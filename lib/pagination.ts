/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

export interface Pagination {
  page: number
  pageSize: number
  offset: number
}

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

function toPositiveInt (value: unknown, fallback: number): number {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return fallback
  }
  const parsed = Number.parseInt(value, 10)
  return parsed > 0 ? parsed : fallback
}

/**
 * Normalises `?page=` and `?pageSize=` query values into safe, bounded
 * numbers. Invalid or missing values fall back to page 1 and the default
 * page size; the page size is capped at MAX_PAGE_SIZE.
 */
export function parsePagination (query: { page?: unknown, pageSize?: unknown }): Pagination {
  const page = toPositiveInt(query.page, 1)
  const pageSize = Math.min(toPositiveInt(query.pageSize, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE)
  return { page, pageSize, offset: (page - 1) * pageSize }
}
