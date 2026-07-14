import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }: InputProps) {
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
        <input
          id={inputId}
          className={`
            w-full rounded-xl border px-3 py-2.5 text-[15px] 
            bg-surface/50 backdrop-blur-sm transition-all duration-200 
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface
            ${error ? 'border-red-500/50 focus:border-red-500' : 'border-border/60 hover:border-border focus:border-primary'}
            disabled:opacity-50 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-foreground/60">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <span className="text-[13px] text-red-500 mt-1">{error}</span>}
      {helperText && !error && <span className="text-[13px] text-foreground/60 mt-1">{helperText}</span>}
    </div>
  );
}
