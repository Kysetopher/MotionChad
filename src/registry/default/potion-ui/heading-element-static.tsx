'use client';

import * as React from 'react';
import type { SlateElementProps } from '@udecode/plate';
import { SlateElement } from '@udecode/plate';

export const HeadingElementStatic = ({
  children,
  className = '',
  ...props
}: SlateElementProps) => {
  return (
    <SlateElement
      as="h1"
      className={`
        relative
        px-0.5
        pt-[1em]
        pb-[3px]
        mb-1
        font-semibold
        !leading-[1.3]
        text-3xl
        touch-pan-y
        first:pt-0
        ${className}
      `}
      {...props}
    >
      {children}
    </SlateElement>
  );
};
