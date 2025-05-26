'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlateElement } from './plate-element';
import { useEditorRef, usePath } from '@udecode/plate/react';
import type { PlateRenderElementProps } from '@udecode/plate/react';
import { Transforms, Node, Path } from 'slate';
import { findCollapsiblePaths } from '@/registry/default/components/editor/utilities';

// Elements that carry a `collapsed` flag
import type { BaseElement } from 'slate';
type CollapsibleElement = BaseElement & { collapsed?: boolean };

export function HeadingElement(props: PlateRenderElementProps) {
  const { children } = props;

  // Grab the editor as `any` to satisfy slate transforms
  const editor = useEditorRef() as any;
  // Always compute the real path
  const path = usePath();

  // ─── DYNAMIC COLLAPSIBLE STATE ──────────────────────────────────────────────
  // Re-compute the list of collapsible sibling paths on every editor update.
  const collapsiblePaths: Path[] = useMemo(() => {
    if (!path) return [];
    return findCollapsiblePaths(path, editor as any);
  }, [editor.children, path]);

  // Whether this heading can collapse anything
  const isCollapsible = collapsiblePaths.length > 0;

  // Track the visual collapsed / expanded state for this heading
  const [collapsed, setCollapsed] = useState(false);

  // Keep `collapsed` in sync with the slate model
  useEffect(() => {
    if (isCollapsible && collapsiblePaths.length) {
      const first = Node.get(editor, collapsiblePaths[0]) as CollapsibleElement;
      setCollapsed(!!first.collapsed);
    } else {
      setCollapsed(false);
    }
  }, [editor, isCollapsible, collapsiblePaths]);

  // ─── TOGGLE HANDLER ─────────────────────────────────────────────────────────
  const handleToggle = useCallback(() => {
    const next = !collapsed;
    // Always fetch the latest paths right before toggling to avoid stale lists
    const freshPaths = findCollapsiblePaths(path, editor as any);
    freshPaths.forEach((p) => {
      Transforms.setNodes<CollapsibleElement>(
        editor,
        { collapsed: next },
        { at: p }
      );
    });
    setCollapsed(next);
  }, [collapsed, editor, path]);

  return (
    <PlateElement
      {...props}
      as="h3"
      className="relative px-0.5 pt-[1em] pb-[3px] mb-1 font-semibold !leading-[1.3] text-xl touch-pan-y first:pt-0"
    >
      {isCollapsible && (
        <span
          contentEditable={false}
          onClick={handleToggle}
          style={{ cursor: 'pointer', marginRight: '0.3em' }}
        >
          {collapsed ? '▸' : '▾'}
        </span>
      )}
      {children}
    </PlateElement>
  );
}
