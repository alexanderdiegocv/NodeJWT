import Schema from 'db-local/lib/modules/schema'

export const User = Schema({
  _id: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
})
