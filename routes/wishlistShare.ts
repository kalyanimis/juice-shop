/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { WishlistModel } from '../models/wishlist'
import { WishlistShareModel } from '../models/wishlistShare'
import { generateInviteToken } from '../lib/wishlistUtils'
import { isValidEmail } from '../lib/wishlistValidator'
import { sendWishlistNotification } from '../lib/wishlistNotifier'

/**
 * Share a wishlist with a user via email invite.
 */
export function shareWishlist() {
  return async (req: Request, res: Response) => {
    const { email, permission } = req.body
    if (!email || !isValidEmail(email)) {
      res.status(400).json({ status: 'error', message: 'Valid recipient email is required.' })
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
        sharedWithEmail: email,
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

      res.status(201).json({ status: 'success', data: share })
    } catch (err: unknown) {
      res.status(500).json({ status: 'error', message: (err as Error).message })
    }
  }
}

/**
 * Accept a wishlist invitation using an invite token.
 */
export function acceptWishlistInvite() {
  return async (req: Request, res: Response) => {
    const { token } = req.body
    if (!token) {
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

      if (share.expiresAt && new Date() > share.expiresAt) {
        res.status(410).json({ status: 'error', message: 'Invitation has expired.' })
        return
      }

      share.accepted = true
      await share.save()

      res.status(200).json({ status: 'success', message: 'Invitation accepted successfully.', data: share })
    } catch (err: unknown) {
      res.status(500).json({ status: 'error', message: (err as Error).message })
    }
  }
}

/**
 * List all active shares for a wishlist.
 */
export function getWishlistShares() {
  return async (req: Request, res: Response) => {
    try {
      const shares = await WishlistShareModel.findAll({
        where: { WishlistId: req.params.wishlistId }
      })
      res.status(200).json({ status: 'success', data: shares })
    } catch (err: unknown) {
      res.status(500).json({ status: 'error', message: (err as Error).message })
    }
  }
}
