import type { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, CreditCard } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface ConfirmedPayment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELED';
  stripeSessionId: string;
  createdAt: string;
  completedAt: string | null;
}

interface ApiErrorResponse {
  message?: string;
}

function formatCurrency(amount = 0, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const sessionId = searchParams.get('session_id');

  const {
    data: confirmedPayment,
    isLoading,
    error,
  } = useQuery<ConfirmedPayment, AxiosError<ApiErrorResponse>>({
    queryKey: ['payment-confirmation', sessionId],
    queryFn: async () => {
      const res = await api.post<ConfirmedPayment>('/payment/confirm-session', {
        sessionId,
      });

      return res.data;
    },
    enabled: Boolean(user && sessionId),
    retry: false,
  });

  const confirmationComplete = confirmedPayment?.status === 'PAID';

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-xl p-8 text-center" elevation="md">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold text-textPrimary dark:text-textPrimary-dark">Payment received</h1>
        <p className="mt-3 text-textSecondary dark:text-textSecondary-dark">
          Stripe completed the checkout flow. MeterFlow is now syncing the payment back into your billing records.
        </p>

        {sessionId && (
          <div className="mt-6 rounded-2xl border border-primary-200 bg-primary-50/60 p-4 text-left dark:border-primary-800 dark:bg-primary-900/20">
            <p className="text-sm text-textSecondary dark:text-textSecondary-dark">Stripe session ID</p>
            <p className="mt-1 break-all font-mono text-sm text-textPrimary dark:text-textPrimary-dark">{sessionId}</p>
          </div>
        )}

        {isLoading && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left dark:bg-primary-900/20">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900 dark:text-textPrimary-dark">Finalizing payment record</p>
                <p className="mt-1 text-sm text-amber-900/80 dark:text-textSecondary-dark">
                  We are confirming the Stripe session and updating the PostgreSQL payment record right now.
                </p>
              </div>
            </div>
          </div>
        )}

        {confirmedPayment && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-100/50 p-4 text-left dark:bg-emerald-900/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-800 dark:text-emerald-400">Payment recorded in database</p>
                <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-400/80">
                  Status: {confirmedPayment.status} · Amount: {formatCurrency(confirmedPayment.amount, confirmedPayment.currency)}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-white p-4 text-left dark:bg-primary-900/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-500">Payment sync still needs attention</p>
                <p className="mt-1 text-sm text-textSecondary dark:text-textSecondary-dark">
                  {error.response?.data?.message || 'The local payment record could not be finalized yet.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-primary-200 bg-white p-4 text-left shadow-soft dark:border-primary-800 dark:bg-primary-900/20">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 text-accent" />
            <div>
              <p className="font-medium text-textPrimary dark:text-textPrimary-dark">Next step</p>
              <p className="mt-1 text-sm text-textSecondary dark:text-textSecondary-dark">
                Open billing to confirm the updated amount due and review the payment record that was written for this Stripe session.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button className="gap-2" onClick={() => navigate(user ? '/billing' : '/login')}>
            <ArrowRight className="h-4 w-4" />
            {user ? (confirmationComplete ? 'Go to Billing' : 'Open Billing') : 'Log In'}
          </Button>
          <Button variant="outline" onClick={() => navigate(user ? '/dashboard' : '/login')}>
            {user ? 'Back to Dashboard' : 'Back to Login'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
