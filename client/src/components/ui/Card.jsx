import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  padding = 'md',
  as = 'div',
  ...props
}) => {
  const paddingSizes = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const Component = as === 'motion' ? motion.div : 'div';
  const motionProps = as === 'motion' ? {
    whileHover: hover ? { y: -4 } : {},
    transition: { duration: 0.2 },
  } : {};

  return (
    <Component
      className={`
        glass-card
        ${paddingSizes[padding]}
        ${className}
      `}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;