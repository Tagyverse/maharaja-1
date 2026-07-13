import { PaymentModesConfig } from '../types/rebrandData';

export const defaultPaymentModes: PaymentModesConfig = {
  whatsapp: {
    enabled: false,
    phoneNumber: '919345259073',
    messageTemplate: 'Hi! I would like to place an order. Please help me.',
    orderPrefix: 'WA-',
  },
  telegram: {
    enabled: false,
    botToken: '',
    chatId: '',
    messageTemplate: 'New order received: {orderDetails}',
    orderFormat: 'TG-{orderId}',
  },
  prepayment: {
    enabled: false,
    bankName: 'ICICI Bank',
    accountNumber: '1234567890123456',
    ifscCode: 'ICIC0000001',
    accountHolderName: 'Business Name',
    upiId: 'business@upi',
    paymentInstructionsTemplate: 'Please transfer to the following account and reply with transaction details.',
  },
};

export const paymentModeLabels = {
  whatsapp: 'WhatsApp Orders',
  telegram: 'Telegram Orders',
  prepayment: 'Bank Transfer / Prepayment',
};

export const paymentModeDescriptions = {
  whatsapp: 'Allow customers to place orders via WhatsApp',
  telegram: 'Allow customers to place orders via Telegram bot',
  prepayment: 'Allow customers to pay via bank transfer or UPI',
};
