import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import { randomUUID } from 'node:crypto'

type EventStatus = 'pending' | 'publish' | 'archived'

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').trim()
}

export default class EventSeeder extends BaseSeeder {
  async run() {
    console.log('🌱 Seeding events and ticket types...')

    // Ambil owner_id dari users yang sudah ada di DB
    const admins = await db
      .from('users')
      .select('user_id')
      .where('role', 'event_organizer_admin')
      .orderBy('created_at', 'asc')

    const superAdmin = await db
      .from('users')
      .select('user_id')
      .where('role', 'super_admin')
      .first()

    if (admins.length === 0 && !superAdmin) {
      throw new Error('❌ Jalankan UserSeeder dulu: node ace db:seed --files database/seeders/user_seeder.ts')
    }

    const getOwner = (i: number): string =>
      admins[i]?.user_id ?? admins[0]?.user_id ?? superAdmin!.user_id

    const events = [
      {
        event_id: randomUUID(),
        owner_id: getOwner(0),
        title: 'Eotech Developer Conference 2025',
        description: 'Konferensi tahunan untuk para developer Indonesia.',
        location: 'Jakarta Convention Center, Jakarta Pusat',
        organizer_contact: '+62-812-0000-0001',
        registration_start_at: daysFromNow(-7),
        registration_end_at: daysFromNow(30),
        banner: 'banners/eotech-devconf-2025.jpg',
        slug: slugify('Eotech Developer Conference 2025'),
        status: 'publish' as EventStatus,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        event_id: randomUUID(),
        owner_id: getOwner(1),
        title: 'Eotech Music Festival 2025',
        description: 'Festival musik outdoor terbesar di Bandung.',
        location: 'Lapangan Gasibu, Bandung',
        organizer_contact: '+62-812-0000-0002',
        registration_start_at: daysFromNow(-3),
        registration_end_at: daysFromNow(45),
        banner: 'banners/eotech-music-fest-2025.jpg',
        slug: slugify('Eotech Music Festival 2025'),
        status: 'publish' as EventStatus,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        event_id: randomUUID(),
        owner_id: getOwner(0),
        title: 'Eotech Product Launch: Mobile App',
        description: 'Peluncuran resmi aplikasi mobile Eotech Tiket.',
        location: 'Eotech HQ, Surabaya',
        organizer_contact: '+62-812-0000-0003',
        registration_start_at: daysFromNow(10),
        registration_end_at: daysFromNow(60),
        banner: null,
        slug: slugify('Eotech Product Launch Mobile App'),
        status: 'pending' as EventStatus,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        event_id: randomUUID(),
        owner_id: getOwner(1),
        title: 'Eotech Hackathon 2024',
        description: 'Hackathon 48 jam bertema Smart City. Event telah selesai.',
        location: 'Gedung Sate, Bandung',
        organizer_contact: '+62-812-0000-0004',
        registration_start_at: daysFromNow(-90),
        registration_end_at: daysFromNow(-60),
        banner: 'banners/eotech-hackathon-2024.jpg',
        slug: slugify('Eotech Hackathon 2024'),
        status: 'archived' as EventStatus,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await db.table('events').multiInsert(events)
    console.log(`  ✅ Inserted ${events.length} events`)

    const ticketTypes = [
      // Event 1 — Developer Conference
      { ticket_type_id: randomUUID(), event_id: events[0].event_id, ticket_name: 'Early Bird', price: 150_000, quota: 100, sales_start_date: daysFromNow(-7), sales_end_date: daysFromNow(7), per_order_limit: 2, description: 'Harga spesial 100 pendaftar pertama.', created_at: new Date(), updated_at: new Date() },
      { ticket_type_id: randomUUID(), event_id: events[0].event_id, ticket_name: 'Regular', price: 250_000, quota: 300, sales_start_date: daysFromNow(-7), sales_end_date: daysFromNow(28), per_order_limit: 5, description: 'Tiket reguler, akses semua sesi dan makan siang.', created_at: new Date(), updated_at: new Date() },
      { ticket_type_id: randomUUID(), event_id: events[0].event_id, ticket_name: 'VIP', price: 750_000, quota: 50, sales_start_date: daysFromNow(-7), sales_end_date: daysFromNow(25), per_order_limit: 2, description: 'Workshop premium, makan malam, goodie bag eksklusif.', created_at: new Date(), updated_at: new Date() },
      // Event 2 — Music Festival
      { ticket_type_id: randomUUID(), event_id: events[1].event_id, ticket_name: 'Early Bird', price: 200_000, quota: 200, sales_start_date: daysFromNow(-3), sales_end_date: daysFromNow(5), per_order_limit: 4, description: 'Harga early bird, berlaku 2 hari penuh.', created_at: new Date(), updated_at: new Date() },
      { ticket_type_id: randomUUID(), event_id: events[1].event_id, ticket_name: 'Regular', price: 350_000, quota: 500, sales_start_date: daysFromNow(-3), sales_end_date: daysFromNow(43), per_order_limit: 6, description: 'Akses area umum dan seluruh panggung 2 hari.', created_at: new Date(), updated_at: new Date() },
      { ticket_type_id: randomUUID(), event_id: events[1].event_id, ticket_name: 'VIP', price: 1_000_000, quota: 75, sales_start_date: daysFromNow(-3), sales_end_date: daysFromNow(40), per_order_limit: 2, description: 'VIP area, meet & greet artis, merchandise eksklusif.', created_at: new Date(), updated_at: new Date() },
      // Event 3 — Product Launch (pending)
      { ticket_type_id: randomUUID(), event_id: events[2].event_id, ticket_name: 'Free RSVP', price: 0, quota: 150, sales_start_date: daysFromNow(10), sales_end_date: daysFromNow(55), per_order_limit: 1, description: 'Gratis, kuota terbatas.', created_at: new Date(), updated_at: new Date() },
      // Event 4 — Hackathon 2024 (archived)
      { ticket_type_id: randomUUID(), event_id: events[3].event_id, ticket_name: 'Peserta Hackathon', price: 50_000, quota: 200, sales_start_date: daysFromNow(-90), sales_end_date: daysFromNow(-65), per_order_limit: 1, description: 'Tiket partisipasi Hackathon 2024.', created_at: new Date(), updated_at: new Date() },
    ]

    await db.table('ticket_types').multiInsert(ticketTypes)
    console.log(`  ✅ Inserted ${ticketTypes.length} ticket types`)

    console.log('\n📋 Seeding summary:')
    for (const e of events) {
      const count = ticketTypes.filter((t) => t.event_id === e.event_id).length
      console.log(`  • [${e.status.toUpperCase().padEnd(9)}] ${e.title} — ${count} ticket type(s) — owner: ${e.owner_id}`)
    }
    console.log('\n✨ Event seeder completed successfully.')
  }
}