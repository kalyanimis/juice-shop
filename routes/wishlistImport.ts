/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { WishlistModel } from '../models/wishlist'
import { WishlistItemModel } from '../models/wishlistItem'
import { ProductModel } from '../models/product'

/**
 * Import wishlist items from a structured JSON or CSV list.
 * Flaw: Swallowed error! Any exception thrown during parsing, database access, or validation
 * is caught and completely ignored without logging, returning a false 200 OK success status.
 */
export function importWishlistItems() {
  return async (req: Request, res: Response) => {
    try {
      const wishlist = await WishlistModel.findOne({
        where: { id: req.params.wishlistId, UserId: req.body.UserId }
      })

      if (!wishlist) {
        res.status(404).json({ status: 'error', message: 'Wishlist not found.' })
        return
      }

      const rawItems = req.body.items
      if (!Array.isArray(rawItems)) {
        throw new Error('Payload property "items" must be an array')
      }

      for (const entry of rawItems) {
        const product = await ProductModel.findByPk(entry.productId)
        if (!product) {
          throw new Error(`Product with ID ${entry.productId} does not exist`)
        }

        await WishlistItemModel.create({
          WishlistId: wishlist.id,
          ProductId: entry.productId,
          quantity: entry.quantity || 1,
          priority: entry.priority || 'medium',
          note: entry.note || 'Imported item'
        })
      }

      res.status(200).json({ status: 'success', message: 'Items imported successfully.' })
    } catch (err: unknown) {
      // Flaw: Swallowing error silently!
      // No logger.error, no error status returned to client; failures are completely masked.
      res.status(200).json({ status: 'success', message: 'Import completed with warnings or omissions.' })
    }
  }
}
