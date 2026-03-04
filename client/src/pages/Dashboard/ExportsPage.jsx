import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageWrapper from '../../components/common/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/common/EmptyState';
import { exportsAPI, projectsAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const ExportsPage = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPlan } = useAuthStore();
  
  const [selectedProject, setSelectedProject] = useState(searchParams.get('project') || '');
  const [formatFilter, setFormatFilter] = useState('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    projectId: selectedProject,
    format: 'gif',
    quality: 'high',
  });

  // Fetch exports
  const { data: exportsData, isLoading } = useQuery({
    queryKey: ['exports', formatFilter],
    queryFn: async () => {
      const params = {};
      if (formatFilter !== 'all') params.format = formatFilter;
      const response = await exportsAPI.getAll(params);
      return response.data.data;
    },
  });

  // Fetch projects for dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsAPI.getAll({ limit: 100 });
      return response.data.data.projects;
    },
  });

  // Create export mutation
  const createMutation = useMutation({
    mutationFn: exportsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exports'] });
      toast.success('Export created!');
      setIsExportModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Export failed');
    },
  });

  // Delete export mutation
  const deleteMutation = useMutation({
    mutationFn: exportsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exports'] });
      toast.success('Export deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete');
    },
  });

  const handleCreateExport = () => {
    if (!exportSettings.projectId) {
      toast.error('Please select a project');
      return;
    }
    if (exportSettings.format === 'mp4' && !hasPlan('pro')) {
      toast.error('MP4 export requires Pro plan');
      return;
    }
    createMutation.mutate(exportSettings);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exports = exportsData?.exports || [];
  const projects = projectsData || [];

  return (
    <PageWrapper
      title="Exports"
      subtitle="Manage your animation exports"
      actions={
        <Button onClick={() => setIsExportModalOpen(true)}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          New Export
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex gap-2">
          {['all', 'gif', 'mp4', 'json', 'png'].map((format) => (
            <Button
              key={format}
              variant={formatFilter === format ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFormatFilter(format)}
            >
              {format.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Exports List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4">
              <div className="skeleton h-20 w-full" />
            </div>
          ))}
        </div>
      ) : exports.length > 0 ? (
        <div className="space-y-4">
          {exports.map((exp, index) => (
            <motion.div
              key={exp._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg bg-background-tertiary flex items-center justify-center">
                  {exp.project?.thumbnail ? (
                    <img 
                      src={exp.project.thumbnail} 
                      alt={exp.project.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-accent-cyan">
                      {exp.format.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary truncate">
                    {exp.project?.name || 'Unknown Project'}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`
                      px-2 py-0.5 rounded text-xs font-medium
                      ${exp.format === 'mp4' ? 'bg-accent-cyan/20 text-accent-cyan' : 
                        exp.format === 'gif' ? 'bg-accent-lime/20 text-accent-lime' : 
                        'bg-background-tertiary text-text-secondary'}
                    `}>
                      {exp.format.toUpperCase()}
                    </span>
                    <span className="text-sm text-text-muted">
                      {exp.quality} quality
                    </span>
                    <span className="text-sm text-text-muted">
                      {formatDate(exp.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {exp.url && (
                    <a
                      href={exp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-text-muted hover:text-accent-cyan hover:bg-background-tertiary transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate(exp._id)}
                    className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
          title="No exports yet"
          description="Export your first animation to get started"
          actionLabel="Create Export"
          onAction={() => setIsExportModalOpen(true)}
        />
      )}

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Create Export"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary mb-2 block">Project</label>
            <select
              value={exportSettings.projectId}
              onChange={(e) => setExportSettings({ ...exportSettings, projectId: e.target.value })}
              className="input-field w-full"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-text-secondary mb-2 block">Format</label>
            <div className="grid grid-cols-4 gap-2">
              {['gif', 'mp4', 'json', 'png'].map((format) => (
                <button
                  key={format}
                  onClick={() => setExportSettings({ ...exportSettings, format })}
                  className={`
                    p-3 rounded-lg text-center transition-colors
                    ${exportSettings.format === format 
                      ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan' 
                      : 'bg-background-tertiary text-text-secondary hover:text-text-primary'}
                    ${format === 'mp4' && !hasPlan('pro') ? 'opacity-50' : ''}
                  `}
                >
                  <span className="text-lg font-bold">{format.toUpperCase()}</span>
                  {format === 'mp4' && !hasPlan('pro') && (
                    <span className="text-xs block mt-1">Pro</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-text-secondary mb-2 block">Quality</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high', 'original'].map((quality) => (
                <button
                  key={quality}
                  onClick={() => setExportSettings({ ...exportSettings, quality })}
                  className={`
                    flex-1 p-2 rounded-lg text-sm capitalize transition-colors
                    ${exportSettings.quality === quality 
                      ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan' 
                      : 'bg-background-tertiary text-text-secondary hover:text-text-primary'}
                  `}
                >
                  {quality}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsExportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateExport}
              loading={createMutation.isPending}
            >
              Export
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default ExportsPage;