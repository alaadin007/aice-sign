import React, { useState, useEffect } from 'react';
import { TextInput } from './components/TextInput';
import { AssessmentDisplay } from './components/AssessmentDisplay';
import { Dashboard } from './components/Dashboard';
import { AuthForm } from './components/AuthForm';
import { ProfilePage } from './components/ProfilePage';
import { EmailVerification } from './components/EmailVerification';
import { generateAssessment } from './services/openai';
import { signIn, signUp, signOut, onAuthChange } from './services/auth';
import { cn } from './lib/utils';
import type { Assessment } from './types/assessment';
import type { User } from './types/auth';
import { BookOpen, Award, LogOut, User as UserIcon } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'assessment' | 'dashboard' | 'profile'>('assessment');
  const [text, setText] = useState('');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(setUser);
    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    await signIn({ email, password });
  };

  const handleSignUp = async (email: string, password: string, firstName: string, lastName: string) => {
    await signUp({ email, password, firstName, lastName });
  };

  const handleSignOut = async () => {
    await signOut();
    setView('assessment');
    setText('');
    setAssessment(null);
  };

  const handleGenerateAssessment = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await generateAssessment(text);
      setAssessment(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17]">
      <header className="bg-[#0B0F17] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">AiCE</span>
              <span className="text-blue-400">•</span>
            </div>

            <div className="flex-1 flex justify-center">
              <h1 className="text-2xl font-light text-blue-400">
                AI-Powered Continuing Education
              </h1>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView('assessment')}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md",
                    view === 'assessment' 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  )}
                >
                  Take Assessment
                </button>

                <button
                  onClick={() => setView('dashboard')}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md",
                    view === 'dashboard' 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  )}
                >
                  <Award className="w-4 h-4 inline-block mr-1" />
                  Certificates
                </button>

                <button
                  onClick={() => setView('profile')}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md",
                    view === 'profile' 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  )}
                >
                  <UserIcon className="w-4 h-4 inline-block mr-1" />
                  {user.firstName}
                </button>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 rounded-md hover:bg-gray-800"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">
                Learn • Verify • Earn Credits
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                AI-Powered Learning Assessment
              </h2>
              <p className="text-lg text-gray-400">
                Submit any text and get an instant assessment with multiple-choice questions. 
                Test your knowledge and earn certificates for high scores!
              </p>
            </div>

            <AuthForm onSignIn={handleSignIn} onSignUp={handleSignUp} />
          </div>
        ) : (
          <>
            {!user.emailVerified && (
              <div className="mb-6">
                <EmailVerification email={user.email} />
              </div>
            )}
            
            {view === 'assessment' ? (
              <div className="flex flex-col items-center space-y-6">
                <TextInput
                  value={text}
                  onChange={setText}
                  onSubmit={handleGenerateAssessment}
                  isLoading={loading}
                />

                {error && (
                  <div className="w-full max-w-2xl p-4 bg-red-900/50 border border-red-800 rounded-lg">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <AssessmentDisplay assessment={assessment} user={user} />
              </div>
            ) : view === 'dashboard' ? (
              <Dashboard user={user} />
            ) : (
              <ProfilePage user={user} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;