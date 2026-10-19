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
import { type WishlistPermission } from '../data/wishlistTypes'

class WishlistShare extends Model<
  InferAttributes<WishlistShare>,
  InferCreationAttributes<WishlistShare>
> {
  declare id: CreationOptional<number>
  declare WishlistId: ForeignKey<WishlistModel['id']>
  declare sharedWithEmail: string
  declare permission: CreationOptional<WishlistPermission>
  declare inviteToken: string
  declare accepted: CreationOptional<boolean>
  declare expiresAt: CreationOptional<Date>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare wishlist?: NonAttribute<WishlistModel>
}

const WishlistShareModelInit = (sequelize: Sequelize) => {
  WishlistShare.init(
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
      sharedWithEmail: {
        type: DataTypes.STRING,
        allowNull: false
      },
      permission: {
        type: DataTypes.STRING,
        defaultValue: 'read'
      },
      inviteToken: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true
      },
      accepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      tableName: 'WishlistShares',
      sequelize
    }
  )
}

export { WishlistShare as WishlistShareModel, WishlistShareModelInit }
