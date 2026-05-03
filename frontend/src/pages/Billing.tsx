import type { AxiosError } from "axios";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  ExternalLink,
  ShieldCheck,
  History,
  BarChart3,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/UI/Card";
import { Button } from "../components/UI/Button";
import { Skeleton } from "../components/UI/Skeleton";
import { api } from "../lib/api";

interface UsageBlock {
  current: number;
  limit: number;
}

interface PaymentHistoryItem {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
  razorpayPaymentId?: string;
}

interface UsageData {
  totalRequests: number;
  daily: number[];
}

interface LatestPayment {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELED";
  razorpayOrderId: string;
  createdAt: string;
  completedAt: string | null;
}

interface BillingData {
  currency: string;
  estimatedTotal: number;
  amountDue: number;
  paidThisCycle: number;
  billingStatus: "PENDING" | "ACTIVE" | "FAILED";
  daysLeft: number;
  requests: UsageBlock;
  storage: UsageBlock;
  latestPayment: LatestPayment | null;
  totalRequests: number;
  billableRequests: number;
  freeTierRequests: number;
  pricePer100Requests: number;
}

interface ApiErrorResponse {
  message?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

function formatCurrency(amount = 0, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateValue?: string | null) {
  if (!dateValue) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

function getPaymentStatusMeta(
  status?: BillingData["billingStatus"] | LatestPayment["status"],
) {
  switch (status) {
    case "ACTIVE":
    case "PAID":
      return {
        label: "Paid",
        icon: CheckCircle2,
        className: "text-emerald-500",
      };
    case "FAILED":
      return {
        label: "Attention Needed",
        icon: AlertTriangle,
        className: "text-red-500",
      };
    case "CANCELED":
      return {
        label: "Canceled",
        icon: AlertTriangle,
        className: "text-amber-500",
      };
    default:
      return {
        label: "Pending",
        icon: Clock3,
        className: "text-amber-500",
      };
  }
}

export function Billing() {
  const { isDemoMode, authMessage, user: authUser, token: authToken } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch Billing Summary
  const {
    data: billing,
    isLoading: isBillingLoading,
    error: billingError,
  } = useQuery<BillingData, AxiosError<ApiErrorResponse>>({
    queryKey: ["billing"],
    queryFn: async () => {
      const res = await api.get<BillingData>("/billing");
      return res.data;
    },
    retry: false,
    enabled: !isDemoMode,
  });

  // 2. Fetch Payment History
  const {
    data: history,
    isLoading: isHistoryLoading,
  } = useQuery<PaymentHistoryItem[]>({
    queryKey: ["payment-history"],
    queryFn: async () => {
      const res = await api.get<PaymentHistoryItem[]>("/payment/history");
      return res.data;
    },
    enabled: !isDemoMode,
  });

  // 3. Fetch Usage Stats
  const {
    data: usage,
    isLoading: isUsageLoading,
  } = useQuery<UsageData>({
    queryKey: ["usage-stats"],
    queryFn: async () => {
      const res = await api.get<UsageData>("/usage");
      return res.data;
    },
    enabled: !isDemoMode,
  });

  const handlePayment = async () => {
    console.log("clicked");
    
    try {
      // Adding Authorization header to the fetch call
      const res = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      
      const data = await res.json();
      console.log("API:", data);

      if (!data || !data.id || !data.amount) {
        alert("Backend not returning order properly. Ensure you are logged in.");
        return;
      }

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.amount,
        currency: "INR",
        name: "MeterFlow",
        order_id: data.id,
        handler: async function (response: any) {
          console.log("Payment Success Callback:", response);
          try {
            await api.post("/payment/verify", response);
            toast.success("Payment Success");
            queryClient.invalidateQueries({ queryKey: ["billing"] });
            queryClient.invalidateQueries({ queryKey: ["payment-history"] });
          } catch (err: any) {
            console.error("Verification error in frontend:", err);
            const msg = err.response?.data?.message || "Verification failed on server";
            toast.error(msg);
          }
        },
      });

      rzp.open();
    } catch (err: any) {
      console.error("Payment error:", err);
      alert("Error starting payment process.");
    }
  };

  const outstandingAmount = billing?.amountDue ?? 0;
  const billingStatusMeta = getPaymentStatusMeta(billing?.billingStatus);
  const latestPaymentMeta = getPaymentStatusMeta(
    billing?.latestPayment?.status,
  );

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-textPrimary dark:text-textPrimary-dark">
            Billing & Usage
          </h1>
          <p className="mt-1 text-textSecondary dark:text-textSecondary-dark">
            Review your usage-based charges and process payments securely via Razorpay.
          </p>
        </div>
        <Button variant="outline" className="gap-2" disabled>
          <Download className="h-4 w-4" />
          Invoices Soon
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Current Balance / Main Action */}
        <Card className="col-span-1 p-8 lg:col-span-2" accent="amber">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-xl font-semibold text-textPrimary dark:text-textPrimary-dark">
                Current Usage
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  Free Plan
                </span>
                <span className="text-sm text-textSecondary">
                  1,000 requests included
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-textPrimary dark:text-textPrimary-dark">
                Cycle ends in
              </p>
              <p className="text-2xl font-bold text-accent">
                {billing?.daysLeft || 0} days
              </p>
            </div>
          </div>

          <div className="grid gap-6 border-t border-primary-100 pt-8 dark:border-primary-800 md:grid-cols-3">
            <div className="p-4 rounded-xl bg-primary-50/50 dark:bg-primary-900/10">
              <p className="text-sm text-textSecondary">Requests used</p>
              <p className="mt-1 text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">
                {billing?.totalRequests || 0}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-primary-50/50 dark:bg-primary-900/10">
              <p className="text-sm text-textSecondary">Already paid</p>
              <p className="mt-1 text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">
                {formatCurrency(billing?.paidThisCycle, billing?.currency)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
              <p className="text-sm text-accent font-medium">Total Due</p>
              <p className="mt-1 text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">
                {formatCurrency(outstandingAmount, billing?.currency)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end border-t border-primary-100 pt-8 dark:border-primary-800 mt-8">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-lg font-bold text-white transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-lg"
              onClick={handlePayment}
              style={{ position: "relative", zIndex: 50 }}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              {outstandingAmount > 0
                ? `Pay ₹${outstandingAmount}`
                : "Pay ₹499 (Test)"}
            </button>
          </div>
        </Card>

        {/* Sidebar Summary */}
        <Card className="col-span-1 bg-primary p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <ShieldCheck className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-lg font-semibold">Payment Summary</h2>
          </div>

          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <latestPaymentMeta.icon
                className={`h-5 w-5 ${latestPaymentMeta.className}`}
              />
              <div>
                <p className="text-sm font-medium text-white/80">
                  Status: {latestPaymentMeta.label}
                </p>
                <p className="text-lg font-semibold">
                  {outstandingAmount > 0
                    ? `Due: ${formatCurrency(outstandingAmount, billing?.currency)}`
                    : "Balance Clear"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="w-full inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-bold text-primary transition-all hover:bg-accent/90 shadow-md"
            onClick={handlePayment}
            style={{ position: "relative", zIndex: 50 }}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Pay Now
          </button>
        </Card>



        {/* Payment History Section */}
        <Card className="col-span-1 lg:col-span-2 p-8" elevation="none">
          <div className="flex items-center gap-3 mb-6">
            <History className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-textPrimary dark:text-textPrimary-dark">
              Recent Payments
            </h2>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {isHistoryLoading ? (
              <div className="py-4 text-center text-textSecondary">Loading history...</div>
            ) : !history || history.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-textSecondary">
                <History className="w-12 h-12 opacity-10 mb-2" />
                <p className="text-xs italic">No payments found</p>
              </div>
            ) : (
              history.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-3 rounded-lg bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100/50 dark:border-primary-800/50 hover:border-accent/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                       <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-textPrimary dark:text-textPrimary-dark">
                        ₹{p.amount}
                      </p>
                      <p className="text-[10px] text-textSecondary">
                        {formatDate(p.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                    p.status === 'PAID' || p.status === 'success' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
