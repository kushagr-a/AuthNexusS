const {
  doHash,
  doHashValidation,
  hamcprocess,
} = require("../utils/hashing.password");

const {
  signupSchema,
  loginSchema,
  acceptCodeSchema,
  changePasswordSchema,
  acceptFPCodeSchema,
} = require("../middlewares/user.validator");

const User = require("../models/user.models");
const jwt = require("jsonwebtoken");
const transport = require("../middlewares/sendMail");
const { date, exist } = require("joi");

// user register
const signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error, value } = signupSchema.validate({ email, password });

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists!" });
    }

    const hashedPassword = await doHash(password, 12);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    const result = await newUser.save();
    result.password = undefined;

    res.status(201).json({
      success: true,
      message: "Your account has been created successfully",
      result,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong on the server" });
  }
};

// user login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error, value } = loginSchema.validate({ email, password });

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User does not exists!" });
    }
    const result = doHashValidation(password, existingUser.password);
    if (!result) {
      return res
        .status(409)
        .json({ success: false, message: "Invalid Credentials!" });
    }

    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        verified: existingUser.verified,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "8h",
      }
    );

    // ✅ Set cookie
    res.cookie("Authorization", "Bearer " + token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true,
    });

    // ✅ Send JSON response
    return res.status(200).json({
      success: true,
      token,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Sigin error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong on the server" });
  }
};

// user logout
const logout = async (req, res) => {
  res
    .clearCookie("Authorization")
    .status(200)
    .json({ success: true, message: "logged-out successfully" });
};

// verification code
const sentVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User does not exists!" });
    }
    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: "You are already verified" });
    }

    const codeValue = Math.floor(Math.random() * 1000000).toString();
    let info = await transport.sendMail({
      from: process.env.SENDIN_EMAIL_ADD,
      to: existingUser.email,
      subject: "Verification Code",
      html: "<h1>" + codeValue + "</h1>",
    });

    if (info.accepted[0] === existingUser.email) {
      const hashedCodeValue = hamcprocess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      existingUser.verificationCode = hashedCodeValue;
      existingUser.verificationCodeValidation = Date.now();
      await existingUser.save();
      return res.status(200).json({ success: true, message: "Code sent!" });
    }
    res.status(400).json({ success: true, message: "Code sent failed!" });
  } catch (error) {
    console.error("verification  error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong on the server" });
  }
};

// verifying code
const verificationCode = async (req, res) => {
  const { email, providedCode } = req.body;
  try {
    const { error, value } = acceptCodeSchema.validate({ email, providedCode });

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const codeValue = providedCode.toString();
    const existingUser = await User.findOne({ email }).select(
      "+verificationCode +verificationCodeValidation"
    );

    if (!existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User does not exists!" });
    }
    if (existingUser.verified) {
      return res.status(400).json({
        success: false,
        message: "you are already verified! ",
      });
    }

    if (
      !existingUser.verificationCode ||
      !existingUser.verificationCodeValidation
    ) {
      return res.status(400).json({
        success: false,
        message: "Something is wrong with the code!",
      });
    }

    if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
      return res
        .status(400)
        .json({ success: false, message: "Code has been expired!" });
    }

    const hashedCodeValue = hamcprocess(
      codeValue,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );

    if (hashedCodeValue === existingUser.verificationCode) {
      (existingUser.verified = true),
        (existingUser.verificationCode = undefined),
        (existingUser.verificationCodeValidation = undefined);
      await existingUser.save();
      return res
        .status(200)
        .json({ success: true, message: "Your account has been verified! " });
    }
    return res
      .status(400)
      .json({ success: true, message: "unexpected occured!" });
  } catch (error) {
    console.error("verificationCode code error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong on the server" });
  }
};

// change password
const changePassword = async (req, res) => {
  const { userId, verified } = req.user;
  const { oldPassword, newPassword } = req.body;

  try {
    const { error, value } = changePasswordSchema.validate({
      oldPassword,
      newPassword,
    });

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: "You are not verified user!" });
    }
    const existingUser = await User.findOne({ _id: userId }).select(
      "+password"
    );

    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User dooes not exists! " });
    }

    const result = await doHashValidation(oldPassword, existingUser.password);
    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const hashedPassword = await doHash(newPassword, 12);
    existingUser.password = hashedPassword;
    await existingUser.save();
    return res
      .status(200)
      .json({ success: true, message: "Password updated! " });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong on the server",
    });
  }
};

// Sent forgotPasword Code
const sentForgotPasswordCode = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User does not exists!" });
    }
    const codeValue = Math.floor(Math.random() * 1000000).toString();
    let info = await transport.sendMail({
      from: process.env.SENDIN_EMAIL_ADD,
      to: existingUser.email,
      subject: "Forgot password Code",
      html: "<h1>" + codeValue + "</h1>",
    });

    if (info.accepted[0] === existingUser.email) {
      const hashedCodeValue = hamcprocess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      existingUser.forgotPasswordCode = hashedCodeValue;
      existingUser.forgotPasswordCodeValidation = Date.now();
      await existingUser.save();
      return res.status(200).json({ success: true, message: "Code sent!" });
    }
    res.status(400).json({ success: true, message: "Code sent failed!" });
  } catch (error) {
    console.error("verification  error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong on the server" });
  }
};

// Verify Forgot Password Code
const verifyForgotPasswordCode = async (req, res) => {
  const { email, providedCode, newPassword } = req.body;
  try {
    const { error, value } = acceptFPCodeSchema.validate({
      email,
      providedCode,
      newPassword,
    });

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const codeValue = providedCode.toString();
    const existingUser = await User.findOne({ email }).select(
      "+forgotPasswordCode +forgotPasswordCodeValidation"
    );

    if (!existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User does not exists!" });
    }

    if (
      !existingUser.forgotPasswordCode ||
      !existingUser.forgotPasswordCodeValidation
    ) {
      return res.status(400).json({
        success: false,
        message: "Something is wrong with the code!",
      });
    }

    if (
      Date.now() - existingUser.forgotPasswordCodeValidation >
      5 * 60 * 1000
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Code has been expired!" });
    }

    const hashedCodeValue = hamcprocess(
      codeValue,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );

    if (hashedCodeValue === existingUser.forgotPasswordCode) {
      (existingUser.forgotPasswordCode = undefined),
        (existingUser.forgotPasswordCodeValidation = undefined);
      await existingUser.save();
      return res
        .status(200)
        .json({ success: true, message: "Pasword Updated! " });
    }
    return res
      .status(400)
      .json({ success: true, message: "unexpected occured!" });
  } catch (error) {
    console.error("verificationCode code error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong on the server" });
  }
};

module.exports = {
  signup,
  login,
  logout,
  sentVerificationCode,
  verificationCode,
  changePassword,
  sentForgotPasswordCode,
  verifyForgotPasswordCode,
};
