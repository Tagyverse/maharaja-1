import React from 'react';

interface Option {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface AdminButtonGroupProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function AdminButtonGroup({
  options,
  value,
  onChange,
  disabled = false,
  size = 'md',
}: AdminButtonGroupProps) {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-2.5 text-lg',
  };

  return (
    <div className="inline-flex gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          disabled={disabled}
          className={`${sizeStyles[size]} rounded-md font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
            value === option.id
              ? 'bg-white text-indigo-600 border border-indigo-200 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 border border-transparent'
          } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        >
          {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
}
