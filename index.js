require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookeiParser = require("cookie-parser");

const app = express();

// Database requring
const connectDB = require("./config/db")
connectDB()

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(cookeiParser());
app.use(express.urlencoded({extended:true}))

// Auth Router
const authRouter = require("./routers/auth.routes")

// Post Router
const postRouter = require("./routers/post.routes")


// assining router
app.use("/api/user",authRouter)
app.use("/api/user",postRouter)

// for testing purpose
app.get("/", (req, res) => {
  res.json({ message: "hello from home page" });
});


app.listen(process.env.PORT, () => {
  console.log(`Your server start on ${process.env.PORT}`);
});
