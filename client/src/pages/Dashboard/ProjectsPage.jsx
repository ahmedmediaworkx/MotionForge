import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageWrapper from '../../components/common/PageWrapper';
import ProjectCard from '../../components/common/ProjectCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { ProjectCardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { projectsAPI } from '../../services/api';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Fetch projects
  const { data, isLoading } = useQuery({
    queryKey: ['projects', statusFilter, searchQuery],
    queryFn: async () => {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      const response = await projectsAPI.getAll(params);
      return response.data.data;
    },
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: projectsAPI.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created!');
      setIsCreateModalOpen(false);
      setNewProjectName('');
      navigate(`/dashboard/editor/${response.data.data.project._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create project');
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: projectsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted');
      setProjectToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    },
  });

  // Duplicate project mutation
  const duplicateMutation = useMutation({
    mutationFn: projectsAPI.duplicate,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project duplicated!');
      navigate(`/dashboard/editor/${response.data.data.project._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to duplicate project');
    },
  });

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    createMutation.mutate({ name: newProjectName });
  };

  const projects = data?.projects || [];

  return (
    <PageWrapper
      title="Projects"
      subtitle="Manage your animation projects"
      actions={
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
        <div className="flex gap-2">
          {['all', 'draft', 'published'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProjectCard
                project={project}
                onEdit={(p) => navigate(`/dashboard/editor/${p._id}`)}
                onDelete={(p) => setProjectToDelete(p)}
                onDuplicate={(p) => duplicateMutation.mutate(p._id)}
                onExport={(p) => navigate(`/dashboard/exports?project=${p._id}`)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          }
          title={searchQuery ? 'No projects found' : 'No projects yet'}
          description={searchQuery ? 'Try a different search term' : 'Create your first animation project to get started'}
          actionLabel={searchQuery ? 'Clear Search' : 'Create Project'}
          onAction={() => {
            if (searchQuery) {
              setSearchQuery('');
            } else {
              setIsCreateModalOpen(true);
            }
          }}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewProjectName('');
        }}
        title="Create New Project"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Project Name"
            placeholder="My Awesome Animation"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            autoFocus
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewProjectName('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateProject}
              loading={createMutation.isPending}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setProjectToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => deleteMutation.mutate(projectToDelete._id)}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default ProjectsPage;