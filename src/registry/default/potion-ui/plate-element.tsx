'use client';

import React from 'react';
import { PlateElement as PlateElementPrimitive } from '@udecode/plate/react';
import { BlockSelection } from './block-selection';

// Pull in element so TS knows about your custom flag
type PEProps = React.ComponentProps<typeof PlateElementPrimitive> & {
  element: { collapsed?: boolean }
};

export function PlateElement({
  element,
  children,
  className,
  ...props
}: PEProps) {
  // 1️⃣ if anyone marked this node as collapsed, bail out
  if (element.collapsed) {
    return null;
  }

  // 2️⃣ otherwise render exactly as before
  return (
    <PlateElementPrimitive element={element} className={className} {...props}>
      {children}
      {className?.includes('slate-selectable') && <BlockSelection />}
    </PlateElementPrimitive>
  );
}
