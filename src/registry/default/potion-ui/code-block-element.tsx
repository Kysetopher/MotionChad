'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import { NodeApi } from '@udecode/plate';
import { useCodeBlockElementState } from '@udecode/plate-code-block/react';
import { FilesIcon } from 'lucide-react';

import { useCopyToClipboard } from '@/registry/default/hooks/use-copy-to-clipboard';

import { BlockActionButton } from './block-context-menu';
import { Button } from './button';
import { CodeBlockCombobox } from './code-block-combobox';
import { PlateElement } from './plate-element';

import './code-block-element.css';

export function CodeBlockElement({
  children,
  className,
  ...props
}: React.ComponentProps<typeof PlateElement>) {
  const { element } = props;
  const state = useCodeBlockElementState({ element });
  const { copyToClipboard } = useCopyToClipboard();

  return (
    <PlateElement
      className={cn('group my-1', state.className, className)}
      {...props}
    >
      <pre
        className="overflow-x-auto rounded-md bg-muted pt-[34px] pr-4 pb-8 pl-8 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid"
        data-plate-open-context-menu
      >
        <code>{children}</code>
      </pre>

      {state.syntax && (
        <div className="absolute top-2 left-2 z-10 h-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <CodeBlockCombobox />
        </div>
      )}

      <div
        className="absolute top-1 right-1 z-10 flex gap-px opacity-0 transition-opacity duration-300 select-none group-hover:opacity-100"
        contentEditable={false}
      >
        <Button
          size="blockAction"
          variant="blockActionSecondary"
          className="relative top-0 right-0 w-auto"
          onClick={() => {
            const lines = element.children.map((child) =>
              NodeApi.string(child)
            );
            copyToClipboard(lines.join('\n\n'), {
              tooltip: 'Copied code to clipboard',
            });
          }}
        >
          <FilesIcon className="size-3.5" />
          Copy
        </Button>

        <BlockActionButton
          variant="blockActionSecondary"
          defaultStyles={false}
        />
      </div>
    </PlateElement>
  );
}
