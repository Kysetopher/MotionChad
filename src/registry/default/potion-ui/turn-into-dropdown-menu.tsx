'use client';

import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CalloutPlugin } from '@udecode/plate-callout/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { INDENT_LIST_KEYS, ListStyleType } from '@udecode/plate-indent-list';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import {
  ParagraphPlugin,
  useEditorRef,
  useSelectionFragmentProp,
} from '@udecode/plate/react';
import {
  ChevronDownIcon,
  Code2Icon,
  Columns3Icon,
  Heading1Icon,
  LightbulbIcon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  QuoteIcon,
  SquareIcon,
  TableIcon,
} from 'lucide-react';

import {
  getBlockType,
  setBlockType,
} from '@/registry/default/components/editor/transforms';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';

export const ConversionDictionary = { 
  table : [
      {
        icon: <TableIcon />,
        label: 'Spreadsheet',
        value: 'spreadsheet', 
      },
  ],
  spreadsheet : [
    {
        icon: <TableIcon />,
        label: 'Table',
        value: 'table', 
      },
  ],
  default : [
    {
      icon: <PilcrowIcon />,
      keywords: ['paragraph'],
      label: 'Text',
      value: ParagraphPlugin.key,
    },
    {
      icon: <Heading1Icon />,
      keywords: ['title', 'h1'],
      label: 'Heading 1',
      value: HEADING_KEYS.h1,
    },
    {
      icon: <SquareIcon />,
      keywords: ['checklist', 'task', 'checkbox', '[]'],
      label: 'To-do list',
      value: INDENT_LIST_KEYS.todo,
    },
    {
      icon: <ListIcon />,
      keywords: ['unordered', 'ul', '-'],
      label: 'Bulleted list',
      value: ListStyleType.Disc,
    },
    {
      icon: <ListOrderedIcon />,
      keywords: ['ordered', 'ol', '1'],
      label: 'Numbered list',
      value: ListStyleType.Decimal,
    },
    {
      icon: <ChevronDownIcon />,
      keywords: ['collapsible', 'expandable'],
      label: 'Toggle list',
      value: TogglePlugin.key,
    },
    {
      icon: <Code2Icon />,
      keywords: ['```'],
      label: 'Code',
      value: CodeBlockPlugin.key,
    },
    {
      icon: <QuoteIcon />,
      keywords: ['citation', 'blockquote', '>'],
      label: 'Quote',
      value: BlockquotePlugin.key,
    },
    {
      icon: <LightbulbIcon />,
      keywords: ['highlight', 'note', 'important'],
      label: 'Callout',
      value: CalloutPlugin.key,
    },
    // {
    //   icon: <Columns3Icon />,
    //   label: '3 columns',
    //   value: 'action_three_columns',
    // },
  ]
};

export function TurnIntoDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const openState = useOpenState();

  // Retrieve the current block type from the selection.
  const value = useSelectionFragmentProp({
    defaultValue: ParagraphPlugin.key,
    getProp: (node) => getBlockType(node as any),
  });

  console.log(value);
  let itemsToRender;
  switch (value) {
    case 'table':
      itemsToRender = ConversionDictionary.table;
      break;
    case 'spreadsheet':
      itemsToRender = ConversionDictionary.spreadsheet;
      break;
    default:
      // Otherwise, use the default conversion options.
      itemsToRender = ConversionDictionary.default;
      break;
  }

  const selectedItem =
    itemsToRender.find((item) => item.value === (value ?? ParagraphPlugin.key)) ||
    itemsToRender[0];

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Turn into" isDropdown>
          {selectedItem.label}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent
          className="ignore-click-outside/toolbar min-w-0"
          data-plate-prevent-overlay
          align="start"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Turn into</DropdownMenuLabel>

            <DropdownMenuRadioGroup
              className="flex flex-col gap-0.5"
              value={selectedItem.value}
              onValueChange={(type) => {
                setBlockType(editor, type);
                editor.tf.focus();
              }}
            >
              {itemsToRender.map(({ icon, label, value: itemValue }) => (
                <DropdownMenuRadioItem
                  key={itemValue}
                  className="min-w-[180px]"
                  value={itemValue}
                >
                  <div className="mr-2 flex size-5 items-center justify-center rounded-sm border border-foreground/15 bg-white p-0.5 text-subtle-foreground [&_svg]:size-3">
                    {icon}
                  </div>
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
