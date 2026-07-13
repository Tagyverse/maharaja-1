import { useState, useEffect, useRef } from 'react';
import { X, Plus, MapPin, CreditCard as Edit2, Trash2, Check, Home, Briefcase } from 'lucide-react';

interface Address {
  id: string;
  label: string;
  type: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface AddressManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (address: Address) => void;
  selectMode?: boolean;
}

export default function AddressManager({ isOpen, onClose, onSelect, selectMode = false }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<Omit<Address, 'id' | 'isDefault'>>({
    label: '',
    type: 'home',
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('saved_addresses');
    if (saved) {
      try {
        setAddresses(JSON.parse(saved));
      } catch { setAddresses([]); }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSheetExpanded(false);
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isOpen) return;
    const handleScroll = () => {
      if (el.scrollTop > 40 && !sheetExpanded) {
        setSheetExpanded(true);
      } else if (el.scrollTop <= 10 && sheetExpanded) {
        setSheetExpanded(false);
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [isOpen, sheetExpanded]);

  const saveAddresses = (updated: Address[]) => {
    setAddresses(updated);
    localStorage.setItem('saved_addresses', JSON.stringify(updated));
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) return;

    if (editingId) {
      const updated = addresses.map(a => a.id === editingId ? { ...a, ...formData } : a);
      saveAddresses(updated);
    } else {
      const newAddress: Address = {
        ...formData,
        id: Date.now().toString(),
        isDefault: addresses.length === 0,
      };
      saveAddresses([...addresses, newAddress]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    if (updated.length > 0 && !updated.some(a => a.isDefault)) {
      updated[0].isDefault = true;
    }
    saveAddresses(updated);
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    saveAddresses(updated);
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      label: address.label,
      type: address.type,
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ label: '', type: 'home', name: '', phone: '', address: '', city: '', state: '', pincode: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`absolute left-0 right-0 bg-white flex flex-col overflow-hidden rounded-t-3xl transition-[top,border-radius] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          sheetExpanded ? 'top-0 !rounded-t-none' : 'top-[8%]'
        }`}
        style={{ bottom: 0 }}
      >
        {/* Drag handle */}
        {!sheetExpanded && (
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-soft flex items-center justify-center">
              <MapPin className="w-4 h-4 text-brand" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">
              {selectMode ? 'Select Address' : 'My Addresses'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 min-h-0">
          {!showForm ? (
            <>
              {addresses.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">No saved addresses</p>
                  <p className="text-xs text-gray-400">Add an address for faster checkout</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`relative p-4 rounded-xl border transition-all ${
                        addr.isDefault ? 'border-brand-soft bg-brand-soft/30' : 'border-gray-100 bg-gray-50/50'
                      } ${selectMode ? 'cursor-pointer hover:border-brand' : ''}`}
                      onClick={() => selectMode && onSelect?.(addr)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                            {addr.type === 'home' ? <Home className="w-3 h-3 text-gray-500" /> : <Briefcase className="w-3 h-3 text-gray-500" />}
                          </span>
                          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                            {addr.label || addr.type}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-medium text-brand bg-brand-light px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </div>
                        {!selectMode && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEdit(addr)} className="w-7 h-7 rounded-full hover:bg-gray-200 flex items-center justify-center">
                              <Edit2 className="w-3 h-3 text-gray-500" />
                            </button>
                            <button onClick={() => handleDelete(addr.id)} className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center">
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800">{addr.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      {!selectMode && !addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="mt-2 text-[11px] font-medium text-brand hover:text-brand-dark flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Set as default
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowForm(true)}
                className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-brand hover:text-brand hover:bg-brand-soft transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={resetForm} className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                  Cancel
                </button>
                <span className="text-gray-300">|</span>
                <span className="text-sm font-semibold text-gray-800">
                  {editingId ? 'Edit Address' : 'New Address'}
                </span>
              </div>

              {/* Type selector */}
              <div className="flex gap-2">
                {(['home', 'work', 'other'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFormData(p => ({ ...p, type }))}
                    className={`px-4 py-2 rounded-full text-xs font-medium capitalize transition-all ${
                      formData.type === type
                        ? 'bg-green-100 text-gray-900 border-green-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Label (e.g., My Home)"
                value={formData.label}
                onChange={e => setFormData(p => ({ ...p, label: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-light focus:border-brand outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-light focus:border-brand outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone *"
                  value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-light focus:border-brand outline-none"
                />
              </div>
              <textarea
                placeholder="Full Address *"
                value={formData.address}
                onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-light focus:border-brand outline-none resize-none"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="City *"
                  value={formData.city}
                  onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                  className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-light focus:border-brand outline-none"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
                  className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-light focus:border-brand outline-none"
                />
                <input
                  type="text"
                  placeholder="Pincode *"
                  value={formData.pincode}
                  onChange={e => setFormData(p => ({ ...p, pincode: e.target.value }))}
                  className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-light focus:border-brand outline-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode}
                className="w-full py-3.5 bg-green-100 text-gray-900 rounded-xl text-sm font-bold hover:bg-green-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-green-300"
              >
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
