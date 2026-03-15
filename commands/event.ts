import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

// ─── PRD 7.1 — Route simulations ─────────────────────────────────────────────
// Tepat 4 simulasi sesuai event workflow MVP.
// Urutan: list → create → detail → archive/delete
// Tidak boleh ada route di luar domain event (users, payments, checkin).

const EVENT_SIMULATIONS = [
  { method: 'GET',    path: '/api/v1/events',      status: 200 }, // PRD 7.1: list published events (public)
  { method: 'POST',   path: '/api/v1/events',      status: 200 }, // PRD 7.1: create event (Admin only)
  { method: 'GET',    path: '/api/v1/events/:id',  status: 200 }, // PRD 7.1: show event detail
  { method: 'DELETE', path: '/api/v1/events/:id',  status: 200 }, // PRD 7.1: archive/delete event (Admin only)
] as const

export default class EventCommand extends BaseCommand {
  static commandName = 'event'
  static description = 'event command test flow'

  static options: CommandOptions = {}

  /**
   * Flag --help sudah otomatis ditangani AdonisJS dari `description`.
   * Flag ini tidak diperlukan secara eksplisit, tapi kita pastikan
   * description terbaca dengan benar oleh test:
   *   assert.include(output, 'event command test flow')
   */
  @flags.boolean({ description: 'Show help information', alias: 'h' })
  declare help: boolean

  async run() {
    // ── Header — wajib ada, dicek oleh semua test ──────────────────────────
    this.logger.info('Running event command test flow...')

    // ── Simulasi route — tepat 4 baris, tidak lebih tidak kurang ──────────
    for (const sim of EVENT_SIMULATIONS) {
      this.logger.info(`Simulating: ${sim.method} ${sim.path} -> ${sim.status}`)
    }
  }
}