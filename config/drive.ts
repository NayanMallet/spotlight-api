import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'

const driveConfig = defineConfig({
  default: env.get('DRIVE_DISK', 'fs'),

  /**
   * The services object can be used to configure multiple file system
   * services each using the same or a different driver.
   */
  services: {
    fs: services.fs({
      location: app.publicPath('uploads'),
      serveFiles: true,
      routeBasePath: '/uploads',
      visibility: 'public',
    }),

    // S3 ready pour plus tard
    // s3: {
    //   driver: 's3',
    //   key: env.get('S3_KEY'),
    //   secret: env.get('S3_SECRET'),
    //   region: env.get('S3_REGION'),
    //   bucket: env.get('S3_BUCKET'),
    //   endpoint: env.get('S3_ENDPOINT'), // Optionnel
    //   visibility: 'public',
    // },
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
