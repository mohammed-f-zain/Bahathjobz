import React from 'react';

interface Card2Props {
    children: React.ReactNode;
    className?: string;
    padding?: 'sm' | 'md' | 'lg';
}

export function Card2({ children, className = '', padding = 'md' }: Card2Props) {
    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div className={`border-2 border-gray-200 hover:border-[#456882] hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden bg-white rounded-lg hover:rounded-br-[4rem] shadow-sm flex flex-col ${paddingClasses[padding]} ${className}`}>
            {children}
        </div>
    );
}
