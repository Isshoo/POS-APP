const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
});

export const formatCurrency = (value) => currencyFormatter.format(value);

export const formatNumberInput = (value) => {
  const digitsOnly = value.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return new Intl.NumberFormat('id-ID').format(Number(digitsOnly));
};

export const toNumeric = (value) => {
  if (!value) return 0;
  return Number(value.replace(/\D/g, '')) || 0;
};

export const formatDateTime = (datetime) =>
  new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(datetime));


