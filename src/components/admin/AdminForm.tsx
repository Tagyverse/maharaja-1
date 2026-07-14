import React from 'react';
import { Loader2 } from 'lucide-react';

interface AdminFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AdminForm({
  onSubmit,
  isLoading = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onCancel,
  children,
  title,
  description,
}: AdminFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8 space-y-6"
    >
      {title && (
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      )}

      <div className="space-y-6">
        {children}
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 sm:px-6 py-2.5 rounded-lg font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 sm:px-6 py-2.5 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
