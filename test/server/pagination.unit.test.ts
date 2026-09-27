/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { parsePagination, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../lib/pagination'

void describe('pagination', () => {
  void it('defaults to the first page with the default page size', () => {
    assert.deepEqual(parsePagination({}), { page: 1, pageSize: DEFAULT_PAGE_SIZE, offset: 0 })
  })

  void it('computes the offset from page and page size', () => {
    assert.deepEqual(parsePagination({ page: '3', pageSize: '10' }), { page: 3, pageSize: 10, offset: 20 })
  })

  void it('caps the page size', () => {
    assert.equal(parsePagination({ pageSize: '5000' }).pageSize, MAX_PAGE_SIZE)
  })

  void it('falls back on zero, negative, fractional and non-numeric input', () => {
    for (const bad of ['0', '-2', '1.5', 'abc', '', undefined, ['2']]) {
      assert.deepEqual(parsePagination({ page: bad, pageSize: bad }), { page: 1, pageSize: DEFAULT_PAGE_SIZE, offset: 0 })
    }
  })
})
