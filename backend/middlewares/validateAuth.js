const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[A-Z]/)
    .required()
    .messages({
      "string.empty": "Name is required.",
      "string.min": "Name must be at least 2 characters long.",
      "string.pattern.base": "Name must start with a capital letter.",
      "any.required": "Name is required.",
    }),

  email: Joi.string().trim().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  }),

  password: Joi.string()
    .trim()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/)
    .required()
    .messages({
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 6 characters long.",
      "string.pattern.base":
        "Password must contain a capital letter, a number, and a special character.",
      "any.required": "Password is required.",
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required.",
      "string.pattern.base": "Phone number must be exactly 10 digits.",
      "any.required": "Phone number is required.",
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  }),

  password: Joi.string().trim().required().messages({
    "string.empty": "Password is required.",
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
