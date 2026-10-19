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
import { type UserModel } from './user'
import { type WishlistVisibility } from '../data/wishlistTypes'

class Wishlist extends Model<
  InferAttributes<Wishlist>,
  InferCreationAttributes<Wishlist>
> {
  declare id: CreationOptional<number>
  declare UserId: ForeignKey<UserModel['id']>
  declare title: string
  declare description: CreationOptional<string>
  declare visibility: CreationOptional<WishlistVisibility>
  declare isPublic: CreationOptional<boolean>
  declare shareCode: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare user?: NonAttribute<UserModel>
}

const WishlistModelInit = (sequelize: Sequelize) => {
  Wishlist.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING(1000),
        allowNull: true
      },
      visibility: {
        type: DataTypes.STRING,
        defaultValue: 'private'
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      shareCode: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      tableName: 'Wishlists',
      sequelize
    }
  )
}

export { Wishlist as WishlistModel, WishlistModelInit }
