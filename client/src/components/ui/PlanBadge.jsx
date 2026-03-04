const planColors = {
  free: 'badge-free',
  pro: 'badge-pro',
  agency: 'badge-agency',
};

const PlanBadge = ({ plan, className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
        ${planColors[plan] || planColors.free}
        ${className}
      `}
    >
      {plan?.charAt(0).toUpperCase() + plan?.slice(1)}
    </span>
  );
};

export default PlanBadge;