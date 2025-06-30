const Joi = require("joi");

const signupSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  password: Joi.string()
    .required()
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$")
    ),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  password: Joi.string()
    .required()
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$")
    ),
});

const acceptCodeSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  providedCode: Joi.number().required(),
});

const changePasswordSchema = Joi.object({
  newPassword: Joi.string()
    .required()
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$")
    ),
  oldPassword: Joi.string()
    .required()
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$")
    ),
});

const acceptFPCodeSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  providedCode: Joi.number().required(),
  newPassword: Joi.string()
    .required()
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$")
    ),
});

const createPostSchema = Joi.object({
  title: Joi.string()
    .min(6)
    .max(60)
    .required(),
  description: Joi.string().min(3).max(600).required(),
  userId: Joi.string(),
});

module.exports = {
  signupSchema,
  loginSchema,
  acceptCodeSchema,
  changePasswordSchema,
  acceptFPCodeSchema,
  createPostSchema,
};
