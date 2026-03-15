import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'
import { randomUUID } from 'node:crypto'

// ─── Types (sesuai ERD enum Roles) ───────────────────────────────────────────

type AppRole =
  | 'guest'
  | 'participant'
  | 'volunteer_organizer'
  | 'event_organizer_admin'
  | 'super_admin'

interface UserSeed {
  user_id: string
  full_name: string
  email: string
  password: string
  role: AppRole
  created_at: Date
  updated_at: Date
}

// ─── Seeder ───────────────────────────────────────────────────────────────────

export default class UserSeeder extends BaseSeeder {
  async run() {
    console.log('🌱 Seeding users...')

    // Hash password sekali, dipakai semua user dummy
    // Password default: Secret@123
    const defaultPassword = await hash.make('Secret@123')

    // ── User Data ──────────────────────────────────────────────────────────
    // PRD Target Users & Persona:
    //   - Admin/Owner Event  → event_organizer_admin
    //   - Rekanan EO         → volunteer_organizer
    //   - Pembeli Tiket      → participant
    //   - Gate Staff         → volunteer_organizer
    //   - Super Admin        → super_admin

    const users: UserSeed[] = [
      // ── Super Admin ──────────────────────────────────────────────────────
      // ERD: super_admin — akses penuh ke seluruh sistem
      {
        user_id: randomUUID(),
        full_name: 'Super Admin Eotech',
        email: 'superadmin@eotech.id',
        password: defaultPassword,
        role: 'super_admin',
        created_at: new Date(),
        updated_at: new Date(),
      },

      // ── Event Organizer Admin ─────────────────────────────────────────────
      // PRD: Admin/Owner Event — membuat event, mengatur tiket,
      //      memantau penjualan, mengunduh laporan, mengundang rekanan EO
      {
        user_id: randomUUID(),
        full_name: 'Budi Santoso',
        email: 'budi.admin@eotech.id',
        password: defaultPassword,
        role: 'event_organizer_admin',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: randomUUID(),
        full_name: 'Sari Dewi',
        email: 'sari.admin@eotech.id',
        password: defaultPassword,
        role: 'event_organizer_admin',
        created_at: new Date(),
        updated_at: new Date(),
      },

      // ── Volunteer Organizer (Rekanan EO & Gate Staff) ─────────────────────
      // PRD 7.4: Rekanan EO — lihat penjualan dasar, kelola check-in,
      //          tidak bisa ubah pengaturan sensitif
      // PRD 7.4: Gate Staff — hanya scan QR & verifikasi tiket
      {
        user_id: randomUUID(),
        full_name: 'Ahmad Fauzi',
        email: 'ahmad.partner@eotech.id',
        password: defaultPassword,
        role: 'volunteer_organizer',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: randomUUID(),
        full_name: 'Rina Marlina',
        email: 'rina.gatestaff@eotech.id',
        password: defaultPassword,
        role: 'volunteer_organizer',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: randomUUID(),
        full_name: 'Deni Kurniawan',
        email: 'deni.partner@eotech.id',
        password: defaultPassword,
        role: 'volunteer_organizer',
        created_at: new Date(),
        updated_at: new Date(),
      },

      // ── Participant (Pembeli Tiket) ────────────────────────────────────────
      // PRD: Pembeli Tiket — melihat event, membeli tiket,
      //      menerima e-ticket, menampilkan QR
      {
        user_id: randomUUID(),
        full_name: 'Citra Lestari',
        email: 'citra@gmail.com',
        password: defaultPassword,
        role: 'participant',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: randomUUID(),
        full_name: 'Fajar Nugroho',
        email: 'fajar@gmail.com',
        password: defaultPassword,
        role: 'participant',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: randomUUID(),
        full_name: 'Hana Pertiwi',
        email: 'hana@yahoo.com',
        password: defaultPassword,
        role: 'participant',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: randomUUID(),
        full_name: 'Irfan Maulana',
        email: 'irfan@outlook.com',
        password: defaultPassword,
        role: 'participant',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: randomUUID(),
        full_name: 'Jasmine Putri',
        email: 'jasmine@gmail.com',
        password: defaultPassword,
        role: 'participant',
        created_at: new Date(),
        updated_at: new Date(),
      },

      // ── Guest ─────────────────────────────────────────────────────────────
      // ERD: guest — hanya bisa melihat event publik, belum login/daftar
      // Catatan: guest umumnya tidak tersimpan di DB karena belum registrasi,
      // tapi disertakan sebagai referensi untuk testing role middleware
      {
        user_id: randomUUID(),
        full_name: 'Guest User',
        email: 'guest@eotech.id',
        password: defaultPassword,
        role: 'guest',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    // ── Insert dengan upsert untuk menghindari duplicate pada re-seed ──────
    // Gunakan email sebagai unique key constraint
    await db.table('users').multiInsert(users)

    console.log(`  ✅ Inserted ${users.length} users`)

    // ── Summary per role ───────────────────────────────────────────────────
    const roleOrder: AppRole[] = [
      'super_admin',
      'event_organizer_admin',
      'volunteer_organizer',
      'participant',
      'guest',
    ]

    console.log('\n📋 User seeding summary:')
    for (const role of roleOrder) {
      const roleUsers = users.filter((u) => u.role === role)
      if (roleUsers.length === 0) continue

      console.log(`\n  [${role.toUpperCase()}] — ${roleUsers.length} user(s)`)
      for (const u of roleUsers) {
        console.log(`    • ${u.full_name.padEnd(25)} ${u.email}`)
      }
    }

    console.log('\n🔑 Default password untuk semua user: Secret@123')
    console.log('\n✨ User seeder completed successfully.')
  }
}