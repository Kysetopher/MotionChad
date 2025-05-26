'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import { AIChatPlugin } from '@udecode/plate-ai/react';
import {
  type FloatingToolbarState,
  flip,
  offset,
  shift,
  useFloatingToolbar,
  useFloatingToolbarState,
} from '@udecode/plate-floating';
import { LinkPlugin } from '@udecode/plate-link/react';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import {
  useComposedRef,
  useEditorRef,
  useEventEditorValue,
  usePluginOption,
} from '@udecode/plate/react';

import { useIsTouchDevice } from '@/registry/default/hooks/use-is-touch-device';
import { Toolbar } from './toolbar';

export function FloatingToolbar({
  children,
  ref: refProp,
  state,
  ...props
}: React.ComponentProps<typeof Toolbar> & {
  state?: FloatingToolbarState;
}) {
  const editor = useEditorRef();
  const focusedEditorId = useEventEditorValue('focus');
  const isFloatingLinkOpen = !!usePluginOption(LinkPlugin, 'mode');
  const aiOpen = usePluginOption(AIChatPlugin, 'open');
  const isSelectingSomeBlocks = usePluginOption(
    BlockSelectionPlugin,
    'isSelectingSome'
  );

  // ──────────────────────────
  // Mobile placement tweak
  // ──────────────────────────
  const isTouchDevice = useIsTouchDevice();
  const placement = isTouchDevice ? 'bottom-start' : 'top-start';
  const crossAxisOffset = isTouchDevice ? 0 : -24;

  const floatingToolbarState = useFloatingToolbarState({
    editorId: editor.id,
    focusedEditorId,
    hideToolbar: aiOpen || isFloatingLinkOpen || isSelectingSomeBlocks,
    ...state,
    floatingOptions: {
      middleware: [
        offset({
          crossAxis: crossAxisOffset,
          mainAxis: 12,
        }),
        shift({ padding: 10 }),
        flip({
          fallbackPlacements: [
            'top-start',
            'top-end',
            'bottom-start',
            'bottom-end',
          ],
          padding: 12,
        }),
      ],
      placement,
      ...state?.floatingOptions,
    },
  });

  const {
    clickOutsideRef,
    hidden,
    props: rootProps,
    ref: floatingRef,
  } = useFloatingToolbar(floatingToolbarState);

  const safeRefProp = typeof refProp === 'string' ? null : refProp;
  const ref = useComposedRef<HTMLDivElement>(safeRefProp, floatingRef);

  if (hidden) return null;

  return (
    <div ref={clickOutsideRef as React.LegacyRef<HTMLDivElement>}>
      <Toolbar
        ref={ref as React.LegacyRef<HTMLDivElement>}
        className={cn(
          'absolute z-50 animate-zoom rounded-lg bg-popover p-1 whitespace-nowrap opacity-100 shadow-toolbar print:hidden',
          'scrollbar-hide max-w-[80vw] overflow-x-auto',
          'border border-green-800/50'
        )}
        {...rootProps}
        {...props}
      >
        {children}
      </Toolbar>
    </div>
  );
}
