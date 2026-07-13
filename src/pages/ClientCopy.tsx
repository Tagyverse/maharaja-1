import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertCircle, Settings, CreditCard, MessageSquare, Send, Package, FileDown } from 'lucide-react';
import RebrandEditor from '../components/clientcopy/RebrandEditor';
import PaymentConfig from '../components/clientcopy/PaymentConfig';
import WhatsAppConfig from '../components/clientcopy/WhatsAppConfig';
import TelegramConfig from '../components/clientcopy/TelegramConfig';
import DataPublish from '../components/clientcopy/DataPublish';
import OrdersManager from '../components/clientcopy/OrdersManager';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function ClientCopy() {
  const { user } = useAuth();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [clientId, setClientId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract client ID from user or URL
    if (user?.email) {
      const id = user.email.split('@')[0];
      setClientId(id);
      setLoading(false);
    }
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Settings className="w-6 h-6 text-cyan-400" />
                Client Setup & Customization
              </h1>
              <p className="text-sm text-slate-400 mt-1">Complete your store setup: rebrand, payments, notifications & more</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Client ID</p>
              <p className="text-sm font-mono font-bold text-cyan-300">{clientId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="rebrand" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 bg-slate-800 border border-slate-700">
            <TabsTrigger value="rebrand" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
              <span className="hidden sm:inline">Rebrand</span>
              <span className="sm:hidden">Brand</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
              <span className="hidden sm:inline">Payment</span>
              <span className="sm:hidden">Pay</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">WA</span>
            </TabsTrigger>
            <TabsTrigger value="telegram" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
              <span className="hidden sm:inline">Telegram</span>
              <span className="sm:hidden">TG</span>
            </TabsTrigger>
            <TabsTrigger value="publish" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
              <span className="hidden sm:inline">Publish</span>
              <span className="sm:hidden">Pub</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
              <span className="hidden sm:inline">Orders</span>
              <span className="sm:hidden">Ord</span>
            </TabsTrigger>
          </TabsList>

          {/* Rebrand Tab */}
          <TabsContent value="rebrand" className="space-y-4">
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-300">Complete all rebrand settings before publishing. Your homepage will remain unavailable until rebrand is published.</p>
            </div>
            <RebrandEditor clientId={clientId} showToast={showToast} />
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-4">
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300">Configure at least one payment gateway before checkout is available. Test mode is recommended during setup.</p>
            </div>
            <PaymentConfig clientId={clientId} showToast={showToast} />
          </TabsContent>

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp" className="space-y-4">
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-300">Enable customer communication before or after checkout. Customers can contact you and receive order updates via WhatsApp.</p>
            </div>
            <WhatsAppConfig clientId={clientId} showToast={showToast} />
          </TabsContent>

          {/* Telegram Tab */}
          <TabsContent value="telegram" className="space-y-4">
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-purple-300">Receive admin notifications for all business events. You&apos;ll get alerts for orders, payments, customer actions, and system events.</p>
            </div>
            <TelegramConfig clientId={clientId} showToast={showToast} />
          </TabsContent>

          {/* Publish Tab */}
          <TabsContent value="publish" className="space-y-4">
            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-cyan-300">Export your configuration as JSON or publish directly to R2/Cloudflare. Publishing makes your store live and accessible to customers.</p>
            </div>
            <DataPublish clientId={clientId} showToast={showToast} />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-300">View and manage all customer orders. Track order status, view customer details, and update shipping information.</p>
            </div>
            <OrdersManager clientId={clientId} showToast={showToast} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 max-w-md">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg border backdrop-blur text-sm flex items-center gap-2 animate-in slide-in-from-right-full ${
              toast.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                : toast.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-current"></div>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
