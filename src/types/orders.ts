export type OrderChannel = 'whatsapp' | 'telegram' | 'payment-gateway';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  timestamp: number;
  channel: OrderChannel;
  status: OrderStatus;
  
  // Customer info
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  // Delivery info
  shippingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Order details
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  
  // Channel specific
  paymentMethod?: string;
  paymentId?: string;
  transactionId?: string;
  whatsappLink?: string;
  telegramChatId?: string;
  adminNotified?: boolean;
  
  // Metadata
  notes?: string;
  tags?: string[];
}

export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  byChannel: {
    whatsapp: number;
    telegram: number;
    paymentGateway: number;
  };
}
