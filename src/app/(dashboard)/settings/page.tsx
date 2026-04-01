'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Bell,
  Moon,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account preferences and system settings.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border-b border-gray-200 w-full justify-start rounded-none p-0 h-auto">
          <TabsTrigger
            value="profile"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent flex items-center gap-2"
          >
            <Moon className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div>
              <Card className="bg-white border border-gray-200">
                <div className="p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#09203F] to-[#0a2651] mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">JD</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">John Davis</h3>
                  <p className="text-sm text-gray-600 mt-2">Executive / Leadership</p>
                  <Badge className="mt-4 bg-[#09203F] text-white">
                    Admin
                  </Badge>
                </div>
              </Card>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white border border-gray-200">
                <div className="border-b border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue="John Davis"
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#09203F]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="john.davis@company.com"
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#09203F]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      defaultValue="Executive / Leadership"
                      disabled
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      defaultValue="CEO / Owner"
                      disabled
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <Button className="bg-[#09203F] hover:bg-[#0a2651] text-white font-medium">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="bg-white border border-gray-200">
                <div className="border-b border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Status</span>
                    <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Login</span>
                    <span className="text-gray-900">Today at 9:30 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Created</span>
                    <span className="text-gray-900">January 15, 2025</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="bg-white border border-gray-200">
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
            </div>
            <div className="p-6 space-y-6">
              {[
                {
                  id: 'tasks',
                  label: 'Task Notifications',
                  description: 'Receive notifications when tasks are assigned or updated',
                  enabled: true,
                },
                {
                  id: 'approvals',
                  label: 'Approval Notifications',
                  description: 'Get notified when approvals require your action',
                  enabled: true,
                },
                {
                  id: 'workflows',
                  label: 'Workflow Notifications',
                  description: 'Be alerted when workflows start or complete',
                  enabled: true,
                },
                {
                  id: 'system',
                  label: 'System Notifications',
                  description: 'Receive alerts about system maintenance and updates',
                  enabled: false,
                },
                {
                  id: 'email',
                  label: 'Email Notifications',
                  description: 'Send notifications via email as well as in-app',
                  enabled: true,
                },
                {
                  id: 'push',
                  label: 'Push Notifications',
                  description: 'Enable push notifications on your devices',
                  enabled: true,
                },
              ].map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start justify-between pb-6 border-b border-gray-200 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{notif.label}</p>
                    <p className="text-sm text-gray-600 mt-1">{notif.description}</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked={notif.enabled}
                      className="w-5 h-5 rounded border-gray-300 bg-white cursor-pointer accent-[#09203F]"
                    />
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <Button className="bg-[#09203F] hover:bg-[#0a2651] text-white font-medium">
                  Save Preferences
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-6 space-y-6">
          <Card className="bg-white border border-gray-200">
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Theme</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-4">Current Theme</p>
                <div className="space-y-3">
                  {[
                    { id: 'dark', label: 'Dark', selected: false },
                    { id: 'light', label: 'Light', selected: true },
                    { id: 'auto', label: 'Auto (System)', selected: false },
                  ].map((theme) => (
                    <label key={theme.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        defaultChecked={theme.selected}
                        className="w-4 h-4 rounded-full border-gray-300 bg-white cursor-pointer accent-[#09203F]"
                      />
                      <span className="text-gray-900">{theme.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white border border-gray-200">
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Interface Settings</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Sidebar Default State</p>
                  <p className="text-sm text-gray-600 mt-1">Show sidebar by default</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-gray-300 bg-white cursor-pointer accent-[#09203F]"
                />
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Compact Mode</p>
                  <p className="text-sm text-gray-600 mt-1">Use compact spacing</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={false}
                  className="w-5 h-5 rounded border-gray-300 bg-white cursor-pointer accent-[#09203F]"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Animations</p>
                  <p className="text-sm text-gray-600 mt-1">Enable UI animations</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-gray-300 bg-white cursor-pointer accent-[#09203F]"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="bg-white border border-gray-200">
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#09203F]" />
                Password
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#09203F]"
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#09203F]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#09203F]"
                />
              </div>
              <div className="pt-4">
                <Button className="bg-[#09203F] hover:bg-[#0a2651] text-white font-medium">
                  Update Password
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-white border border-gray-200">
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#09203F]" />
                Two-Factor Authentication
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Authenticator App</p>
                  <p className="text-sm text-gray-600 mt-1">Use an authenticator app for 2FA</p>
                </div>
                <Badge className="bg-gray-200 text-gray-900">Not Enabled</Badge>
              </div>
              <Button variant="outline" className="bg-gray-50 hover:bg-gray-100 text-gray-900 border-gray-200">
                Enable 2FA
              </Button>
            </div>
          </Card>

          <Card className="bg-white border border-gray-200">
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
            </div>
            <div className="p-6 space-y-4">
              {[
                {
                  device: 'Desktop - Chrome on macOS',
                  location: 'San Francisco, CA',
                  lastActive: 'Just now',
                  current: true,
                },
                {
                  device: 'iPhone - Safari',
                  location: 'San Francisco, CA',
                  lastActive: '2 hours ago',
                  current: false,
                },
                {
                  device: 'Desktop - Firefox on Windows',
                  location: 'Los Angeles, CA',
                  lastActive: '1 day ago',
                  current: false,
                },
              ].map((session, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between pb-4 border-b border-gray-200 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      {session.device}
                      {session.current && (
                        <Badge className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200">
                          Current
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{session.location}</p>
                    <p className="text-xs text-gray-500 mt-1">Last active: {session.lastActive}</p>
                  </div>
                  {!session.current && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    >
                      Sign Out
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-white border border-red-200">
            <div className="border-b border-red-200 p-6">
              <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                Danger Zone
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Sign out of your account. You will need to log in again to access this system.
              </p>
              <Button variant="outline" className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
