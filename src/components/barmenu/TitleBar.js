'use client';
import React, { useEffect, useCallback } from 'react';
import { Plate } from '@udecode/plate/react';
import { useGeneralContext } from '../../ContextProvider';
import { useCreateTitleEditor } from '@/components/editor/use-create-title-editor';
import dynamic from 'next/dynamic';

const EditorContainer = dynamic(
  () =>
    import('@/components/plate-ui/editor').then((mod) => mod.EditorContainer),
  { ssr: false }
);

const Editor = dynamic(
  () => import('@/components/plate-ui/editor').then((mod) => mod.Editor),
  { ssr: false }
);

function TitleBar({ title }) {
  const { reverieData, isBelowTablet, ReverieManager, openRev } = useGeneralContext();
  const initialValue = [{ type: 'p', children: [{ text: '' }] }];

  const editor = useCreateTitleEditor({
    readOnly: !reverieData.access_level || reverieData.access_level === 'SHARED',
    value: title ? [{ type: 'p', children: [{ text: title || '' }] }] : initialValue,
  });

  useEffect(() => {
    if (editor && title !== undefined) {
      const newValue = [{ type: 'p', children: [{ text: title || '' }] }];
      if (JSON.stringify(editor.children) !== JSON.stringify(newValue)) {
        editor.children = newValue;
      }
    }
  }, [title, editor]);

  const handleFinish = useCallback(async () => {
    if (!editor) return;

    const editorText = editor.children?.[0]?.children?.[0]?.text ?? '';
    const currentTitle = reverieData?.title ?? '';

    if (editorText !== currentTitle) {
      try {
        const successTitle = await ReverieManager.updateReverie(openRev, {
          title: editorText,
          viewed: true,
        });

        if (!successTitle) {
          console.error('Failed to update supabase with changes to title');
        }
      } catch (error) {
        console.error('Failed to update title:', error);
      }
    }
  });

  useEffect(() => {
    const handleBeforeUnload = async () => {
      await handleFinish();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleBeforeUnload);
    };
  });

return (
      <Plate editor={editor}>
        <EditorContainer variant={isBelowTablet ? 'titleMobile' : 'titleDesktop'}>
          <Editor
            variant={(!reverieData.access_level || reverieData.access_level === 'SHARED')? 'titleRead': 'titleEdit' }
            placeholder="Enter a title..."
            spellCheck
            onBlur={handleFinish}
          />
        </EditorContainer>
      </Plate>
  );
}

export default TitleBar;
