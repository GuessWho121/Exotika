/**
 * Validates phone numbers to ensure correct formatting and digit count.
 */
export const validatePhone = (phone: string | undefined | null): boolean => {
  if (!phone) return false
  const regex = /^\+?[0-9\s\-()]{7,20}$/
  if (!regex.test(phone)) return false
  
  // Enforce at least 10 digits to match server-side validation schema constraints
  const digitCount = phone.replace(/\D/g, "").length
  return digitCount >= 10
}
