/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { fn, col } from 'sequelize'
import { WishlistModel } from '../models/wishlist'
import { WishlistItemModel } from '../models/wishlistItem'
import { ProductModel } from '../models/product'
import { WishlistShareModel } from '../models/wishlistShare'
import logger from '../lib/logger'

/**
 * Generate analytics and summary stats for a user's wishlists.
 * Uses three batched queries (items, products, share counts) regardless of how many wishlists exist.
 */
export function getWishlistSummaryStats() {
  return async (req: Request, res: Response) => {
    try {
      const wishlists = await WishlistModel.findAll({
        where: { UserId: req.body.UserId }
      })
      const wishlistIds = wishlists.map((w) => w.id)

      const items = wishlistIds.length === 0
        ? []
        : await WishlistItemModel.findAll({ where: { WishlistId: wishlistIds } })
      const shareCounts = wishlistIds.length === 0
        ? []
        : await WishlistShareModel.findAll({
          attributes: ['WishlistId', [fn('COUNT', col('id')), 'count']],
          where: { WishlistId: wishlistIds },
          group: ['WishlistId'],
          raw: true
        }) as unknown as Array<{ WishlistId: number, count: number | string }>

      const productIds = [...new Set(items.map((item) => item.ProductId))]
      const products = productIds.length === 0
        ? []
        : await ProductModel.findAll({ where: { id: productIds } })
      const productById = new Map(products.map((p) => [p.id, p]))
      const shareCountByWishlist = new Map(shareCounts.map((s) => [s.WishlistId, Number(s.count)]))

      const summaries = []
      let grandTotalItems = 0
      let grandTotalValue = 0

      for (const wishlist of wishlists) {
        const listItems = items.filter((item) => item.WishlistId === wishlist.id)
        let listTotalValue = 0
        const detailedItems = []

        for (const item of listItems) {
          const product = productById.get(item.ProductId)
          if (product) {
            const itemCost = (product.price || 0) * item.quantity
            listTotalValue += itemCost
            detailedItems.push({
              itemId: item.id,
              productName: product.name,
              quantity: item.quantity,
              unitPrice: product.price,
              totalCost: itemCost
            })
          }
        }

        grandTotalItems += listItems.length
        grandTotalValue += listTotalValue

        summaries.push({
          wishlistId: wishlist.id,
          title: wishlist.title,
          itemCount: listItems.length,
          totalValue: listTotalValue,
          shareCount: shareCountByWishlist.get(wishlist.id) ?? 0,
          items: detailedItems
        })
      }

      res.status(200).json({
        status: 'success',
        data: {
          totalWishlists: wishlists.length,
          grandTotalItems,
          grandTotalValue,
          averageItemsPerWishlist: wishlists.length > 0 ? Number((grandTotalItems / wishlists.length).toFixed(1)) : 0,
          wishlists: summaries
        }
      })
    } catch (err: unknown) {
      logger.error(`Wishlist analytics failed: ${(err as Error).message}`)
      res.status(500).json({ status: 'error', message: 'Could not compute wishlist statistics.' })
    }
  }
}
