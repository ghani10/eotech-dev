/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.on('/').renderInertia('home', {}).as('home')

const api = 'api/v1'

// ─── Auth Routes (Guest only) ─────────────────────────────────────────────────
router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())


// ─── Event API ────────────────────────────────────────────────────────────────
// PRD 7.1: Public — shareable event URL, no login required
router.group(() => {
  // Public: list published events & view by slug (PRD: URL publik tanpa login)
  router.get(`${api}/events`, 'EventsController.index')
  router.get(`${api}/events/slug/:slug`, 'EventsController.showBySlug')
}).prefix('')

// PRD 7.1 + Role: Admin/Owner can create, update, archive events
// ERD Roles: event_organizer_admin, super_admin
router
  .group(() => {
    router.post(`${api}/events`, 'EventsController.store')
    router.get(`${api}/events/:id`, 'EventsController.show')
    router.put(`${api}/events/:id`, 'EventsController.update')
    router.patch(`${api}/events/:id/status`, 'EventsController.updateStatus')
    router.delete(`${api}/events/:id`, 'EventsController.destroy')
  })
  .use(middleware.auth())
  .use(middleware.role(['event_organizer_admin', 'super_admin']))


// ─── Event Member / Partner API ───────────────────────────────────────────────
// PRD 7.4 + 7.6: Undang partner EO via magic link, manage roles
router
  .group(() => {
    // Admin only: invite & revoke partner access
    router.post(`${api}/events/:eventId/members/invite`, 'EventMembersController.invite')
    router.delete(`${api}/events/:eventId/members/:memberId`, 'EventMembersController.revoke')
    router.get(`${api}/events/:eventId/members`, 'EventMembersController.index')
  })
  .use(middleware.auth())
  .use(middleware.role(['event_organizer_admin', 'super_admin']))

// PRD 7.6: Partner accepts invite via magic link (no auth — link-based)
router.get(`${api}/invitations/:token`, 'EventMembersController.acceptInvite')


// ─── Ticket Type API ──────────────────────────────────────────────────────────
// PRD 7.2: Admin manages ticket types per event
router
  .group(() => {
    router.get(`${api}/events/:eventId/ticket-types`, 'TicketTypesController.index')
    router.post(`${api}/events/:eventId/ticket-types`, 'TicketTypesController.store')
    router.put(`${api}/events/:eventId/ticket-types/:id`, 'TicketTypesController.update')
    router.delete(`${api}/events/:eventId/ticket-types/:id`, 'TicketTypesController.destroy')
  })
  .use(middleware.auth())
  .use(middleware.role(['event_organizer_admin', 'super_admin']))


// ─── Order & Payment API ──────────────────────────────────────────────────────
// PRD 7.3: Buyer checkout flow — pilih tiket → isi data → bayar → e-ticket
// PRD: Pembeli butuh login untuk mengakses order/tiket mereka
router
  .group(() => {
    router.post(`${api}/orders`, 'OrdersController.store')                  // checkout
    router.get(`${api}/orders/:id`, 'OrdersController.show')                // lihat order
    router.get(`${api}/orders/:id/tickets`, 'OrdersController.tickets')     // lihat tiket dari order
  })
  .use(middleware.auth())
  .use(middleware.role(['participant', 'event_organizer_admin', 'super_admin']))

// PRD: User can check ticket status by ticket number (no login — public lookup)
router.get(`${api}/tickets/:ticketId/status`, 'TicketsController.checkStatus')


// ─── Payment Webhook / Callback ───────────────────────────────────────────────
// PRD 7.3: Payment gateway callback (status otomatis)
router.post(`${api}/payments/webhook`, 'PaymentsController.webhook')


// ─── Check-in API ─────────────────────────────────────────────────────────────
// PRD 7.4: Gate Staff — scan QR, verifikasi tiket
// ERD Roles: volunteer_organizer (Gate Staff)
router
  .group(() => {
    router.post(`${api}/checkin`, 'TicketsController.checkin')              // scan & validate QR
    router.get(`${api}/checkin/history`, 'TicketsController.checkinHistory') // riwayat check-in
  })
  .use(middleware.auth())
  .use(middleware.role(['volunteer_organizer', 'event_organizer_admin', 'super_admin']))


// ─── Dashboard & Reporting API ────────────────────────────────────────────────
// PRD 7.5: Admin — ringkasan penjualan, breakdown, export CSV
router
  .group(() => {
    router.get(`${api}/events/:eventId/dashboard`, 'DashboardController.summary')
    router.get(`${api}/events/:eventId/reports/participants`, 'DashboardController.exportParticipants')
    router.get(`${api}/events/:eventId/reports/transactions`, 'DashboardController.exportTransactions')
    router.get(`${api}/events/:eventId/reports/checkins`, 'DashboardController.exportCheckins')
  })
  .use(middleware.auth())
  .use(middleware.role(['event_organizer_admin', 'super_admin']))

// PRD 7.5: Partner EO — hanya akses ringkasan dasar (bukan export sensitif)
router
  .group(() => {
    router.get(`${api}/events/:eventId/dashboard/summary`, 'DashboardController.partnerSummary')
  })
  .use(middleware.auth())
  .use(middleware.role(['volunteer_organizer', 'event_organizer_admin', 'super_admin']))