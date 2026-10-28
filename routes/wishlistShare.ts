/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { WishlistModel } from '../models/wishlist'
import { WishlistShareModel } from '../models/wishlistShare'
import { UserModel } from '../models/user'
import { generateInviteToken, isValidPermission } from '../lib/wishlistUtils'
import { isValidEmail } from '../lib/wishlistValidator'
import { sendWishlistNotification } from '../lib/wishlistNotifier'
import logger from '../lib/logger'

/**
 * Share a wishlist with a user via email invite.
 */
export function shareWishlist() {
  return async (req: Request, res: Response) => {
    const { email, permission } = req.body
    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      res.status(400).json({ status: 'error', message: 'Valid recipient email is required.' })
      return
    }
    if (permission !== undefined && (typeof permission !== 'string' || !isValidPermission(permission))) {
      res.status(400).json({ status: 'error', message: 'Permission must be one of: read, write, admin.' })
      return
    }

    try {
      const wishlist = await WishlistModel.findOne({
        where: { id: req.params.wishlistId, UserId: req.body.UserId }
      })

      if (!wishlist) {
        res.status(404).json({ status: 'error', message: 'Wishlist not found or access denied.' })
        return
      }

      const inviteToken = generateInviteToken()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      const share = await WishlistShareModel.create({
        WishlistId: wishlist.id,
        sharedWithEmail: email.toLowerCase(),
        permission: permission || 'read',
        inviteToken,
        accepted: false,
        expiresAt
      })

      await sendWishlistNotification({
        recipientEmail: email,
        wishlistTitle: wishlist.title,
        action: 'share_invite',
        actorName: 'A Juice Shop User',
        inviteLink: `/wishlist/accept-invite?token=${inviteToken}`
      })

      // The invite token is only delivered to the recipient, never echoed back to the inviter
      const { inviteToken: _omitted, ...safeShare } = share.toJSON()
      res.status(201).json({ status: 'success', data: safeShare })
    } catch (err: unknown) {
      logger.error(`Failed to share wishlist: ${(err as Error).message}`)
      res.status(500).json({ status: 'error', message: 'Could not share wishlist.' })
    }
  }
}

/**
 * Accept a wishlist invitation using an invite token.
 * The authenticated user's e-mail address must match the address that was invited.
 */
export function acceptWishlistInvite() {
  return async (req: Request, res: Response) => {
    const { token } = req.body
    if (!token || typeof token !== 'string') {
      res.status(400).json({ status: 'error', message: 'Invite token is required.' })
      return
    }

    try {
      const share = await WishlistShareModel.findOne({
        where: { inviteToken: token }
      })

      if (!share) {
        res.status(404).json({ status: 'error', message: 'Invalid or expired invitation token.' })
        return
      }

      const user = await UserModel.findByPk(req.body.UserId)
      if (!user?.email || user.email.toLowerCase() !== share.sharedWithEmail.toLowerCase()) {
        // Same response as an unknown token so tokens cannot be probed
        res.status(404).json({ status: 'error', message: 'Invalid or expired invitation token.' })
        return
      }

      if (share.expiresAt && new Date() > share.expiresAt) {
        res.status(410).json({ status: 'error', message: 'Invitation has expired.' })
        return
      }

      share.accepted = true
      await share.save()

      const { inviteToken: _omitted, ...safeShare } = share.toJSON()
      res.status(200).json({ status: 'success', message: 'Invitation accepted successfully.', data: safeShare })
    } catch (err: unknown) {
      logger.error(`Failed to accept wishlist invite: ${(err as Error).message}`)
      res.status(500).json({ status: 'error', message: 'Could not accept invitation.' })
    }
  }
}

/**
 * List all active shares for a wishlist. Only the owner may see them.
 */
export function getWishlistShares() {
  return async (req: Request, res: Response) => {
    try {
      const wishlist = await WishlistModel.findOne({
        where: { id: req.params.wishlistId, UserId: req.body.UserId }
      })

      if (!wishlist) {
        res.status(404).json({ status: 'error', message: 'Wishlist not found or access denied.' })
        return
      }

      const shares = await WishlistShareModel.findAll({
        where: { WishlistId: wishlist.id },
        attributes: { exclude: ['inviteToken'] }
      })
      res.status(200).json({ status: 'success', data: shares })
    } catch (err: unknown) {
      logger.error(`Failed to list wishlist shares: ${(err as Error).message}`)
      res.status(500).json({ status: 'error', message: 'Could not load shares.' })
    }
  }
}
