/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import logger from './logger'

export interface WishlistNotificationPayload {
  recipientEmail: string
  wishlistTitle: string
  action: 'share_invite' | 'item_added' | 'item_reserved' | 'access_revoked'
  actorName: string
  inviteLink?: string
}

/**
 * Dispatch an email notification to wishlist collaborators.
 */
export async function sendWishlistNotification(payload: WishlistNotificationPayload): Promise<boolean> {
  try {
    logger.info(`Sending wishlist notification [${payload.action}] to ${payload.recipientEmail} for '${payload.wishlistTitle}'`)
    // Simulated mail dispatch in demo environment
    return true
  } catch (error) {
    logger.error(`Failed to send wishlist notification: ${(error as Error).message}`)
    return false
  }
}

/**
 * Compose email body for a wishlist share invitation.
 */
export function composeInviteEmailBody(wishlistTitle: string, inviterName: string, inviteUrl: string): string {
  return `
Hello,

${inviterName} has invited you to collaborate on their Juice Shop wishlist "${wishlistTitle}".

Click the link below to accept the invitation and view or edit the wishlist:
${inviteUrl}

Cheers,
The OWASP Juice Shop Team
`.trim()
}
