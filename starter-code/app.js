require('dotenv').config()

const bodyParser   = require('body-parser')
const cookieParser = require('cookie-parser')
const express      = require('express')
const favicon      = require('serve-favicon')
const hbs          = require('hbs')
const HandlebarsIntl = require('handlebars-intl');

const logger       = require('morgan')
const path         = require('path')

require('./config/mongoose.config.js')

const session = require("express-session")
const bcrypt = require("bcrypt")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const flash = require("connect-flash")

HandlebarsIntl.registerWith(hbs)

const User = require('./models/user.model')

const app = express()
// app.js
app.use(session({
  secret: "our-passport-local-strategy-app",
  resave: true,
  saveUninitialized: true
}))




passport.serializeUser((user, cb) => {
  cb(null, user._id)
})

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) {
      return cb(err)
    }
    cb(null, user)
  })
})


app.use(flash())

passport.use(new LocalStrategy({
  passReqToCallback: true
}, (req, username, password, next) => {
  User.findOne({
    username
  }, (err, user) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return next(null, false, {
        message: "Usuario incorrecto"
      })
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, {
        message: "Contraseña incorrecta"
      })
    }

    return next(null, user)
  })
}))

app.use(passport.initialize())
app.use(passport.session())

const app_name = require('./package.json').name
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`)



// Middleware Setup
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}))
      

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')))



// default value for title local
app.locals.title = 'Express - Generated with IronGenerator'



const index = require('./routes/index.routes')
app.use('/', index)

const auth = require('./routes/auth/auth.routes')
app.use('/auth', auth)

const manage = require('./routes/manage/users.routes')
app.use('/manage', manage)

const course = require('./routes/courses/course.routes')
app.use('/courses', course)


module.exports = app
