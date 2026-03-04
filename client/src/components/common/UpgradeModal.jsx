import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { billingAPI } from '../../services/api';

const UpgradeModal = ({ isOpen, onClose, feature }) => {
  const navigate = useNavigate();
  const { hasPlan } = useAuthStore();

  const handleUpgrade = async () => {
    try {
      const { data } = await billingAPI.createCheckout('pro');
      if (data.data.url) {
        window.location.href = data.data.url;
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
    }
  };

  const featureMessages = {
    mp4: {
      title: 'MP4 Export',
      description: 'Export your animations as MP4 videos. This feature is available on Pro and Agency plans.',
      plan: 'Pro'
    },
    unlimited: {
      title: 'Unlimited Projects',
      description: 'Create as many projects as you need. This feature is available on Pro and Agency plans.',
      plan: 'Pro'
    },
    team: {
      title: 'Team Collaboration',
      description: 'Invite team members to collaborate on projects. This feature is available on Agency plan.',
      plan: 'Agency'
    },
    branding: {
      title: 'Custom Branding',
      description: 'Remove MotionForge watermark and add your own branding. This feature is available on Pro and Agency plans.',
      plan: 'Pro'
    },
    priority: {
      title: 'Priority Support',
      description: 'Get faster responses and dedicated support. This feature is available on Agency plan.',
      plan: 'Agency'
    }
  };

  const message = featureMessages[feature] || {
    title: 'Upgrade Required',
    description: 'This feature requires a higher plan.',
    plan: 'Pro'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upgrade Required" size="sm">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent-cyan/20 to-accent-lime/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold font-clash text-text-primary mb-2">
          {message.title}
        </h3>
        
        <p className="text-text-secondary mb-6">
          {message.description}
        </p>

        <div className="flex flex-col gap-3">
          <Button onClick={handleUpgrade} className="w-full">
            Upgrade to {message.plan}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UpgradeModal;