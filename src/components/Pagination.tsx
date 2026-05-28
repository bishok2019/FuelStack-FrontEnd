import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationMeta = {
  total: number;
  current_total: number;
  current_page: number;
  page_size: number;
  total_pages: number;
  previous_page: number | null;
  next_page: number | null;
  timestamp: string;
};

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export default function Pagination({ page, pageSize, total, meta, onPageChange, onPageSizeChange }: PaginationProps) {
  const totalPages = meta?.total_pages ?? Math.max(1, Math.ceil((Number(total) || 0) / pageSize));
  const currentPage = meta?.current_page ?? page;
  const currentPageSize = meta?.page_size ?? pageSize;
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Page <span className="font-semibold text-slate-800">{currentPage}</span> of{' '}
        <span className="font-semibold text-slate-800">{totalPages}</span>
        {meta?.total != null ? <span className="ml-2">({meta.total} total records)</span> : null}
      </p>
      <div className="flex items-center gap-2">
        <select className="input w-24" value={currentPageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <button className="btn-secondary px-3" onClick={() => onPageChange(meta?.previous_page ?? page - 1)} disabled={!meta?.previous_page && page <= 1} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button className="btn-secondary px-3" onClick={() => onPageChange(meta?.next_page ?? page + 1)} disabled={!meta?.next_page && page >= totalPages} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
