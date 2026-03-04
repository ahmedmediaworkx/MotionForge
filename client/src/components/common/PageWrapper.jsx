import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

const PageWrapper = ({ 
  children, 
  title, 
  subtitle,
  actions,
  className = '',
  animate = true 
}) => {
  const PageComponent = animate ? motion.div : 'div';
  const motionProps = animate ? {
    variants: pageVariants,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
  } : {};

  return (
    <PageComponent
      className={`min-h-screen p-6 lg:p-8 ${className}`}
      {...motionProps}
    >
      {/* Page Header */}
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            {title && (
              <h1 className="text-2xl lg:text-3xl font-bold font-clash text-text-primary">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-text-secondary">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Page Content */}
      {children}
    </PageComponent>
  );
};

export default PageWrapper;