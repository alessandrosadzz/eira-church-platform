import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({
  className,
  glow = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'relative rounded-xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md p-5 text-zinc-100 transition-all duration-200',
          glow && 'border-[#C5A880]/30 shadow-[0_0_30px_-5px_rgba(197,168,128,0.12)]',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
