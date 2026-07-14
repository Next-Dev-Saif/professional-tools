import { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
  leftIcon?: ReactNode;
}

export function Select({ label, options, error, leftIcon, className = '', id, ...props }: SelectProps) {
  const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : Math.random().toString());

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-foreground/80">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 text-foreground/60 group-focus-within:text-primary transition-colors">
            {leftIcon}
          </div>
        )}
        <select
          id={inputId}
          className={`
            w-full appearance-none rounded-xl border py-2.5 pr-10 text-[15px] 
            bg-surface/50 backdrop-blur-sm transition-all duration-200 
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface
            ${error ? 'border-red-500/50 focus:border-red-500' : 'border-border/60 hover:border-border focus:border-primary'}
            disabled:opacity-50 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : 'pl-3'}
            ${className}
          `}
          {...props}
        >
          <option value="" disabled>Select an option...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 pr-3.5 flex items-center text-foreground/60 group-focus-within:text-primary transition-colors">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error && <span className="text-[13px] text-red-500 mt-1">{error}</span>}
    </div>
  );
}
