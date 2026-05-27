import { test } from '@japa/runner'
import User from '#auth/models/user'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Auth / login', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('logs in with valid credentials and stores an access token', async ({ client, assert }) => {
    const user = await User.create({
      full_name: 'Login User',
      email: 'login@example.com',
      password: 'password123',
    })

    const response = await client.post('/login').json({
      email: 'login@example.com',
      password: 'password123',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      user: {
        id: user.id,
        email: 'login@example.com',
      },
    })

    const body = response.body()
    assert.equal(body.token.type, 'bearer')
    assert.isString(body.token.token)

    const tokens = await User.accessTokens.all(user)
    assert.lengthOf(tokens, 1)
  })

  test('rejects invalid credentials', async ({ client }) => {
    await User.create({
      full_name: 'Invalid Login User',
      email: 'invalid-login@example.com',
      password: 'password123',
    })

    const response = await client.post('/login').json({
      email: 'invalid-login@example.com',
      password: 'wrong-password',
    })

    response.assertStatus(401)
    response.assertBodyContains({
      message: 'Invalid credentials',
    })
  })

  test('rejects a non-existent email without leaking account state', async ({ client }) => {
    const response = await client.post('/login').json({
      email: 'missing-login@example.com',
      password: 'password123',
    })

    response.assertStatus(401)
    response.assertBodyContains({
      message: 'Invalid credentials',
    })
  })

  test('rejects missing required fields', async ({ client }) => {
    const response = await client.post('/login').json({})

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Validation failed',
    })
  })

  test('rejects invalid email format', async ({ client }) => {
    const response = await client.post('/login').json({
      email: 'not-an-email',
      password: 'password123',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Validation failed',
    })
  })

  test('rejects password values outside the length limits', async ({ client }) => {
    const shortPassword = await client.post('/login').json({
      email: 'login@example.com',
      password: 'short',
    })

    shortPassword.assertStatus(400)
    shortPassword.assertBodyContains({
      message: 'Validation failed',
    })

    const longPassword = await client.post('/login').json({
      email: 'login@example.com',
      password: 'x'.repeat(256),
    })

    longPassword.assertStatus(400)
    longPassword.assertBodyContains({
      message: 'Validation failed',
    })
  })

  test('rejects login while already authenticated', async ({ client }) => {
    const user = await User.create({
      full_name: 'Already Logged In',
      email: 'already-login@example.com',
      password: 'password123',
    })

    const response = await client.post('/login').loginAs(user).json({
      email: 'already-login@example.com',
      password: 'password123',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'You are already logged in',
    })
  })
})
