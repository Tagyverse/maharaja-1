import { useState, useEffect } from 'react';
import { UploadCloud, FileDown, Cloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getRebrandConfig, getPaymentConfig, getWhatsAppConfig, getTelegramConfig, downloadConfigAsJSON, publishToR2 } from '../../utils/clientCopyFirebase';
import Button from '../ui/button';

interface DataPublishProps {
  clientId: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function DataPublish({ clientId, showToast }: DataPublishProps) {
  const [rebrandConfig, setRebrandConfig] = useState<any>(null);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [whatsappConfig, setWhatsappConfig] = useState<any>(null);
  const [telegramConfig, setTelegramConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [lastPublished, setLastPublished] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [readiness, setReadiness] = useState({
    rebrand: false,
    payment: false,
    whatsapp: false,
    telegram: false,
  });

  useEffect(() => {
    const loadAllConfigs = async () => {
      try {
        const [rebrand, payment, whatsapp, telegram] = await Promise.all([
          getRebrandConfig(clientId),
          getPaymentConfig(clientId),
          getWhatsAppConfig(clientId),
          getTelegramConfig(clientId),
        ]);

        setRebrandConfig(rebrand);
        setPaymentConfig(payment);
        setWhatsappConfig(whatsapp);
        setTelegramConfig(telegram);

        setReadiness({
          rebrand: !!rebrand?.status === 'complete',
          payment: !!payment?.primaryGateway,
          whatsapp: !!whatsapp?.businessNumber,
          telegram: !!telegram?.botToken && !!telegram?.chatId,
        });

        setLoading(false);
      } catch (error) {
        console.error('Error loading configs:', error);
        showToast('Failed to load configurations', 'error');
        setLoading(false);
      }
    };

    loadAllConfigs();
  }, [clientId, showToast]);

  const handlePublish = async () => {
    if (!rebrandConfig?.status === 'complete') {
      showToast('Please complete rebrand configuration first', 'error');
      return;
    }

    if (!paymentConfig?.primaryGateway) {
      showToast('Please configure payment gateway', 'error');
      return;
    }

    setPublishing(true);
    try {
      const configData = {
        rebrand: rebrandConfig,
        payments: paymentConfig,
        notifications: {
          whatsapp: whatsappConfig,
          telegram: telegramConfig,
        },
        publishedAt: new Date().toISOString(),
      };

      const url = await publishToR2(clientId, configData);
      setPublishedUrl(url);
      setLastPublished(new Date().toLocaleString());
      showToast('Configuration published to R2 successfully!', 'success');
    } catch (error) {
      console.error('Error publishing:', error);
      showToast(error instanceof Error ? error.message : 'Failed to publish configuration', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadConfigAsJSON(clientId);
      showToast('Configuration downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading:', error);
      showToast('Failed to download configuration', 'error');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Readiness Check */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${readiness.rebrand ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/60 border-slate-700'}`}>
          <div className="flex items-center gap-2 mb-2">
            {readiness.rebrand ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-slate-400" />
            )}
            <span className={`font-semibold ${readiness.rebrand ? 'text-green-300' : 'text-slate-300'}`}>Rebrand</span>
          </div>
          <p className="text-xs text-slate-400">
            {readiness.rebrand ? 'Complete ✓' : 'Configure in Rebrand tab'}
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${readiness.payment ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/60 border-slate-700'}`}>
          <div className="flex items-center gap-2 mb-2">
            {readiness.payment ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-slate-400" />
            )}
            <span className={`font-semibold ${readiness.payment ? 'text-green-300' : 'text-slate-300'}`}>Payment</span>
          </div>
          <p className="text-xs text-slate-400">
            {readiness.payment ? 'Complete ✓' : 'Configure in Payment tab'}
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${readiness.whatsapp ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/60 border-slate-700'}`}>
          <div className="flex items-center gap-2 mb-2">
            {readiness.whatsapp ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-slate-400" />
            )}
            <span className={`font-semibold ${readiness.whatsapp ? 'text-green-300' : 'text-slate-300'}`}>WhatsApp</span>
          </div>
          <p className="text-xs text-slate-400">
            {readiness.whatsapp ? 'Optional ✓' : 'Optional'}
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${readiness.telegram ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/60 border-slate-700'}`}>
          <div className="flex items-center gap-2 mb-2">
            {readiness.telegram ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-slate-400" />
            )}
            <span className={`font-semibold ${readiness.telegram ? 'text-green-300' : 'text-slate-300'}`}>Telegram</span>
          </div>
          <p className="text-xs text-slate-400">
            {readiness.telegram ? 'Optional ✓' : 'Optional'}
          </p>
        </div>
      </div>

      {/* Publication History */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Cloud className="w-5 h-5 text-cyan-400" />
          Publication Status
        </h3>
        <div className="space-y-4">
          {lastPublished ? (
            <>
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm font-semibold text-green-300 mb-2">✓ Published Successfully</p>
                <p className="text-xs text-green-200 mb-3">Last published: {lastPublished}</p>
              </div>
              {publishedUrl && (
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Published URL</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={publishedUrl}
                      readOnly
                      className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded text-xs text-slate-300 font-mono"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(publishedUrl);
                        showToast('URL copied!', 'success');
                      }}
                      className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-xs transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 bg-slate-700/50 rounded-lg text-center">
              <p className="text-slate-400 text-sm">Not published yet. Click "Publish to R2" below to go live.</p>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Preview */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Configuration Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-slate-700/50 rounded-lg">
            <p className="text-slate-400 font-mono text-xs">
              <strong>Rebrand:</strong> {rebrandConfig?.name || 'Not configured'} {rebrandConfig?.status === 'complete' ? '✓' : '⚠'}
            </p>
          </div>
          <div className="p-3 bg-slate-700/50 rounded-lg">
            <p className="text-slate-400 font-mono text-xs">
              <strong>Primary Gateway:</strong> {paymentConfig?.primaryGateway || 'Not configured'} {paymentConfig?.primaryGateway ? '✓' : '⚠'}
            </p>
          </div>
          <div className="p-3 bg-slate-700/50 rounded-lg">
            <p className="text-slate-400 font-mono text-xs">
              <strong>WhatsApp:</strong> {whatsappConfig?.businessNumber || 'Not configured'} {whatsappConfig?.businessNumber ? '✓' : '-'}
            </p>
          </div>
          <div className="p-3 bg-slate-700/50 rounded-lg">
            <p className="text-slate-400 font-mono text-xs">
              <strong>Telegram:</strong> {telegramConfig?.chatId || 'Not configured'} {telegramConfig?.chatId ? '✓' : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handlePublish}
          disabled={publishing || !readiness.rebrand || !readiness.payment}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {publishing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Cloud className="w-4 h-4" />
              Publish to R2 (Go Live)
            </>
          )}
        </Button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              Export JSON
            </>
          )}
        </button>
      </div>

      {/* Help Information */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <p className="font-semibold mb-1">Publishing Your Store</p>
          <ul className="text-xs space-y-1 list-disc list-inside">
            <li>Your store requires both rebrand and payment configuration before publishing</li>
            <li>Once published, your store becomes live and customers can access it</li>
            <li>You can export your configuration as JSON for backup or sharing</li>
            <li>Publishing to R2 uses Cloudflare CDN for global availability</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
