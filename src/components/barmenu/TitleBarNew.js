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

function TitleBarNew({ title }) {
  const { isBelowTablet, openRev, ReverieManager,reverieData, setReverieData, setOpenRev, createCardId, setCreateCardId } = useGeneralContext();

  const initialValue = [{ type: 'p', children: [{ text: '' }] }];

  const editor = useCreateTitleEditor({
    value: title
      ? [{ type: 'p', children: [{ text: title || '' }] }]
      : initialValue,
  });

  useEffect(() => {
    if ((title || openRev === null) && editor) {
      const newValue = [{ type: 'p', children: [{ text: title || '' }] }];
      if (JSON.stringify(editor.children) !== JSON.stringify(newValue)) {
        editor.children = newValue;
      }
    }
  }, [title, editor]);


  const handleFinish = useCallback(async () => {
    if (!editor) return;
    const editorText = editor.children?.[0]?.children?.[0]?.text ?? '';
    const newCardData = {
      title: editorText,
      viewed: true,
    };
    
    if (openRev) {

      try {
        if (editorText) {
          const successTitle = await ReverieManager.updateReverie(openRev, newCardData);

          if (!successTitle) {
            console.error('Failed to update supabase with changes to title');
          }
        }
      } catch (error) {
        console.error('Failed to update title:', error);
      }
    } else {
      if (editorText !== '' && createCardId) {

        try {
          const currentTime = await ReverieManager.getTimestamp();
          const createSuccess = await ReverieManager.updateReverie(createCardId, {...newCardData, score:null, created_at: currentTime});
          if (createSuccess) {
            setOpenRev(createCardId);
            setReverieData({...newCardData, id: createCardId, created_at:currentTime});

            setCreateCardId(ReverieManager.addCard({score: -1}));

          } else console.error('Failed to update the card placeholder with the with the updated data for the new card');
        } catch (error) {
          console.error('Failed to create or update title:', error);
        }
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
  }, [handleFinish]);

  return (
      <Plate editor={editor}>
        <EditorContainer variant={isBelowTablet ? 'titleMobile' : 'titleDesktop'}>
          <Editor
            variant='titleEdit'
            placeholder="Enter a title..."
            spellCheck
            onBlur={handleFinish}
          />
        </EditorContainer>
      </Plate>
  );
}

export default TitleBarNew;
