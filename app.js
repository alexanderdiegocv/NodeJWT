import { JWT_SECRET, PORT } from './config.js'
import express, { json } from 'express'

import { UserRepository } from './modules/infrastructure/user-respository.js'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'

const app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.set('views', './views')
app.use(json())
app.use(cookieParser())
app.use((req, res, next) => {
  const token = req.cookies.access_token
  req.session = { user: null }

  if (token) {
    const userData = jwt.verify(token, JWT_SECRET)
    req.session.user = userData
  }

  next()
})

app.get('/', (req, res) => {
  const { user } = req.session
  console.log(user)

  res.render('login', { title: 'Login', user })
})

app.get('/register', (req, res) => {
  res.render('register', { title: 'Register', user: null })
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await UserRepository.login({ username, password })
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '1h'
    })

    const refreshToken = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d'
    })

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000
    }).cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }).send({ user, token })
  } catch (error) {
    console.log(error)
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

app.get('/logout', (req, res) => {
  res.clearCookie('access_token').redirect('/')
})

app.get('/home', (req, res) => {
  const { user } = req.session

  if (!user) {
    return res.status(403).send('Unauthorized')
  }

  res.render('protected', {
    title: 'Home',
    user
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
