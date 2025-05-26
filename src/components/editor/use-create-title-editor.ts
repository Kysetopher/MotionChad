'use client';

import type { Value } from '@udecode/plate';
import { usePlateEditor } from '@udecode/plate/react';
import { emojiPlugin } from '@/registry/default/components/editor/plugins/emoji-plugin';
import {basicComponents  } from '@/registry/default/components/editor/editor-components';


const editorPlugins = [
    emojiPlugin,
  ] as const;



export const useCreateTitleEditor = (
  {
    components = {},
    readOnly = false,
    ...options
  },
  deps: any[] = []
) => {
  return usePlateEditor<Value, (typeof editorPlugins)[number]>(
    {
      override: {
        components: {
            ...components,
            ...basicComponents 
          },
      },
       plugins: [
             ...editorPlugins
           ],
      ...options,
    },
    deps
  );
};
