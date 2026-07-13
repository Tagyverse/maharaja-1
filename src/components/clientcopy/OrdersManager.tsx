import { useState, useEffect } from 'react';
import { Package, Eye, Loader2, RefreshCw, FileDown, ChevronDown, Check } from 'lucide-react';
import { listClientOrders, updateOrderStatus, OrderData } from '../../utils/clientCopyFirebase';

interface OrdersManagerProps {
  clientId: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function OrdersManager({ clientId, showToast }: OrdersManagerProps) {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [clientId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await listClientOrders(clientId);
      setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error loading orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
    showToast('Orders refreshed', 'success');
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderData['orderStatus']) => {
    setUpdatingStatus(orderId);
    try {
      await updateOrderStatus(clientId, orderId, newStatus);
      setOrders(prev =>
        prev.map(o =>
          o.orderId === orderId ? { ...o, orderStatus: newStatus } : o
        )
      );
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
      showToast(`Order ${orderId} updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update order status', 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const downloadOrdersCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Total', 'Status', 'Payment', 'Created'];
    const csv = [
      headers.join(','),
      ...orders.map(o =>
        [
          o.orderId,
          `"${o.customerName}"`,
          o.customerEmail,
          o.customerPhone,
          o.cartTotal,
          o.orderStatus,
          o.paymentStatus,
          new Date(o.createdAt).toLocaleString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${clientId}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Orders exported to CSV', 'success');
  };

  const getStatusColor = (status: OrderData['orderStatus']) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'confirmed':
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
      case 'shipped':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'delivered':
        return 'bg-green-500/10 text-green-300 border-green-500/30';
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
    }
  };

  const getPaymentColor = (status: OrderData['paymentStatus']) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Order Management</h3>
          <p className="text-sm text-slate-400 mt-1">
            Total Orders: <strong className="text-cyan-300">{orders.length}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 transition-colors disabled:opacity-50"
          >
            {refreshing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </>
            )}
          </button>
          <button
            onClick={downloadOrdersCSV}
            disabled={orders.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-12 text-center">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No orders yet. When customers place orders, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.orderId}>
              <button
                onClick={() => setSelectedOrder(selectedOrder?.orderId === order.orderId ? null : order)}
                className="w-full p-4 bg-slate-800/60 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors text-left"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white mb-1">{order.orderId}</div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Customer: <span className="text-slate-300">{order.customerName}</span></p>
                      <p>Items: <span className="text-slate-300">{order.items.length}</span> | Total: <span className="text-cyan-300 font-semibold">₹{order.cartTotal}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className={`inline-block px-2 py-1 rounded text-xs border font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </div>
                      <p className={`text-xs font-semibold mt-1 ${getPaymentColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        selectedOrder?.orderId === order.orderId ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </button>

              {/* Order Details */}
              {selectedOrder?.orderId === order.orderId && (
                <div className="mt-2 p-4 bg-slate-800/60 border border-slate-700 border-t-0 rounded-b-lg space-y-4">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-semibold text-white mb-2 text-sm">Customer Information</h4>
                    <div className="space-y-1 text-sm text-slate-300 bg-slate-700/50 p-3 rounded">
                      <p>
                        <strong>Name:</strong> {order.customerName}
                      </p>
                      <p>
                        <strong>Email:</strong> {order.customerEmail}
                      </p>
                      <p>
                        <strong>Phone:</strong> {order.customerPhone}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 className="font-semibold text-white mb-2 text-sm">Shipping Address</h4>
                    <div className="text-sm text-slate-300 bg-slate-700/50 p-3 rounded">
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-white mb-2 text-sm">Items</h4>
                    <div className="space-y-1 text-sm">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between p-2 bg-slate-700/50 rounded">
                          <span className="text-slate-300">
                            {item.name} <span className="text-slate-500">x{item.quantity}</span>
                          </span>
                          <span className="text-cyan-300 font-semibold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="flex justify-between p-2 border-t border-slate-600 mt-2 font-semibold text-cyan-300">
                        <span>Total</span>
                        <span>₹{order.cartTotal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div>
                    <h4 className="font-semibold text-white mb-2 text-sm">Payment Information</h4>
                    <div className="text-sm text-slate-300 bg-slate-700/50 p-3 rounded space-y-1">
                      <p>
                        <strong>Method:</strong> <span className="capitalize">{order.paymentMethod}</span>
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <span className={`ml-2 font-semibold ${getPaymentColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </p>
                      <p>
                        <strong>Payment ID:</strong> <span className="font-mono text-xs">{order.paymentId}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div>
                    <h4 className="font-semibold text-white mb-2 text-sm">Update Order Status</h4>
                    <div className="flex gap-2 flex-wrap">
                      {['placed', 'confirmed', 'shipped', 'delivered'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(order.orderId, status as OrderData['orderStatus'])}
                          disabled={updatingStatus === order.orderId || order.orderStatus === status}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors capitalize ${
                            order.orderStatus === status
                              ? 'bg-cyan-600 text-white'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-300 disabled:opacity-50'
                          }`}
                        >
                          {updatingStatus === order.orderId && order.orderStatus === status ? (
                            <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                          ) : order.orderStatus === status ? (
                            <Check className="w-3 h-3 inline mr-1" />
                          ) : null}
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                    <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
                    <p>Updated: {new Date(order.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
