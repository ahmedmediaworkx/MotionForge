import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageWrapper from '../../components/common/PageWrapper';
import StatCard from '../../components/common/StatCard';
import ProjectCard from '../../components/common/ProjectCard';
import Button from '../../components/ui/Button';
import { ProjectCardSkeleton, StatCardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { projectsAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['projectStats'],
    queryFn: async () => {
      const response = await projectsAPI.getStats();
      return response.data.data;
    },
  });

  // Fetch recent projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['recentProjects'],
    queryFn: async () => {
      const response = await projectsAPI.getAll({ limit: 4, sort: '-createdAt' });
      return response.data.data;
    },
  });

  const handleCreateProject = async () => {
    try {
      const response = await projectsAPI.create({
        name: 'Untitled Project',
        description: '',
      });
      toast.success('Project created!');
      navigate(`/dashboard/editor/${response.data.data.project._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const stats = statsData || {
    totalProjects: 0,
    publishedProjects: 0,
    thisMonthExports: 0,
    exportLimit: 5,
    plan: 'free',
  };

  const projects = projectsData?.projects || [];

  return (
    <PageWrapper
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'Creator'}!`}
      subtitle="Here's what's happening with your animations"
      actions={
        <Button onClick={handleCreateProject}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Button>
      }
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Projects"
              value={stats.totalProjects}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              }
              delay={0}
            />
            <StatCard
              title="Published"
              value={stats.publishedProjects}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              delay={100}
            />
            <StatCard
              title="Exports This Month"
              value={stats.thisMonthExports}
              suffix={` / ${stats.exportLimit}`}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
              delay={200}
            />
            <StatCard
              title="Current Plan"
              value={stats.plan?.charAt(0).toUpperCase() + stats.plan?.slice(1) || 'Free'}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              delay={300}
            />
          </>
        )}
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold font-clash text-text-primary">
            Recent Projects
          </h2>
          <Button variant="ghost" onClick={() => navigate('/dashboard/projects')}>
            View All
          </Button>
        </div>

        {projectsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProjectCard
                  project={project}
                  onEdit={(p) => navigate(`/dashboard/editor/${p._id}`)}
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
            title="No projects yet"
            description="Create your first animation project to get started"
            actionLabel="Create Project"
            onAction={handleCreateProject}
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default DashboardHome;