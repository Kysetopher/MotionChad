import React from 'react';

import type { SlateRenderElementProps } from '@udecode/plate';

import { cn } from '@udecode/cn';

import { CheckboxStatic } from './checkbox-static';

// ---------------------------------------------------------------------------
// Static (read‑only) todo list marker & list item
// Uses the same bullet‑removal trick as the interactive version
// ---------------------------------------------------------------------------

export const TodoMarkerStatic = ({
  element,
}: Omit<SlateRenderElementProps, 'children'>) => {
  return (
    <div contentEditable={false}>
      <CheckboxStatic
        className="pointer-events-none absolute top-1 -left-6"
        checked={element.checked as boolean}
      />
    </div>
  );
};

export const TodoLiStatic = ({
  children,
  element,
}: SlateRenderElementProps) => {
  return (
    <span
      className={cn(
        'relative list-none pl-1',
        (element.checked as boolean) && 'text-muted-foreground line-through'
      )}
    >
      {children}
    </span>
  );
};
