/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type WishlistModel } from '../models/wishlist'
import { WishlistShareModel } from '../models/wishlistShare'
import { UserModel } from '../models/user'

/**
 * A wishlist is readable by its owner, by anyone if it is public, and by users
 * whose e-mail address has an accepted, non-expired share for it.
 */
export async function canViewWishlist (wishlist: WishlistModel, userId: number): Promise<boolean> {
  if (wishlist.UserId === userId || wishlist.isPublic) {
    return true
  }
  const user = await UserModel.findByPk(userId)
  if (!user?.email) {
    return false
  }
  const shares = await WishlistShareModel.findAll({
    where: { WishlistId: wishlist.id, sharedWithEmail: user.email.toLowerCase(), accepted: true }
  })
  return shares.some((share) => !share.expiresAt || new Date() <= share.expiresAt)
}
