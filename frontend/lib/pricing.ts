export const PLATFORM_FEE_PERCENT = 2
export const GST_PERCENT = 18

export function calculateBookingTotalRupees(pricePerTicket: number, quantity: number) {
  const baseAmount = pricePerTicket * quantity
  const platformFee = Math.round((baseAmount * PLATFORM_FEE_PERCENT) / 100)
  const gst = Math.round(((baseAmount + platformFee) * GST_PERCENT) / 100)
  const totalAmount = baseAmount + platformFee + gst

  return {
    baseAmount,
    platformFee,
    gst,
    totalAmount,
  }
}

export function getDisplayedBookingAmountRupees(storedAmountPaise: number, pricePerTicket: number, quantity: number) {
  const calculatedTotal = calculateBookingTotalRupees(pricePerTicket, quantity).totalAmount
  const storedAmountRupees = storedAmountPaise > 0 ? storedAmountPaise / 100 : 0

  // Older bookings stored only the base amount, so prefer the larger valid total.
  return Math.max(storedAmountRupees, calculatedTotal)
}