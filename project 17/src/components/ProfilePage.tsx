import React, { useState } from 'react';
import { updatePassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { updateProfile } from '../services/auth';
import { cn } from '../lib/utils';
import { User, Lock, Mail, Save, CheckCircle, XCircle } from 'lucide-react';
import type { User as UserType } from '../types/auth';

interface ProfilePageProps {
  user: UserType;
}

export function ProfilePage({ user }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await updateProfile(user.uid, {
        firstName,
        lastName,
        email
      });
      
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      await updatePassword(user, newPassword);
      
      setSuccess('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError('Failed to update password. Please try signing in again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Verification Status Banner */}
        <div className={cn(
          "mb-6 p-4 rounded-lg flex items-center gap-3",
          user.emailVerified 
            ? "bg-green-50 border border-green-200" 
            : "bg-yellow-50 border border-yellow-200"
        )}>
          {user.emailVerified ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">Verified Account</h3>
                <p className="text-sm text-green-700">Your email address has been verified.</p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">Verification Required</h3>
                <p className="text-sm text-yellow-700">
                  Please check your email and click the verification link to verify your account.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                ) : (
                  <p className="mt-1 p-2 border border-gray-200 rounded-md bg-gray-50">
                    {firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                ) : (
                  <p className="mt-1 p-2 border border-gray-200 rounded-md bg-gray-50">
                    {lastName}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  <span className="flex items-center gap-2">
                    Email
                    {user.emailVerified ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-yellow-600" />
                    )}
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                ) : (
                  <p className="mt-1 p-2 border border-gray-200 rounded-md bg-gray-50">
                    {email}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-md",
                    "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {loading ? 'Saving...' : (
                    <>
                      Save Changes
                      <Save className="w-4 h-4" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFirstName(user.firstName);
                    setLastName(user.lastName);
                    setEmail(user.email);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-md",
                "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}