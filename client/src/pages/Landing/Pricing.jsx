import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    plan: 'free',
    features: [
      { text: '3 Projects', included: true },
      { text: '5 Exports/month', included: true },
      { text: 'GIF & PNG exports', included: true },
      { text: 'Basic templates', included: true },
      { text: 'MP4 export', included: false },
      { text: 'Custom branding', included: false },
      { text: 'Team collaboration', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For serious creators',
    plan: 'pro',
    features: [
      { text: 'Unlimited Projects', included: true },
      { text: '100 Exports/month', included: true },
      { text: 'All export formats', included: true },
      { text: 'Premium templates', included: true },
      { text: 'MP4 export', included: true },
      { text: 'Custom branding', included: true },
      { text: 'Team collaboration', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    name: 'Agency',
    price: '$49',
    period: '/month',
    description: 'For teams & businesses',
    plan: 'agency',
    features: [
      { text: 'Unlimited Projects', included: true },
      { text: 'Unlimited Exports', included: true },
      { text: 'All export formats', included: true },
      { text: 'Premium templates', included: true },
      { text: 'MP4 export', included: true },
      { text: 'Custom branding', included: true },
      { text: '10 Team members', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 lg:py-32 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-cyan/5 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-clash text-text-primary mb-4">
            Simple, Transparent
            <span className="text-gradient"> Pricing</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className={`h-full relative ${plan.popular ? 'border-accent-cyan' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-accent-cyan to-accent-lime text-background-primary text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold font-clash text-text-primary mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold font-clash text-text-primary">
                      {plan.price}
                    </span>
                    <span className="text-text-muted">{plan.period}</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      {feature.included ? (
                        <svg className="w-5 h-5 text-accent-lime flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={feature.included ? 'text-text-primary' : 'text-text-muted'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to="/register">
                  <Button 
                    variant={plan.popular ? 'primary' : 'secondary'} 
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;