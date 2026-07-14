import React from 'react';
import { X } from 'lucide-react';

interface AdminTagProps {
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  onRemove?: () => void;
  icon?: React.ReactNode;
}

export default function AdminTag({
  label,
  variant = 'default',
  onRemove,
  icon,
}: AdminTagProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${variantStyles[variant]} animate-scale-in`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          type="button"
          aria-label={`Remove ${label}`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
