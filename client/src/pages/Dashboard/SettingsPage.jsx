import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import PageWrapper from '../../components/common/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { usersAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const SettingsPage = () => {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifications, setNotifications] = useState({
    email: user?.notifications?.email ?? true,
    marketing: user?.notifications?.marketing ?? false,
  });

  // Update profile mutation
  const profileMutation = useMutation({
    mutationFn: usersAPI.updateProfile,
    onSuccess: (response) => {
      updateUser(response.data.data.user);
      toast.success('Profile updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  // Change password mutation
  const passwordMutation = useMutation({
    mutationFn: usersAPI.changePassword,
    onSuccess: () => {
      toast.success('Password changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });

  const handleProfileUpdate = () => {
    profileMutation.mutate({ name, notifications });
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    passwordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <PageWrapper
      title="Settings"
      subtitle="Manage your account settings"
    >
      {/* Profile Section */}
      <Card className="mb-8">
        <h3 className="text-lg font-semibold text-text-primary mb-6">
          Profile
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-cyan to-accent-lime flex items-center justify-center text-background-primary text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-text-primary">{user?.name}</p>
              <p className="text-sm text-text-muted">{user?.email}</p>
            </div>
          </div>

          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            disabled
            placeholder="your@email.com"
          />

          <div className="flex justify-end">
            <Button 
              onClick={handleProfileUpdate}
              loading={profileMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* Password Section */}
      <Card className="mb-8">
        <h3 className="text-lg font-semibold text-text-primary mb-6">
          Change Password
        </h3>
        
        <div className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="flex justify-end">
            <Button 
              onClick={handlePasswordChange}
              loading={passwordMutation.isPending}
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              Change Password
            </Button>
          </div>
        </div>
      </Card>

      {/* Notifications Section */}
      <Card className="mb-8">
        <h3 className="text-lg font-semibold text-text-primary mb-6">
          Notifications
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary cursor-pointer">
            <div>
              <p className="font-medium text-text-primary">Email Notifications</p>
              <p className="text-sm text-text-muted">Receive updates about your projects</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
              className="w-5 h-5 rounded border-border bg-background-tertiary text-accent-cyan focus:ring-accent-cyan"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary cursor-pointer">
            <div>
              <p className="font-medium text-text-primary">Marketing Emails</p>
              <p className="text-sm text-text-muted">Receive news and promotional content</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.marketing}
              onChange={(e) => setNotifications({ ...notifications, marketing: e.target.checked })}
              className="w-5 h-5 rounded border-border bg-background-tertiary text-accent-cyan focus:ring-accent-cyan"
            />
          </label>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20">
        <h3 className="text-lg font-semibold text-red-400 mb-6">
          Danger Zone
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text-primary">Delete Account</p>
            <p className="text-sm text-text-muted">Permanently delete your account and all data</p>
          </div>
          <Button variant="danger">
            Delete Account
          </Button>
        </div>
      </Card>
    </PageWrapper>
  );
};

export default SettingsPage;