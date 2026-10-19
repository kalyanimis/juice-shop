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
import { type UserModel } from './user'

class WishlistCollaboration extends Model<
  InferAttributes<WishlistCollaboration>,
  InferCreationAttributes<WishlistCollaboration>
> {
  declare id: CreationOptional<number>
  declare WishlistId: ForeignKey<WishlistModel['id']>
  declare UserId: ForeignKey<UserModel['id']>
  declare action: string
  declare details: CreationOptional<string>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare wishlist?: NonAttribute<WishlistModel>
  declare user?: NonAttribute<UserModel>
}

const WishlistCollaborationModelInit = (sequelize: Sequelize) => {
  WishlistCollaboration.init(
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
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      details: {
        type: DataTypes.STRING(2000),
        allowNull: true
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      tableName: 'WishlistCollaborations',
      sequelize
    }
  )
}

export { WishlistCollaboration as WishlistCollaborationModel, WishlistCollaborationModelInit }
