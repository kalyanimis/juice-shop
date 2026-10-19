/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type WishlistAttributes, type WishlistItemAttributes } from '../data/wishlistTypes'

export interface ValidationError {
  field: string
  message: string
}

/**
 * Validate wishlist creation/update input payload.
 */
export function validateWishlistInput(data: Partial<WishlistAttributes>): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title is required and must not be empty.' })
  } else if (data.title.length > 100) {
    errors.push({ field: 'title', message: 'Title cannot exceed 100 characters.' })
  }

  if (data.description && data.description.length > 1000) {
    errors.push({ field: 'description', message: 'Description cannot exceed 1000 characters.' })
  }

  if (data.visibility && !['private', 'unlisted', 'public'].includes(data.visibility)) {
    errors.push({ field: 'visibility', message: 'Visibility must be one of: private, unlisted, public.' })
  }

  return errors
}

/**
 * Validate wishlist item payload.
 */
export function validateWishlistItemInput(data: Partial<WishlistItemAttributes>): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.ProductId || typeof data.ProductId !== 'number' || data.ProductId <= 0) {
    errors.push({ field: 'ProductId', message: 'Valid ProductId is required.' })
  }

  if (data.quantity !== undefined && (typeof data.quantity !== 'number' || data.quantity < 1 || data.quantity > 999)) {
    errors.push({ field: 'quantity', message: 'Quantity must be an integer between 1 and 999.' })
  }

  if (data.priority && !['low', 'medium', 'high', 'urgent'].includes(data.priority)) {
    errors.push({ field: 'priority', message: 'Priority must be one of: low, medium, high, urgent.' })
  }

  return errors
}

/**
 * Validate email address for wishlist sharing.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
