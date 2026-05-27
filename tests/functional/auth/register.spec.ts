import { test } from '@japa/runner'
import User from '#auth/models/user'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Auth / register', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('registers a user and persists the normalized account data', async ({ client, assert }) => {
    const response = await client.post('/register').json({
      full_name: 'Register User',
      email: 'REGISTER@example.com',
      password: 'password123',
    })

    response.assertStatus(201)
    response.assertBodyContains({
      user: {
        full_name: 'Register User',
        email: 'register@example.com',
      },
    })

    const body = response.body()
    assert.equal(body.token.type, 'bearer')
    assert.isString(body.token.token)

    const user = await User.findByOrFail('email', 'register@example.com')
    assert.equal(user.full_name, 'Register User')
    assert.match(user.bannerUrl!, /^https:\/\/unavatar\.io\/register@example\.com/)
    assert.notEqual(user.password, 'password123')
  })

  test('persists an explicit banner URL during registration', async ({ client, assert }) => {
    const response = await client.post('/register').json({
      full_name: 'Banner User',
      email: 'banner-register@example.com',
      password: 'password123',
      bannerUrl: 'https://example.com/banner.jpg',
    })

    response.assertStatus(201)
    response.assertBodyContains({
      user: { email: 'banner-register@example.com' },
    })

    const user = await User.findByOrFail('email', 'banner-register@example.com')
    assert.equal(user.bannerUrl, 'https://example.com/banner.jpg')
  })

  test('rejects missing required fields', async ({ client }) => {
    const response = await client.post('/register').json({})

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Validation failed',
    })
  })

  test('rejects invalid email format', async ({ client }) => {
    const response = await client.post('/register').json({
      full_name: 'Invalid Email',
      email: 'not-an-email',
      password: 'password123',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Validation failed',
    })
  })

  test('rejects password values outside the length limits', async ({ client }) => {
    const shortPassword = await client.post('/register').json({
      full_name: 'Short Password',
      email: 'short-password@example.com',
      password: 'short',
    })

    shortPassword.assertStatus(400)
    shortPassword.assertBodyContains({
      message: 'Validation failed',
    })

    const longPassword = await client.post('/register').json({
      full_name: 'Long Password',
      email: 'long-password@example.com',
      password: 'x'.repeat(256),
    })

    longPassword.assertStatus(400)
    longPassword.assertBodyContains({
      message: 'Validation failed',
    })
  })

  test('rejects duplicate email addresses', async ({ client }) => {
    await User.create({
      full_name: 'Existing User',
      email: 'existing-register@example.com',
      password: 'password123',
    })

    const response = await client.post('/register').json({
      full_name: 'Duplicate User',
      email: 'existing-register@example.com',
      password: 'password123',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Validation failed',
    })
  })

  test('rejects registration while already authenticated', async ({ client }) => {
    const user = await User.create({
      full_name: 'Logged In User',
      email: 'logged-in-register@example.com',
      password: 'password123',
    })

    const response = await client.post('/register').loginAs(user).json({
      full_name: 'Another User',
      email: 'another-register@example.com',
      password: 'password123',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'You are already logged in',
    })
  })
})
