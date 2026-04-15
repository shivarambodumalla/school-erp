import { randomBytes } from 'crypto'

/**
 * Generate a secure random temporary password.
 * Format: 12 characters, guaranteed to contain uppercase, lowercase, digit, and special char.
 */
export function generateTempPassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const digits = '0123456789'
  const special = '@#$%&'
  const all = upper + lower + digits + special

  const bytes = randomBytes(12)

  // Guarantee at least one of each required type
  const required = [
    upper[bytes[0]! % upper.length],
    lower[bytes[1]! % lower.length],
    digits[bytes[2]! % digits.length],
    special[bytes[3]! % special.length],
  ]

  // Fill the rest randomly
  const rest = Array.from({ length: 8 }, (_, i) => all[bytes[i + 4]! % all.length])

  // Shuffle using Fisher-Yates
  const chars = [...required, ...rest]
  for (let i = chars.length - 1; i > 0; i--) {
    const j = bytes[(i + 4) % 12]! % (i + 1)
    ;[chars[i], chars[j]] = [chars[j]!, chars[i]!]
  }

  return chars.join('')
}
