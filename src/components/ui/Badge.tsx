import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-900',
  success: 'bg-green-100 text-green-900',
  warning: 'bg-yellow-100 text-yellow-900',
  destructive: 'bg-red-100 text-red-900',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center px-3 py-1 rounded-full
          text-xs font-medium
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
