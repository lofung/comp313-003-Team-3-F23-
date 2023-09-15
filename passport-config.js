const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const userModel = require('./models/user.js');

function initialize(passport) {
  const authenticateUser = async (userNameTypedIn, password, done) => {
    //console.log(userNameTypedIn)
    //console.log(password)
    const userFromMongo = await userModel.findOne({name: userNameTypedIn})
    //Try using JSON.parse() and JSON.stringify() to remove mongoose object property:
    //https://stackoverflow.com/questions/33054622/find-user-in-mongo-with-mongoose-and-return-the-result-to-a-json
    const user = JSON.parse(JSON.stringify(userFromMongo))
    ///console.log(user)
    if (user == null) {
      return done(null, false, { message: 'No user with that user name' })
    }

    try {
      if (await bcrypt.compare(password, user.hashed)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      console.error(e)
      return done(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'name' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser(async (id, done) => {
    //await console.log(userModel.findOne({id}))
    return done(null, await userModel.findOne({id}))
  })
}

module.exports = initialize