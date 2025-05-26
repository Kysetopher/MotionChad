'use client';

import type { Value } from '@udecode/plate';
import { usePlateEditor } from '@udecode/plate/react';
import { withPlaceholders } from '@/registry/default/potion-ui/placeholder';
import { suggestionPlugin } from '@/registry/default/components/editor/plugins/suggestion-plugin';

import { editorPlugins, viewPlugins } from '@/registry/default/components/editor/plugins/editor-plugins';
import { editorComponents, viewComponents } from '@/registry/default/components/editor/editor-components';


import { BlockDiscussion } from '@/registry/default/potion-ui/block-discussion';
import { AfterEditableComments } from '@/registry/default/potion-ui/floating-discussion';
import { SuggestionBelowNodes } from '@/registry/default/potion-ui/suggestion-line-break';
import { commentsPlugin } from '@/registry/default/components/editor/plugins/comments-plugin';

export const useCreateEditor = (
  {
    components,
    readOnly,
    ...options
  }: {
    components?: Record<string, React.ComponentType>;
    plugins?: any[];
    readOnly?: boolean;
    value?: Value;
  } = {},
  deps: any[] = []
) => {
  return usePlateEditor<Value, (typeof editorPlugins)[number]>(
    {
      override: {
        components: {
          ...(readOnly ? viewComponents : withPlaceholders(editorComponents)),
          ...components,
        },
      },
      plugins: [
        ...(readOnly
          ? viewPlugins
          : [...editorPlugins]),
       
        suggestionPlugin,
        commentsPlugin.extend({
          render: {
            aboveNodes: BlockDiscussion as any,
            afterEditable: AfterEditableComments as any,
          },
        }),
        suggestionPlugin.extend({
          render: { belowNodes: SuggestionBelowNodes as any },
        }),
      ],
      ...options,
    },
    deps
  );
};