import { useState } from 'react';
import { ChevronDown, Eye, EyeOff, Trash2 } from 'lucide-react';
import { EditableSection } from '../../types/rebrandData';

interface EditableSectionManagerProps {
  sections: EditableSection[];
  onUpdateSections: (sections: EditableSection[]) => void;
}

export default function EditableSectionManager({
  sections,
  onUpdateSections,
}: EditableSectionManagerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'policy' | 'page' | 'info'>('all');

  const filteredSections = filterCategory === 'all' 
    ? sections 
    : sections.filter(s => s.category === filterCategory);

  const handleUpdateSection = (id: string, updates: Partial<EditableSection>) => {
    const updated = sections.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    onUpdateSections(updated);
  };

  const handleToggleVisibility = (id: string) => {
    handleUpdateSection(id, { visible: !sections.find(s => s.id === id)?.visible });
  };

  const handleDeleteSection = (id: string) => {
    const updated = sections.filter(s => s.id !== id);
    onUpdateSections(updated);
  };

  const handleAddSection = () => {
    const newSection: EditableSection = {
      id: `custom-${Date.now()}`,
      title: 'New Section',
      content: '',
      order: Math.max(...sections.map(s => s.order), 0) + 1,
      visible: true,
      category: 'page',
    };
    onUpdateSections([...sections, newSection]);
  };

  const categoryLabels = {
    all: 'All Sections',
    policy: 'Policies',
    page: 'Pages',
    info: 'Information',
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(Object.entries(categoryLabels) as Array<[keyof typeof categoryLabels, string]>).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterCategory(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterCategory === key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sections List */}
      <div className="space-y-2">
        {filteredSections.length === 0 ? (
          <div className="p-4 text-center bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">No sections found in this category</p>
          </div>
        ) : (
          filteredSections.map(section => (
            <div key={section.id} className="border border-gray-300 rounded-lg">
              {/* Section Header */}
              <button
                onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}
                className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedId === section.id ? 'rotate-180' : ''
                    }`}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{section.title}</h4>
                    <p className="text-xs text-gray-500 capitalize">{section.category}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleToggleVisibility(section.id);
                    }}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title={section.visible ? 'Hide' : 'Show'}
                  >
                    {section.visible ? (
                      <Eye className="w-4 h-4 text-gray-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {section.id.startsWith('custom-') && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteSection(section.id);
                      }}
                      className="p-2 hover:bg-red-100 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              </button>

              {/* Section Content Editor */}
              {expandedId === section.id && (
                <div className="px-4 py-4 border-t border-gray-300 bg-gray-50 space-y-4">
                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={e => handleUpdateSection(section.id, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Content Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      value={section.content}
                      onChange={e => handleUpdateSection(section.id, { content: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {section.content.length} characters
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={section.category}
                      onChange={e => handleUpdateSection(section.id, { 
                        category: e.target.value as 'policy' | 'page' | 'info' 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="policy">Policy</option>
                      <option value="page">Page</option>
                      <option value="info">Information</option>
                    </select>
                  </div>

                  {/* Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <input
                      type="number"
                      min="1"
                      value={section.order}
                      onChange={e => handleUpdateSection(section.id, { order: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Visibility Toggle */}
                  <div className="flex items-center gap-3 p-3 bg-white rounded border border-gray-300">
                    <input
                      type="checkbox"
                      checked={section.visible}
                      onChange={e => handleUpdateSection(section.id, { visible: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                    <label className="text-sm font-medium text-gray-700">Visible on website</label>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add New Section */}
      <button
        onClick={handleAddSection}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 hover:border-blue-500 hover:text-blue-500 transition-colors font-medium"
      >
        + Add New Section
      </button>
    </div>
  );
}
