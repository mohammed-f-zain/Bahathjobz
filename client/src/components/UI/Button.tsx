import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'search' | 'cta' | 'blue';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl ' +
    'transition-all duration-300 ease-in-out ' +
    'focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',

    secondary:
      'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',

    outline:
      'border border-[#456882] text-[#456882] hover:bg-[#456882]/10 focus:ring-[#456882]',

    ghost:
      'text-gray-600 hover:bg-gray-50 focus:ring-gray-500',

    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',

    search: `
      text-white
      bg-gradient-to-r
      from-[#1B3C53]
      via-[#234C6A]
      to-[#456882]
      bg-[length:200%_200%]
      hover:bg-[position:100%_50%]
      focus:ring-[#234C6A]
      hover:scale-[1.03]
      hover:shadow-lg
    `,

    cta: `
      text-white
      bg-gradient-to-r
      from-[#234C6A]
      to-[#1B3C53]
      transition-all
      duration-300
      ease-in-out
      hover:from-[#1B3C53]
      hover:to-[#456882]
      hover:scale-[1.05]
      hover:shadow-xl
      focus:ring-[#234C6A]
    `,

    blue:
      `
      bg-[#1292bf]
      text-white hover:bg-[#1292bf]/80
      focus:ring-[#1292bf]
      hover:scale-[1.03] 
      hover:shadow-lg
      `,

  };

  const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-3.5 text-lg',
    xl: 'px-10 py-4 text-xl',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}
