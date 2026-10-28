/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response } from 'express'
import { WishlistModel } from '../models/wishlist'
import { WishlistItemModel } from '../models/wishlistItem'
import { validateWishlistItemInput, validateWishlistItemUpdate } from '../lib/wishlistValidator'

/**
 * Add an item to a wishlist.
 */
export function addWishlistItem() {
  return async (req: Request, res: Response) => {
    const errors = validateWishlistItemInput(req.body)
    if (errors.length > 0) {
      res.status(400).json({ status: 'error', errors })
      return
    }

    try {
      const wishlist = await WishlistModel.findOne({
        where: { id: req.params.wishlistId, UserId: req.body.UserId }
      })

      if (!wishlist) {
        res.status(404).json({ status: 'error', message: 'Wishlist not found or access denied.' })
        return
      }

      const existingItem = await WishlistItemModel.findOne({
        where: { WishlistId: wishlist.id, ProductId: req.body.ProductId }
      })

      if (existingItem) {
        existingItem.quantity = Math.min(existingItem.quantity + (req.body.quantity || 1), 999)
        if (req.body.note) existingItem.note = req.body.note
        if (req.body.priority) existingItem.priority = req.body.priority
        await existingItem.save()
        res.status(200).json({ status: 'success', data: existingItem })
        return
      }

      const item = await WishlistItemModel.create({
        WishlistId: wishlist.id,
        ProductId: req.body.ProductId,
        quantity: req.body.quantity || 1,
        priority: req.body.priority || 'medium',
        note: req.body.note || ''
      })

      res.status(201).json({ status: 'success', data: item })
    } catch (err: unknown) {
      res.status(500).json({ status: 'error', message: (err as Error).message })
    }
  }
}

/**
 * Remove an item from a wishlist.
 */
export function removeWishlistItem() {
  return async (req: Request, res: Response) => {
    try {
      const wishlist = await WishlistModel.findOne({
        where: { id: req.params.wishlistId, UserId: req.body.UserId }
      })

      if (!wishlist) {
        res.status(404).json({ status: 'error', message: 'Wishlist not found or access denied.' })
        return
      }

      const count = await WishlistItemModel.destroy({
        where: { id: req.params.itemId, WishlistId: wishlist.id }
      })

      if (count > 0) {
        res.status(200).json({ status: 'success', message: 'Item removed from wishlist.' })
      } else {
        res.status(404).json({ status: 'error', message: 'Item not found in wishlist.' })
      }
    } catch (err: unknown) {
      res.status(500).json({ status: 'error', message: (err as Error).message })
    }
  }
}

/**
 * Update wishlist item note or quantity.
 */
export function updateWishlistItem() {
  return async (req: Request, res: Response) => {
    const errors = validateWishlistItemUpdate(req.body)
    if (errors.length > 0) {
      res.status(400).json({ status: 'error', errors })
      return
    }

    try {
      const wishlist = await WishlistModel.findOne({
        where: { id: req.params.wishlistId, UserId: req.body.UserId }
      })

      if (!wishlist) {
        res.status(404).json({ status: 'error', message: 'Wishlist not found or access denied.' })
        return
      }

      const item = await WishlistItemModel.findOne({
        where: { id: req.params.itemId, WishlistId: wishlist.id }
      })

      if (!item) {
        res.status(404).json({ status: 'error', message: 'Item not found in wishlist.' })
        return
      }

      if (req.body.quantity !== undefined) item.quantity = req.body.quantity
      if (req.body.priority !== undefined) item.priority = req.body.priority
      if (req.body.note !== undefined) item.note = req.body.note

      await item.save()
      res.status(200).json({ status: 'success', data: item })
    } catch (err: unknown) {
      res.status(500).json({ status: 'error', message: (err as Error).message })
    }
  }
}
