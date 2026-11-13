'use client';

// src/components/ui/Button.tsx

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'dark' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Base: 48px touch target on md/lg, focus-visible contrast
    const baseStyles =
      'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none rounded-[var(--radius-btn,0.5rem)]';

    const sizeStyles = {
      sm: 'h-9 px-3 text-xs',
      md: 'h-12 px-5 text-sm min-h-[48px]', // Touch target ergonomico
      lg: 'h-14 px-7 text-base min-h-[56px]',
    }[size];

    const variantStyles = {
      primary:
        'bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)] hover:bg-[var(--accent-hover,#EAB308)] active:bg-[var(--accent-active,#CA8A04)] focus-visible:ring-black border border-black shadow-[2px_2px_0px_#0A0A0A]',
      dark:
        'bg-[#0A0A0A] text-white hover:bg-[#27272A] active:bg-[#3F3F46] focus-visible:ring-[var(--accent,#FACC15)] border border-black',
      secondary:
        'bg-white text-[#0A0A0A] border border-[#E4E4E7] hover:bg-[#F4F4F5] active:bg-[#E4E4E7] focus-visible:ring-black shadow-sm',
      danger:
        'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] hover:bg-[#FCA5A5] active:bg-[#EF4444] active:text-white focus-visible:ring-[#EF4444]',
      ghost:
        'bg-transparent text-[#0A0A0A] hover:bg-[#F4F4F5] active:bg-[#E4E4E7] focus-visible:ring-black',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
