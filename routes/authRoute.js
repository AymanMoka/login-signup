const express = require("express");
const authController = require("../controllers/authController");


const router = express.Router();

const multer = require("multer");
const fileMap = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = fileMap[file.mimetype];
    let errorUpload = new Error("invalid type");
    if (isValid) {
      errorUpload = null;
    }
    cb(errorUpload, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = fileMap[file.mimetype];
    cb(null, `${fileName}.${extension}`);
  },
});

const upload = multer({ storage: storage });

router.post("/register", upload.single("photo"), authController.register);
router.post("/login", authController.login);

module.exports = router;
