/*
|--------------------------------------------------------------------------
| Role Middleware
|--------------------------------------------------------------------------
|
| Middleware ini memvalidasi role user yang sedang login terhadap
| role yang diizinkan untuk mengakses suatu route.
|
| Berdasarkan PRD Eotech Tiket:
| - Super Admin   : akses penuh ke seluruh sistem
| - Event Org Admin: buat/kelola event, undang partner, lihat laporan
| - Volunteer/Gate : hanya check-in & lihat ringkasan dasar
| - Participant    : beli tiket, lihat order sendiri
| - Guest          : hanya baca event publik (tidak butuh middleware ini)
|
| ERD Enum Roles:
|   guest | participant | event_organizer_admin | volunteer_organizer | super_admin
|
*/

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { randomUUID } from 'node:crypto'

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Enum role sesuai ERD Eotech Tiket.
 * Urutan mencerminkan hierarki privilege (semakin tinggi = semakin besar akses).
 */
export type AppRole =
  | 'guest'
  | 'participant'
  | 'volunteer_organizer'
  | 'event_organizer_admin'
  | 'super_admin'

/**
 * Hierarki role: angka lebih tinggi = privilege lebih besar.
 * Digunakan untuk pengecekan "minimal role" (hasMinRole).
 */
const ROLE_HIERARCHY: Record<AppRole, number> = {
  guest: 0,
  participant: 1,
  volunteer_organizer: 2,
  event_organizer_admin: 3,
  super_admin: 4,
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export default class RoleMiddleware {
  /**
   * Generate trace ID untuk setiap pengecekan role.
   * Format: ROLE-{timestamp}-{uuid_prefix}
   */
  private generateMessageId(): string {
    return `ROLE-${Date.now()}-${randomUUID().split('-')[0].toUpperCase()}`
  }

  /**
   * Cek apakah role user termasuk dalam daftar role yang diizinkan.
   * super_admin selalu diizinkan tanpa perlu dicantumkan di allowedRoles.
   */
  private isRoleAllowed(userRole: AppRole, allowedRoles: AppRole[]): boolean {
    // super_admin bypass semua pembatasan role
    if (userRole === 'super_admin') return true

    return allowedRoles.includes(userRole)
  }

  /**
   * Cek apakah user memiliki role minimal yang dibutuhkan (berbasis hierarki).
   * Berguna untuk route yang membutuhkan "setidaknya" level tertentu.
   */
  private hasMinRole(userRole: AppRole, minRole: AppRole): boolean {
    return (ROLE_HIERARCHY[userRole] ?? -1) >= (ROLE_HIERARCHY[minRole] ?? 0)
  }

  /**
   * Handle — dipanggil oleh AdonisJS untuk setiap request yang melewati middleware ini.
   *
   * Cara pakai di routes.ts:
   *   .use(middleware.role(['event_organizer_admin', 'super_admin']))
   *
   * @param allowedRoles  Daftar role yang boleh mengakses route ini.
   *                      super_admin selalu lolos meskipun tidak dicantumkan.
   */
  async handle(
    { auth, response, logger }: HttpContext,
    next: NextFn,
    allowedRoles: AppRole[]
  ): Promise<void> {
    const messageId = this.generateMessageId()

    // ── 1. Pastikan user sudah terautentikasi ──────────────────────────────
    const user = auth.user

    if (!user) {
      logger.warn({ messageId }, '[ROLE] Unauthenticated request blocked')
      response.unauthorized({
        message_id: messageId,
        message: 'Authentication required. Please log in to continue.',
      })
      return
    }

    const userRole = user.role as AppRole

    // ERD: primary key users table adalah user_id (uuid), bukan id
    const userId = user.userId

    logger.info(
      { messageId, userId, userRole, allowedRoles },
      '[ROLE] Checking role access'
    )

    // ── 2. Validasi role user ada di enum yang dikenal ────────────────────
    if (!Object.keys(ROLE_HIERARCHY).includes(userRole)) {
      logger.warn(
        { messageId, userId, userRole },
        '[ROLE] Unknown role detected'
      )
      response.forbidden({
        message_id: messageId,
        message: 'Your account has an unrecognized role. Please contact support.',
      })
      return
    }

    // ── 3. Cek apakah role diizinkan ──────────────────────────────────────
    if (!this.isRoleAllowed(userRole, allowedRoles)) {
      logger.warn(
        { messageId, userId, userRole, allowedRoles },
        '[ROLE] Access denied — insufficient role'
      )
      response.forbidden({
        message_id: messageId,
        message: `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}.`,
        your_role: userRole,
        required_roles: allowedRoles,
      })
      return
    }

    // ── 4. Akses diizinkan, lanjutkan ke handler ──────────────────────────
    logger.info(
      { messageId, userId, userRole },
      '[ROLE] Access granted'
    )

    await next()
  }
}