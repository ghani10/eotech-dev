import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Event from '#models/event'
import { randomUUID } from 'node:crypto'

export default class EventsController {
  /**
   * Generate a trace message ID for each request lifecycle
   */
  private generateMessageId(): string {
    return `EVT-${Date.now()}-${randomUUID().split('-')[0].toUpperCase()}`
  }

  /**
   * List all events with pagination
   * PRD 7.1: Buat, edit, dan arsipkan event
   */
  async index({ request, response, logger }: HttpContext) {
    const messageId = this.generateMessageId()
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const status = request.input('status') // filter by EventStatus: pending | published | archived

    logger.info({ messageId, page, limit, status }, '[INDEX] Fetching event list')

    try {
      const query = db.from('events').orderBy('created_at', 'desc')

      // PRD: Published events visible publicly; Draft/Archived filtered by admin
      if (status) {
        query.where('status', status)
      }

      const dataEvent = await query.paginate(page, limit)

      logger.info({ messageId, total: dataEvent.total }, '[INDEX] Events fetched successfully')

      return response.ok({
        message_id: messageId,
        message: 'success',
        data: dataEvent,
      })
    } catch (error) {
      logger.error({ messageId, error: error.message }, '[INDEX] Failed to fetch events')
      return response.internalServerError({
        message_id: messageId,
        message: 'Failed to fetch events',
        error: error.message,
      })
    }
  }

  /**
   * Create a new event
   * PRD 7.1: Field minimal event + status default Draft
   * PRD Acceptance: Admin dapat menyimpan event sebagai Draft
   */
  async store({ request, response, logger }: HttpContext) {
    const messageId = this.generateMessageId()

    logger.info({ messageId }, '[STORE] Creating new event')

    const {
      title,
      description,
      location,
      organizer_contact,
      registration_start_at,
      registration_end_at,
      banner,
      slug,
      status,
    } = request.only([
      'title',
      'description',
      'location',
      'organizer_contact',
      'registration_start_at',
      'registration_end_at',
      'banner',
      'slug',
      'status',
    ])

    // PRD Acceptance: Validasi field wajib — Nama, Deskripsi, Lokasi, Kontak penyelenggara
    const missingFields: string[] = []
    if (!title) missingFields.push('title')
    if (!description) missingFields.push('description')
    if (!location) missingFields.push('location')
    if (!organizer_contact) missingFields.push('organizer_contact')
    if (!registration_start_at) missingFields.push('registration_start_at')
    if (!registration_end_at) missingFields.push('registration_end_at')

    if (missingFields.length > 0) {
      logger.warn({ messageId, missingFields }, '[STORE] Validation failed — missing required fields')
      return response.unprocessableEntity({
        message_id: messageId,
        message: 'Validation failed. Please fill in all required fields.',
        missing_fields: missingFields,
      })
    }

    // PRD ERD: EventStatus = pending | published | archived; default pending (Draft)
    const allowedStatuses = ['pending', 'publish', 'archived']
    const eventStatus = status && allowedStatuses.includes(status) ? status : 'pending'

    // Generate slug if not provided
    const eventSlug = slug || `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`

    // Check slug uniqueness
    const existingSlug = await db.from('events').where('slug', eventSlug).first()
    if (existingSlug) {
      logger.warn({ messageId, slug: eventSlug }, '[STORE] Slug already exists')
      return response.conflict({
        message_id: messageId,
        message: 'Slug already in use. Please provide a unique slug.',
      })
    }

    try {
      const eventId = randomUUID()

      await db.table('events').insert({
        event_id: eventId,
        title,
        description,
        location,
        organizer_contact,
        registration_start_at,
        registration_end_at,
        banner: banner ?? null,
        slug: eventSlug,
        status: eventStatus,
        created_at: new Date(),
        updated_at: new Date(),
      })

      logger.info({ messageId, eventId, status: eventStatus }, '[STORE] Event created successfully')

      return response.created({
        message_id: messageId,
        message: 'Event created successfully',
        data: {
          event_id: eventId,
          slug: eventSlug,
          status: eventStatus,
        },
      })
    } catch (error) {
      logger.error({ messageId, error: error.message }, '[STORE] Failed to create event')
      return response.internalServerError({
        message_id: messageId,
        message: 'Failed to create event',
        error: error.message,
      })
    }
  }

  /**
   * Show a single event by ID
   * PRD 7.1: Halaman detail event publik (shareable URL via slug)
   */
  async show({ params, response, logger }: HttpContext) {
    const messageId = this.generateMessageId()
    const id = params.id

    logger.info({ messageId, eventId: id }, '[SHOW] Fetching event detail')

    if (!id) {
      logger.warn({ messageId }, '[SHOW] Missing event ID param')
      return response.badRequest({
        message_id: messageId,
        message: 'Event ID is required',
      })
    }

    try {
      const event = await db
        .from('events')
        .select('*')
        .where('event_id', id)
        .first()

      if (!event) {
        logger.warn({ messageId, eventId: id }, '[SHOW] Event not found')
        return response.notFound({
          message_id: messageId,
          message: `Event with ID ${id} not found`,
        })
      }

      logger.info({ messageId, eventId: id, status: event.status }, '[SHOW] Event found')

      return response.ok({
        message_id: messageId,
        message: 'success',
        data: event,
      })
    } catch (error) {
      logger.error({ messageId, eventId: id, error: error.message }, '[SHOW] Failed to fetch event')
      return response.internalServerError({
        message_id: messageId,
        message: 'Failed to fetch event',
        error: error.message,
      })
    }
  }

  /**
   * Show a single event by slug (public shareable URL)
   * PRD Acceptance: Admin dapat mengubah status menjadi Published dan sistem membuat URL publik
   */
  async showBySlug({ params, response, logger }: HttpContext) {
    const messageId = this.generateMessageId()
    const { slug } = params

    logger.info({ messageId, slug }, '[SHOW_SLUG] Fetching public event by slug')

    try {
      const event = await db
        .from('events')
        .select('*')
        .where('slug', slug)
        .where('status', 'publish')
        .first()

      if (!event) {
        logger.warn({ messageId, slug }, '[SHOW_SLUG] Publish event not found')
        return response.notFound({
          message_id: messageId,
          message: 'Event not found or not yet publish',
        })
      }

      logger.info({ messageId, slug, eventId: event.event_id }, '[SHOW_SLUG] Public event returned')

      return response.ok({
        message_id: messageId,
        message: 'success',
        data: event,
      })
    } catch (error) {
      logger.error({ messageId, slug, error: error.message }, '[SHOW_SLUG] Error fetching event by slug')
      return response.internalServerError({
        message_id: messageId,
        message: 'Failed to fetch event',
        error: error.message,
      })
    }
  }

  /**
   * Update event details or status
   * PRD Acceptance: Admin dapat mengubah status menjadi Published/Archived/Draft
   * PRD 7.1: Edit event
   */
  async update({ params, request, response, logger }: HttpContext) {
    const messageId = this.generateMessageId()
    const id = params.id

    logger.info({ messageId, eventId: id }, '[UPDATE] Updating event')

    if (!id) {
      return response.badRequest({
        message_id: messageId,
        message: 'Event ID is required',
      })
    }

    try {
      const event = await Event.find(id)

      if (!event) {
        logger.warn({ messageId, eventId: id }, '[UPDATE] Event not found')
        return response.notFound({
          message_id: messageId,
          message: `Event with ID ${id} not found`,
        })
      }

      const allowedFields = [
        'title',
        'description',
        'location',
        'organizer_contact',
        'registration_start_at',
        'registration_end_at',
        'banner',
        'slug',
        'status',
      ]

      const payload = request.only(allowedFields)

      // Validate status if provided
      const allowedStatuses = ['pending', 'publish', 'archived']
      if (payload.status && !allowedStatuses.includes(payload.status)) {
        logger.warn({ messageId, status: payload.status }, '[UPDATE] Invalid status value')
        return response.unprocessableEntity({
          message_id: messageId,
          message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
        })
      }

      // Check slug uniqueness if slug is being changed
      if (payload.slug && payload.slug !== event.slug) {
        const slugTaken = await db.from('events').where('slug', payload.slug).whereNot('event_id', id).first()
        if (slugTaken) {
          logger.warn({ messageId, slug: payload.slug }, '[UPDATE] Slug already taken')
          return response.conflict({
            message_id: messageId,
            message: 'Slug already in use by another event',
          })
        }
      }

      await db
        .from('events')
        .where('event_id', id)
        .update({ ...payload, updated_at: new Date() })

      logger.info({ messageId, eventId: id, updatedFields: Object.keys(payload) }, '[UPDATE] Event updated')

      return response.ok({
        message_id: messageId,
        message: 'Event updated successfully',
        data: { event_id: id, ...payload },
      })
    } catch (error) {
      logger.error({ messageId, eventId: id, error: error.message }, '[UPDATE] Failed to update event')
      return response.internalServerError({
        message_id: messageId,
        message: 'Failed to update event',
        error: error.message,
      })
    }
  }

  /**
   * Archive (soft delete) or hard delete an event
   * PRD 7.1: Arsipkan event
   * PRD Acceptance: status Archived — event tidak tampil di halaman publik
   */
  async destroy({ params, request, response, logger }: HttpContext) {
    const messageId = this.generateMessageId()
    const id = params.id
    const hardDelete = request.input('hard_delete', false)

    logger.info({ messageId, eventId: id, hardDelete }, '[DESTROY] Deleting/archiving event')

    if (!id) {
      return response.badRequest({
        message_id: messageId,
        message: 'Event ID is required',
      })
    }

    try {
      const event = await Event.find(id)

      if (!event) {
        logger.warn({ messageId, eventId: id }, '[DESTROY] Event not found')
        return response.notFound({
          message_id: messageId,
          message: `Event with ID ${id} not found`,
        })
      }

      if (hardDelete) {
        // Hard delete — permanent removal
        await event.delete()
        logger.info({ messageId, eventId: id }, '[DESTROY] Event permanently deleted')
        return response.ok({
          message_id: messageId,
          message: 'Event permanently deleted',
          data: { event_id: id },
        })
      }

      // PRD: Soft archive instead of hard delete — status = 'archived'
      await db
        .from('events')
        .where('event_id', id)
        .update({ status: 'archived', updated_at: new Date() })

      logger.info({ messageId, eventId: id }, '[DESTROY] Event archived successfully')

      return response.ok({
        message_id: messageId,
        message: 'Event archived successfully',
        data: { event_id: id, status: 'archived' },
      })
    } catch (error) {
      logger.error({ messageId, eventId: id, error: error.message }, '[DESTROY] Failed to delete/archive event')
      return response.internalServerError({
        message_id: messageId,
        message: 'Failed to process event deletion',
        error: error.message,
      })
    }
  }
}