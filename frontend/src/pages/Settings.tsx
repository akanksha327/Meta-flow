import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { LogOut, User, Mail, Shield, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-textPrimary dark:text-textPrimary-dark">Settings</h1>
        <p className="text-textSecondary dark:text-textSecondary-dark mt-1">Manage your account and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium text-textPrimary dark:text-textPrimary-dark">Account Details</h3>
          <p className="text-sm text-textSecondary dark:text-textSecondary-dark mt-1">
            Personal information and security settings.
          </p>
        </div>
        
        <Card className="md:col-span-2 p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
              <User className="w-8 h-8 text-primary-500 dark:text-primary-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark">Email Address</p>
              <p className="text-lg font-semibold text-textPrimary dark:text-textPrimary-dark">{user?.email || 'Not logged in'}</p>
            </div>
          </div>

          <div className="border-t border-primary-100 dark:border-primary-800 pt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-textSecondary" />
                <span className="text-textPrimary dark:text-textPrimary-dark">Email Notifications</span>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-textSecondary" />
                <span className="text-textPrimary dark:text-textPrimary-dark">Two-Factor Authentication</span>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-textSecondary" />
                <span className="text-textPrimary dark:text-textPrimary-dark">Security Alerts</span>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>

          <div className="border-t border-primary-100 dark:border-primary-800 pt-6">
            <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10 gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium text-textPrimary dark:text-textPrimary-dark">Plan & Billing</h3>
          <p className="text-sm text-textSecondary dark:text-textSecondary-dark mt-1">
            Manage your subscription and payment methods.
          </p>
        </div>
        
        <Card className="md:col-span-2 p-6">
           <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-textPrimary dark:text-textPrimary-dark">Usage-Based Pricing</p>
                <p className="text-sm text-textSecondary mt-1">You are currently on the Pay-as-you-go plan.</p>
              </div>
              <Button variant="primary" onClick={() => navigate('/billing')}>Manage Billing</Button>
           </div>
        </Card>
      </div>
    </div>
  );
}
