import { ReactNode, isValidElement } from 'react';

type Row = Record<string, any>;
type Column = {
  key: string;
  header: ReactNode;
  render?: (row: Row) => ReactNode;
};

type TableProps = {
  columns: Column[];
  data?: Row[];
  rowKey?: string;
  onRowClick?: (row: Row) => void;
  onRowDoubleClick?: (row: Row) => void;
  empty?: string;
};

function renderValue(value: any): ReactNode {
  if (isValidElement(value)) return value;
  if (value === null || value === undefined || value === '') return '-';
  if (['string', 'number', 'boolean'].includes(typeof value)) return String(value);
  if (Array.isArray(value)) return value.map(renderValue).join(', ');
  if (typeof value === 'object') {
    return value.name || value.title || value.username || value.email || value.id || JSON.stringify(value);
  }
  return String(value);
}

export default function Table({ columns, data = [], rowKey = 'id', onRowClick, onRowDoubleClick, empty = 'No records found.' }: TableProps) {
  const isInteractive = onRowClick || onRowDoubleClick;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-left font-semibold text-slate-600">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length ? (
              data.map((row, index) => (
                <tr
                  key={row[rowKey] ?? index}
                  onClick={() => onRowClick?.(row)}
                  onDoubleClick={() => onRowDoubleClick?.(row)}
                  className={isInteractive ? 'cursor-pointer hover:bg-blue-50/50' : 'hover:bg-slate-50/60'}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {renderValue(column.render ? column.render(row) : row[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-10 text-center text-slate-500" colSpan={columns.length}>
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
