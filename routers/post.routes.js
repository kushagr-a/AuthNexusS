const express = require("express");
const identifier = require("../middlewares/identification");
const {
  getPost,
  createPost,
  singlePost,
  updatePost,
  deletePost,
} = require("../controllers/post.controller");

const router = express.Router();

//@endpoint :-signup
//@api:- api/user/signup
// method :- post
router.get("/all-post", getPost);

//@endpoint :- login
//@api:- api/user/login
// method :- post
router.get("/single-post", singlePost);

//@endpoint :-logout
//@api:- api/user/logout
// method :- post
router.post("/create-post", identifier, createPost);

//@endpoint :-logout
//@api:- api/user/logout
// method :- post
router.put("/update-post", identifier, updatePost);

//@endpoint :-send-code
//@api:- api/user/send-code
// method :- patch
router.delete("/delete-post", identifier, deletePost);

module.exports = router;
