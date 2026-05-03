import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import toast from 'react-hot-toast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, continueAsDemo, isDemoMode, authMessage } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccess = async () => {
    setIsSubmitting(true);
    try {
      await continueAsDemo();
      toast.success('Demo dashboard is ready.');
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to enter demo mode.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-md p-8" elevation="md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">M</div>
          <h1 className="text-2xl font-bold text-textPrimary dark:text-white">Welcome Back</h1>
          <p className="text-textSecondary mt-2">Log in to manage your API usage</p>
        </div>

        {authMessage && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-medium">Demo mode is active</p>
            <p className="mt-1">
              {authMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing you in...' : isDemoMode ? 'Enter Dashboard' : 'Log In'}
          </Button>
        </form>

        {isDemoMode && (
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            disabled={isSubmitting}
            onClick={handleDemoAccess}
          >
            Continue in Demo Mode
          </Button>
        )}

        <p className="text-center mt-6 text-sm text-textSecondary">
          Don't have an account? <Link to="/signup" className="text-accent hover:text-accent-dark font-medium transition-colors">Sign up</Link>
        </p>
      </Card>
    </div>
  );
}
