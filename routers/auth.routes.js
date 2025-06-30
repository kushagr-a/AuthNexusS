const express = require("express");
const {
  signup,
  login,
  logout,
  sentVerificationCode,
  verificationCode,
  changePassword,
  sentForgotPasswordCode,
  verifyForgotPasswordCode,
} = require("../controllers/auth.controller");
const identifier = require("../middlewares/identification");

const router = express.Router();

//@endpoint :-signup
//@api:- api/user/signup
// method :- post
router.post("/signup", signup);

//@endpoint :- login
//@api:- api/user/login
// method :- post
router.post("/login", login);

//@endpoint :-logout
//@api:- api/user/logout
// method :- post
router.post("/logout", identifier, logout);

//@endpoint :-send-code
//@api:- api/user/send-code
// method :- patch
router.patch("/send-code", identifier, sentVerificationCode);

//@endpoint :- verify-code
//@api:- api/user/verify-code
// method :- patch
router.patch("/verify-code", identifier, verificationCode);

//@endpoint :- verify-code
//@api:- api/user/change-password
// method :- patch
router.patch("/change-password", identifier, changePassword);

//@endpoint :- send-forgot-password-code
//@api:- api/user/send-forgot-password-code
// method :- patch
router.patch("/send-forgot-password-code", sentForgotPasswordCode);

//@endpoint :- verify-forgot-password-code
//@api:- api/user/verify-forgot-password-code
// method :- patch
router.patch("/verify-forgot-password-code", verifyForgotPasswordCode);

module.exports = router;
