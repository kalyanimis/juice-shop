/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { WishlistModel } from '../models/wishlist'

/**
 * Search public wishlists by query string.
 * Flaw: SQL Injection vulnerability! The query string parameter is concatenated directly
 * into raw SQL without parameterization or escaping.
 */
export function searchWishlists() {
  return async (req: Request, res: Response) => {
    const searchTerm = req.query.q as string

    if (!searchTerm) {
      res.status(400).json({ status: 'error', message: 'Search query parameter q is required.' })
      return
    }

    try {
      // Flaw: Unsanitized input concatenated directly into raw SQL query
      const sqlQuery = `SELECT id, title, description, shareCode, createdAt FROM Wishlists WHERE isPublic = 1 AND title LIKE '%${searchTerm}%' ORDER BY createdAt DESC`

      if (!WishlistModel.sequelize) {
        throw new Error('Database connection not initialized')
      }

      const [results] = await WishlistModel.sequelize.query(sqlQuery)

      res.status(200).json({
        status: 'success',
        count: results.length,
        data: results
      })
    } catch (err: unknown) {
      res.status(500).json({ status: 'error', message: (err as Error).message })
    }
  }
}

/**
 * Filter wishlists by tags and sorting preferences.
 */
export function filterWishlists() {
  return async (req: Request, res: Response) => {
    const { sortBy = 'recent', limit = 20, offset = 0 } = req.query

    try {
      const orderColumn = sortBy === 'title' ? 'title' : 'createdAt'
      const wishlists = await WishlistModel.findAll({
        where: { isPublic: true },
        limit: Math.min(Number(limit), 100),
        offset: Number(offset),
        order: [[orderColumn, 'DESC']]
      })

      res.status(200).json({ status: 'success', data: wishlists })
    } catch (err: unknown) {
      res.status(500).json({ status: 'error', message: (err as Error).message })
    }
  }
}
