import { ArrowLeft, Mail, Phone, MessageCircle } from 'lucide-react';
import { brand } from '../config/brand';

interface ContactProps {
  onBack: () => void;
}

export default function Contact({ onBack }: ContactProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 sm:p-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Get in Touch</h1>
            <p className="text-gray-300 text-sm">We'd love to hear from you. Reach out anytime.</p>
          </div>

          {/* Contact Cards */}
          <div className="p-6 sm:p-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href={`tel:${brand.phone}`}
                className="group flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Phone className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <p className="text-sm font-bold text-gray-900">{brand.phone}</p>
                </div>
              </a>

              <a
                href={`https://wa.me/${brand.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <MessageCircle className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">WhatsApp</p>
                  <p className="text-sm font-bold text-gray-900">Chat with us</p>
                </div>
              </a>

              <a
                href={`mailto:${brand.email}`}
                className="group flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Mail className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="text-xs font-bold text-gray-900 break-all">{brand.email}</p>
                </div>
              </a>
            </div>

            {/* WhatsApp CTA */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 text-center">
              <p className="text-sm text-gray-700 mb-3">Prefer chatting directly? We respond within minutes.</p>
              <a
                href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(brand.whatsappDefaultMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" />
                Message on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
