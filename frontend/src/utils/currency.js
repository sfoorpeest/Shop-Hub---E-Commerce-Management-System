/**
 * Format a number as Vietnamese Dong (VND) currency.
 * DB prices are stored in VND (e.g. 649000 = 649,000₫)
 */
export const formatVND = (amount) => {
  if (amount == null || isNaN(amount)) return "0₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
