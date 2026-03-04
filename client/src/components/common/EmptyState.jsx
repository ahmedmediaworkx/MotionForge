import { motion } from 'framer-motion';
import Button from '../ui/Button';

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}
    >
      {icon && (
        <div className="w-20 h-20 mb-6 rounded-2xl bg-background-tertiary flex items-center justify-center text-text-muted">
          {icon}
        </div>
      )}
      
      <h3 className="text-xl font-semibold font-clash text-text-primary mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-text-secondary text-center max-w-md mb-6">
          {description}
        </p>
      )}
      
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;