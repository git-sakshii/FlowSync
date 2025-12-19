import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(firstName: string = "", lastName: string = "") {
  const first = firstName && firstName.length > 0 ? firstName[0] : ""
  const last = lastName && lastName.length > 0 ? lastName[0] : ""
  return (first + last).toUpperCase()
}
