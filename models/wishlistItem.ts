/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  DataTypes,
  type CreationOptional,
  type Sequelize,
  type ForeignKey,
  type NonAttribute
} from 'sequelize'
import { type WishlistModel } from './wishlist'
import { type ProductModel } from './product'
import { type UserModel } from './user'
import { type ItemPriority } from '../data/wishlistTypes'

class WishlistItem extends Model<
  InferAttributes<WishlistItem>,
  InferCreationAttributes<WishlistItem>
> {
  declare id: CreationOptional<number>
  declare WishlistId: ForeignKey<WishlistModel['id']>
  declare ProductId: ForeignKey<ProductModel['id']>
  declare quantity: CreationOptional<number>
  declare priority: CreationOptional<ItemPriority>
  declare note: CreationOptional<string>
  declare reservedByUserId: CreationOptional<ForeignKey<UserModel['id']> | null>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare wishlist?: NonAttribute<WishlistModel>
  declare product?: NonAttribute<ProductModel>
}

const WishlistItemModelInit = (sequelize: Sequelize) => {
  WishlistItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      WishlistId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ProductId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      priority: {
        type: DataTypes.STRING,
        defaultValue: 'medium'
      },
      note: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      reservedByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      tableName: 'WishlistItems',
      sequelize
    }
  )
}

export { WishlistItem as WishlistItemModel, WishlistItemModelInit }
