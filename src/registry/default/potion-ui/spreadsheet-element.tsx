'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@udecode/cn';
import { PlusIcon } from 'lucide-react';

import { PlateElement } from './plate-element';
import { Button } from './button';
import graphInterface from '@/utils/neo4j/interface';

export function SpreadsheetElement({
  children,
  className,
  tableId,
  ...props
}: React.ComponentProps<typeof PlateElement> & {
  tableId: string;
}) {
  const [tableData, setTableData] = useState<any>(null);

  useEffect(() => {
    async function fetchOrCreateSpreadsheet() {
      try {
        if (!tableId) {
          console.warn('No tableId provided — cannot fetch spreadsheet data.');
          return;
        }

        let existingData = await graphInterface.getSpreadSheet(tableId);
        if (!existingData) {
          existingData = {
            rows: [
              { cells: [{ content: 'Cell A1' }, { content: 'Cell B1' }] },
              { cells: [{ content: 'Cell A2' }, { content: 'Cell B2' }] },
            ],
          };
          await graphInterface.addSpreadsheet({
            data: existingData,
            tableId,
          });
          console.log('Created new spreadsheet in DB:', existingData);
        } else {
          console.log('Fetched existing spreadsheet from DB:', existingData);
        }

        setTableData(existingData);
      } catch (err) {
        console.error('Error fetching/creating spreadsheet:', err);
      }
    }

    fetchOrCreateSpreadsheet();
  }, [tableId]);

  function handleAddRow() {
    if (!tableData) return;

    const newRow = { cells: [{ content: '' }, { content: '' }] };
    const updated = {
      ...tableData,
      rows: [...tableData.rows, newRow],
    };
    setTableData(updated);
    // Optionally update DB:
    // graphInterface.updateSpreadsheet(tableId, updated);
  }

  function handleAddColumn() {
    if (!tableData) return;

    const updatedRows = tableData.rows.map((row: any) => ({
      ...row,
      cells: [...row.cells, { content: '' }],
    }));

    const updated = {
      ...tableData,
      rows: updatedRows,
    };
    setTableData(updated);
    // Optionally update DB:
    // graphInterface.updateSpreadsheet(tableId, updated);
  }

  return (
    <PlateElement
      className={cn(className, 'overflow-x-auto py-5')}
      {...props}
    >
      {children} {/* Ensure children are rendered */}
      <div className="relative w-fit">
        <table className="border-collapse">
          <tbody>
            {tableData ? (
              tableData.rows.map((row: any, rowIndex: number) => (
                <tr key={rowIndex}>
                  {row.cells.map((cell: any, cellIndex: number) => (
                    <td key={cellIndex} className="border p-2">
                      {cell.content}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-2">Loading spreadsheet...</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-2 flex gap-2">
          <Button variant="outline" onClick={handleAddRow}>
            <PlusIcon className="mr-1 h-4 w-4" />
            Add Row
          </Button>
          <Button variant="outline" onClick={handleAddColumn}>
            <PlusIcon className="mr-1 h-4 w-4" />
            Add Column
          </Button>
        </div>
      </div>
    </PlateElement>
  );
}
