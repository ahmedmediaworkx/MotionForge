const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    thumbnail: 'h-48 w-full rounded-lg',
    card: 'h-64 w-full rounded-xl',
    button: 'h-10 w-24 rounded-lg',
  };

  return (
    <div
      className={`
        skeleton
        ${variants[variant]}
        ${className}
      `}
    />
  );
};

export const ProjectCardSkeleton = () => (
  <div className="glass-card p-4">
    <Skeleton variant="thumbnail" className="mb-4" />
    <Skeleton variant="title" className="mb-2" />
    <Skeleton variant="text" className="w-1/2" />
  </div>
);

export const StatCardSkeleton = () => (
  <div className="glass-card p-6">
    <div className="flex items-center justify-between mb-4">
      <Skeleton variant="avatar" />
      <Skeleton variant="button" />
    </div>
    <Skeleton variant="title" className="mb-2" />
    <Skeleton variant="text" className="w-1/3" />
  </div>
);

export const TableRowSkeleton = ({ columns = 4 }) => (
  <div className="flex items-center gap-4 p-4">
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton key={i} variant="text" className="flex-1" />
    ))}
  </div>
);

export default Skeleton;