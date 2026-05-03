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
    <div className="min-h-screen flex bg-primary overflow-hidden">
      {/* Left side - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 bg-primary-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-700/20 rounded-full -ml-48 -mb-48 blur-3xl" />
        
        <div className="relative z-10 max-w-lg mx-auto text-center lg:text-left">
          <div className="flex items-center gap-3 mb-12">
            <img src="/logo.png" alt="Logo" className="w-12 h-12" />
            <span className="text-3xl font-bold text-white tracking-tight">MeterFlow</span>
          </div>
          
          <h2 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Join the future of <span className="text-accent italic">API economy.</span>
          </h2>
          <p className="text-xl text-primary-300 leading-relaxed mb-12">
            Create an account in minutes and start monitoring your usage with millisecond precision.
          </p>

          <div className="relative inline-block">
             <img src="/src/assets/hero.png" alt="Hero Illustration" className="w-full max-w-md mx-auto drop-shadow-2xl animate-pulse-slow" />
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface dark:bg-surface-dark">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-10">
            <div className="lg:hidden flex justify-center mb-6">
               <img src="/logo.png" alt="Logo" className="w-16 h-16" />
            </div>
            <h1 className="text-4xl font-bold text-textPrimary dark:text-white tracking-tight">Create Account</h1>
            <p className="text-textSecondary mt-3 text-lg">Sign up for your developer dashboard</p>
          </div>

          {authMessage && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-sm text-amber-900 backdrop-blur-sm">
              <p className="font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Demo Access Active
              </p>
              <p className="mt-1 opacity-80">
                {authMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="First Name"
              type="text"
              placeholder="Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="bg-white dark:bg-primary-900/50"
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="bg-white dark:bg-primary-900/50"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="bg-white dark:bg-primary-900/50"
            />
            
            <p className="text-xs text-textSecondary leading-relaxed">
              By creating an account, you agree to our <a href="#" className="text-accent font-semibold">Terms of Service</a> and <a href="#" className="text-accent font-semibold">Privacy Policy</a>.
            </p>

            <Button type="submit" className="w-full py-4 text-lg font-bold shadow-xl shadow-accent/20" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : isDemoMode ? 'Enter Demo Dashboard' : 'Get Started'}
            </Button>
          </form>

          <p className="text-center mt-10 text-textSecondary">
            Already have an account? <Link to="/login" className="text-accent hover:text-accent-dark font-bold transition-all border-b-2 border-accent/20 hover:border-accent pb-0.5">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
