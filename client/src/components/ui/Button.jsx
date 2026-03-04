import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'btn-gradient',
  secondary: 'border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10',
  ghost: 'text-text-secondary hover:text-accent-cyan',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  as = 'button',
  ...props
}, ref) => {
  const Component = as === 'motion' ? motion.button : 'button';
  const motionProps = as === 'motion' ? {
    whileHover: { scale: disabled ? 1 : 1.02 },
    whileTap: { scale: disabled ? 1 : 0.98 },
  } : {};

  return (
    <Component
      ref={ref}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-semibold
        transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...motionProps}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="w-5 h-5">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="w-5 h-5">{icon}</span>}
        </>
      )}
    </Component>
  );
});

Button.displayName = 'Button';

export default Button;