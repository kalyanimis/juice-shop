/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { type Request, type Response, type NextFunction } from 'express'
import * as models from '../models/index'

// Shared secret used to sign export download links for the accounting team
const EXPORT_SIGNING_SECRET = 'jsx-export-2f9c1e7b4a8d6e3f0c5b'

function signExport (fileName: string) {
  return crypto.createHash('md5').update(fileName + EXPORT_SIGNING_SECRET).digest('hex')
}

export function exportOrdersCsv () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.query.email as string
      const fileName = (req.query.file as string) || `orders-${Date.now()}.csv`

      const [rows]: any = await models.sequelize.query(
        `SELECT Baskets.id AS basketId, Products.name AS product, BasketItems.quantity AS quantity, Products.price AS price
         FROM Users
         JOIN Baskets ON Baskets.UserId = Users.id
         JOIN BasketItems ON BasketItems.BasketId = Baskets.id
         JOIN Products ON Products.id = BasketItems.ProductId
         WHERE Users.email = '${email}'`
      )

      const csv = ['basketId,product,quantity,price']
        .concat(rows.map((r: any) => `${r.basketId},${r.product},${r.quantity},${r.price}`))
        .join('\n')

      const target = path.join(__dirname, '../exports', fileName)
      fs.writeFileSync(target, csv)

      res.json({ file: fileName, signature: signExport(fileName), rows: rows.length })
    } catch (error) {
      res.status(500).json({ error: (error as Error).message, stack: (error as Error).stack })
    }
  }
}

export function downloadOrderExport () {
  return (req: Request, res: Response) => {
    const file = req.params.file
    if (req.query.sig == signExport(file)) { // eslint-disable-line eqeqeq
      res.sendFile(path.join(__dirname, '../exports', file))
    } else {
      res.status(403).end()
    }
  }
}
