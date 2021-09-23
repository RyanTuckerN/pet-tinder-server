require("dotenv").config();
const express = require("express");
const db = require("./db");
const app = express();
const PORT = process.env.PORT
const CLIENT_URL = process.env.CLIENT_URL

////////////////////////
//***CHAT ADDITIONS***//
////////////////////////
const server = app.listen(PORT, () =>
  console.log(`🚢 Server listening on port ${PORT} 🚢`)
);
const cors = require("cors");
const io = require("socket.io")(server, {
  cors: {
    origin: CLIENT_URL, //whatever port client runs on!
    methods: ["GET", "POST"],
  },
});
app.use(express.urlencoded({ extended: true }));
app.use(cors());
////////////////////////
////////////////////////

db.sync(
  // { force: true },
  { logging: false }
);
// db.drop()

app.use(require("./middleware/headers"));
app.use(express.json());

const controllers = require("./controllers");
//USER ENDPOINT
app.use("/user", controllers.usercontroller);
app.use('/note', controllers.notificationcontroller)
//PROTECTED ENDPOINTS
// app.use(require("./middleware/validateSession"));
app.use("/dog", controllers.dogcontroller);
app.use("/like", controllers.likecontroller);
io.on("connection", controllers.socketcontroller);
