import React from 'react';
import { RenderLeafProps } from '@udecode/plate-core';

export const HighlightLeaf = (props: RenderLeafProps) => {
  const { attributes, children, leaf } = props;

  if (leaf.highlight) {
    return (
      <mark {...attributes} style={{ backgroundColor: '#4cbfd2' }}>
        {children}
      </mark>
    );
  }

  return <span {...attributes}>{children}</span>;
};
