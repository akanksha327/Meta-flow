import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import toast from 'react-hot-toast';

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, isDemoMode, authMessage } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('First name is required.');
      return;
    }
    if (!email || password.length < 6) {
      toast.error('Valid email required and password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(name, email, password);
      toast.success('Account created! Verification email sent.', { duration: 6000 });
      navigate('/verify-email');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-md p-8" elevation="md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">M</div>
          <h1 className="text-2xl font-bold text-textPrimary dark:text-white">Create Account</h1>
          <p className="text-textSecondary mt-2">Sign up to start tracking your APIs</p>
        </div>

        {authMessage && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-medium">Demo mode is active</p>
            <p className="mt-1">
              {authMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="First Name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
          />
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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : isDemoMode ? 'Open Demo Dashboard' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-textSecondary">
          Already have an account? <Link to="/login" className="text-accent hover:text-accent-dark font-medium transition-colors">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
