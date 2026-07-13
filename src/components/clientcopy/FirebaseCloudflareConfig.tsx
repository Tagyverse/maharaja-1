import { useState, useEffect } from 'react';
import { AlertCircle, Eye, EyeOff, Copy, Check } from 'lucide-react';
import Button from '../ui/button';

interface FirebaseCloudflareConfigProps {
  clientId: string;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface InfraConfig {
  firebase: {
    apiKey: string;
    projectId: string;
    messagingSenderId: string;
    appId: string;
  };
  cloudflare: {
    accountId: string;
    bucketName: string;
    accessKeyId: string;
    accessKeySecret: string;
  };
}

export default function FirebaseCloudflareConfig({ clientId, showToast }: FirebaseCloudflareConfigProps) {
  const [config, setConfig] = useState<InfraConfig>({
    firebase: {
      apiKey: '',
      projectId: '',
      messagingSenderId: '',
      appId: '',
    },
    cloudflare: {
      accountId: '',
      bucketName: '',
      accessKeyId: '',
      accessKeySecret: '',
    },
  });

  const [showSecrets, setShowSecrets] = useState({
    firebaseApiKey: false,
    cloudflareAccessKeyId: false,
    cloudflareAccessKeySecret: false,
  });

  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, [clientId]);

  const loadConfig = async () => {
    try {
      // Load from Firebase
      const response = await fetch(`/api/get-client-config?clientId=${clientId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.firebaseConfig || data.cloudflareConfig) {
          setConfig({
            firebase: data.firebaseConfig || config.firebase,
            cloudflare: data.cloudflareConfig || config.cloudflare,
          });
        }
      }
    } catch (error) {
      console.log('[v0] First time setup - using defaults');
    }
  };

  const updateConfig = async () => {
    try {
      // Save to Firebase
      await fetch(`/api/save-client-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          firebaseConfig: config.firebase,
          cloudflareConfig: config.cloudflare,
        }),
      });
      showToast('Infrastructure configuration saved', 'success');
    } catch (error) {
      showToast('Failed to save configuration', 'error');
      console.error('[v0] Error saving config:', error);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    showToast(`${label} copied to clipboard`, 'info');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Firebase Configuration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Firebase Configuration
          </h3>
        </div>
        <p className="text-sm text-slate-400">Get these from Firebase Console → Project Settings</p>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm text-slate-300 mb-1">API Key</label>
            <div className="flex gap-2">
              <input
                type={showSecrets.firebaseApiKey ? 'text' : 'password'}
                value={config.firebase.apiKey}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    firebase: { ...config.firebase, apiKey: e.target.value },
                  })
                }
                className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                placeholder="AIzaSy..."
              />
              <button
                onClick={() =>
                  setShowSecrets({
                    ...showSecrets,
                    firebaseApiKey: !showSecrets.firebaseApiKey,
                  })
                }
                className="p-2 hover:bg-slate-700 rounded transition"
              >
                {showSecrets.firebaseApiKey ? (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Project ID</label>
            <input
              type="text"
              value={config.firebase.projectId}
              onChange={(e) =>
                setConfig({
                  ...config,
                  firebase: { ...config.firebase, projectId: e.target.value },
                })
              }
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              placeholder="my-project-id"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Messaging Sender ID</label>
            <input
              type="text"
              value={config.firebase.messagingSenderId}
              onChange={(e) =>
                setConfig({
                  ...config,
                  firebase: {
                    ...config.firebase,
                    messagingSenderId: e.target.value,
                  },
                })
              }
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              placeholder="123456789"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">App ID</label>
            <input
              type="text"
              value={config.firebase.appId}
              onChange={(e) =>
                setConfig({
                  ...config,
                  firebase: { ...config.firebase, appId: e.target.value },
                })
              }
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              placeholder="1:123456789:web:abcdef"
            />
          </div>
        </div>
      </div>

      {/* Cloudflare Configuration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-orange-300 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Cloudflare R2 Configuration
          </h3>
        </div>
        <p className="text-sm text-slate-400">Get these from Cloudflare → R2 → API Tokens</p>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Account ID</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={config.cloudflare.accountId}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    cloudflare: { ...config.cloudflare, accountId: e.target.value },
                  })
                }
                className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                placeholder="abcdef123456"
              />
              <button
                onClick={() =>
                  copyToClipboard(config.cloudflare.accountId, 'Account ID')
                }
                className="p-2 hover:bg-slate-700 rounded transition"
              >
                {copied === 'Account ID' ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Bucket Name</label>
            <input
              type="text"
              value={config.cloudflare.bucketName}
              onChange={(e) =>
                setConfig({
                  ...config,
                  cloudflare: { ...config.cloudflare, bucketName: e.target.value },
                })
              }
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              placeholder="my-store-config"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Access Key ID</label>
            <div className="flex gap-2">
              <input
                type={showSecrets.cloudflareAccessKeyId ? 'text' : 'password'}
                value={config.cloudflare.accessKeyId}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    cloudflare: {
                      ...config.cloudflare,
                      accessKeyId: e.target.value,
                    },
                  })
                }
                className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                placeholder="xxxxx"
              />
              <button
                onClick={() =>
                  setShowSecrets({
                    ...showSecrets,
                    cloudflareAccessKeyId: !showSecrets.cloudflareAccessKeyId,
                  })
                }
                className="p-2 hover:bg-slate-700 rounded transition"
              >
                {showSecrets.cloudflareAccessKeyId ? (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Access Key Secret</label>
            <div className="flex gap-2">
              <input
                type={showSecrets.cloudflareAccessKeySecret ? 'text' : 'password'}
                value={config.cloudflare.accessKeySecret}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    cloudflare: {
                      ...config.cloudflare,
                      accessKeySecret: e.target.value,
                    },
                  })
                }
                className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                placeholder="xxxxx"
              />
              <button
                onClick={() =>
                  setShowSecrets({
                    ...showSecrets,
                    cloudflareAccessKeySecret:
                      !showSecrets.cloudflareAccessKeySecret,
                  })
                }
                className="p-2 hover:bg-slate-700 rounded transition"
              >
                {showSecrets.cloudflareAccessKeySecret ? (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={updateConfig}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition"
      >
        Save Infrastructure Configuration
      </Button>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          Your infrastructure credentials are encrypted and stored securely. They&apos;re used only to publish your store configuration to Cloudflare R2.
        </p>
      </div>
    </div>
  );
}
