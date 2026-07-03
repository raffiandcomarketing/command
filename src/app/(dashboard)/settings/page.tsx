'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/client/api';
import { User, Shield, Bell, LogOut, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'profile' | 'security' | 'notifications';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const userId = session?.user?.id;

  // Profile
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? '');
      setEmail(session.user.email ?? '');
    }
  }, [session?.user]);

  const saveProfile = async () => {
    if (!userId) return;
    if (!name.trim()) {
      setProfileError('Name is required');
      return;
    }
    setProfileSaving(true);
    setProfileError(null);
    try {
      await api(`/api/users/${userId}`, { method: 'PATCH', body: JSON.stringify({ name: name.trim() }) });
      toast.success('Profile saved');
      void update();
    } catch (e) {
      setProfileError((e as Error).message);
    } finally {
      setProfileSaving(false);
    }
  };

  const changePassword = async () => {
    if (!userId) return;
    setPwError(null);
    if (!currentPassword) {
      setPwError('Enter your current password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    setPwSaving(true);
    try {
      await api(`/api/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      toast.success('Password changed. Use it at your next sign-in.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setPwError((e as Error).message);
    } finally {
      setPwSaving(false);
    }
  };

  const tabs: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
    { key: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { key: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-4xl font-semibold text-stone-900 mb-2">Settings</h1>
        <p className="text-stone-500">Manage your account and security preferences.</p>
      </div>

      <div className="flex border-b border-stone-200 bg-white rounded-t-lg">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === t.key ? 'border-[#09203F] text-[#09203F]' : 'border-transparent text-stone-500 hover:text-stone-800'
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <Card className="bg-white border border-stone-200 rounded-xl shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-stone-900 mb-1">Profile</h2>
            <p className="text-sm text-stone-500">Your name is shown on tasks, approvals, and activity.</p>
          </div>

          {profileError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {profileError}
            </div>
          )}

          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={email} disabled />
          <p className="text-xs text-stone-400 -mt-4">Email changes are managed by an administrator (Admin → Users).</p>

          <div className="flex justify-end">
            <Button onClick={saveProfile} loading={profileSaving} className="bg-[#0A2245] hover:bg-[#0E2C55] shadow-luxe text-white">
              Save Changes
            </Button>
          </div>
        </Card>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="bg-white border border-stone-200 rounded-xl shadow-sm p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-stone-900 mb-1">Change Password</h2>
              <p className="text-sm text-stone-500">
                At least 10 characters with an uppercase letter, a lowercase letter, and a number.
              </p>
            </div>

            {pwError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {pwError}
              </div>
            )}

            <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
            <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
            <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />

            <div className="flex justify-end">
              <Button onClick={changePassword} loading={pwSaving} className="bg-[#0A2245] hover:bg-[#0E2C55] shadow-luxe text-white">
                Update Password
              </Button>
            </div>
          </Card>

          <Card className="bg-white border border-stone-200 rounded-xl shadow-sm p-8 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-stone-900 mb-1">Session</h2>
              <p className="text-sm text-stone-500">
                Sessions expire automatically after 12 hours. Signing out ends this session immediately.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-600 bg-stone-50 border border-stone-100 rounded-lg p-3">
              <Info className="w-4 h-4 text-stone-400 flex-shrink-0" />
              Multi-factor authentication for admins is on the security roadmap (Sprint 2 hardening ships the policy;
              SSO/MFA arrives with the Google Workspace integration).
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => void signOut({ callbackUrl: '/login' })} className="border-red-200 text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <Card className="bg-white border border-stone-200 rounded-xl shadow-sm p-8 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-stone-900 mb-1">Notification Preferences</h2>
            <p className="text-sm text-stone-500">In-app notifications are always on.</p>
          </div>
          <div className="flex items-start gap-3 text-sm text-stone-600 bg-stone-50 border border-stone-100 rounded-lg p-4">
            <Info className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
            <p>
              Email and SMS delivery preferences will appear here once the delivery channels are connected
              (go-live roadmap Sprint 8: email/SMS provider + notification engine). Until then, check the{' '}
              <a href="/notifications" className="text-[#09203F] font-medium hover:underline">
                Notifications
              </a>{' '}
              page for everything addressed to you.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
