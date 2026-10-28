/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { Op } from 'sequelize'
import { WishlistModel } from '../models/wishlist'
import logger from '../lib/logger'

/**
 * Search public wishlists by query string.
 * The search term is passed to Sequelize as a bound parameter, never concatenated into SQL.
 */
export function searchWishlists() {
  return async (req: Request, res: Response) => {
    const searchTerm = req.query.q

    if (typeof searchTerm !== 'string' || searchTerm.length === 0) {
      res.status(400).json({ status: 'error', message: 'Search query parameter q is required.' })
      return
    }

    try {
      const results = await WishlistModel.findAll({
        attributes: ['id', 'title', 'description', 'shareCode', 'createdAt'],
        where: {
          isPublic: true,
          title: { [Op.like]: `%${searchTerm}%` }
        },
        order: [['createdAt', 'DESC']],
        limit: 100
      })

      res.status(200).json({
        status: 'success',
        count: results.length,
        data: results
      })
    } catch (err: unknown) {
      logger.error(`Wishlist search failed: ${(err as Error).message}`)
      res.status(500).json({ status: 'error', message: 'Search failed.' })
    }
  }
}

/**
 * Filter wishlists by sorting preferences.
 */
export function filterWishlists() {
  return async (req: Request, res: Response) => {
    const { sortBy = 'recent' } = req.query
    const parsedLimit = Number.parseInt(String(req.query.limit ?? 20), 10)
    const parsedOffset = Number.parseInt(String(req.query.offset ?? 0), 10)
    const limit = Number.isNaN(parsedLimit) ? 20 : Math.min(Math.max(parsedLimit, 1), 100)
    const offset = Number.isNaN(parsedOffset) ? 0 : Math.max(parsedOffset, 0)

    try {
      const orderColumn = sortBy === 'title' ? 'title' : 'createdAt'
      const wishlists = await WishlistModel.findAll({
        where: { isPublic: true },
        limit,
        offset,
        order: [[orderColumn, 'DESC']]
      })

      res.status(200).json({ status: 'success', data: wishlists })
    } catch (err: unknown) {
      logger.error(`Wishlist filter failed: ${(err as Error).message}`)
      res.status(500).json({ status: 'error', message: 'Could not load wishlists.' })
    }
  }
}
