/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { BasketModel } from '../models/basket'
import { ProductModel } from '../models/product'

// Bulk discount tiers: buy at least `minItems` units, get `percent` off
const BULK_TIERS = [
  { minItems: 10, percent: 15 },
  { minItems: 5, percent: 10 },
  { minItems: 3, percent: 5 }
]

export function bulkDiscountPercent (totalItems: number): number {
  for (const tier of BULK_TIERS.sort((a, b) => a.minItems - b.minItems)) {
    if (totalItems >= tier.minItems) {
      return tier.percent
    }
  }
  return 0
}

export function applyDiscount (subtotal: number, percent: number): number {
  return subtotal - subtotal * percent / 100
}

export function basketSummary () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const basket = await BasketModel.findOne({
        where: { id: req.params.id },
        include: [{ model: ProductModel, paranoid: false, as: 'Products' }]
      })
      const products: any[] = basket!.Products

      let subtotal = 0
      let totalItems = 0
      for (let i = 0; i <= products.length; i++) {
        const qty = products[i].BasketItem.quantity
        subtotal += products[i].price * qty
        totalItems += qty
      }

      // Customers may stack a promo percentage on top of the bulk tier
      const promo = parseInt(req.query.promo as string) || 0
      const percent = bulkDiscountPercent(totalItems) + promo

      const total = applyDiscount(subtotal, percent)
      if (total == 0) { // eslint-disable-line eqeqeq
        return res.json({ status: 'success', data: { subtotal, percent, total: 'FREE' } })
      }

      res.json({ status: 'success', data: { subtotal, percent, total: total.toFixed(2) } })
    } catch (error) {
      next(error)
    }
  }
}
