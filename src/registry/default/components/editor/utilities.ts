import {
    Node,
    Path,
    Transforms,
    Editor as SlateEditorStatic,
    Element as SlateElement,
  } from 'slate';
  import type { Editor as SlateEditorInstance } from 'slate';
  import type { TElement } from '@udecode/plate';
  
  /**
   * Finds the paths of all sibling nodes after the given path until a node of the same type appears.
   */
  export function findCollapsiblePaths(
    path: Path,
    editor: SlateEditorInstance,
  ): Path[] {
    const collapsiblePaths: Path[] = [];
    try {
      const parentNode = Node.parent(editor, path) as SlateElement;
      const startIndex = path[path.length - 1] + 1;
      const currentType = (Node.get(editor, path) as TElement).type;
  
      for (let i = startIndex; i < parentNode.children.length; i++) {
        const p: Path = [...path.slice(0, -1), i];
        const node = Node.get(editor, p) as TElement;
        if (node.type === currentType) break;
        collapsiblePaths.push(p);
      }
    } catch (err) {
      console.warn('Could not determine the collapsible nodes:', err);
    }
    return collapsiblePaths;
  }
  
  /**
   * Expands all collapsed nodes when navigating via keyboard through the document.
   */
  export function handleCollapsedNavigation(
    event: KeyboardEvent,
    editor: SlateEditorInstance,
  ): void {
    const { selection } = editor;
    if (!selection) return;
  
    // Get the first matched node & path under the selection
    const entries = Array.from(
      SlateEditorStatic.nodes(editor, {
        match: (n) => (n as TElement).type !== undefined,
      })
    ) as [TElement, Path][];
  
    if (entries.length === 0) return;
    const [currentNode, currentPath] = entries[0];
  
    // Backspace or ArrowLeft at start of node → expand previous siblings
    if (
      (event.key === 'Backspace' || event.key === 'ArrowLeft') &&
      SlateEditorStatic.isStart(editor, selection.anchor, currentPath)
    ) {
      try {
        let prevPath = Path.previous(currentPath);
        let prevEntry = SlateEditorStatic.node(editor, prevPath) as [TElement, Path];
  
        while (prevEntry) {
          const [prevNode] = prevEntry;
          // stop if same type
          if (prevNode.type === currentNode.type) break;
          // expand if collapsed
          if ((prevNode as any).collapsed) {
            event.preventDefault();
            Transforms.setNodes(
              editor,
              { collapsed: false } as any,
              { at: prevPath },
            );
          }
          prevPath = Path.previous(prevPath);
          prevEntry = SlateEditorStatic.node(editor, prevPath) as [TElement, Path];
        }
      } catch {
        // out of bounds or no more nodes
        return;
      }
    }
  
    // ArrowRight at end of node → expand next siblings
    if (
      event.key === 'ArrowRight' &&
      SlateEditorStatic.isEnd(editor, selection.anchor, currentPath)
    ) {
      try {
        let nextPath = Path.next(currentPath);
        let nextEntry = SlateEditorStatic.node(editor, nextPath) as [TElement, Path];
  
        while (nextEntry) {
          const [nextNode] = nextEntry;
          // stop if same type (except for bulleted-list you might still want to expand?)
          if (
            nextNode.type === currentNode.type &&
            currentNode.type !== 'bulleted-list'
          ) {
            break;
          }
          // expand if collapsed
          if ((nextNode as any).collapsed) {
            event.preventDefault();
            Transforms.setNodes(
              editor,
              { collapsed: false } as any,
              { at: nextPath },
            );
          }
          nextPath = Path.next(nextPath);
          nextEntry = SlateEditorStatic.node(editor, nextPath) as [TElement, Path];
        }
      } catch {
        return;
      }
    }
  }
  
    // TODO: handle list-item boundary navigation via PlateEditor helpers
  
  