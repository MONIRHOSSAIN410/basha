export const formatBDT = (amount = 0) =>
  new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export const formatDate = (date) =>
  new Intl.DateTimeFormat('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date));

export const formatDateInput = (date) => new Date(date).toISOString().slice(0, 10);
