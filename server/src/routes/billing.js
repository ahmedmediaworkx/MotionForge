import express from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';
import { protect, requirePlan } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Plan prices (in production, these would come from Stripe)
const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '3 projects',
      '5 exports/month',
      'Basic animations',
      'Community support'
    ]
  },
  pro: {
    name: 'Pro',
    price: 19,
    priceId: process.env.STRIPE_PRICE_PRO || 'price_pro_monthly',
    features: [
      'Unlimited projects',
      '100 exports/month',
      'MP4 export',
      'Custom branding',
      'Priority support'
    ]
  },
  agency: {
    name: 'Agency',
    price: 49,
    priceId: process.env.STRIPE_PRICE_AGENCY || 'price_agency_monthly',
    features: [
      'Everything in Pro',
      'Unlimited exports',
      '10 team members',
      'Priority support',
      'Custom integrations'
    ]
  }
};

// @route   GET /api/billing/plan
// @desc    Get current plan
// @access  Private
router.get('/plan', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  const currentPlan = PLANS[user.plan];
  
  res.json({
    success: true,
    data: {
      plan: user.plan,
      planDetails: currentPlan,
      exportCount: user.exportCount,
      exportLimit: user.exportLimit,
      projectLimit: user.projectLimit,
      stripeCustomerId: user.stripeCustomerId
    }
  });
}));

// @route   GET /api/billing/plans
// @desc    Get all available plans
// @access  Public
router.get('/plans', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      plans: PLANS
    }
  });
}));

// @route   POST /api/billing/checkout
// @desc    Create Stripe checkout session
// @access  Private
router.post('/checkout', protect, asyncHandler(async (req, res) => {
  const { plan } = req.body;

  if (!PLANS[plan] || plan === 'free') {
    return res.status(400).json({
      success: false,
      message: 'Invalid plan selected'
    });
  }

  const planDetails = PLANS[plan];

  // Get or create Stripe customer
  let customerId = req.user.stripeCustomerId;
  
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: req.user.email,
      name: req.user.name,
      metadata: {
        userId: req.user._id.toString()
      }
    });
    customerId = customer.id;
    await User.findByIdAndUpdate(req.user._id, { stripeCustomerId: customerId });
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: planDetails.priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.CLIENT_URL}/dashboard/billing?success=true&plan=${plan}`,
    cancel_url: `${process.env.CLIENT_URL}/dashboard/billing?canceled=true`,
    metadata: {
      userId: req.user._id.toString(),
      plan: plan
    }
  });

  res.json({
    success: true,
    data: { sessionId: session.id, url: session.url }
  });
}));

// @route   POST /api/billing/portal
// @desc    Create Stripe billing portal session
// @access  Private
router.post('/portal', protect, asyncHandler(async (req, res) => {
  if (!req.user.stripeCustomerId) {
    return res.status(400).json({
      success: false,
      message: 'No billing account found'
    });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: req.user.stripeCustomerId,
    return_url: `${process.env.CLIENT_URL}/dashboard/billing`
  });

  res.json({
    success: true,
    data: { url: session.url }
  });
}));

// @route   POST /api/billing/webhook
// @desc    Handle Stripe webhooks
// @access  Public (Stripe will verify signature)
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const plan = session.metadata.plan;

      // Update user plan
      const exportLimit = plan === 'agency' ? 999999 : plan === 'pro' ? 100 : 5;
      const projectLimit = plan === 'free' ? 3 : 999999;

      await User.findByIdAndUpdate(userId, {
        plan: plan,
        stripeSubscriptionId: session.subscription,
        exportLimit: exportLimit,
        projectLimit: projectLimit
      });
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Find user by customer ID
      const user = await User.findOne({ stripeCustomerId: customerId });
      if (user) {
        // Determine plan from subscription
        let newPlan = 'free';
        if (subscription.status === 'active') {
          const priceId = subscription.items.data[0]?.price.id;
          if (priceId === process.env.STRIPE_PRICE_AGENCY) newPlan = 'agency';
          else if (priceId === process.env.STRIPE_PRICE_PRO) newPlan = 'pro';
        }

        const exportLimit = newPlan === 'agency' ? 999999 : newPlan === 'pro' ? 100 : 5;
        const projectLimit = newPlan === 'free' ? 3 : 999999;

        await User.findByIdAndUpdate(user._id, {
          plan: newPlan,
          exportLimit: exportLimit,
          projectLimit: projectLimit
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const user = await User.findOne({ stripeCustomerId: customerId });
      if (user) {
        await User.findByIdAndUpdate(user._id, {
          plan: 'free',
          stripeSubscriptionId: '',
          exportLimit: 5,
          projectLimit: 3
        });
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ success: true, received: true });
}));

// @route   GET /api/billing/invoices
// @desc    Get invoice history
// @access  Private
router.get('/invoices', protect, asyncHandler(async (req, res) => {
  if (!req.user.stripeCustomerId) {
    return res.json({
      success: true,
      data: { invoices: [] }
    });
  }

  const invoices = await stripe.invoices.list({
    customer: req.user.stripeCustomerId,
    limit: 12
  });

  const formattedInvoices = invoices.data.map(invoice => ({
    id: invoice.id,
    number: invoice.number,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency,
    status: invoice.status,
    date: new Date(invoice.created * 1000).toISOString(),
    pdfUrl: invoice.invoice_pdf
  }));

  res.json({
    success: true,
    data: { invoices: formattedInvoices }
  });
}));

export default router;