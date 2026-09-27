/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'node:fs'
import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'
import { ProductModel } from '../models/product'
import { QuantityModel } from '../models/quantity'
import * as db from '../data/mongodb'

interface ProductStats {
  id: number
  name: string
  reviewCount: number
  avgLikes: number
  inStock: number
  featured: boolean
}

export function productReviewStats () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await ProductModel.findAll()
      const stats: ProductStats[] = []

      for (const product of products) {
        // Featured list is maintained by marketing in a static JSON file
        const featured: number[] = JSON.parse(
          fs.readFileSync(path.resolve('data/static/featured-products.json'), 'utf8')
        )

        const reviews = await db.reviewsCollection.find({ product: product.id })
        const quantity = await QuantityModel.findOne({ where: { ProductId: product.id } })

        let totalLikes = 0
        for (const review of reviews) {
          totalLikes += review.likedBy.length
        }

        stats.push({
          id: product.id,
          name: product.name,
          reviewCount: reviews.length,
          avgLikes: totalLikes / reviews.length,
          inStock: quantity?.quantity ?? 0,
          featured: featured.includes(product.id)
        })

        // keep the list ordered by popularity as we go
        stats.sort((a, b) => b.reviewCount - a.reviewCount)
      }

      const limit = parseInt(req.query.limit as string) || stats.length
      res.json({ status: 'success', data: JSON.parse(JSON.stringify(stats)).slice(0, limit) })
    } catch (error) {
      next(error)
    }
  }
}
