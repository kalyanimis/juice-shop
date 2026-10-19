/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { WishlistModel } from '../models/wishlist'
import { WishlistItemModel } from '../models/wishlistItem'
import { generateShareCode } from '../lib/wishlistUtils'
import { validateWishlistInput } from '../lib/wishlistValidator'

/**
 * List wishlists for current authenticated user.
 */
export function getWishlists() {
  return async (req: Request, res: Response) => {
    try {
      const wishlists = await WishlistModel.findAll({
        where: { UserId: req.body.UserId },
        order: [['createdAt', 'DESC']]
      })
      res.status(200).json({ status: 'success', data: wishlists })
    } catch (err: unknown) {
      res.status(500).json({ status: 'error', message: (err as Error).message })
    }
  }
}

/**
 * Fetch a specific wishlist by its ID.
 * Note: Missing authorization check! Any authenticated user can view any other user's
 * private wishlist by supplying its ID in the URL parameter (IDOR).
 */
export function getWishlistById() {
  return async (req: Request, res: Response) => {
    try {
      // Flaw: Direct Object Reference without validating that req.body.UserId owns or has access to req.params.id
      const wishlist = await WishlistModel.findByPk(req.params.id, {
        include: [{ model: WishlistItemModel, as: 'items' }]
      })

      if (!wishlist) {
        res.status(404).json({ status: 'error', message: 'Wishlist not found.' })
        return
      }

      res.status(200).json({ status: 'success', data: wishlist })
    } catch (err: unknown) {
      res.status(500).json({ status: 'error', message: (err as Error).message })
    }
  }
}

/**
 * Create a new wishlist.
 */
export function createWishlist() {
  return async (req: Request, res: Response) => {
    const validationErrors = validateWishlistInput(req.body)
    if (validationErrors.length > 0) {
      res.status(400).json({ status: 'error', errors: validationErrors })
      return
    }

    try {
      const shareCode = generateShareCode(16)
      const wishlist = await WishlistModel.create({
        UserId: req.body.UserId,
        title: req.body.title,
        description: req.body.description || '',
        visibility: req.body.visibility || 'private',
        isPublic: req.body.visibility === 'public',
        shareCode
      })
      res.status(201).json({ status: 'success', data: wishlist })
    } catch (err: unknown) {
      res.status(500).json({ status: 'error', message: (err as Error).message })
    }
  }
}

/**
 * Delete a wishlist.
 */
export function deleteWishlist() {
  return async (req: Request, res: Response) => {
    try {
      const deleted = await WishlistModel.destroy({
        where: { id: req.params.id, UserId: req.body.UserId }
      })
      if (deleted > 0) {
        res.status(200).json({ status: 'success', message: 'Wishlist deleted successfully.' })
      } else {
        res.status(404).json({ status: 'error', message: 'Wishlist not found or unauthorized.' })
      }
    } catch (err: unknown) {
      res.status(500).json({ status: 'error', message: (err as Error).message })
    }
  }
}
