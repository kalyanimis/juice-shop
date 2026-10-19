/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { WishlistModel } from '../models/wishlist'
import { WishlistItemModel } from '../models/wishlistItem'
import { ProductModel } from '../models/product'
import { WishlistShareModel } from '../models/wishlistShare'

/**
 * Generate analytics and summary stats for a user's wishlists.
 * Flaw: Severe N+1 query pattern! For each wishlist, it queries its items individually in a loop,
 * and then for each item queries the product record individually in a nested loop.
 */
export function getWishlistSummaryStats() {
  return async (req: Request, res: Response) => {
    try {
      const wishlists = await WishlistModel.findAll({
        where: { UserId: req.body.UserId }
      })

      const summaries = []
      let grandTotalItems = 0
      let grandTotalValue = 0

      // Flaw: N+1 query problem - sequential queries inside loop over wishlists
      for (const wishlist of wishlists) {
        // Individual query per wishlist:
        const items = await WishlistItemModel.findAll({
          where: { WishlistId: wishlist.id }
        })

        let listTotalValue = 0
        const detailedItems = []

        // Nested N+1: Individual query per item inside the loop
        for (const item of items) {
          const product = await ProductModel.findByPk(item.ProductId)
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

        // Another query inside the loop for shares:
        const shareCount = await WishlistShareModel.count({
          where: { WishlistId: wishlist.id }
        })

        grandTotalItems += items.length
        grandTotalValue += listTotalValue

        summaries.push({
          wishlistId: wishlist.id,
          title: wishlist.title,
          itemCount: items.length,
          totalValue: listTotalValue,
          shareCount,
          items: detailedItems
        })
      }

      res.status(200).json({
        status: 'success',
        data: {
          totalWishlists: wishlists.length,
          grandTotalItems,
          grandTotalValue,
          averageItemsPerWishlist: wishlists.length > 0 ? (grandTotalItems / wishlists.length).toFixed(1) : 0,
          wishlists: summaries
        }
      })
    } catch (err: unknown) {
      res.status(500).json({ status: 'error', message: (err as Error).message })
    }
  }
}
