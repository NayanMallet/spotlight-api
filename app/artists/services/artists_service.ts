import Artist from '#artists/models/artist'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import app from '@adonisjs/core/services/app'
import { inject } from '@adonisjs/core'
import { cuid } from '@adonisjs/core/helpers'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'

export interface CreateArtistData {
  name: string
}

export interface UpdateArtistData {
  name?: string
}

export interface GetArtistsOptions {
  page?: number
  limit?: number
  name?: string
}

@inject()
export class ArtistsService {
  private readonly ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
  private readonly UPLOADS_PATH = 'uploads/artists'
  private readonly UPLOADS_URL_PREFIX = '/uploads/artists/'

  /**
   * Stores a new artist in the database.
   * @param data - The artist data excluding the image.
   * @param image - The image file to be uploaded.
   * @return A promise that resolves to the created Artist instance.
   * @throws Error if image is not provided or file upload fails
   */
  async create(data: CreateArtistData, image: MultipartFile): Promise<Artist> {
    if (!image) {
      throw new Error('Artist image is required')
    }

    this.validateImageType(image)

    // Create artist record
    const artist = await Artist.create({
      name: data.name,
      image: '', // Will be updated after file upload
    })

    try {
      // Upload image and update artist
      artist.image = await this.uploadArtistImage(artist.id, image)
      await artist.save()
      return artist
    } catch (error) {
      // If file upload fails, delete the created artist to maintain consistency
      await artist.delete()
      throw new Error(`Failed to upload artist image: ${error.message}`)
    }
  }

  /**
   * Retrieves all artists with optional filtering and pagination.
   * @param options - Filtering and pagination options.
   * @return A promise that resolves to paginated artists.
   */
  async getAll(options: GetArtistsOptions = {}) {
    const { page = 1, limit = 20, name } = options
    const query = Artist.query()

    // Apply filters
    if (name) {
      query.whereILike('name', `%${name}%`)
    }

    // Order by name
    query.orderBy('name', 'asc')

    // Apply pagination
    return await query.paginate(page, limit)
  }

  /**
   * Retrieves a single artist by ID.
   * @param id - The artist ID.
   * @return A promise that resolves to the Artist instance or null if not found.
   */
  async getById(id: number): Promise<Artist | null> {
    return await Artist.find(id)
  }

  /**
   * Updates an existing artist.
   * @param id - The artist ID.
   * @param data - The updated artist data.
   * @param image - Optional new image file.
   * @return A promise that resolves to the updated Artist instance.
   * @throws Error if artist is not found or update fails
   */
  async update(id: number, data: UpdateArtistData, image?: MultipartFile): Promise<Artist> {
    const artist = await Artist.find(id)
    if (!artist) {
      throw new Error('Artist not found')
    }

    // Update artist fields
    if (data.name !== undefined) artist.name = data.name

    // Handle image update if provided
    if (image) {
      this.validateImageType(image)

      // Delete old artist image
      await this.deleteArtistImage(artist.id, artist.image)

      try {
        // Upload new image file and update artist
        artist.image = await this.uploadArtistImage(artist.id, image)
      } catch (error) {
        throw new Error(`Failed to upload artist image: ${error.message}`)
      }
    }

    await artist.save()
    return artist
  }

  /**
   * Deletes an artist by ID and their associated image.
   * @param id - The artist ID.
   * @return A promise that resolves to true if deleted, false if not found.
   */
  async delete(id: number): Promise<boolean> {
    const artist = await Artist.find(id)
    if (!artist) {
      return false
    }

    // Delete the artist image file if it exists
    await this.deleteArtistImage(id, artist.image)

    await artist.delete()
    return true
  }

  /**
   * Validates that the uploaded file is an allowed image type
   * @param image - The image file to validate
   * @throws Error if file type is not allowed
   */
  private validateImageType(image: MultipartFile): void {
    if (!this.ALLOWED_IMAGE_EXTENSIONS.includes(image.extname || '')) {
      throw new Error(
        `Invalid file type. Allowed types: ${this.ALLOWED_IMAGE_EXTENSIONS.join(', ')}`
      )
    }
  }

  /**
   * Uploads an artist image and returns the URL path
   * @param artistId - The artist ID
   * @param image - The image file to upload
   * @returns The URL path to the uploaded image
   */
  private async uploadArtistImage(artistId: number, image: MultipartFile): Promise<string> {
    const fileName = `artist_${artistId}_${cuid()}.${image.extname}`
    const uploadsPath = app.publicPath(this.UPLOADS_PATH)

    await image.move(uploadsPath, {
      name: fileName,
      overwrite: true,
    })

    return `${this.UPLOADS_URL_PREFIX}${fileName}`
  }

  /**
   * Deletes an artist's image file if it exists
   * @param artistId - The artist ID
   * @param imagePath - The image path to delete
   */
  private async deleteArtistImage(artistId: number, imagePath?: string): Promise<void> {
    if (imagePath && imagePath.startsWith(this.UPLOADS_URL_PREFIX)) {
      try {
        const fileName = imagePath.replace(this.UPLOADS_URL_PREFIX, '')
        const filePath = join(app.publicPath(this.UPLOADS_PATH), fileName)
        await unlink(filePath)
      } catch (error) {
        // Log the error but don't fail the operation if file doesn't exist
        console.warn(`Failed to delete image for artist ${artistId}:`, error.message)
      }
    }
  }
}
