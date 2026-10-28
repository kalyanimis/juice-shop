/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { sequelize } from '../models'
import { WishlistModel } from '../models/wishlist'
import { WishlistItemModel } from '../models/wishlistItem'
import { ProductModel } from '../models/product'
import { validateWishlistItemInput, type ValidationError } from '../lib/wishlistValidator'
import logger from '../lib/logger'

const MAX_IMPORT_ITEMS = 200

class ImportValidationError extends Error {
  constructor (readonly errors: ValidationError[]) {
    super('Import payload failed validation')
  }
}

/**
 * Import wishlist items from a structured JSON list.
 * All items are validated and written in one transaction: either everything is imported or nothing is.
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
      if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > MAX_IMPORT_ITEMS) {
        res.status(400).json({
          status: 'error',
          message: `Payload property "items" must be an array of 1 to ${MAX_IMPORT_ITEMS} entries.`
        })
        return
      }

      const imported = await sequelize.transaction(async (transaction) => {
        let count = 0
        for (const [index, entry] of rawItems.entries()) {
          // Accept both the exported (ProductId) and the lower-camel (productId) spelling
          const candidate = {
            ProductId: entry?.ProductId ?? entry?.productId,
            quantity: entry?.quantity,
            priority: entry?.priority,
            note: entry?.note
          }
          const errors = validateWishlistItemInput(candidate)
          if (errors.length > 0) {
            throw new ImportValidationError(errors.map((e) => ({ ...e, field: `items[${index}].${e.field}` })))
          }

          const product = await ProductModel.findByPk(candidate.ProductId, { transaction })
          if (!product) {
            throw new ImportValidationError([{ field: `items[${index}].ProductId`, message: `Product ${candidate.ProductId} does not exist.` }])
          }

          await WishlistItemModel.create({
            WishlistId: wishlist.id,
            ProductId: candidate.ProductId,
            quantity: candidate.quantity ?? 1,
            priority: candidate.priority ?? 'medium',
            note: typeof candidate.note === 'string' ? candidate.note.slice(0, 500) : 'Imported item'
          }, { transaction })
          count++
        }
        return count
      })

      res.status(200).json({ status: 'success', message: 'Items imported successfully.', imported })
    } catch (err: unknown) {
      if (err instanceof ImportValidationError) {
        res.status(400).json({ status: 'error', errors: err.errors })
        return
      }
      logger.error(`Wishlist import failed: ${(err as Error).message}`)
      res.status(500).json({ status: 'error', message: 'Import failed; no items were imported.' })
    }
  }
}
