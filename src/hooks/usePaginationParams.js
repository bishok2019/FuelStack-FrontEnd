import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function usePaginationParams(defaultPageSize = 10) {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const pageSize = Number(searchParams.get('page_size') || defaultPageSize);

  const setPage = (nextPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', nextPage);
    params.set('page_size', pageSize);
    setSearchParams(params);
  };

  const setPageSize = (nextSize) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', 1);
    params.set('page_size', nextSize);
    setSearchParams(params);
  };

  return useMemo(
    () => ({ page, pageSize, setPage, setPageSize }),
    [page, pageSize, searchParams],
  );
}
