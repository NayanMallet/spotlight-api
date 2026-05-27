import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import { dirname, join } from 'node:path'
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs'

const JPEG_BYTES = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0xff, 0xd9,
])

function writeFixture(fileName: string, contents: Buffer): string {
  const filePath = join(app.tmpPath('functional-upload-fixtures'), fileName)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, contents)
  return filePath
}

export function createJpegFixture(prefix = 'image'): string {
  return writeFixture(`${prefix}-${cuid()}.jpg`, JPEG_BYTES)
}

export function createTextFixture(prefix = 'image'): string {
  return writeFixture(`${prefix}-${cuid()}.txt`, Buffer.from('not an allowed image'))
}

export function createLargeJpegFixture(prefix = 'image'): string {
  return writeFixture(`${prefix}-${cuid()}.jpg`, Buffer.alloc(5 * 1024 * 1024 + 1, 1))
}

export function publicUploadPath(uploadUrl: string | null | undefined): string | null {
  if (!uploadUrl?.startsWith('/uploads/')) return null
  return app.publicPath(uploadUrl.slice(1))
}

export function cleanupFiles(...paths: Array<string | null | undefined>) {
  for (const path of paths) {
    if (path && existsSync(path)) {
      unlinkSync(path)
    }
  }
}
