import { Request, Response } from 'express';
import { db } from '../../src/lib/firebase';
import { ref, get } from 'firebase/database';
import Razorpay from 'razorpay';
import Stripe from 'stripe';

// Types
interface PaymentRequest {
  clientId: string;
  gateway: 'razorpay' | 'stripe' | 'paypal';
  amount: number;
  currency: string;
  description: string;
  customerId: string;
  orderData: any;
}

interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  clientSecret?: string;
  error?: string;
}

// Decrypt function (matches the one in clientCopyFirebase.ts)
const decryptData = (encrypted: string): string => {
  return atob(encrypted);
};

// Initialize Razorpay
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export default async function handler(
  req: Request,
  res: Response
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { clientId, gateway, amount, currency, description, customerId, orderData }: PaymentRequest = req.body;

    // Fetch client's payment config from Firebase
    const configSnapshot = await get(ref(db, `clients/${clientId}/payments`));
    if (!configSnapshot.exists()) {
      res.status(404).json({ error: 'Payment config not found' });
      return;
    }

    const paymentConfig = configSnapshot.val();

    if (gateway === 'razorpay') {
      const response = await handleRazorpay(
        paymentConfig,
        amount,
        currency,
        description,
        customerId,
        orderData
      );
      res.status(200).json(response);
    } else if (gateway === 'stripe') {
      const response = await handleStripe(
        paymentConfig,
        amount,
        currency,
        description,
        customerId,
        orderData
      );
      res.status(200).json(response);
    } else if (gateway === 'paypal') {
      const response = await handlePayPal(
        paymentConfig,
        amount,
        currency,
        description,
        customerId,
        orderData
      );
      res.status(200).json(response);
    } else {
      res.status(400).json({ error: 'Unsupported payment gateway' });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      error: 'Payment processing failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function handleRazorpay(
  config: any,
  amount: number,
  currency: string,
  description: string,
  customerId: string,
  orderData: any
): Promise<PaymentResponse> {
  try {
    const apiKey = config.gateways?.razorpay?.apiKey;
    if (!apiKey) {
      return { success: false, error: 'Razorpay API key not configured' };
    }

    // Create Razorpay order
    const order = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      description,
      customer_notify: 1,
      receipt: `order-${Date.now()}`,
      notes: {
        customerId,
        orderData: JSON.stringify(orderData),
      },
    });

    return {
      success: true,
      paymentId: order.id,
    };
  } catch (error) {
    console.error('Razorpay error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Razorpay processing failed',
    };
  }
}

async function handleStripe(
  config: any,
  amount: number,
  currency: string,
  description: string,
  customerId: string,
  orderData: any
): Promise<PaymentResponse> {
  try {
    const publishableKey = config.gateways?.stripe?.publishableKey;
    const secretKey = config.gateways?.stripe?.secretKey;

    if (!publishableKey || !secretKey) {
      return { success: false, error: 'Stripe keys not configured' };
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      description,
      metadata: {
        customerId,
        orderData: JSON.stringify(orderData),
      },
    });

    return {
      success: true,
      paymentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    console.error('Stripe error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Stripe processing failed',
    };
  }
}

async function handlePayPal(
  config: any,
  amount: number,
  currency: string,
  description: string,
  customerId: string,
  orderData: any
): Promise<PaymentResponse> {
  try {
    const clientId = config.gateways?.paypal?.clientId;
    const secretId = config.gateways?.paypal?.secretId;

    if (!clientId || !secretId) {
      return { success: false, error: 'PayPal credentials not configured' };
    }

    // Get PayPal access token
    const auth = Buffer.from(`${clientId}:${secretId}`).toString('base64');
    const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      return { success: false, error: 'PayPal authentication failed' };
    }

    const { access_token } = await tokenResponse.json();

    // Create PayPal order
    const orderResponse = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toString(),
            },
            description,
            custom_id: customerId,
          },
        ],
      }),
    });

    if (!orderResponse.ok) {
      return { success: false, error: 'PayPal order creation failed' };
    }

    const paypalOrder = await orderResponse.json();

    return {
      success: true,
      paymentId: paypalOrder.id,
    };
  } catch (error) {
    console.error('PayPal error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PayPal processing failed',
    };
  }
}
