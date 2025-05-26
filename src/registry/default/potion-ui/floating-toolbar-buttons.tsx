'use client';

import React from 'react';

import {
  INDENT_LIST_KEYS,
  someIndentList,
  toggleIndentList,
} from '@udecode/plate-indent-list';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import {
  useEditorReadOnly,
  useEditorRef,
  useSelectionAcrossBlocks,
} from '@udecode/plate/react';
import { Editor, Element } from 'slate';
import { CheckSquare, Heading, Highlighter } from 'lucide-react';

import { getBlockType, setBlockType } from '@/registry/default/components/editor/transforms';

import { ColorDropdownMenu } from './color-dropdown-menu';
import { LinkToolbarButton } from './link-toolbar-button';
import { MarkToolbarButton } from './mark-toolbar-button';
import { MoreDropdownMenu } from './more-dropdown-menu';
import { SuggestionToolbarButton } from './suggestion-toolbar-button';
import { ToolbarButton, ToolbarGroup } from './toolbar';

export function FloatingToolbarButtons() {
  const plateEditor = useEditorRef();
  const readOnly = useEditorReadOnly();
  const isSelectionAcrossBlocks = useSelectionAcrossBlocks();

  // ——— Canonical state from Slate (cheap look-ups) ———
  const currentBlockEntry = plateEditor.api.block();
  const currentBlockType = currentBlockEntry ? getBlockType(currentBlockEntry[0]) : '';

  const h1ActiveCanonical = currentBlockType === HEADING_KEYS.h1;

  const todoActiveCanonical =
    someIndentList(plateEditor, INDENT_LIST_KEYS.todo) ||
    !!Editor.above(plateEditor as unknown as Editor, {
      match: (n): n is Element =>
        Element.isElement(n) && (n as any).listStyleType === INDENT_LIST_KEYS.todo,
    });

  // ——— Optimistic local state for snappy UI ———
  const [h1Pressed, setH1Pressed] = React.useState(h1ActiveCanonical);
  const [todoPressed, setTodoPressed] = React.useState(todoActiveCanonical);

  // Keep local ⇆ canonical in sync whenever Slate changes underneath us
  React.useEffect(() => setH1Pressed(h1ActiveCanonical), [h1ActiveCanonical]);
  React.useEffect(() => setTodoPressed(todoActiveCanonical), [todoActiveCanonical]);

  // -----------------------------------------------------------------------
  // UI
  // -----------------------------------------------------------------------

  if (readOnly) return null;

  return (
    <div className="flex" style={{ transform: 'translateX(-1px)', whiteSpace: 'nowrap' }}>
      {/* GROUP 1 —— Primary Formatting Controls */}
      <ToolbarGroup>
        {/* Heading-3 block toggle */}
        <ToolbarButton
          tooltip="Heading 3"
          shortcut="⌘+Option+3"
          pressed={h1Pressed}
          onClick={() => {
            setBlockType(plateEditor, h1ActiveCanonical ? 'p' : HEADING_KEYS.h1);
            setH1Pressed((prev) => !prev);
            plateEditor.tf.focus();
          }}
        >
          <Heading />
        </ToolbarButton>

        {/* Highlight mark */}
        <MarkToolbarButton
          nodeType={HighlightPlugin.key}
          shortcut="⌘+Shift+H"
          tooltip="Highlight"
        >
          <Highlighter />
        </MarkToolbarButton>

        {/* Checkbox (todo-list) toggle */}
        <ToolbarButton
          tooltip="Checkbox"
          shortcut="⌘+Shift+9"
          pressed={todoPressed}
          onClick={() => {
            toggleIndentList(plateEditor, { listStyleType: INDENT_LIST_KEYS.todo });
            setTodoPressed((prev) => !prev);
            plateEditor.tf.focus();
          }}
        >
          <CheckSquare />
        </ToolbarButton>

        <LinkToolbarButton />
      </ToolbarGroup>

      {/* GROUP 2 —— Feedback Controls */}
      <ToolbarGroup>
        <SuggestionToolbarButton />
      </ToolbarGroup>

      {/* GROUP 3 —— Palette & Overflow */}
      <ToolbarGroup>
        <ColorDropdownMenu />
        {!isSelectionAcrossBlocks && <MoreDropdownMenu />}
      </ToolbarGroup>
    </div>
  );
}
