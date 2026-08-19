const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "Name is required.",
    "string.min": "Name must be at least 2 characters long.",
    "any.required": "Name is required.",
  }),

  email: Joi.string().trim().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  }),

  password: Joi.string().trim().min(6).max(128).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 6 characters long.",
    "any.required": "Password is required.",
  }),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+\-\s()]{7,20}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required.",
      "string.pattern.base": "Phone number is not valid.",
      "any.required": "Phone number is required.",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  }),

  password: Joi.string().trim().min(6).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 6 characters long.",
    "any.required": "Password is required.",
  }),
});

const validateAuth = (type) => {
  return (req, res, next) => {
    const schema = type === "register" ? registerSchema : loginSchema;

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validateAuth,
};
