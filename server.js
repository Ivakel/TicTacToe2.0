const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const User = require("./models/userModel");
const Pool = require("./models/playersPool");
const bcrypt = require("bcrypt");
const passport = require("passport");
const passportSetup = require("./config/passportAuth");
const cookieSession = require("cookie-session");
const initialisePassport = require("./config/passportLocal");
const flash = require("express-flash");
const session = require("express-session");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(5001, {
  cors: {
    origins: ["http://localhost:8080"],
  },
});

io.on("connection", (socket) => {
  socket.on("find", async (player) => {
    Pool.findOne({ _id: process.env.PLAYERS_ID }).then((players) => {
      // let pool = players.pool;
      // pool.push(player);
      players.pool.push(player);

      if (players.pool.length > 1) {
        const [p1, p2] = players.pool.slice(0, 2);

        const player1 = {
          socketId: p1.socketId,
          sign: "x",
          turn: 1,
          username: p1.username,
        };

        const player2 = {
          socketId: p2.socketId,
          sign: "o",
          turn: 0,
          username: p2.username,
        };

        const remaining = players.pool.slice(2, players.pool.length); // getting the remaining unpaired players
        players.pool = remaining;
        players.save(); //saving the remaining unpaired players
        // console.log(player1.socketId);
        // console.log(player2.socketId);

        socket.emit("send-opponent", {
          opponent: player2,
          socketId: player1.socketId,
        });
        socket.emit("send-opponent", {
          opponent: player1,
          socketId: player2.socketId,
        });
      } else {
        players.save();
      }
    });
  });
});

let playerPool = null;

app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

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

app.get("/", (req, res) => {
  const user = req.user;

  res.render("index.ejs", { user: user });
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
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
  const hashedPW = await bcrypt.hash(password, 10);

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

function getUsername(email) {
  let username = "";

  for (let i = 0; i < email.length; i++) {
    if (email[i] === "@") {
      return username;
    }
    username += email[i];
  }
  return username;
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

    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
