'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { cn, MemoizedChildren } from '@udecode/cn';
import { isType } from '@udecode/plate';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { useDraggable, useDropLine } from '@udecode/plate-dnd';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { ColumnItemPlugin, ColumnPlugin } from '@udecode/plate-layout/react';
import {
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
} from '@udecode/plate-media/react';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import {
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import {
  type PlateRenderElementProps,
  type RenderNodeWrapper,
  ParagraphPlugin,
  useEditorRef,
  useElement,
  usePath,
  usePluginOption,
  useReadOnly,
  useSelected,
} from '@udecode/plate/react';
import { GripVertical } from 'lucide-react';

import { STRUCTURAL_TYPES } from '../components/editor/transforms';
import { BlockMenu } from './block-menu';
import { Button } from './button';
const UNDRAGGABLE_KEYS = [
  ColumnItemPlugin.key,
  TableRowPlugin.key,
  TableCellPlugin.key,
];

export const DraggableAboveNodes: RenderNodeWrapper = (props) => {
  const { editor, element, path } = props;
  const readOnly = useReadOnly();
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const update = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mql.matches);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  const enabled = useMemo(() => {
    if (!isDesktop || readOnly) return false;
    if (path.length === 1 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      return true;
    }
    if (path.length === 3 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: { type: editor.getType(ColumnPlugin) },
      });
      if (block) return true;
    }
    if (path.length === 4 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: { type: editor.getType(TablePlugin) },
      });
      if (block) return true;
    }
    return false;
  }, [editor, element, path, readOnly, isDesktop]);

  // Instead of returning null, return a no-op wrapper
  if (!enabled) {
    function NoOpWrapper(props: any) {
      return <>{props.children}</>;
    }
    NoOpWrapper.displayName = "NoOpWrapper";
    return NoOpWrapper;
  }

  // Return the actual draggable wrapper as a named component
  function RenderDraggable(props: any) {
    return <Draggable {...props} />;
  }
  RenderDraggable.displayName = "RenderDraggable";

  return RenderDraggable;
};


export function Draggable({
  className,
  ...props
}: React.ComponentProps<'div'> & PlateRenderElementProps) {
  const { children, editor, element, path } = props;
  const { isDragging, previewRef, handleRef } = useDraggable({ element });
  const isInColumn = path?.length === 3;
  const isInTable = path?.length === 4;

  return (
    <div
      className={cn(
        'relative',
        isDragging && 'opacity-50',
        STRUCTURAL_TYPES.includes(element.type) ? 'group/structural' : 'group',
        className
      )}
    >
      <Gutter>
        <div
          className={cn(
            'slate-blockToolbarWrapper',
            'flex h-[1.5em]',
            isType(editor, element, [
              HEADING_KEYS.h1,
            ]) && 'h-[1.3em]',
            isInColumn && 'h-4',
            isInTable && 'mt-1 size-4'
          )}
        >
          <div
            className={cn(
              'slate-blockToolbar',
              'pointer-events-auto mr-1 flex items-center',
              isInColumn && 'mr-1.5'
            )}
          >
            

            <div
              ref={handleRef as React.LegacyRef<HTMLDivElement>}
              className="h-6"
            >
              <DragHandle />
            </div>
          </div>
        </div>
      </Gutter>

      <div
        ref={previewRef as React.LegacyRef<HTMLDivElement>}
        className="slate-blockWrapper"
      >
        <MemoizedChildren>{children}</MemoizedChildren>

        <DropLine />
      </div>
    </div>
  );
}
Draggable.displayName = "Draggable";

function Gutter({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const editor = useEditorRef();
  const element = useElement();
  const path = usePath();
  const isSelectionAreaVisible = usePluginOption(
    BlockSelectionPlugin,
    'isSelectionAreaVisible'
  );
  const selected = useSelected();

  const isNodeType = (keys: string[] | string) => isType(editor, element, keys);
  const isInColumn = path?.length === 3;
  const isInTable = path?.length === 4;

  return (
    <div
      className={cn(
        'slate-gutterLeft',
        'absolute -top-px z-50 flex h-full -translate-x-full cursor-text hover:opacity-100 sm:opacity-0',
        STRUCTURAL_TYPES.includes(element.type)
          ? 'group-hover/structural:opacity-100'
          : 'group-hover:opacity-100',
        isSelectionAreaVisible && 'hidden',
        !selected && 'opacity-0',
        isNodeType(HEADING_KEYS.h1) && 'pb-1 text-[1.875em]',
        isNodeType(ParagraphPlugin.key) && 'pt-[3px] pb-0',
        isNodeType(['ul', 'ol']) && 'pb-0',
        isNodeType(BlockquotePlugin.key) && 'pb-0',
        isNodeType(CodeBlockPlugin.key) && 'pt-6 pb-0',
        isNodeType([
          ImagePlugin.key,
          MediaEmbedPlugin.key,
          TogglePlugin.key,
          ColumnPlugin.key,
        ]) && 'py-0',
        isNodeType([PlaceholderPlugin.key, TablePlugin.key]) && 'pt-3 pb-0',
        isInColumn && 'mt-2 h-4 pt-0',
        isInTable && 'size-4',
        className
      )}
      {...props}
      contentEditable={false}
    >
      {children}
    </div>
  );
}
Gutter.displayName = "Gutter";

const DragHandle = React.memo(function DragHandle({
  handleRef,
  ...props
}: any) {
  const editor = useEditorRef();
  const element = useElement();

  return (
    <BlockMenu id={element.id as string} placement="left" animateZoom>
      <Button
        ref={handleRef as React.LegacyRef<HTMLDivElement>}
        {...props}
        variant="ghost"
        className="h-6 w-[18px] shrink-0 rounded-sm p-0 hidden md:block"
        onMouseDown={() => {
          editor
            .getApi(BlockSelectionPlugin)
            .blockSelection.addSelectedRow(element.id as string);
        }}
        data-plate-prevent-unselect
        tabIndex={-1}
        tooltip={
          <div className="text-center">
            Drag <span className="text-gray-400">to move</span>
            <br />
            Click <span className="text-gray-400">to open menu</span>
          </div>
        }
        tooltipContentProps={{
          side: 'bottom',
        }}
      >
        <GripVertical className="size-4 text-muted-foreground/70" />
      </Button>
    </BlockMenu>
  );
});
DragHandle.displayName = "DragHandle";

function DropLine({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { dropLine } = useDropLine();

  if (!dropLine) return null;

  return (
    <div
      {...props}
      className={cn(
        'slate-dropLine',
        'absolute inset-x-0 h-[3px] opacity-100 transition-opacity',
        'bg-red-500',
        dropLine !== 'top' && dropLine !== 'bottom'
          ? 'top-0'
          : dropLine === 'top'
          ? '-top-px'
          : '-bottom-px',
        className
      )}
    >
      {children}
    </div>
  );
}
DropLine.displayName = "DropLine";
