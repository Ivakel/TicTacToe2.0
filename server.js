const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const User = require("./models/userModel");
const bcrypt = require("bcrypt");
const passport = require("passport");
const passportSetup = require("./config/passportAuth");
const cookieSession = require("cookie-session");
const initialisePassport = require("./config/passportLocal");
const flash = require("express-flash");
const session = require("express-session");
const io = require("socket.io")(5001, {
  cors: {
    origin: ["http://localhost:8080"],
  },
});

//Do the login/logout
const app = express();

app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

// app.use(
//   cookieSession({
//     maxAge: 24 * 60 * 60 * 1000,
//     keys: [process.env.COOKIE_SESSION_KEY],
//   })
// );

app.use(
  session({
    secret: process.env.COOKIE_SESSION_KEY,
    resave: false,
    saveInitialised: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
initialisePassport(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT;

//ROUTES

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);
app.get(
  "/auth/google/redirect",
  passport.authenticate("google"),
  (req, res) => {
    res.render("/", { user: req.user });
  }
);

// app.get("/", authCheck, (req, res) => {
//   res.render("index.ejs", { user: req.user });
// });

app.get("/", (req, res) => {
  if (req.user) {
    io.on("connection", (socket) => {
      console.log(socket.id);
    });
  }
  res.render("index.ejs", { user: req.user });
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

//signup server
app.get("/auth/signup", (req, res) => {
  res.render("signup.ejs");
});
app.get("/auth/login", (req, res) => {
  res.render("login.ejs");
});

//signup authentication
app.post(
  "/auth/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureMessage: "/auth/signup",
  })
);

app.post("/auth/signup", async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const hashedPW = await bcrypt(password, 10);

  try {
    new User({
      username: username,
      email: email,
      password: hashedPW,
    }).save();
    res.redirect("/auth/login");
  } catch (error) {
    res.send(error);
  }
});

//useful functions for middleware
function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/auth/signup");
  }
}

function checkNotAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    next();
  }
}

mongoose.set("strictQuery", false);
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@tictactoeapi.e1ttns0.mongodb.net/TicTacToeAPI?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
