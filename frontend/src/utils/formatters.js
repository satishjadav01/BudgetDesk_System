export function formatCurrency(value, currency = "INR") {
  const number = Number(value || 0);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(number);
}

export function apiErrorMessage(error, fallback = "Something went wrong.") {
  return error?.response?.data?.message || fallback;
}
