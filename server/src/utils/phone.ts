export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return ""
  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, "")

  if (digits.length === 10) {
    return `+91${digits}`
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`
  }
  if (digits.length > 10) {
    return `+${digits}`
  }
  return digits
}
