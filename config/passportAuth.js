const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const dotenv = require("dotenv").config();
const User = require("../models/userModel");

//serializing the user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

//deserializing the user
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      //options for the google strat
      callbackURL: "/auth/google/redirect",
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    },
    (accessToken, refreshToken, profile, done) => {
      //do
      User.findOne({ googleID: profile.id }).then((existingUser) => {
        if (existingUser) {
          //cookie save
          console.log("existing user is", existingUser);
          done(null, existingUser);
        } else {
          new User({
            username: profile.displayName,
            googleID: profile.id,
          })
            .save()
            .then((newUser) => {
              console.log("created: " + newUser);
              done(null, newUser);
            });
        }
      });
    }
  )
);
