import type { SlateRenderElementProps } from '@udecode/plate';

import { cn } from '@udecode/cn';
import {
  useIndentTodoListElement,
  useIndentTodoListElementState,
} from '@udecode/plate-indent-list/react';

import { Checkbox } from './checkbox';

// ---------------------------------------------------------------------------
// Todo list marker (interactive version)
// ---------------------------------------------------------------------------

export const TodoMarker = ({
  element,
}: Omit<SlateRenderElementProps, 'children'>) => {
  const state = useIndentTodoListElementState({ element });
  const { checkboxProps } = useIndentTodoListElement(state);

  return (
    <div contentEditable={false}>
      <Checkbox
        style={{ left: -24, position: 'absolute', top: 4 }}
        {...checkboxProps}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Todo list item <li>
// – `list-none` kills the default “disc” bullet (the white dot you saw)
// – `pl-6` re‑adds the spacing so text still lines up with the checkbox
// ---------------------------------------------------------------------------

export const TodoLi = ({ children, element }: SlateRenderElementProps) => {
  return (
    <li
      className={cn(
        'relative list-none pl-1',
        (element.checked as boolean) && 'text-muted-foreground line-through'
      )}
    >
      {children}
    </li>
  );
};
