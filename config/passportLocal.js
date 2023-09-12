const LocalStrategy = require("passport-local").Strategy;
const dotenv = require("dotenv").config();
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

function initialise(passport) {
  const authenticateUser = (email, password, done) => {
    User.findOne({ email: email }).then(async (existingUser) => {
      if (!existingUser) {
        //cookie save

        return done(null, false, { message: "User not found!" });
      } else {
        try {
          if (await bcrypt.compare(password, existingUser.password)) {
            done(null, existingUser);
          } else {
            return done(null, false, { message: "Password incorrect!" });
          }
        } catch (error) {
          return done(error);
        }
      }
    });
  };
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => {
    return done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    return done(null, User.findById(id));
  });
}

module.exports = initialise;
