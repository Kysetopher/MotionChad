'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Plate } from '@udecode/plate/react';
import { useRouter } from 'next/router';
import '../../styles/plate.css';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import dynamic from 'next/dynamic';
import { useGeneralContext } from '../../ContextProvider';
import isEqual from 'lodash.isequal';

const EditorContainer = dynamic(
  () =>
    import('@/components/plate-ui/editor').then((mod) => mod.EditorContainer),
  { ssr: false }
);

const Editor = dynamic(
  () => import('@/components/plate-ui/editor').then((mod) => mod.Editor),
  { ssr: false }
);

export default function TilePlate({ plate, version }) {
  const router = useRouter();
  const { ReverieManager, mobileClient, reverieData, openRev, setReverieData, setOpenRev, createCardId, setCreateCardId } = useGeneralContext();

  const [bundleReady, setBundleReady] = useState(false);
  useEffect(() => {
    const p1 = EditorContainer.preload?.();
    const p2 = Editor.preload?.();
    Promise.all([p1, p2]).then(() => setBundleReady(true));
  }, []);

  const isPlateValid = Array.isArray(plate) && plate.length > 0;
  const lastVersionRef = useRef(version);
  const initialValue = [{ type: 'p', children: [{ text: ' ' }] }];
  const isNew = !openRev;

  const isEmptyDoc = (nodes) => {
    // 0. Not an array or empty ⇒ reject
    if (!Array.isArray(nodes) || nodes.length === 0) return true;
  
    // 1. Basic structural sanity check for each top‑level node
    const hasInvalidNode = nodes.some(
      (n) =>
        typeof n !== 'object' ||
        n === null ||
        typeof n.type !== 'string' ||
        !Array.isArray(n.children)
    );
    if (hasInvalidNode) return true;
  
    // 2. All paragraphs are blank (placeholder) ⇒ reject
    const allBlank = nodes.every(
      (n) =>
        n.type === 'p' &&
        Array.isArray(n.children) &&
        n.children.length === 1 &&
        typeof n.children[0].text === 'string' &&
        n.children[0].text.trim() === ''
    );
  
    return allBlank;
  };

  const readOnly =
    (!reverieData ||
      !reverieData.access_level ||
      reverieData.access_level === 'SHARED') &&
    bundleReady;

// ----------------------------------------------------------------------------
//  EDITOR INSTANCE
// ----------------------------------------------------------------------------
  const editor = useCreateEditor(
    {
      readOnly,
      value: isNew ? initialValue : isPlateValid ? plate : initialValue,
    },
    [readOnly]
  );
  
//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |  PLATE VALUE UPDATES     |
//-----------------------------------------|__________________________|---------------------------------------------------------------

useEffect(() => {
  if (!editor || !isPlateValid || isNew) return;

  const versionChanged = lastVersionRef.current !== version;
  const contentChanged = !isEqual(editor.children, plate);

  if (versionChanged || contentChanged) {
    editor.children = plate;
    lastVersionRef.current = version;
  }
}, [editor, plate, version, isPlateValid, isNew,openRev]);


//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |     MOBILE CONFIG        |
//-----------------------------------------|__________________________|---------------------------------------------------------------
 
  // const previousDimensions = useRef({ width: 0, height: 0 });

  // const handleEditorUpdate = useCallback(() => {
  //   try {
  //     if (
  //       editor &&
  //       editor.selection && 
  //       document.activeElement === document.querySelector('.plate-editor')
  //     ) {
  //       Transforms.insertText(editor, ' ');
  //       setTimeout(() => {
  //         Transforms.delete(editor, { unit: 'character', reverse: true });
  //       }, 1);
  //     }
  //   } catch (err) {
  //     console.warn('Could not nudge editor:', err);
  //   }
  // });

  // useEffect(() => {
  //   if (!mobileClient) return;

  //   const handleResize = () => {
  //     const currentHeight = window.innerHeight;
  //     if (currentHeight < previousDimensions.current.height) {
  //       handleEditorUpdate();
  //     }
  //     previousDimensions.current.height = currentHeight;
  //   };

  //   previousDimensions.current.height = window.innerHeight;

  //   window.addEventListener('resize', handleResize);
  //   return () => {
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, [mobileClient, handleEditorUpdate]);


  // useEffect(() => {
  //   if (typeof window !== 'undefined' && navigator?.virtualKeyboard) {
  //     const handleGeometryChange = (event) => {

  //       const currentHeight = window.innerHeight;
  //       if (currentHeight < previousDimensions.current.height) {
  //         handleEditorUpdate();
  //       }
  //     };

  //     navigator.virtualKeyboard.addEventListener('geometrychange', handleGeometryChange);
  //     return () => {
  //       navigator.virtualKeyboard.removeEventListener('geometrychange', handleGeometryChange);
  //     };
  //   }
  // }, [handleEditorUpdate]);
//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |     UPLOAD CHANGES       |
//-----------------------------------------|__________________________|---------------------------------------------------------------

const handleFinishEditBody = useCallback(async () => {
    if (!editor) return;

    const newValue = editor.children;

    if (isEmptyDoc(newValue)) return;

    if (isNew && isEqual(initialValue, newValue)) return;

    if (!isNew && isEqual(plate, newValue)) return;

    try {
      if (isNew) {
        const currentTime = await ReverieManager.getTimestamp();
        const newCardData = {
          plate: newValue,
          viewed: true,
          score: null,
          created_at: currentTime,
        };

        const createSuccess = await ReverieManager.updateReverie(
          createCardId,
          newCardData
        );
        if (createSuccess) {
          setOpenRev(createCardId);
          setReverieData({ ...newCardData, id: createCardId });
          setCreateCardId(ReverieManager.addCard({ score: -1 }));
        } else {
          console.error(
            'Failed to update the new card placeholder with updated data'
          );
        }
      } else {

        const success = await ReverieManager.updateReverie(openRev, {
          plate: newValue,
          version: version || 0,
          viewed: true,
        });
        if (!success) {
          console.error('Failed to update existing reverie with changes');
        }
      }
    } catch (error) {
      console.error('Error syncing reverie changes:', error);
    }
  });


  const handleFinishEditBodyRef = useRef(handleFinishEditBody);
  useEffect(() => {
    handleFinishEditBodyRef.current = handleFinishEditBody;
  }, [handleFinishEditBody]);

  useEffect(() => {
    const handleBeforeUnload = async () => {
      await handleFinishEditBodyRef.current();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    handleFinishEditBody();
  }, [router.query.id]);
//-----------------------------------------|                          |---------------------------------------------------------------------------
//                                         |  PAGE RESIZE DESKTOP     |
//-----------------------------------------|__________________________|---------------------------------------------------------------

  useEffect(() => {
    if (!mobileClient) {
      const handleResize = () => {
        if (document.activeElement?.blur) {
          document.activeElement.blur();
        }
      };
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [mobileClient]);
// --------------------------------------------------
//  MOBILE BOTTOM‑BAR HANDLING
// --------------------------------------------------
const setBottomBarHeight = useCallback((px) => {
  document.documentElement.style.setProperty('--browser-bottom-bar-height', px);
}, []);

const handleEditorFocus = useCallback(() => {
  if (mobileClient) {
    setBottomBarHeight('-48px');
  }
}, [mobileClient, setBottomBarHeight]);

const handleEditorBlur = useCallback(() => {
  handleFinishEditBody(); // always persist

  if (mobileClient) {
    // Restore bottom bar height after keyboard closes
    const bottomBar =
      document.documentElement.clientHeight - window.innerHeight;
    setBottomBarHeight(`0px`);
  }
}, [handleFinishEditBody, mobileClient, setBottomBarHeight]);
  // --------------------------------------------------
  //  RENDER
  // --------------------------------------------------
  return (
    <div id={mobileClient ? 'tilemobile' : ''} className="plate-tile-container">
      <Plate editor={editor}>
        <EditorContainer>
          <Editor
            variant={mobileClient ? 'docMobile' : 'docDesktop'}
            onFocus={handleEditorFocus}
            onBlur={handleEditorBlur}
          />
        </EditorContainer>
      </Plate>
    </div>
  );
}
