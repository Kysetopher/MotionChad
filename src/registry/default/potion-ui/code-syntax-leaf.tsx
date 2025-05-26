'use client';

import React from 'react';

import { useCodeSyntaxLeaf } from '@udecode/plate-code-block/react';
import { PlateLeaf } from '@udecode/plate/react';

export function CodeSyntaxLeaf({
  children,
  ...props
}: React.ComponentProps<typeof PlateLeaf>) {
  const { leaf } = props;
  const { tokenProps } = useCodeSyntaxLeaf({ leaf });

  return (
    <PlateLeaf {...props}>
      <span {...tokenProps}>{children}</span>
    </PlateLeaf>
  );
}
