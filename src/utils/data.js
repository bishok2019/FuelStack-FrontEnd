export const rowsOf = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.records)) return data.records;
  return [];
};

export const totalOf = (data) => Number(data?.meta?.total || data?.total || data?.count || rowsOf(data).length || 0);

export const currency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));

export const orderTotal = (order) => order?.total_price ?? order?.total ?? order?.total_amount ?? 0;

export const orderItemCount = (order) => order?.total_item ?? order?.total_items ?? 0;

export const orderLines = (order) => rowsOf(order?.order_details || order?.items || order?.order_items || []);

export const nameOf = (item, fallback = 'Unnamed') =>
  String(item?.name || item?.title || item?.username || item?.email || item?.id || fallback);

export const statusOf = (item) => {
  const raw = item?.status || item?.order_status || 'Pending';
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

export const productPrice = (product) =>
  Number(product?.price || product?.unit_price || product?.selling_price || 0);

export const lowStock = (item) => {
  const filled = Number(item?.filled_qty || item?.filled_quantity || item?.quantity || 0);
  const reserved = Number(item?.reserved_qty || item?.reserved_quantity || 0);
  return filled - reserved <= 10;
};
