import { TablePlugin } from '@udecode/plate-table/react';
import { SpreadsheetElement } from '@/registry/default/potion-ui/spreadsheet-element';
import { insertTable as defaultInsertTable } from '@udecode/plate-table';

const insertSpreadsheet = (editor: any, options = {}) => {
  defaultInsertTable(editor, options);
  const tableEntry = editor.api.block({ match: { type: TablePlugin.key } });
  if (tableEntry) {
    const [tableNode, path] = tableEntry;
    editor.tf.setNodes({ type: 'spreadsheet' }, { at: path });
  }
};

export const SpreadsheetPlugin = {
  ...TablePlugin.configure({ options: {} }),
  key: 'spreadsheet',
  component: SpreadsheetElement,
  insert: insertSpreadsheet,
} as any;