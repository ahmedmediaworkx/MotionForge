import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendLabel,
  suffix = '',
  prefix = '',
  delay = 0 
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    const duration = 1000;
    const steps = 30;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setDisplayValue(numericValue);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const formatValue = (val) => {
    if (typeof val === 'string' && isNaN(parseFloat(val))) {
      return val;
    }
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-text-secondary mb-2">{title}</p>
          <motion.p 
            className="text-3xl font-bold font-clash text-text-primary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.3, duration: 0.3 }}
          >
            {prefix}{formatValue(displayValue)}{suffix}
          </motion.p>
          
          {trend !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-sm ${trend >= 0 ? 'text-accent-lime' : 'text-red-400'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
              {trendLabel && (
                <span className="text-xs text-text-muted">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-3 rounded-xl bg-accent-cyan/10 text-accent-cyan">
            {icon}
          </div>
        )}
      </div>
      
      {/* Background glow */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent-cyan/5 rounded-full blur-2xl" />
    </Card>
  );
};

export default StatCard;