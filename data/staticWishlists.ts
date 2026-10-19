/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type WishlistAttributes, type WishlistItemAttributes } from './wishlistTypes'

export interface WishlistTemplate {
  category: string
  templateName: string
  wishlist: Omit<WishlistAttributes, 'id' | 'UserId' | 'shareCode'>
  defaultItems: Array<Omit<WishlistItemAttributes, 'id' | 'WishlistId'>>
}

export const staticWishlistTemplates: WishlistTemplate[] = [
  {
    category: 'Seasonal & Holidays',
    templateName: 'Holiday Celebration Basket',
    wishlist: {
      title: 'OWASP Holiday Juice Basket',
      description: 'Curated selection of our finest festive juices, party treats and eco-friendly swag.',
      visibility: 'public',
      isPublic: true
    },
    defaultItems: [
      {
        ProductId: 1,
        quantity: 3,
        priority: 'high',
        note: 'Apple Juice (1000ml) - essential for the celebration'
      },
      {
        ProductId: 2,
        quantity: 2,
        priority: 'medium',
        note: 'Orange Juice with real pulp'
      },
      {
        ProductId: 5,
        quantity: 1,
        priority: 'urgent',
        note: 'Eggfruit Juice - limited holiday batch'
      }
    ]
  },
  {
    category: 'Office & Team',
    templateName: 'Hacker Refreshments',
    wishlist: {
      title: 'CTF Marathon Energy Kit',
      description: 'Fuel for midnight bug hunting and capture-the-flag competitions.',
      visibility: 'public',
      isPublic: true
    },
    defaultItems: [
      {
        ProductId: 3,
        quantity: 5,
        priority: 'urgent',
        note: 'Banan-o-Rama Energy Boost'
      },
      {
        ProductId: 7,
        quantity: 4,
        priority: 'high',
        note: 'Green Smoothie Detox'
      },
      {
        ProductId: 11,
        quantity: 2,
        priority: 'low',
        note: 'Juice Shop Hoodie (L) for late night sessions'
      }
    ]
  },
  {
    category: 'Healthy Living',
    templateName: 'Weekly Vitality Pack',
    wishlist: {
      title: 'Weekly Organic Reset',
      description: 'Nutrient-rich cold pressed juices to kick off each morning.',
      visibility: 'unlisted',
      isPublic: false
    },
    defaultItems: [
      {
        ProductId: 4,
        quantity: 7,
        priority: 'high',
        note: 'Lemon Juice (1000ml) for immune support'
      },
      {
        ProductId: 8,
        quantity: 7,
        priority: 'medium',
        note: 'Strawberry Juice (500ml)'
      }
    ]
  }
]

export function getTemplateByName(name: string): WishlistTemplate | undefined {
  return staticWishlistTemplates.find((tmpl) => tmpl.templateName.toLowerCase() === name.toLowerCase())
}
