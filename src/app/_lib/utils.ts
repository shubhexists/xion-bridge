import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const truncateAddress = (address: string) => {
  return address.length > 5 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address
}

export const adjustDecimals = (amount: string, decimals: number, fixed = 3) => {
  const value = Number(amount)
  const multiplier = 10 ** fixed
  const adjusted = (value * multiplier) / 10 ** decimals
  const rounded = (Math.ceil(adjusted) / multiplier).toFixed(fixed)
  return rounded.replace(/\.?0+$/, '')
}

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}
