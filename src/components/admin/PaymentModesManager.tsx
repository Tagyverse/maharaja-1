import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { PaymentModesConfig } from '../../types/rebrandData';
import { defaultPaymentModes } from '../../config/paymentModes';

interface PaymentModesManagerProps {
  paymentModes: PaymentModesConfig;
  onUpdatePaymentModes: (modes: PaymentModesConfig) => void;
}

export default function PaymentModesManager({
  paymentModes,
  onUpdatePaymentModes,
}: PaymentModesManagerProps) {
  const [expandedMode, setExpandedMode] = useState<'whatsapp' | 'telegram' | 'prepayment' | null>(
    'whatsapp',
  );

  const handleToggle = (mode: 'whatsapp' | 'telegram' | 'prepayment') => {
    onUpdatePaymentModes({
      ...paymentModes,
      [mode]: {
        ...paymentModes[mode],
        enabled: !paymentModes[mode].enabled,
      },
    });
  };

  const handleWhatsAppChange = (field: string, value: string) => {
    onUpdatePaymentModes({
      ...paymentModes,
      whatsapp: {
        ...paymentModes.whatsapp,
        [field]: value,
      },
    });
  };

  const handleTelegramChange = (field: string, value: string) => {
    onUpdatePaymentModes({
      ...paymentModes,
      telegram: {
        ...paymentModes.telegram,
        [field]: value,
      },
    });
  };

  const handlePrepaymentChange = (field: string, value: string) => {
    onUpdatePaymentModes({
      ...paymentModes,
      prepayment: {
        ...paymentModes.prepayment,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* WhatsApp Configuration */}
      <div className="border border-gray-300 rounded-lg">
        <button
          onClick={() => setExpandedMode(expandedMode === 'whatsapp' ? null : 'whatsapp')}
          className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">WhatsApp Orders</h3>
              <p className="text-sm text-gray-600">Allow customers to place orders via WhatsApp</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {paymentModes.whatsapp.enabled && (
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <ChevronDown
              className={`w-5 h-5 transition-transform ${expandedMode === 'whatsapp' ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {expandedMode === 'whatsapp' && (
          <div className="px-4 py-4 border-t border-gray-300 bg-gray-50 space-y-4">
            {/* Enable Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={paymentModes.whatsapp.enabled}
                onChange={() => handleToggle('whatsapp')}
                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
              />
              <label className="text-sm font-medium text-gray-700">Enable WhatsApp Orders</label>
            </div>

            {paymentModes.whatsapp.enabled && (
              <>
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Phone Number (with country code)
                  </label>
                  <input
                    type="text"
                    value={paymentModes.whatsapp.phoneNumber}
                    onChange={e => handleWhatsAppChange('phoneNumber', e.target.value)}
                    placeholder="919345259073"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Message Template */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Template
                  </label>
                  <textarea
                    value={paymentModes.whatsapp.messageTemplate}
                    onChange={e => handleWhatsAppChange('messageTemplate', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Order Prefix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Prefix
                  </label>
                  <input
                    type="text"
                    value={paymentModes.whatsapp.orderPrefix}
                    onChange={e => handleWhatsAppChange('orderPrefix', e.target.value)}
                    placeholder="WA-"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Telegram Configuration */}
      <div className="border border-gray-300 rounded-lg">
        <button
          onClick={() => setExpandedMode(expandedMode === 'telegram' ? null : 'telegram')}
          className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Telegram Orders</h3>
            <p className="text-sm text-gray-600">Allow customers to place orders via Telegram bot</p>
          </div>
          <div className="flex items-center gap-3">
            {paymentModes.telegram.enabled && (
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <ChevronDown
              className={`w-5 h-5 transition-transform ${expandedMode === 'telegram' ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {expandedMode === 'telegram' && (
          <div className="px-4 py-4 border-t border-gray-300 bg-gray-50 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={paymentModes.telegram.enabled}
                onChange={() => handleToggle('telegram')}
                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
              />
              <label className="text-sm font-medium text-gray-700">Enable Telegram Orders</label>
            </div>

            {paymentModes.telegram.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bot Token</label>
                  <input
                    type="password"
                    value={paymentModes.telegram.botToken}
                    onChange={e => handleTelegramChange('botToken', e.target.value)}
                    placeholder="Your Telegram Bot Token"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chat ID</label>
                  <input
                    type="text"
                    value={paymentModes.telegram.chatId}
                    onChange={e => handleTelegramChange('chatId', e.target.value)}
                    placeholder="Your Chat ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Template
                  </label>
                  <textarea
                    value={paymentModes.telegram.messageTemplate}
                    onChange={e => handleTelegramChange('messageTemplate', e.target.value)}
                    rows={3}
                    placeholder="New order received: {orderDetails}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Format
                  </label>
                  <input
                    type="text"
                    value={paymentModes.telegram.orderFormat}
                    onChange={e => handleTelegramChange('orderFormat', e.target.value)}
                    placeholder="TG-{orderId}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Prepayment Configuration */}
      <div className="border border-gray-300 rounded-lg">
        <button
          onClick={() => setExpandedMode(expandedMode === 'prepayment' ? null : 'prepayment')}
          className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bank Transfer / Prepayment</h3>
            <p className="text-sm text-gray-600">Allow customers to pay via bank transfer or UPI</p>
          </div>
          <div className="flex items-center gap-3">
            {paymentModes.prepayment.enabled && (
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <ChevronDown
              className={`w-5 h-5 transition-transform ${expandedMode === 'prepayment' ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {expandedMode === 'prepayment' && (
          <div className="px-4 py-4 border-t border-gray-300 bg-gray-50 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={paymentModes.prepayment.enabled}
                onChange={() => handleToggle('prepayment')}
                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
              />
              <label className="text-sm font-medium text-gray-700">Enable Bank Transfer / UPI</label>
            </div>

            {paymentModes.prepayment.enabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={paymentModes.prepayment.bankName}
                      onChange={e => handlePrepaymentChange('bankName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={paymentModes.prepayment.accountHolderName}
                      onChange={e => handlePrepaymentChange('accountHolderName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={paymentModes.prepayment.accountNumber}
                    onChange={e => handlePrepaymentChange('accountNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={paymentModes.prepayment.ifscCode}
                    onChange={e => handlePrepaymentChange('ifscCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                  <input
                    type="text"
                    value={paymentModes.prepayment.upiId}
                    onChange={e => handlePrepaymentChange('upiId', e.target.value)}
                    placeholder="name@upi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Instructions Template
                  </label>
                  <textarea
                    value={paymentModes.prepayment.paymentInstructionsTemplate}
                    onChange={e => handlePrepaymentChange('paymentInstructionsTemplate', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
