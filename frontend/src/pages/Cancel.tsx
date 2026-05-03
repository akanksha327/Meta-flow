import { ArrowLeft, CreditCard, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { useAuth } from '../context/AuthContext';

export function Cancel() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-xl p-8 text-center" elevation="md">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <XCircle className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold text-textPrimary dark:text-textPrimary-dark">Payment canceled</h1>
        <p className="mt-3 text-textSecondary dark:text-textSecondary-dark">
          The Stripe checkout flow was canceled before payment completion, so no charge was recorded.
        </p>

        <div className="mt-6 rounded-2xl border border-primary-200 bg-white p-4 text-left shadow-soft dark:border-primary-800 dark:bg-primary-900/20">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 text-accent" />
            <div>
              <p className="font-medium text-textPrimary dark:text-textPrimary-dark">You can try again</p>
              <p className="mt-1 text-sm text-textSecondary dark:text-textSecondary-dark">
                Return to billing whenever you are ready and launch Stripe Checkout again with the latest amount due.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button className="gap-2" onClick={() => navigate(user ? '/billing' : '/login')}>
            <ArrowLeft className="h-4 w-4" />
            {user ? 'Back to Billing' : 'Log In'}
          </Button>
          <Button variant="outline" onClick={() => navigate(user ? '/dashboard' : '/login')}>
            {user ? 'Dashboard' : 'Back to Login'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
