/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { WishlistModel } from '../models/wishlist'
import { WishlistItemModel } from '../models/wishlistItem'
import { ProductModel } from '../models/product'
import { formatWishlistItemCsv } from '../lib/wishlistUtils'

/**
 * Export a wishlist as CSV file attachment.
 */
export function exportWishlistCsv() {
  return async (req: Request, res: Response) => {
    try {
      const wishlist = await WishlistModel.findOne({
        where: { id: req.params.wishlistId, UserId: req.body.UserId }
      })

      if (!wishlist) {
        res.status(404).json({ status: 'error', message: 'Wishlist not found.' })
        return
      }

      const items = await WishlistItemModel.findAll({
        where: { WishlistId: wishlist.id },
        include: [{ model: ProductModel, as: 'product' }]
      })

      const csvLines = ['id,productName,quantity,priority,note']
      for (const item of items) {
        csvLines.push(
          formatWishlistItemCsv({
            id: item.id,
            productName: item.product?.name || `Product #${item.ProductId}`,
            quantity: item.quantity,
            priority: item.priority || 'medium',
            note: item.note || ''
          })
        )
      }

      const csvContent = csvLines.join('\n')
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="wishlist-${wishlist.id}.csv"`)
      res.status(200).send(csvContent)
    } catch (err: unknown) {
      res.status(500).json({ status: 'error', message: (err as Error).message })
    }
  }
}

/**
 * Export a wishlist as JSON backup.
 */
export function exportWishlistJson() {
  return async (req: Request, res: Response) => {
    try {
      const wishlist = await WishlistModel.findOne({
        where: { id: req.params.wishlistId, UserId: req.body.UserId },
        include: [{ model: WishlistItemModel, as: 'items' }]
      })

      if (!wishlist) {
        res.status(404).json({ status: 'error', message: 'Wishlist not found.' })
        return
      }

      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="wishlist-${wishlist.id}.json"`)
      res.status(200).json({
        exportDate: new Date().toISOString(),
        version: '1.0',
        wishlist
      })
    } catch (err: unknown) {
      res.status(500).json({ status: 'error', message: (err as Error).message })
    }
  }
}
