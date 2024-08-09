import DBLocal from 'db-local'
import { SALT_ROUNDS } from '../../config.js'
import { ValidationError } from './validation.js'
import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import { z } from 'zod'

const { Schema } = new DBLocal({ path: './db' })

const User = Schema('User', {
  _id: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
})

const UserModel = z.object({
  _id: z.string().uuid().optional(),
  username: z.string(),
  password: z.string().min(6).max(20)
})

export class UserRepository {
  static async login ({ username, password }) {
    const result = UserModel.safeParse({ username, password })

    if (!result.success) {
      throw new ValidationError(result.error)
    }

    const user = User.findOne({ username })

    if (!user) {
      throw new ValidationError('User not found')
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      throw new ValidationError('Invalid password')
    }

    // const { password: _, ...userData } = user

    return {
      _id: user._id,
      username: user.username
    }
  }

  static async create ({ username, password }) {
    const result = UserModel.safeParse({ username, password })

    if (!result.success) {
      throw new Error(result.error)
    }

    const user = User.findOne({ username })

    if (user) {
      throw new Error('User already exists')
    }

    const id = crypto.randomUUID()
    const hash = await bcrypt.hash(password, SALT_ROUNDS)

    User.create({
      _id: id,
      username,
      password: hash
    }).save()

    return { id, username }
  }
}
