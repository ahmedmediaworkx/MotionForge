import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import PlanBadge from '../ui/PlanBadge';
import Button from '../ui/Button';

const ProjectCard = ({ 
  project, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onExport,
  showActions = true 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card padding="none" className="overflow-hidden group">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-background-tertiary overflow-hidden">
          {project.thumbnail && !imageError ? (
            <img 
              src={project.thumbnail} 
              alt={project.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-lime/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          )}
          
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span className={`
              px-2 py-1 rounded-md text-xs font-medium
              ${project.status === 'published' 
                ? 'bg-accent-lime/20 text-accent-lime' 
                : 'bg-background-tertiary/80 text-text-secondary'}
            `}>
              {project.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>

          {/* Hover overlay with actions */}
          {showActions && isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-background-primary/80 backdrop-blur-sm flex items-center justify-center gap-3"
            >
              <Button size="sm" onClick={() => onEdit?.(project)}>
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => onExport?.(project)}
              >
                Export
              </Button>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-text-primary truncate flex-1">
              {project.name}
            </h3>
          </div>
          
          {project.description && (
            <p className="text-sm text-text-secondary line-clamp-2 mb-3">
              {project.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>{formatDate(project.createdAt)}</span>
            
            {showActions && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onDuplicate?.(project)}
                  className="p-1.5 rounded hover:bg-background-tertiary transition-colors"
                  title="Duplicate"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button 
                  onClick={() => onDelete?.(project)}
                  className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;