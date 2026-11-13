import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  prefix?: string;
  formattedValue?: string;
  helperText?: string;
  onChange: (value: number) => void;
  className?: string;
  id?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  prefix = '',
  formattedValue,
  helperText,
  onChange,
  className,
  id
}: SliderProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const sliderId = id || `slider-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className={twMerge(clsx('flex flex-col gap-2', className))}>
      <div className="flex items-center justify-between text-xs">
        <label
          htmlFor={sliderId}
          className="font-medium text-zinc-300 tracking-wide cursor-pointer"
        >
          {label}
        </label>
        <span className="font-mono font-semibold text-zinc-100 bg-zinc-800/80 px-2.5 py-0.5 rounded border border-zinc-700/60 tabular-nums text-xs">
          {formattedValue || `${prefix}${value}${unit}`}
        </span>
      </div>

      <div className="relative flex items-center h-8">
        {/* Track Background */}
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#B89A72] to-[#E6D5BE] rounded-full transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Real Native Input with Expanded 44px Touch Target */}
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none z-10"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={formattedValue || `${prefix}${value}${unit}`}
        />

        {/* Custom Visual Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#E6D5BE] border-2 border-zinc-950 shadow-md shadow-black/60 pointer-events-none transition-transform duration-75 group-hover:scale-110"
          style={{ left: `${percentage}%` }}
        />
      </div>

      {helperText && (
        <span className="text-[11px] text-zinc-500 leading-tight">
          {helperText}
        </span>
      )}
    </div>
  );
}
