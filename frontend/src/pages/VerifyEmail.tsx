import { useEffect, useState } from 'react';
import { Mail, RefreshCw, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { useNavigate } from 'react-router-dom';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

export function VerifyEmail() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);

  // REQUIREMENT 2: Auto-check verification state
  useEffect(() => {
    if (!auth.currentUser) return;

    const interval = setInterval(async () => {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        await firebaseUser.reload();
        if (firebaseUser.emailVerified) {
          clearInterval(interval);
          toast.success('Email verified! Entering dashboard...', { duration: 3000 });
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  // Handle case where user is already verified but navigated here
  useEffect(() => {
    if (user?.emailVerified) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleResend = async () => {
    if (!auth.currentUser) return;
    setIsResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success('Verification email resent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-md p-8 text-center" elevation="md">
        <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold text-textPrimary dark:text-white mb-2">Check your email</h1>
        <p className="text-textSecondary mb-6">
          We've sent a verification link to <br/>
          <span className="font-semibold text-textPrimary dark:text-white">{user?.email}</span>
        </p>

        <div className="flex items-center justify-center gap-2 mb-8 p-3 bg-primary-50/50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
          <RefreshCw className="w-4 h-4 text-accent animate-spin" />
          <span className="text-sm font-medium text-textPrimary dark:text-textPrimary-dark">
            Waiting for verification...
          </span>
        </div>

        <p className="text-sm text-textSecondary mb-8">
          This page will update automatically once you verify.
        </p>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full gap-2" 
            onClick={handleResend}
            disabled={isResending}
          >
            <Mail className="w-4 h-4" />
            {isResending ? 'Sending...' : 'Resend Email'}
          </Button>

          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full text-sm text-textSecondary hover:text-red-500 transition-colors pt-4"
          >
            <LogOut className="w-4 h-4" />
            Sign out and try another email
          </button>
        </div>
      </Card>
    </div>
  );
}
