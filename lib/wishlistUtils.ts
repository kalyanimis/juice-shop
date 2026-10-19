/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import crypto from 'crypto'
import { type WishlistPermission, type WishlistVisibility } from '../data/wishlistTypes'

/**
 * Generate a random URL-safe share code for wishlists.
 */
export function generateShareCode(length: number = 16): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length)
}

/**
 * Generate a secure invite token for collaborator invitations.
 */
export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Check if the given visibility string is valid.
 */
export function isValidVisibility(visibility: string): visibility is WishlistVisibility {
  return ['private', 'unlisted', 'public'].includes(visibility)
}

/**
 * Check if a permission grants editing capability.
 */
export function canEditWishlist(permission: WishlistPermission): boolean {
  return permission === 'write' || permission === 'admin'
}

/**
 * Format wishlist title to safe slug for vanity links.
 */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Calculate total estimated value of items in a wishlist.
 */
export function calculateWishlistValue(items: Array<{ quantity: number; price?: number }>): number {
  return items.reduce((sum, item) => {
    const unitPrice = item.price ?? 0
    return sum + (unitPrice * item.quantity)
  }, 0)
}

/**
 * Format CSV export line for a single wishlist item.
 */
export function formatWishlistItemCsv(item: {
  id: number
  productName: string
  quantity: number
  priority: string
  note?: string
}): string {
  const sanitize = (val: string) => `"${(val || '').replace(/"/g, '""')}"`
  return `${item.id},${sanitize(item.productName)},${item.quantity},${item.priority},${sanitize(item.note ?? '')}`
}
