'use client';

// src/components/ui/Textarea.tsx

import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, required, id, className = '', rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined);
    const errorId = textareaId ? `${textareaId}-error` : undefined;
    const helperId = textareaId ? `${textareaId}-helper` : undefined;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-bold tracking-tight text-[#0A0A0A] uppercase"
          >
            {label}
            {required && <span className="text-[#EF4444] ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full p-4 rounded-lg bg-white border text-base text-[#0A0A0A] placeholder-[#A1A1AA] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:border-black disabled:bg-[#F4F4F5] disabled:cursor-not-allowed resize-y ${
            error ? 'border-[#EF4444] focus-visible:ring-[#EF4444]' : 'border-[#E4E4E7] hover:border-[#A1A1AA]'
          } ${className}`}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs font-semibold text-[#DC2626]">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-[#71717A]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
