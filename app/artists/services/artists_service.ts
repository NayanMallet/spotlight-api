import Artist from '#artists/models/artist'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import app from '@adonisjs/core/services/app'
import { inject } from '@adonisjs/core'
import { cuid } from '@adonisjs/core/helpers'

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

    // Validate file type
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']
    if (!allowedExtensions.includes(image.extname || '')) {
      throw new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`)
    }

    // Create artist record
    const artist = await Artist.create({
      name: data.name,
      image: '', // Will be updated after file upload
    })

    try {
      // Upload image file
      const fileName = `artist_${artist.id}_${cuid()}.${image.extname}`

      await image.move(app.publicPath('uploads/artists'), {
        name: fileName,
        overwrite: true,
      })

      // Update artist with image URL
      artist.image = `/uploads/artists/${fileName}`
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
      // Validate file type
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']
      if (!allowedExtensions.includes(image.extname || '')) {
        throw new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`)
      }

      try {
        // Upload new image file
        const fileName = `artist_${artist.id}_${cuid()}.${image.extname}`

        await image.move(app.publicPath('uploads/artists'), {
          name: fileName,
          overwrite: true,
        })

        // Update artist with new image URL
        artist.image = `/uploads/artists/${fileName}`
      } catch (error) {
        throw new Error(`Failed to upload artist image: ${error.message}`)
      }
    }

    await artist.save()
    return artist
  }

  /**
   * Deletes an artist by ID.
   * @param id - The artist ID.
   * @return A promise that resolves to true if deleted, false if not found.
   */
  async delete(id: number): Promise<boolean> {
    const artist = await Artist.find(id)
    if (!artist) {
      return false
    }

    await artist.delete()
    return true
  }
}
