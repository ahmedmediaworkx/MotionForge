import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/common/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/common/EmptyState';
import { teamAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const TeamPage = () => {
  const queryClient = useQueryClient();
  const { hasPlan } = useAuthStore();
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');

  // Check if user has agency plan
  if (!hasPlan('agency')) {
    return (
      <PageWrapper title="Team" subtitle="Manage your team members">
        <EmptyState
          icon={
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          title="Team feature unavailable"
          description="Team collaboration is available on the Agency plan. Upgrade to invite team members and collaborate on projects."
          actionLabel="Upgrade to Agency"
          onAction={() => window.location.href = '/dashboard/billing'}
        />
      </PageWrapper>
    );
  }

  // Fetch team members
  const { data: teamData, isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const response = await teamAPI.getAll();
      return response.data.data.teamMembers;
    },
  });

  // Invite member mutation
  const inviteMutation = useMutation({
    mutationFn: teamAPI.invite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      toast.success('Invitation sent!');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('viewer');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    },
  });

  // Remove member mutation
  const removeMutation = useMutation({
    mutationFn: teamAPI.removeMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      toast.success('Team member removed');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => teamAPI.updateMember(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      toast.success('Role updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    },
  });

  const teamMembers = teamData || [];
  const pendingInvites = teamMembers.filter(m => m.status === 'pending');
  const activeMembers = teamMembers.filter(m => m.status === 'active');

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <PageWrapper
      title="Team"
      subtitle="Manage your team members and collaborations"
      actions={
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Invite Member
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="text-center">
          <p className="text-3xl font-bold font-clash text-accent-cyan">{teamMembers.length}</p>
          <p className="text-sm text-text-muted">Total Members</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold font-clash text-accent-lime">{activeMembers.length}</p>
          <p className="text-sm text-text-muted">Active</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold font-clash text-text-primary">{10 - teamMembers.length}</p>
          <p className="text-sm text-text-muted">Seats Available</p>
        </Card>
      </div>

      {/* Active Members */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Active Members</h3>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-4">
                <div className="skeleton h-16 w-full" />
              </div>
            ))}
          </div>
        ) : activeMembers.length > 0 ? (
          <div className="space-y-4">
            {activeMembers.map((member, index) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-cyan to-accent-lime flex items-center justify-center text-background-primary font-bold">
                    {member.member?.name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary">
                      {member.member?.name || 'Pending'}
                    </p>
                    <p className="text-sm text-text-muted">
                      {member.member?.email || member.email}
                    </p>
                  </div>

                  {/* Role */}
                  <select
                    value={member.role}
                    onChange={(e) => updateRoleMutation.mutate({ id: member._id, role: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>

                  {/* Remove */}
                  <button
                    onClick={() => removeMutation.mutate(member._id)}
                    className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            title="No team members yet"
            description="Invite your first team member to start collaborating"
            actionLabel="Invite Member"
            onAction={() => setIsInviteModalOpen(true)}
          />
        )}
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Pending Invitations</h3>
          <div className="space-y-4">
            {pendingInvites.map((invite, index) => (
              <motion.div
                key={invite._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="flex items-center gap-4 opacity-75">
                  <div className="w-12 h-12 rounded-full bg-background-tertiary flex items-center justify-center text-text-muted">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary">{invite.email}</p>
                    <p className="text-sm text-text-muted">Invited on {formatDate(invite.invitedAt)}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                    Pending
                  </span>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setInviteEmail('');
          setInviteRole('viewer');
        }}
        title="Invite Team Member"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
          />

          <div>
            <label className="text-sm text-text-secondary mb-2 block">Role</label>
            <div className="flex gap-2">
              {['admin', 'editor', 'viewer'].map((role) => (
                <button
                  key={role}
                  onClick={() => setInviteRole(role)}
                  className={`
                    flex-1 p-3 rounded-lg text-sm capitalize transition-colors
                    ${inviteRole === role 
                      ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan' 
                      : 'bg-background-tertiary text-text-secondary hover:text-text-primary'}
                  `}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
              loading={inviteMutation.isPending}
              disabled={!inviteEmail}
            >
              Send Invite
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default TeamPage;