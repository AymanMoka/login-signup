const User = require("../models/userModel");
const Joi = require("joi");
const Bcrypt = require("bcryptjs");
const Jwt = require("jsonwebtoken");
const HttpCodes = require("http-status-codes");
module.exports = {
  async register(req, res) {
    console.log(req.file);
    const userSchema = Joi.object({
      firstName: Joi.string()
        .required()
        .messages({ "any.required": "firstName is required !!" }),
      lastName: Joi.string()
        .required()
        .messages({ "any.required": "lastName is required !!" }),
      username: Joi.string()
        .required()
        .messages({ "any.required": "username is required !!" }),
      phone: Joi.number().required().messages({
        "any.required": "phone is required !!",
        "number.base": "phone must be a number",
      }),
      email: Joi.string()
        .required()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .messages({
          "string.email": "email must be a valid email",
        }),
      password: Joi.string().required().min(6).max(30).messages({
        "string.min": "password can't be less than 6 char ",
        "string.max": "password must be less than or equal to 30 char",
      }),
      repeatPassword: Joi.string()
        .required()
        .valid(Joi.ref("password"))
        .messages({ "any.only": "Password must matching" }),
      photo: Joi.string(),
    });

    if (!req.file) {
      return res.status(HttpCodes.StatusCodes.CONFLICT).json({
        success: false,
        message: "No Image Found",
      });
    }

    const filename = req.file.filename;
    const base = `${req.protocol}://${req.get("host")}/public/uploads/`;

    const { value, error } = userSchema.validate(req.body); //validate schema with req body
    if (error) {
      return res
        .status(HttpCodes.StatusCodes.NOT_ACCEPTABLE)
        .json({ message: error.message });
    }

    const newUsername = await User.findOne({ username: req.body.username });
    if (newUsername) {
      return res
        .status(HttpCodes.StatusCodes.CONFLICT)
        .json({ message: "username already exsit" });
    }
    const newEmail = await User.findOne({ email: req.body.email });
    if (newEmail) {
      return res
        .status(HttpCodes.StatusCodes.CONFLICT)
        .json({ message: "email already exsit" });
    }
    const newPhone = await User.findOne({ phone: req.body.phone });
    if (newPhone) {
      return res
        .status(HttpCodes.StatusCodes.CONFLICT)
        .json({ message: "phone already exsit" });
    }

    return Bcrypt.hash(req.body.password, 10, (err, hashed) => {
      if (err) {
        return res
          .status(HttpCodes.StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: err.message });
      }

      const newUser = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashed,
        username: req.body.username,
        phone: req.body.phone,
        photo: `${base}${filename}`,
      };

      User.create(newUser)
        .then((user) => {
          const token = Jwt.sign({ user: user }, process.env.token, {
            expiresIn: "10h",
          });
          return res
            .status(HttpCodes.StatusCodes.CREATED)
            .json({ message: "user created", user: user, token: token });
        })
        .catch((err) => {
          return res
            .status(HttpCodes.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: err.message });
        });
    });
  },
  login(req, res) {
    if (
      !(req.body.username || req.body.email || req.body.password) ||
      !req.body.password
    ) {
      return res
        .status(HttpCodes.StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Username and password is a must !!" });
    }

    User.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.email },
        { phone: req.body.phone },
      ],
    })
      .then((user) => {
        if (!user) {
          return res
            .status(HttpCodes.StatusCodes.NOT_FOUND)
            .json({ message: "User not found" });
        }
        return Bcrypt.compare(req.body.password, user.password)
          .then((result) => {
            if (!result) {
              return res
                .status(HttpCodes.StatusCodes.NOT_ACCEPTABLE)
                .json({ message: "Password not correct !!" });
            }
            const token = Jwt.sign({ user: user }, "Ayman Moka", {
              expiresIn: "10h",
            });
            return res
              .status(HttpCodes.StatusCodes.OK)
              .json({ message: "logged in", token: token });
          })
          .catch((err) => {
            return res
              .status(HttpCodes.StatusCodes.INTERNAL_SERVER_ERROR)
              .json({ err: err.message });
          });
      })
      .catch((err) => {
        return res
          .status(HttpCodes.StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ err: err.message });
      });
  },
};
