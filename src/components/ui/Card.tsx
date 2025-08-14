'use client';

import React from 'react';
import { CardProps } from '@/types';

const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  shadow = 'md',
  padding = 'md',
}) => {
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-2xl',
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseClasses = `
    bg-white rounded-3xl border border-gray-100
    transition-all duration-300 ease-in-out
    hover:shadow-xl hover:scale-[1.02]
    backdrop-blur-sm bg-white/90
  `;

  const classes = `
    ${baseClasses}
    ${shadowClasses[shadow]}
    ${paddingClasses[padding]}
    ${className}
  `;

  return (
    <div className={classes}>
      {title && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {title}
          </h3>
        </div>
      )}
      <div className="text-gray-700">{children}</div>
    </div>
  );
};

export default Card;


