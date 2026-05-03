import { useState, useEffect, useRef } from 'react';

import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Skeleton } from '../components/UI/Skeleton';
import { CheckCircle2, Globe, Link as LinkIcon, MoreVertical, Plus, Server, Trash2, Settings, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface ApiRecord {
  id: string;
  name: string;
  baseUrl: string;
  keyCount?: number;
  createdAt: string;
}

interface ApiPayload {
  name: string;
  baseUrl: string;
}

const copyToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for non-https or older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
};

function getNameValidationMessage(name: string) {
  if (!name.trim()) {
    return 'API name is required.';
  }

  return '';
}

function getBaseUrlValidationMessage(baseUrl: string) {
  const trimmedBaseUrl = baseUrl.trim();

  if (!trimmedBaseUrl) {
    return 'Base URL is required.';
  }

  try {
    const parsedUrl = new URL(trimmedBaseUrl);

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return 'Base URL must start with http:// or https://.';
    }
  } catch {
    return 'Enter a valid URL like https://api.example.com.';
  }

  return '';
}

export function APIs() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [nameError, setNameError] = useState('');
  const [baseUrlError, setBaseUrlError] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);


  const { data: apis, isLoading } = useQuery<ApiRecord[]>({
    queryKey: ['apis'],
    queryFn: async () => {
      const res = await api.get<ApiRecord[]>('/apis');
      return res.data;
    },
    retry: false,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const resetCreateForm = () => {
    setName('');
    setBaseUrl('');
    setNameError('');
    setBaseUrlError('');
  };

  const createMutation = useMutation({
    mutationFn: async (payload: ApiPayload) => {
      const res = await api.post<ApiRecord>('/apis', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apis'] });
      toast.success('API created successfully');
      setShowCreate(false);
      resetCreateForm();
    },
    onError: (err: any) => {
      console.error("API Creation Error:", err);
      const msg = err.response?.data?.message || err.message || 'Failed to create API';
      toast.error(msg);
    },
  });

  const handleToggleCreate = () => {
    setShowCreate((currentValue) => {
      const nextValue = !currentValue;

      if (!nextValue) {
        resetCreateForm();
      }

      return nextValue;
    });
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this API? This will also revoke all associated API keys.')) {
      // For now, we don't have a delete endpoint, so we show an alert or implement it later
      toast.error('Delete functionality coming soon!');
      setOpenMenuId(null);
    }
  };


  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedBaseUrl = baseUrl.trim();
    const nextNameError = getNameValidationMessage(trimmedName);
    const nextBaseUrlError = getBaseUrlValidationMessage(trimmedBaseUrl);

    setNameError(nextNameError);
    setBaseUrlError(nextBaseUrlError);

    if (nextNameError || nextBaseUrlError) {
      return;
    }

    createMutation.mutate({
      name: trimmedName,
      baseUrl: trimmedBaseUrl,
    });
  };

  const generateKeyMutation = useMutation({
    mutationFn: async (apiId: string) => {
      const res = await api.post('/keys', { apiId });
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['apis'] });
      queryClient.invalidateQueries({ queryKey: ['keys'] });
      toast.success(`New API Key: ${data.key}`, { duration: 10000 });
      alert(`New API Key: ${data.key}\n\nPlease save this key now as it won't be shown again.`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate key');
    },
  });

  const generateKey = (apiId: string) => {
    if (window.confirm('Generate a new API key for this API?')) {
      generateKeyMutation.mutate(apiId);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-textPrimary dark:text-textPrimary-dark">API Management</h1>
          <p className="mt-1 text-textSecondary dark:text-textSecondary-dark">
            Register each upstream API with a name and base URL so the gateway can forward requests correctly.
          </p>
        </div>
        <Button className="gap-2" onClick={handleToggleCreate}>
          <Plus className="w-4 h-4" />
          {showCreate ? 'Cancel' : 'Register API'}
        </Button>
      </div>

      {showCreate && (
        <Card className="p-6 relative z-10">
          <form onSubmit={handleCreate} className="flex flex-col gap-4 pointer-events-auto">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr_auto] lg:items-end">
              <Input
                label="API Name"
                placeholder="e.g. Production Payment API"
                value={name}
                onChange={(e) => {
                  const val = e.target.value;
                  setName(val);
                  if (nameError) setNameError('');
                }}
                error={nameError}
                disabled={createMutation.isPending}
              />
              <Input
                label="Base URL"
                type="url"
                placeholder="https://api.com"
                value={baseUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setBaseUrl(val);
                  if (baseUrlError) setBaseUrlError('');
                }}
                error={baseUrlError}
                disabled={createMutation.isPending}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
              <Button type="submit" disabled={createMutation.isPending} className="lg:self-end">
                {createMutation.isPending ? 'Creating...' : 'Save API'}
              </Button>
            </div>

            <div className="rounded-xl border border-primary-200 bg-primary-50/40 px-4 py-3 text-sm text-textSecondary dark:border-primary-800 dark:bg-primary-900/20 dark:text-textSecondary-dark">
              <p>Gateway example: <span className="font-mono text-textPrimary dark:text-textPrimary-dark">/gateway/apiId/posts</span> forwards to your base URL.</p>
              <p className="mt-1 text-xs opacity-80 italic">Note: Full API keys are only shown once during creation for security.</p>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 flex flex-col gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !apis || apis.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Server className="w-12 h-12 text-primary-200 dark:text-primary-800 mb-4" />
            <h3 className="text-lg font-medium text-textPrimary dark:text-white">No APIs Registered</h3>
            <p className="text-textSecondary mt-1">Register your first API with its upstream base URL to enable gateway forwarding.</p>
          </div>
        ) : (
          <div className="divide-y divide-primary-100 dark:divide-primary-800/50">
            {apis.map((apiItem) => (
              <div
                key={apiItem.id}
                className="p-6 flex flex-col gap-4 hover:bg-surface/50 dark:hover:bg-primary-800/20 transition-colors lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-800 flex items-center justify-center shrink-0">
                    <Server className="w-5 h-5 text-primary-500 dark:text-primary-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-textPrimary dark:text-textPrimary-dark">{apiItem.name}</h4>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Ready
                      </span>
                    </div>

                    <div className="mt-2 flex items-start gap-2 text-sm text-textSecondary dark:text-textSecondary-dark">
                      <Globe className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="truncate font-mono">{apiItem.baseUrl}</span>
                    </div>

                    <div className="mt-2 flex items-start gap-2 text-sm text-textSecondary dark:text-textSecondary-dark group">
                      <LinkIcon className="mt-0.5 h-4 w-4 shrink-0" />
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-xs font-semibold uppercase tracking-wider text-textSecondary/70">Gateway URL</span>
                        <div className="flex items-center gap-2">
                          <code className="truncate font-mono bg-primary-50/50 dark:bg-primary-900/30 px-2 py-0.5 rounded text-xs border border-primary-100 dark:border-primary-800">
                            {`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/gateway/${apiItem.id}/posts`}
                          </code>
                          <button 
                            onClick={async () => {
                              const url = `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/gateway/${apiItem.id}/posts`;
                              const ok = await copyToClipboard(url);
                              if (ok) toast.success('Gateway URL copied!');
                              else toast.error('Failed to copy');
                            }}
                            className="p-1 hover:bg-primary-100 dark:hover:bg-primary-800 rounded transition-colors"
                            title="Copy Gateway URL"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] text-textSecondary dark:text-textSecondary-dark opacity-60">
                      Include <code className="text-accent">x-api-key</code> in your headers to authenticate requests.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 lg:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => generateKey(apiItem.id)}
                    disabled={generateKeyMutation.isPending}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Generate Key
                  </Button>
                  <div className="text-sm text-textSecondary dark:text-textSecondary-dark">
                    {apiItem.keyCount ?? 0} API key{apiItem.keyCount === 1 ? '' : 's'}
                  </div>
                  <div className="relative inline-block text-left" ref={openMenuId === apiItem.id ? menuRef : null}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(apiItem.id);
                      }}
                      className="text-textSecondary hover:text-textPrimary dark:hover:text-white p-2 shrink-0 transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/50 rounded-lg pointer-events-auto relative z-10"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                      {openMenuId === apiItem.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl border border-primary-100 bg-surface-card p-1 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-primary-800 dark:bg-surface-cardDark"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(apiItem.baseUrl, '_blank');
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-textPrimary hover:bg-primary-50 dark:text-textPrimary-dark dark:hover:bg-primary-900/50 transition-colors pointer-events-auto"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Visit URL
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-textPrimary hover:bg-primary-50 dark:text-textPrimary-dark dark:hover:bg-primary-900/50 transition-colors pointer-events-auto"
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(apiItem.id);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors pointer-events-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete API
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>


              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
