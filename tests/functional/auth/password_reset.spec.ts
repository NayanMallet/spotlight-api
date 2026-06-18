import { test } from '@japa/runner'
import User from '#auth/models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import Mail from '@adonisjs/mail/services/main'
import type { FakeMailer } from '@adonisjs/mail'

test.group('Auth / password reset', (group) => {
  let mailer: FakeMailer

  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => {
    mailer = Mail.fake()
    return () => Mail.restore()
  })

  test('sends a password reset email for an existing account', async ({ client }) => {
    const user = await User.create({
      full_name: 'Reset User',
      email: 'reset@example.com',
      password: 'password123',
    })

    const response = await client.post('/forgot-password').json({
      email: 'reset@example.com',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Password reset link sent successfully',
      data: {
        id: user.id,
        email: 'reset@example.com',
      },
    })

    mailer.messages.assertSent((message) => {
      message.assertTo('reset@example.com')
      message.assertHtmlIncludes('/reset-password/')
      return true
    })
  })

  test('rejects password reset email requests for unknown accounts', async ({ client }) => {
    const response = await client.post('/forgot-password').json({
      email: 'missing-reset@example.com',
    })

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'User with this email address not found',
    })
    mailer.messages.assertNoneSent()
  })

  test('rejects password reset email requests with missing email', async ({ client }) => {
    const response = await client.post('/forgot-password').json({})

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Validation failed',
    })
    mailer.messages.assertNoneSent()
  })

  test('rejects password reset email requests with invalid email format', async ({ client }) => {
    const response = await client.post('/forgot-password').json({
      email: 'not-an-email',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Validation failed',
    })
    mailer.messages.assertNoneSent()
  })

  test('shows the reset password form token payload', async ({ client }) => {
    const response = await client.get('/reset-password/token%20with%20spaces')

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Reset password form',
      token: 'token with spaces',
    })
  })

  test('resets an existing user password', async ({ client, assert }) => {
    const user = await User.create({
      full_name: 'Password Reset User',
      email: 'password-reset@example.com',
      password: 'old-password123',
    })
    const oldPasswordHash = user.password

    const response = await client.post('/reset-password').json({
      email: 'password-reset@example.com',
      newPassword: 'new-password123',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Password reset successfully',
      data: {
        id: user.id,
        email: 'password-reset@example.com',
      },
    })

    await user.refresh()
    assert.notEqual(user.password, oldPasswordHash)

    const verifiedUser = await User.verifyCredentials(
      'password-reset@example.com',
      'new-password123'
    )
    assert.equal(verifiedUser.id, user.id)
  })

  test('rejects password reset for an unknown account', async ({ client }) => {
    const response = await client.post('/reset-password').json({
      email: 'unknown-password-reset@example.com',
      newPassword: 'new-password123',
    })

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'User with this email address not found',
    })
  })

  test('rejects password reset with missing required fields', async ({ client }) => {
    const response = await client.post('/reset-password').json({})

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Validation failed',
    })
  })

  test('rejects password reset with invalid email format', async ({ client }) => {
    const response = await client.post('/reset-password').json({
      email: 'not-an-email',
      newPassword: 'new-password123',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Validation failed',
    })
  })

  test('rejects password reset with password values outside the length limits', async ({
    client,
  }) => {
    const shortPassword = await client.post('/reset-password').json({
      email: 'password-reset@example.com',
      newPassword: 'short',
    })

    shortPassword.assertStatus(400)
    shortPassword.assertBodyContains({
      message: 'Validation failed',
    })

    const longPassword = await client.post('/reset-password').json({
      email: 'password-reset@example.com',
      newPassword: 'x'.repeat(256),
    })

    longPassword.assertStatus(400)
    longPassword.assertBodyContains({
      message: 'Validation failed',
    })
  })
})
