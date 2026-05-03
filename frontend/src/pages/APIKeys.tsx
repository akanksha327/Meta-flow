import { useEffect, useState, useRef } from 'react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Skeleton } from '../components/UI/Skeleton';
import { Key, Plus, MoreVertical, Server, Copy, Check, X, Trash2, Ban, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface ApiRecord {
  id: string;
  name: string;
  baseUrl: string;
}

interface ApiKeyRecord {
  id: string;
  apiId: string;
  apiName: string | null;
  name: string;
  prefix: string;
  key?: string;
  status: 'active' | 'revoked';
  createdAt: string;
  lastUsedAt: string | null;
  usageCount?: number;
}

const copyToClipboard = async (text: string) => {
  try {
    let successful = false;
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      successful = true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      successful = document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    return successful;
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
};

function formatDate(dateValue?: string | null) {
  if (!dateValue) return 'Never';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateValue));
}

export function APIKeys() {
  const [selectedApiId, setSelectedApiId] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [isCopiedId, setIsCopiedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: apis, isLoading: apisLoading } = useQuery<ApiRecord[]>({
    queryKey: ['apis'],
    queryFn: async () => {
      const res = await api.get<ApiRecord[]>('/apis');
      return res.data;
    },
    retry: false,
  });

  useEffect(() => {
    if (!apis?.length) {
      setSelectedApiId('');
      return;
    }
    if (!selectedApiId || !apis.some((apiRecord) => apiRecord.id === selectedApiId)) {
      setSelectedApiId(apis[0].id);
    }
  }, [apis, selectedApiId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: keys, isLoading: keysLoading } = useQuery<ApiKeyRecord[]>({
    queryKey: ['keys', selectedApiId],
    queryFn: async () => {
      const res = await api.get<ApiKeyRecord[]>('/keys', {
        params: selectedApiId ? { apiId: selectedApiId } : undefined,
      });
      return res.data;
    },
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedApiId) throw new Error('Select an API before creating a key.');
      const res = await api.post('/keys', { apiId: selectedApiId });
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['keys'] });
      setNewlyCreatedKey(data.key);
      toast.success('API key created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to create API key');
    },
  });

  const handleCopy = async (text: string, id: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setIsCopiedId(id);
      setTimeout(() => setIsCopiedId(null), 2000);
      toast.success('Full API Key copied successfully');
    } else {
      toast.error('Failed to copy');
    }
  };

  const handleCreate = () => {
    if (!apis?.length) {
      toast.error('Create an API first before generating a key.');
      return;
    }
    createMutation.mutate();
  };

  const isLoading = apisLoading || keysLoading;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-textPrimary dark:text-textPrimary-dark">API Keys</h1>
          <p className="mt-1 text-textSecondary dark:text-textSecondary-dark">
            Manage your keys for authenticating gateway requests.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={handleCreate}
          disabled={createMutation.isPending || !selectedApiId}
        >
          <Plus className="w-4 h-4" />
          {createMutation.isPending ? 'Creating...' : 'Create New Key'}
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-primary-100 p-6 dark:border-primary-800 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-primary-50/10">
          <div className="w-full max-w-xs">
            <label className="ml-1 text-sm font-semibold text-textSecondary uppercase tracking-wider">
              Selected API
            </label>
            <select
              value={selectedApiId}
              onChange={(e) => setSelectedApiId(e.target.value)}
              disabled={!apis?.length}
              className="mt-2 w-full rounded-xl border border-primary-200 bg-surface-card px-4 py-2.5 text-textPrimary transition-colors duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent dark:border-primary-800 dark:bg-surface-cardDark dark:text-textPrimary-dark"
            >
              {apis?.length ? (
                apis.map((apiRecord) => (
                  <option key={apiRecord.id} value={apiRecord.id}>
                    {apiRecord.name}
                  </option>
                ))
              ) : (
                <option value="">No APIs available</option>
              )}
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-textSecondary italic bg-amber-50 dark:bg-amber-900/10 px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-800">
            <Info className="w-4 h-4 text-accent" />
            Full API keys are only shown once. Always copy and store securely.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-primary-50/50 text-xs font-bold text-textSecondary uppercase tracking-widest dark:bg-primary-900/20">
                <th className="px-6 py-5">Key Name</th>
                <th className="px-6 py-5">API</th>
                <th className="px-6 py-5">Key Value (Masked)</th>
                <th className="px-6 py-5">Created</th>
                <th className="px-6 py-5">Last Used</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="p-4"><Skeleton className="h-10 w-full" /></td></tr>
                ))
              ) : keys?.map((key, index) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={key.id}
                  className="group border-b border-primary-50 transition-colors hover:bg-surface/50 dark:border-primary-800/50 dark:hover:bg-primary-800/20"
                >
                  <td className="px-6 py-4 font-medium text-textPrimary dark:text-textPrimary-dark">{key.name}</td>
                  <td className="px-6 py-4 text-sm text-textSecondary dark:text-textSecondary-dark">
                    {key.apiName ?? 'Unknown API'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 group/key">
                      <code className="rounded-lg bg-surface px-3 py-1.5 font-mono text-xs text-textPrimary dark:bg-primary-900 dark:text-textPrimary-dark border border-primary-100 dark:border-primary-800">
                        {key.prefix}************
                      </code>
                      <button 
                        onClick={() => handleCopy(key.key || '', key.id)}
                        className={`p-2 rounded-lg transition-all ${isCopiedId === key.id ? 'bg-emerald-100 text-emerald-600' : 'bg-primary-50 text-primary-400 hover:text-accent hover:bg-accent/10'}`}
                        title="Copy Full API Key (It is only shown once)"
                      >
                        {isCopiedId === key.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-textSecondary dark:text-textSecondary-dark">
                    {formatDate(key.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-textSecondary dark:text-textSecondary-dark">
                    {formatDate(key.lastUsedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${key.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-300'}`}>
                      {key.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-textSecondary hover:text-textPrimary hover:bg-primary-50 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {newlyCreatedKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-surface-card p-10 shadow-2xl dark:bg-surface-cardDark border border-primary-100 dark:border-primary-800"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 mx-auto mb-6">
                <Key className="h-8 w-8" />
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">New API Key Generated</h3>
                <p className="mt-3 text-textSecondary dark:text-textSecondary-dark leading-relaxed">
                  Please copy this key and store it safely. For your security, <span className="font-bold text-accent">it will never be shown again.</span>
                </p>
              </div>

              <div className="mt-8 relative group">
                <div className="flex items-center gap-3 rounded-2xl border border-primary-200 bg-primary-50/50 p-5 font-mono text-sm dark:border-primary-800 dark:bg-primary-900/30 overflow-hidden">
                  <span className="flex-1 truncate text-textPrimary dark:text-textPrimary-dark font-bold">{newlyCreatedKey}</span>
                  <button
                    onClick={() => handleCopy(newlyCreatedKey, 'new')}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all shadow-sm ${isCopiedId === 'new' ? 'bg-emerald-500 text-white' : 'bg-white text-primary-600 hover:bg-primary-50'}`}
                  >
                    {isCopiedId === 'new' ? <Check className="h-5 h-5" /> : <Copy className="h-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="mt-10">
                <Button className="w-full py-4 text-base font-bold shadow-lg shadow-accent/20" onClick={() => setNewlyCreatedKey(null)}>
                  I have saved the key securely
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
