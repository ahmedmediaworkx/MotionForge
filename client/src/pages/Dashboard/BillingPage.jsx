import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/common/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PlanBadge from '../../components/ui/PlanBadge';
import { billingAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    plan: 'free',
    features: [
      '3 Projects',
      '5 Exports/month',
      'GIF & PNG exports',
      'Basic templates',
    ],
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    plan: 'pro',
    features: [
      'Unlimited Projects',
      '100 Exports/month',
      'All export formats',
      'MP4 export',
      'Custom branding',
    ],
  },
  {
    name: 'Agency',
    price: '$49',
    period: '/month',
    plan: 'agency',
    features: [
      'Everything in Pro',
      'Unlimited Exports',
      '10 Team members',
      'Priority support',
    ],
  },
];

const BillingPage = () => {
  const { user, hasPlan } = useAuthStore();

  // Fetch billing data
  const { data: billingData, isLoading } = useQuery({
    queryKey: ['billing'],
    queryFn: async () => {
      const response = await billingAPI.getPlan();
      return response.data.data;
    },
  });

  const handleUpgrade = async (plan) => {
    try {
      const response = await billingAPI.createCheckout(plan);
      if (response.data.data.url) {
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create checkout');
    }
  };

  const handlePortal = async () => {
    try {
      const response = await billingAPI.createPortal();
      if (response.data.data.url) {
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to open portal');
    }
  };

  const currentPlan = billingData?.plan || user?.plan || 'free';

  return (
    <PageWrapper
      title="Billing"
      subtitle="Manage your subscription and billing"
    >
      {/* Current Plan */}
      <Card className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Current Plan
            </h3>
            <div className="flex items-center gap-3">
              <PlanBadge plan={currentPlan} />
              <span className="text-text-secondary">
                {currentPlan === 'free' ? 'Free forever' : 
                 currentPlan === 'pro' ? '$19/month' : '$49/month'}
              </span>
            </div>
          </div>
          {currentPlan !== 'free' && (
            <Button variant="secondary" onClick={handlePortal}>
              Manage Subscription
            </Button>
          )}
        </div>
      </Card>

      {/* Usage Stats */}
      {billingData?.usage && (
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Usage This Month
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-text-muted mb-1">Projects</p>
              <p className="text-2xl font-bold text-text-primary">
                {billingData.usage.projects} / {billingData.usage.projectLimit || '∞'}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Exports</p>
              <p className="text-2xl font-bold text-text-primary">
                {billingData.usage.exports} / {billingData.usage.exportLimit || '∞'}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Storage</p>
              <p className="text-2xl font-bold text-text-primary">
                {billingData.usage.storage || '0'} MB
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Plans */}
      <h3 className="text-xl font-semibold font-clash text-text-primary mb-6">
        Available Plans
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`h-full ${currentPlan === plan.plan ? 'border-accent-cyan' : ''}`}>
              {currentPlan === plan.plan && (
                <div className="text-center text-sm text-accent-cyan mb-4">
                  Current Plan
                </div>
              )}
              
              <div className="text-center mb-6">
                <h4 className="text-xl font-semibold font-clash text-text-primary mb-2">
                  {plan.name}
                </h4>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold font-clash text-text-primary">
                    {plan.price}
                  </span>
                  <span className="text-text-muted">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-text-secondary">
                    <svg className="w-5 h-5 text-accent-lime flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {currentPlan === plan.plan ? (
                <Button variant="secondary" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : plan.plan === 'free' ? (
                <Button variant="ghost" className="w-full" disabled>
                  Downgrade
                </Button>
              ) : hasPlan(plan.plan) ? (
                <Button variant="secondary" className="w-full" disabled>
                  Already Available
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => handleUpgrade(plan.plan)}
                >
                  Upgrade to {plan.name}
                </Button>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
};

export default BillingPage;