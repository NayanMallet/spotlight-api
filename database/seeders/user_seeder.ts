import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#auth/models/user'
import { UserRoles } from '#auth/enums/users'

export default class extends BaseSeeder {
  async run() {
    // Create admin user
    await User.updateOrCreate(
      { email: 'admin@spotlight.com' },
      {
        full_name: 'Admin User',
        email: 'admin@spotlight.com',
        password: 'admin123',
        role: UserRoles.ADMIN,
      }
    )

    // Create regular user
    await User.updateOrCreate(
      { email: 'user@spotlight.com' },
      {
        full_name: 'Regular User',
        email: 'user@spotlight.com',
        password: 'user123',
        role: UserRoles.USER,
      }
    )

    console.log('✅ Users seeded successfully')
  }
}
