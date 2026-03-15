import { test } from '@japa/runner'
import { execSync, spawnSync } from 'child_process'

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Jalankan `node ace event` dan kembalikan stdout sebagai string.
 * Melempar error jika command gagal (exit code != 0).
 */
function runEventCommand(args = ''): string {
  return execSync(`node ace event${args ? ` ${args}` : ''}`, {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'test' },
    encoding: 'utf8',
    timeout: 15000,
  })
}

// ─── PRD Routes yang wajib ada di simulasi ────────────────────────────────────
// Sesuai PRD 7.1–7.5 dan routes.ts yang sudah didefinisikan

const EXPECTED_SIMULATIONS = [
  'Simulating: GET /api/v1/events -> 200',       // PRD 7.1: list published events
  'Simulating: POST /api/v1/events -> 200',      // PRD 7.1: create event (Admin)
  'Simulating: GET /api/v1/events/:id -> 200',   // PRD 7.1: show event detail
  'Simulating: DELETE /api/v1/events/:id -> 200', // PRD 7.1: archive/delete event
] as const

const FORBIDDEN_STRINGS = [
  'Error',
  'Exception',
  'vite:dep-scan',
  'GET /api/v1/invalid',
  'Simulating: DELETE /api/v1/users', // route tidak ada di PRD
  'UnhandledPromiseRejection',
  'Cannot find module',
] as const

// ─── Test Group ───────────────────────────────────────────────────────────────

test.group('Commands > event', () => {

  // ── Basic output ────────────────────────────────────────────────────────────

  test('harus mencetak header "Running event command test flow..."', async ({ assert }) => {
    const output = runEventCommand()
    assert.include(output, 'Running event command test flow...')
  })

  test('harus mencetak semua simulasi route sesuai PRD 7.1', async ({ assert }) => {
    const output = runEventCommand()
    for (const sim of EXPECTED_SIMULATIONS) {
      assert.include(output, sim, `Expected simulation missing: "${sim}"`)
    }
  })

  test('harus keluar dengan exit code 0 (sukses)', async ({ assert }) => {
    const result = spawnSync('node', ['ace', 'event'], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test' },
      encoding: 'utf8',
      timeout: 15000,
    })
    assert.equal(result.status, 0, `Command exited with code ${result.status}. stderr: ${result.stderr}`)
  })

  // ── Negative / guard assertions ─────────────────────────────────────────────

  test('output tidak boleh mengandung string error atau exception', async ({ assert }) => {
    const output = runEventCommand()
    for (const forbidden of FORBIDDEN_STRINGS) {
      assert.notInclude(output, forbidden, `Forbidden string found in output: "${forbidden}"`)
    }
  })

  test('output tidak boleh mengandung route yang tidak terdefinisi di PRD', async ({ assert }) => {
    const output = runEventCommand()
    assert.notInclude(output, 'GET /api/v1/invalid')
    assert.notInclude(output, '/api/v1/users/delete')   // bukan bagian event workflow
    assert.notInclude(output, '/api/v1/payments/refund') // non-goal PRD (refund manual di luar scope)
  })

  // ── Help flag ───────────────────────────────────────────────────────────────

  test('flag --help harus mencetak deskripsi command', async ({ assert }) => {
    const output = runEventCommand('--help')
    assert.include(output, 'event command test flow')
  })

  // ── Performance ─────────────────────────────────────────────────────────────

  test('command harus selesai dalam waktu kurang dari 15 detik (PRD: performance target)', async ({ assert }) => {
    const start = Date.now()
    runEventCommand()
    const elapsed = Date.now() - start
    assert.isBelow(elapsed, 15000, `Command took ${elapsed}ms, expected < 15000ms`)
  })

  // ── Consistency ─────────────────────────────────────────────────────────────

  test('dua kali run berturut-turut harus menghasilkan output yang konsisten', async ({ assert }) => {
    const output1 = runEventCommand()
    const output2 = runEventCommand()

    assert.include(output1, 'Running event command test flow...')
    assert.include(output2, 'Running event command test flow...')

    for (const sim of EXPECTED_SIMULATIONS) {
      assert.equal(
        output1.includes(sim),
        output2.includes(sim),
        `Inconsistent output across runs for: "${sim}"`
      )
    }
  })

  // ── PRD Workflow coverage ───────────────────────────────────────────────────

  test('PRD 7.1 — simulasi GET list events harus ada (publik, tanpa auth)', async ({ assert }) => {
    const output = runEventCommand()
    assert.include(output, 'Simulating: GET /api/v1/events -> 200')
  })

  test('PRD 7.1 — simulasi POST create event harus ada (Admin only)', async ({ assert }) => {
    const output = runEventCommand()
    assert.include(output, 'Simulating: POST /api/v1/events -> 200')
  })

  test('PRD 7.1 — simulasi GET event by ID harus ada (detail event)', async ({ assert }) => {
    const output = runEventCommand()
    assert.include(output, 'Simulating: GET /api/v1/events/:id -> 200')
  })

  test('PRD 7.1 — simulasi DELETE/archive event harus ada (Admin only)', async ({ assert }) => {
    const output = runEventCommand()
    assert.include(output, 'Simulating: DELETE /api/v1/events/:id -> 200')
  })

  // ── Pollution guard ─────────────────────────────────────────────────────────

  test('output tidak boleh mengandung noise build tool (vite, webpack, esbuild)', async ({ assert }) => {
    const output = runEventCommand()
    assert.notInclude(output, 'vite:dep-scan')
    assert.notInclude(output, 'webpack')
    assert.notInclude(output, 'esbuild')
    assert.notInclude(output, 'Compiling TypeScript')
  })

  test('output tidak boleh mengandung simulasi route non-event (users, payments, checkin)', async ({ assert }) => {
    const output = runEventCommand()
    // Route-route ini bukan bagian dari command `event`, ada di command masing-masing
    assert.notInclude(output, 'Simulating: DELETE /api/v1/users')
    assert.notInclude(output, 'Simulating: POST /api/v1/checkin')
    assert.notInclude(output, 'Simulating: POST /api/v1/payments')
  })

  // ── Completeness: semua 4 simulasi wajib hadir, tidak lebih tidak kurang ────

  test('harus ada tepat 4 baris simulasi route sesuai definisi command', async ({ assert }) => {
    const output = runEventCommand()
    const simulationLines = output
      .split('\n')
      .filter((line) => line.includes('Simulating:'))

    assert.lengthOf(
      simulationLines,
      EXPECTED_SIMULATIONS.length,
      `Expected ${EXPECTED_SIMULATIONS.length} simulation lines, got ${simulationLines.length}:\n${simulationLines.join('\n')}`
    )
  })
})