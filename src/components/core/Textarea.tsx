import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({ label, error, helperText, className = '', id, ...props }: TextareaProps) {
  const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : Math.random().toString());

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-foreground/80">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={`
          w-full min-h-[120px] rounded-xl border p-3 text-[15px] 
          bg-surface/50 backdrop-blur-sm transition-all duration-200 
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface
          ${error ? 'border-red-500/50 focus:border-red-500' : 'border-border/60 hover:border-border focus:border-primary'}
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-[13px] text-red-500 mt-1">{error}</span>}
      {helperText && !error && <span className="text-[13px] text-foreground/60 mt-1">{helperText}</span>}
    </div>
  );
}
