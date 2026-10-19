/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

export type WishlistPermission = 'read' | 'write' | 'admin'

export type WishlistVisibility = 'private' | 'unlisted' | 'public'

export type ItemPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface WishlistAttributes {
  id?: number
  UserId: number
  title: string
  description?: string
  visibility: WishlistVisibility
  isPublic: boolean
  shareCode: string
  createdAt?: Date
  updatedAt?: Date
}

export interface WishlistItemAttributes {
  id?: number
  WishlistId: number
  ProductId: number
  quantity: number
  priority: ItemPriority
  note?: string
  reservedByUserId?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface WishlistShareAttributes {
  id?: number
  WishlistId: number
  sharedWithEmail: string
  permission: WishlistPermission
  inviteToken: string
  accepted: boolean
  expiresAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface WishlistCollaborationAttributes {
  id?: number
  WishlistId: number
  UserId: number
  action: 'create' | 'update' | 'delete' | 'share' | 'reserve'
  details?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface WishlistSearchFilter {
  query?: string
  visibility?: WishlistVisibility
  minItems?: number
  sortBy?: 'created' | 'popularity' | 'title'
  limit?: number
  offset?: number
}

export interface WishlistAnalyticsReport {
  totalWishlists: number
  totalItems: number
  averageItemsPerList: number
  mostAddedProductIds: number[]
  activeSharesCount: number
}
