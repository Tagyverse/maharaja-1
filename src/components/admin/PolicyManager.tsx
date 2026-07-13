import { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';
import { db } from '../../lib/firebase';
import { ref, get, set, update } from 'firebase/database';
import { brand } from '../../config/brand';

interface Policy {
  key: string;
  title: string;
  content: string;
  isEnabled: boolean;
}

export default function PolicyManager() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [saving, setSaving] = useState(false);

  const defaultPolicies: Policy[] = [
    {
      key: 'shipping_policy',
      title: 'Shipping Policy',
      content: `# Shipping Policy

${brand.policies.shipping.intro}

## Processing Time
${brand.policies.shipping.processingTime.map(item => `- ${item}`).join('\n')}

## Shipping Time
- Once shipped, orders usually take ${brand.policies.shipping.shippingTime.domestic}
- ${brand.policies.shipping.shippingTime.note}

## Shipping Charges
${brand.policies.shipping.shippingCharges.map(item => `- ${item}`).join('\n')}

## Order Tracking
- ${brand.policies.shipping.orderTracking}

## Incorrect Address
${brand.policies.shipping.incorrectAddress.map(item => `- ${item}`).join('\n')}

## Delays
${brand.policies.shipping.delays.map(item => `- ${item}`).join('\n')}

## Returns / Exchanges / Refunds
${brand.policies.shipping.returns.map(item => `- ${item}`).join('\n')}

## Lost or Damaged Parcels
${brand.policies.shipping.lostDamaged.map(item => `- ${item}`).join('\n')}`,
      isEnabled: true
    },
    {
      key: 'privacy_policy',
      title: 'Privacy Policy',
      content: `# Privacy Policy

${brand.policies.privacy}

## Contact Us
For privacy concerns, contact us at ${brand.email}`,
      isEnabled: true
    },
    {
      key: 'about_us',
      title: 'About Us',
      content: `# About ${brand.name}

${brand.aboutUs}

## For Customization
WhatsApp us for custom orders and special requests!`,
      isEnabled: true
    },
    {
      key: 'terms_conditions',
      title: 'Terms & Conditions',
      content: `# Terms & Conditions

${brand.policies.terms}

## Contact
For any queries, contact us at ${brand.email}

By continuing to use our website, you agree to follow these terms.`,
      isEnabled: true
    }
  ];

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const policiesRef = ref(db, 'policies');
      const snapshot = await get(policiesRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const policiesArray = Object.keys(data).map(key => ({
          ...data[key],
          key
        }));
        setPolicies(policiesArray);
      } else {
        const policiesData: any = {};
        defaultPolicies.forEach(policy => {
          policiesData[policy.key] = {
            title: policy.title,
            content: policy.content,
            isEnabled: policy.isEnabled
          };
        });
        await set(policiesRef, policiesData);
        setPolicies(defaultPolicies);
      }
    } catch (error) {
      console.error('Error loading policies:', error);
      setPolicies(defaultPolicies);
    }
  };

  const savePolicies = async () => {
    setSaving(true);
    try {
      const policiesData: any = {};
      policies.forEach(policy => {
        policiesData[policy.key] = {
          title: policy.title,
          content: policy.content,
          isEnabled: policy.isEnabled
        };
      });

      await update(ref(db, 'policies'), policiesData);
      alert('Policies saved successfully!');
    } catch (error) {
      console.error('Error saving policies:', error);
      alert('Failed to save policies');
    } finally {
      setSaving(false);
    }
  };

  const updatePolicy = (key: string, updates: Partial<Policy>) => {
    setPolicies(policies.map(policy =>
      policy.key === key ? { ...policy, ...updates } : policy
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Policy Management</h3>
        <button
          onClick={savePolicies}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All Policies'}
        </button>
      </div>

      <div className="space-y-6">
        {policies.map((policy) => (
          <div key={policy.key} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-teal-600" />
                <input
                  type="text"
                  value={policy.title}
                  onChange={(e) => updatePolicy(policy.key, { title: e.target.value })}
                  className="text-lg font-semibold text-gray-900 border-b-2 border-transparent hover:border-gray-300 focus:border-teal-500 outline-none transition-colors"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.isEnabled}
                  onChange={(e) => updatePolicy(policy.key, { isEnabled: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">Show on website</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content (Markdown supported)
              </label>
              <textarea
                value={policy.content}
                onChange={(e) => updatePolicy(policy.key, { content: e.target.value })}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-sm"
                placeholder="Enter policy content..."
              />
              <p className="mt-2 text-xs text-gray-500">
                Use # for headings, ## for subheadings, - for bullet points
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Usage Information</h4>
        <p className="text-sm text-blue-800">
          These policies will appear as bottom sheets when users click on the policy links in the footer.
          Use markdown formatting for better readability. Make sure to save after making changes.
        </p>
      </div>
    </div>
  );
}
