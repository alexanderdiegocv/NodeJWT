import express, { json } from 'express'

import { PORT } from './config.js'
import { UserRepository } from './modules/infrastructure/user-respository.js'

const app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.set('views', './views')
app.use(json())

app.get('/', (req, res) => {
  res.render('login', { title: 'Login', user: null })
})

app.get('/register', (req, res) => {
  res.render('register', { title: 'Register', user: null })
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await UserRepository.login({ username, password })
    res.send({ user })
  } catch (error) {
    res.status(400).send(error.message)
  }
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body
  console.log(req.body)
  try {
    const user = await UserRepository.create({ username, password })
    res.send(user)
  } catch (error) {
    res.status(400).send(error.message)
  }
})

app.post('/logout', (req, res) => {})

app.get('/home', (req, res) => {
  res.render('protected', {
    title: 'Home',
    user: {
      _id: '123',
      username: 'john.doe'
    }
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
