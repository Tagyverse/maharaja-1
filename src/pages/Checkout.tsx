import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Loader, Truck, Tag, X, AlertTriangle, MapPin, MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, push, update, get } from 'firebase/database';
import PaymentSuccessDialog from '../components/PaymentSuccessDialog';
import PaymentFailedDialog from '../components/PaymentFailedDialog';
import PaymentCancelledDialog from '../components/PaymentCancelledDialog';
import LazyImage from '../components/LazyImage';
import AddressManager from '../components/AddressManager';
import type { Coupon } from '../types';
import { brand } from '../config/brand';

interface CheckoutProps {
  onBack: () => void;
  onLoginClick: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout({ onBack, onLoginClick }: CheckoutProps) {
  const { items, subtotal, shippingCharge, taxAmount, total, clearCart, getItemPrice, taxSettings } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [dispatchDetails, setDispatchDetails] = useState('');
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string;
    totalAmount: number;
    customerName: string;
    paymentId: string;
  } | undefined>();
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [showAddressManager, setShowAddressManager] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<{ label: string; type: string } | null>(null);

  useEffect(() => {
    if (!loading) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [loading]);

  useEffect(() => {
    const savedData = localStorage.getItem('checkoutFormData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData({
        name: user?.displayName || parsed.name || '',
        email: user?.email || parsed.email || '',
        phone: parsed.phone || '',
        address: parsed.address || '',
        city: parsed.city || '',
        state: parsed.state || '',
        pincode: parsed.pincode || ''
      });
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('checkoutFormData', JSON.stringify(formData));
  }, [formData]);

  // Recovery: retry any unrecorded payments from localStorage
  useEffect(() => {
    const recoverPendingPayments = async () => {
      try {
        const pending = JSON.parse(localStorage.getItem('pending_payments') || '[]');
        const unrecorded = pending.filter((p: any) => !p.recorded && p.pendingOrderId);
        if (unrecorded.length === 0) return;

        for (const payment of unrecorded) {
          try {
            const orderRef = ref(db, `orders/${payment.pendingOrderId}`);
            const snap = await get(orderRef);
            if (snap.exists()) {
              const order = snap.val();
              if (order.payment_status === 'pending' || order.payment_status === 'requires_verification') {
                await update(orderRef, {
                  payment_status: 'paid_requires_confirmation',
                  razorpay_payment_id: payment.razorpay_payment_id,
                  razorpay_order_id: payment.razorpay_order_id,
                  recovered_from_local: true,
                  updated_at: new Date().toISOString(),
                });
              }
            }
            payment.recorded = true;
          } catch (e) {
            console.warn('[CHECKOUT] Recovery failed for payment:', payment.razorpay_payment_id);
          }
        }
        localStorage.setItem('pending_payments', JSON.stringify(pending));
      } catch (e) { /* ignore */ }
    };
    recoverPendingPayments();
  }, []);

  useEffect(() => {
    const fetchDispatchDetails = async () => {
      try {
        const settingsRef = ref(db, 'site_settings');
        const snapshot = await get(settingsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const settingsId = Object.keys(data)[0];
          if (data[settingsId]?.dispatch_details) {
            setDispatchDetails(data[settingsId].dispatch_details);
          }
        }
      } catch (error) {
        console.error('Error fetching dispatch details:', error);
      }
    };
    fetchDispatchDetails();
  }, []);

  useEffect(() => {
    if (appliedCoupon) {
      calculateDiscount();
    }
  }, [appliedCoupon, subtotal]);

  const calculateDiscount = () => {
    if (!appliedCoupon) {
      setDiscount(0);
      return;
    }

    let calculatedDiscount = 0;
    if (appliedCoupon.discount_type === 'percentage') {
      calculatedDiscount = (subtotal * appliedCoupon.discount_value) / 100;
      if (appliedCoupon.max_discount && calculatedDiscount > appliedCoupon.max_discount) {
        calculatedDiscount = appliedCoupon.max_discount;
      }
    } else {
      calculatedDiscount = appliedCoupon.discount_value;
    }

    setDiscount(Math.min(calculatedDiscount, subtotal));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const couponsRef = ref(db, 'coupons');
      const snapshot = await get(couponsRef);

      if (!snapshot.exists()) {
        setCouponError('Invalid coupon code');
        setCouponLoading(false);
        return;
      }

      const coupons = snapshot.val();
      const couponEntry = Object.entries(coupons).find(
        ([_, coupon]: [string, any]) =>
          coupon.code.toUpperCase() === couponCode.toUpperCase().trim()
      );

      if (!couponEntry) {
        setCouponError('Invalid coupon code');
        setCouponLoading(false);
        return;
      }

      const [couponId, couponData] = couponEntry;
      const coupon = { id: couponId, ...couponData } as Coupon;

      if (!coupon.is_active) {
        setCouponError('This coupon is no longer active');
        setCouponLoading(false);
        return;
      }

      if (coupon.valid_from) {
        const validFrom = new Date(coupon.valid_from);
        if (new Date() < validFrom) {
          setCouponError('This coupon is not yet valid');
          setCouponLoading(false);
          return;
        }
      }

      if (coupon.valid_until) {
        const validUntil = new Date(coupon.valid_until);
        if (new Date() > validUntil) {
          setCouponError('This coupon has expired');
          setCouponLoading(false);
          return;
        }
      }

      if (coupon.usage_limit && coupon.usage_count && coupon.usage_count >= coupon.usage_limit) {
        setCouponError('This coupon has reached its usage limit');
        setCouponLoading(false);
        return;
      }

      if (coupon.min_purchase && subtotal < coupon.min_purchase) {
        setCouponError(`Minimum purchase of ₹${coupon.min_purchase} required`);
        setCouponLoading(false);
        return;
      }

      setAppliedCoupon(coupon);
      setCouponError('');
      setCouponLoading(false);
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Failed to apply coupon');
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setDiscount(0);
    setCouponError('');
  };

  const handleAddressSelect = (address: any) => {
    setFormData({
      name: address.name,
      email: formData.email,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
    setSelectedAddress({ label: address.label || address.type, type: address.type });
    setShowAddressManager(false);
  };

  const finalTotal = total - discount;

  const isIndianNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+91')) return true;
    if (cleaned.startsWith('91') && cleaned.length >= 12) return true;
    if (/^[6-9]\d{9}$/.test(cleaned)) return true;
    if (cleaned.startsWith('0') && cleaned.length === 11) return true;
    return false;
  };

  const redirectToWhatsApp = () => {
    const orderItems = items.map(item => {
      const itemPrice = getItemPrice(item);
      let line = `${item.name} x${item.quantity} = ${itemPrice * item.quantity}`;
      if (item.selectedSize) line += ` (Size: ${item.selectedSize})`;
      if (item.selectedColor) line += ` (Color: ${item.selectedColor})`;
      return line;
    });

    const message = [
      `*NEW ORDER (International)*`,
      ``,
      `*Customer:* ${formData.name}`,
      `*Phone:* ${formData.phone}`,
      `*Email:* ${formData.email}`,
      ``,
      `*Items:*`,
      ...orderItems.map(i => `- ${i}`),
      ``,
      `*Subtotal:* Rs.${subtotal}`,
      shippingCharge > 0 ? `*Shipping:* Rs.${shippingCharge}` : '',
      taxAmount > 0 ? `*Tax:* Rs.${taxAmount}` : '',
      discount > 0 ? `*Discount:* -Rs.${discount}` : '',
      `*Total:* Rs.${finalTotal}`,
      ``,
      `*Shipping Address:*`,
      formData.address,
      `${formData.city}, ${formData.state} - ${formData.pincode}`,
      ``,
      `Please share payment details for international transfer.`,
    ].filter(Boolean).join('\n');

    const whatsappNumber = brand.whatsapp;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isIndianNumber(formData.phone)) {
      redirectToWhatsApp();
      return;
    }

    // Check if Razorpay is loaded, wait if needed
    let razorpayReady = false;
    let retries = 0;
    const maxRetries = 10;

    while (!window.Razorpay && retries < maxRetries) {
      console.log('[CHECKOUT] Waiting for Razorpay to load... (attempt ' + (retries + 1) + ')');
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }

    if (!window.Razorpay) {
      console.error('[CHECKOUT] Razorpay failed to load after 1 second');
      setPaymentError('Payment gateway is not available. Please refresh the page and try again.');
      setShowFailed(true);
      return;
    }

    console.log('[CHECKOUT] Razorpay is ready');
    setLoading(true);

    try {
      const orderItems = items.map(item => {
        const itemPrice = getItemPrice(item);
        return {
          product_id: item.id,
          product_name: item.name,
          product_price: itemPrice,
          quantity: item.quantity,
          subtotal: itemPrice * item.quantity,
          selected_size: item.selectedSize || null,
          selected_color: item.selectedColor || null,
          product_image: item.image_url || null
        };
      });

      const shippingAddress = {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      };

      // Save a pending order to Firebase BEFORE opening Razorpay
      // This ensures we never lose an order even if the browser closes after payment
      const pendingOrderData = {
        user_id: user?.uid || null,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: shippingAddress,
        total_amount: finalTotal,
        subtotal: subtotal,
        shipping_charge: shippingCharge,
        tax_amount: taxAmount,
        tax_percentage: taxSettings?.tax_percentage || 0,
        tax_label: taxSettings?.tax_label || null,
        gst_number: taxSettings?.gst_number || null,
        discount: discount,
        coupon_code: appliedCoupon?.code || null,
        coupon_discount_type: appliedCoupon?.discount_type || null,
        coupon_discount_value: appliedCoupon?.discount_value || null,
        payment_status: 'pending',
        order_status: 'pending',
        created_at: new Date().toISOString(),
        order_items: orderItems,
        dispatch_details: '',
      };

      const ordersRef = ref(db, 'orders');
      const newOrderRef = await push(ordersRef, pendingOrderData);
      const pendingOrderId = newOrderRef.key;
      console.log('[CHECKOUT] Pending order created:', pendingOrderId);

      const apiUrl = '/api/create-payment-session';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalTotal,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment session error:', errorText);
        // Remove the pending order since payment session failed
        if (pendingOrderId) {
          const orderRef = ref(db, `orders/${pendingOrderId}`);
          await update(orderRef, { payment_status: 'session_failed', order_status: 'cancelled' });
        }
        throw new Error(`Failed to create payment session: ${errorText}`);
      }

      const paymentData = await response.json();

      const { order_id: razorpayOrderId, amount, currency, key_id } = paymentData;

      // Store razorpay_order_id on the pending order for tracking
      if (pendingOrderId) {
        const orderRef = ref(db, `orders/${pendingOrderId}`);
        await update(orderRef, { razorpay_order_id: razorpayOrderId });
      }

      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: brand.name,
        description: `${brand.name} Order`,
        order_id: razorpayOrderId,
        handler: async function (razorpayResponse: any) {
          setLoading(true);

          // Immediately save payment details to localStorage as a safety net
          const paymentRecord = {
            pendingOrderId,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
            amount: finalTotal,
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
            timestamp: new Date().toISOString(),
            recorded: false,
          };
          try {
            const existing = JSON.parse(localStorage.getItem('pending_payments') || '[]');
            existing.push(paymentRecord);
            localStorage.setItem('pending_payments', JSON.stringify(existing));
          } catch (e) { /* localStorage might be full, continue */ }

          try {
            const verifyUrl = '/api/verify-payment';

            const verifyResponse = await fetch(verifyUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
              })
            });

            let verifyData;
            try {
              verifyData = await verifyResponse.json();
            } catch (jsonError) {
              console.error('[CHECKOUT] Failed to parse verify response:', jsonError);
              throw new Error('Invalid verification response from server');
            }

            if (verifyResponse.ok && verifyData.verified) {
              // Update the existing pending order to completed with retry
              const updateData = {
                payment_status: 'completed',
                order_status: 'processing',
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                updated_at: new Date().toISOString(),
              };

              if (pendingOrderId) {
                let writeSuccess = false;
                for (let attempt = 0; attempt < 3; attempt++) {
                  try {
                    const orderRef = ref(db, `orders/${pendingOrderId}`);
                    await update(orderRef, updateData);
                    writeSuccess = true;
                    break;
                  } catch (writeErr) {
                    console.error(`[CHECKOUT] Firebase write attempt ${attempt + 1} failed:`, writeErr);
                    if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                  }
                }

                if (!writeSuccess) {
                  // Last resort: write via REST API directly
                  try {
                    const firebaseUrl = 'https://maharajagroups-29c74-default-rtdb.firebaseio.com';
                    await fetch(`${firebaseUrl}/orders/${pendingOrderId}.json`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(updateData),
                    });
                    writeSuccess = true;
                  } catch (restErr) {
                    console.error('[CHECKOUT] REST API fallback also failed:', restErr);
                  }
                }

                if (!writeSuccess) {
                  console.error('[CHECKOUT] CRITICAL: Could not record order completion in Firebase. Payment ID:', razorpayResponse.razorpay_payment_id);
                }
              }

              // Mark as recorded in localStorage
              try {
                const existing = JSON.parse(localStorage.getItem('pending_payments') || '[]');
                const updated = existing.map((p: any) =>
                  p.razorpay_payment_id === razorpayResponse.razorpay_payment_id
                    ? { ...p, recorded: true }
                    : p
                );
                localStorage.setItem('pending_payments', JSON.stringify(updated));
              } catch (e) { /* ignore */ }

              if (appliedCoupon) {
                try {
                  const couponRef = ref(db, `coupons/${appliedCoupon.id}`);
                  const couponSnapshot = await get(couponRef);
                  if (couponSnapshot.exists()) {
                    const currentUsageCount = couponSnapshot.val().usage_count || 0;
                    await update(couponRef, { usage_count: currentUsageCount + 1 });
                  }
                } catch (couponErr) {
                  console.warn('[CHECKOUT] Coupon update failed:', couponErr);
                }
              }

              const details = {
                orderId: pendingOrderId || '',
                totalAmount: finalTotal,
                customerName: formData.name,
                paymentId: razorpayResponse.razorpay_payment_id
              };

              setOrderDetails(details);
              setLoading(false);
              setShowSuccess(true);
              clearCart();

              // Send order confirmation email
              try {
                fetch('/api/send-order-mail', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: formData.email,
                    orderId: pendingOrderId,
                  }),
                }).catch((emailErr) => console.warn('[CHECKOUT] Email send failed:', emailErr));
              } catch (emailError) {
                console.warn('[CHECKOUT] Email error:', emailError);
              }

              // Send Telegram notification
              try {
                const tgRef = ref(db, 'integrations/telegram');
                const tgSnap = await get(tgRef);
                if (tgSnap.exists()) {
                  const tgConfig = tgSnap.val();
                  if (tgConfig.enabled && tgConfig.bot_token && tgConfig.chat_id) {
                    fetch('/api/send-telegram-order', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        orderId: pendingOrderId || '',
                        customerName: formData.name,
                        customerPhone: formData.phone,
                        customerEmail: formData.email,
                        totalAmount: finalTotal,
                        paymentId: razorpayResponse.razorpay_payment_id,
                        items: orderItems,
                        shippingAddress: shippingAddress,
                        telegram_bot_token: tgConfig.bot_token,
                        telegram_chat_id: tgConfig.chat_id,
                      }),
                    }).catch((tgErr) => console.warn('[CHECKOUT] Telegram send failed:', tgErr));
                  }
                }
              } catch (tgError) {
                console.warn('[CHECKOUT] Telegram error:', tgError);
              }
            } else {
              // Verification failed - but payment DID succeed on Razorpay's side
              // Mark it so it can be recovered via webhook or manual check
              if (pendingOrderId) {
                try {
                  const orderRef = ref(db, `orders/${pendingOrderId}`);
                  await update(orderRef, {
                    payment_status: 'paid_verification_pending',
                    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                    razorpay_order_id: razorpayResponse.razorpay_order_id,
                    verification_error: verifyData.error || 'Signature mismatch',
                    updated_at: new Date().toISOString(),
                  });
                } catch (e) {
                  console.error('[CHECKOUT] Failed to update order on verify fail:', e);
                }
              }

              let errorMessage = verifyData.error || 'Payment verification failed.';
              if (verifyData.debug) {
                errorMessage += ` (${verifyData.debug})`;
              }
              errorMessage += ' Your payment was received. Payment ID: ' + razorpayResponse.razorpay_payment_id + '. Our system will confirm your order shortly, or contact support.';

              setPaymentError(errorMessage);
              setShowFailed(true);
            }
          } catch (error) {
            console.error('[CHECKOUT] Exception during verification:', error);
            // Even on exception, try to update the order with payment details so it's not lost
            if (pendingOrderId) {
              for (let attempt = 0; attempt < 3; attempt++) {
                try {
                  const orderRef = ref(db, `orders/${pendingOrderId}`);
                  await update(orderRef, {
                    payment_status: 'paid_requires_confirmation',
                    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                    razorpay_order_id: razorpayResponse.razorpay_order_id,
                    verification_error: error instanceof Error ? error.message : 'Unknown error',
                    updated_at: new Date().toISOString(),
                  });
                  break;
                } catch (updateErr) {
                  console.error(`[CHECKOUT] Retry ${attempt + 1} failed to update order:`, updateErr);
                  if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                }
              }
            }
            setPaymentError(`Your payment was successful (ID: ${razorpayResponse.razorpay_payment_id}). There was a verification delay - your order will be confirmed automatically. If not confirmed within 10 minutes, please contact support with your payment ID.`);
            setShowFailed(true);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: brand.razorpay.themeColor
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setShowCancelled(true);
            // Update order to cancelled when user dismisses the payment modal
            if (pendingOrderId) {
              const orderRef = ref(db, `orders/${pendingOrderId}`);
              update(orderRef, { payment_status: 'cancelled', order_status: 'cancelled', updated_at: new Date().toISOString() });
            }
          }
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response);
        const errorMsg = response.error?.description || 'Payment was declined. Please try again with a different payment method.';
        setPaymentError(errorMsg);
        setShowFailed(true);
        setLoading(false);
        // Update order status to payment_failed
        if (pendingOrderId) {
          const orderRef = ref(db, `orders/${pendingOrderId}`);
          update(orderRef, { payment_status: 'failed', order_status: 'cancelled', updated_at: new Date().toISOString() });
        }
      });

      razorpay.open();
      setLoading(false);
    } catch (error: any) {
      console.error('[CHECKOUT] Error processing order:', error);
      console.error('[CHECKOUT] Error code:', error.code);
      console.error('[CHECKOUT] Error message:', error.message);
      
      let errorMessage = 'An error occurred while processing your order. ';
      
      if (error.code === 'PERMISSION_DENIED') {
        errorMessage += 'Permission denied. Please ensure you are properly logged in.';
      } else if (error instanceof Error) {
        errorMessage += error.message;
      } else if (typeof error === 'string') {
        errorMessage += error;
      } else {
        errorMessage += 'Please try again or contact support.';
      }
      
      setPaymentError(errorMessage);
      setShowFailed(true);
      setLoading(false);
    }
  };

  const handleCloseSuccess = async () => {
    localStorage.removeItem('checkoutFormData');
    setShowSuccess(false);
    onBack();
  };

  const handleCloseFailed = () => {
    setShowFailed(false);
  };

  const handleRetryPayment = () => {
    setShowFailed(false);
    setPaymentError('');
  };

  const handleCloseCancelled = () => {
    setShowCancelled(false);
  };

  const handleRetryAfterCancel = () => {
    setShowCancelled(false);
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      submitButton.click();
    }
  };

  if (!user && !showSuccess) {
    return (
      <div className="min-h-screen bg-brand-soft flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border-2 border-brand-soft text-center max-w-md">
          <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-brand" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to continue with checkout</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onBack}
              className="flex-1 bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors border-2 border-gray-300"
            >
              Go Back
            </button>
            <button
              onClick={onLoginClick}
              className="flex-1 bg-green-100 text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-green-200 transition-colors border border-green-300"
            >
              Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !showSuccess) {
    return (
      <div className="min-h-screen bg-brand-soft flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some products to checkout</p>
          <button
            onClick={onBack}
            className="bg-green-100 text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-green-200 transition-colors border border-green-300"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Payment processing overlay */}
      {loading && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Payment in Progress</h3>
            <p className="text-sm text-gray-600 mb-4">Please do not close or refresh this screen until the payment process is complete.</p>
            <div className="flex items-center justify-center gap-2 text-amber-600">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          </div>
        </div>
      )}

      <PaymentSuccessDialog
        isOpen={showSuccess}
        onClose={handleCloseSuccess}
        orderDetails={orderDetails}
      />

      <PaymentFailedDialog
        isOpen={showFailed}
        onClose={handleCloseFailed}
        onRetry={handleRetryPayment}
        errorMessage={paymentError}
      />

      <PaymentCancelledDialog
        isOpen={showCancelled}
        onClose={handleCloseCancelled}
        onRetry={handleRetryAfterCancel}
      />

      <AddressManager
        isOpen={showAddressManager}
        onClose={() => setShowAddressManager(false)}
        onSelect={handleAddressSelect}
        selectMode={true}
      />

      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4">
        <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 font-semibold mb-6 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 sm:p-7 border-2 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Shipping Details</h2>
              <button
                type="button"
                onClick={() => setShowAddressManager(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-soft text-brand rounded-lg text-xs font-semibold hover:bg-brand-light transition-colors border border-brand-soft"
              >
                <MapPin className="w-3.5 h-3.5" />
                Saved Addresses
              </button>
            </div>

            {selectedAddress && (
              <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                <MapPin className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <span className="text-xs font-medium text-green-700">
                  Using: {selectedAddress.label}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAddress(null)}
                  className="ml-auto p-0.5 hover:bg-green-100 rounded"
                >
                  <X className="w-3 h-3 text-green-600" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm font-medium"
                  disabled={!!user?.email}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 text-sm font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 text-sm font-medium"
                  required
                />
              </div>

              {dispatchDetails && (
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 mb-1">Dispatch Information</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{dispatchDetails}</p>
                    </div>
                  </div>
                </div>
              )}

              {!isIndianNumber(formData.phone) && formData.phone.length > 4 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">International number detected. Your order will be sent via WhatsApp for payment coordination.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border ${
                  !isIndianNumber(formData.phone) && formData.phone.length > 4
                    ? 'bg-green-500 text-white hover:bg-green-600 border-green-600'
                    : 'bg-green-100 text-gray-900 hover:bg-green-200 border-green-300'
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : !isIndianNumber(formData.phone) && formData.phone.length > 4 ? (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    Order via WhatsApp
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-7 border-2 border-gray-200 shadow-sm h-fit">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">Order Summary</h2>

            {/* Delivery Address in Order Summary */}
            {formData.address && (
              <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand" />
                    <h3 className="font-bold text-gray-900 text-sm">Delivery Address</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressManager(true)}
                    className="text-[11px] font-medium text-brand hover:text-brand-dark"
                  >
                    Change
                  </button>
                </div>
                <p className="text-sm font-medium text-gray-800">{formData.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formData.phone}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {formData.address}, {formData.city}{formData.state ? `, ${formData.state}` : ''} - {formData.pincode}
                </p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.cart_item_id} className="flex gap-4 pb-4 border-b border-gray-200">
                  <LazyImage
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                    {(item.selectedSize || item.selectedColor) && (
                      <div className="flex gap-2 mt-1">
                        {item.selectedSize && (
                          <span className="text-xs bg-brand-light text-brand-dark px-2 py-0.5 rounded-full font-semibold">
                            {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="text-xs bg-brand-light text-brand-dark px-2 py-0.5 rounded-full font-semibold">
                            {item.selectedColor}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ₹{(getItemPrice(item) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-gray-600" />
                <h3 className="font-bold text-gray-900 text-sm">Have a Coupon?</h3>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-bold text-green-700">{appliedCoupon.code}</p>
                      {appliedCoupon.description && (
                        <p className="text-xs text-green-600">{appliedCoupon.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    placeholder="Enter coupon code"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase text-sm font-medium"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="w-full px-6 py-2.5 bg-green-100 text-gray-900 rounded-xl font-bold text-sm hover:bg-green-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors border border-green-300"
                  >
                    {couponLoading ? 'Applying...' : 'Apply Coupon'}
                  </button>
                </div>
              )}

              {couponError && (
                <p className="mt-2 text-sm text-red-600 font-medium">{couponError}</p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span className={`font-semibold ${shippingCharge === 0 && subtotal >= 2000 ? 'text-green-600' : ''}`}>
                  {shippingCharge === 0 && subtotal >= 2000 ? (
                    <span className="flex items-center gap-1">
                      FREE <span className="text-xs">🎉</span>
                    </span>
                  ) : (
                    `₹${shippingCharge.toFixed(2)}`
                  )}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span className="font-semibold">Discount</span>
                  <span className="font-bold">-₹{discount.toFixed(2)}</span>
                </div>
              )}
              {taxSettings?.is_enabled && !taxSettings?.include_in_price && taxAmount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>{taxSettings.tax_label} ({taxSettings.tax_percentage}%)</span>
                  <span className="font-semibold">₹{taxAmount.toFixed(2)}</span>
                </div>
              )}
              {taxSettings?.is_enabled && taxSettings?.include_in_price && items.length > 0 && (
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Inclusive of {taxSettings.tax_label} ({taxSettings.tax_percentage}%)</span>
                  <span className="font-semibold">₹{(subtotal - (subtotal / (1 + taxSettings.tax_percentage / 100))).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t-2 border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span className="text-green-600">{'\u20B9'}{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {subtotal >= 2000 && (
              <div className="mb-6 p-4 bg-green-50 rounded-2xl border-2 border-green-300">
                <p className="text-sm font-bold text-green-700 text-center">
                  You're getting FREE shipping on this order!
                </p>
              </div>
            )}

            <div className="bg-brand-soft rounded-2xl p-4 border-2 border-brand-soft">
              <p className="text-sm text-gray-700">
                <span className="font-bold">Payment Method:</span> Razorpay Payment Gateway
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Secure payment processing via Razorpay
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
