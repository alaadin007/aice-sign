import React, { useState } from 'react';
import { resendVerificationEmail } from '../services/auth';
import { cn } from '../lib/utils';
import { Mail, AlertTriangle } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
}

export function EmailVerification({ email }: EmailVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await resendVerificationEmail();
      setSuccess('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-yellow-800">Email Verification Required</h3>
          <p className="mt-1 text-sm text-yellow-700">
            Please verify your email address ({email}) to access all features.
          </p>
          
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          
          {success && (
            <p className="mt-2 text-sm text-green-600">{success}</p>
          )}

          <button
            onClick={handleResendVerification}
            disabled={loading}
            className={cn(
              "mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-md",
              "hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? 'Sending...' : (
              <>
                <Mail className="w-4 h-4" />
                Resend Verification Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}