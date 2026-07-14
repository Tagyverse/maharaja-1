import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = '',
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3 lg:gap-4',
    md: 'gap-4 sm:gap-6 lg:gap-8',
    lg: 'gap-6 sm:gap-8 lg:gap-12',
  };

  const colClasses = `grid 
    ${columns.mobile ? `grid-cols-${columns.mobile}` : 'grid-cols-1'}
    ${columns.tablet ? `sm:grid-cols-${columns.tablet}` : ''}
    ${columns.desktop ? `lg:grid-cols-${columns.desktop}` : ''}
    ${gapClasses[gap]} ${className}`;

  return <div className={colClasses}>{children}</div>;
}
