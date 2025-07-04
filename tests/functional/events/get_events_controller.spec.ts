import { test } from '@japa/runner'
import { ApiClient } from '@japa/api-client'

test.group('Events - Get Events Controller', () => {
  test('should get events without authentication', async ({ client }: { client: ApiClient }) => {
    const response = await client
      .get('/events')

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Events retrieved successfully'
    })
    response.assertBodyContains(['data', 'meta'])

    // Check pagination meta
    const body = response.body()
    expect(body.meta).toHaveProperty('total')
    expect(body.meta).toHaveProperty('perPage')
    expect(body.meta).toHaveProperty('currentPage')
    expect(body.meta).toHaveProperty('lastPage')
  })

  test('should get events with authentication', async ({ client }: { client: ApiClient }) => {
    // Register and login a user
    const registerResponse = await client
      .post('/register')
      .json({
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })

    const token = registerResponse.body().token.value

    const response = await client
      .get('/events')
      .bearerToken(token)

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Events retrieved successfully'
    })
    response.assertBodyContains(['data', 'meta'])
  })

  test('should get events with pagination parameters', async ({ client }: { client: ApiClient }) => {
    const response = await client
      .get('/events')
      .qs({
        page: 1,
        limit: 5
      })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Events retrieved successfully'
    })

    const body = response.body()
    expect(body.meta.perPage).toBe(5)
    expect(body.meta.currentPage).toBe(1)
  })

  test('should filter events by type', async ({ client }: { client: ApiClient }) => {
    const response = await client
      .get('/events')
      .qs({
        type: 'concert'
      })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Events retrieved successfully'
    })
  })

  test('should filter events by subtype', async ({ client }: { client: ApiClient }) => {
    const response = await client
      .get('/events')
      .qs({
        subtype: 'rock'
      })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Events retrieved successfully'
    })
  })

  test('should filter events by city', async ({ client }: { client: ApiClient }) => {
    const response = await client
      .get('/events')
      .qs({
        city: 'New York'
      })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Events retrieved successfully'
    })
  })

  test('should filter events by date range', async ({ client }: { client: ApiClient }) => {
    const response = await client
      .get('/events')
      .qs({
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Events retrieved successfully'
    })
  })

  test('should filter events with multiple parameters', async ({ client }: { client: ApiClient }) => {
    const response = await client
      .get('/events')
      .qs({
        type: 'concert',
        subtype: 'rock',
        city: 'New York',
        page: 1,
        limit: 10
      })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Events retrieved successfully'
    })

    const body = response.body()
    expect(body.meta.perPage).toBe(10)
    expect(body.meta.currentPage).toBe(1)
  })

  test('should return 400 for invalid pagination parameters', async ({ client }: { client: ApiClient }) => {
    const response = await client
      .get('/events')
      .qs({
        page: -1,
        limit: 0
      })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Validation failed'
    })
  })

  test('should return 400 for invalid type parameter', async ({ client }: { client: ApiClient }) => {
    const response = await client
      .get('/events')
      .qs({
        type: 'invalid_type'
      })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Validation failed'
    })
  })

  test('should return 400 for invalid subtype parameter', async ({ client }: { client: ApiClient }) => {
    const response = await client
      .get('/events')
      .qs({
        subtype: 'invalid_subtype'
      })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Validation failed'
    })
  })

  test('should return 400 for invalid date format', async ({ client }: { client: ApiClient }) => {
    const response = await client
      .get('/events')
      .qs({
        startDate: 'invalid-date'
      })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Validation failed'
    })
  })

  test('should handle large limit parameter gracefully', async ({ client }: { client: ApiClient }) => {
    const response = await client
      .get('/events')
      .qs({
        limit: 1000
      })

    // Should either succeed with capped limit or return validation error
    expect([200, 400]).toContain(response.response.status)
  })

  test('should handle concurrent requests', async ({ client }: { client: ApiClient }) => {
    const promises = Array(5).fill(null).map(() =>
      client.get('/events').qs({ page: 1, limit: 10 })
    )

    const responses = await Promise.all(promises)

    responses.forEach(response => {
      response.assertStatus(200)
      response.assertBodyContains({
        message: 'Events retrieved successfully'
      })
    })
  })

  test('should return consistent pagination structure when no events found', async ({ client }: { client: ApiClient }) => {
    const response = await client
      .get('/events')
      .qs({
        city: 'NonExistentCity12345'
      })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Events retrieved successfully'
    })

    const body = response.body()
    expect(body.meta).toHaveProperty('total')
    expect(body.meta).toHaveProperty('isEmpty')
    expect(body.data).toBeInstanceOf(Array)
  })
})
