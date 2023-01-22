const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const app = express();

app.use(express.json({limit:'5mb'}));
app.use(express.urlencoded({limit:'5mb',extended:true}));//parsing

app.use(cors());
app.options("*", cors());//enable cors


require("dotenv").config();
mongoose.connect(
  process.env.data_base,
  {
    useNewUrlParser: true,
  },
  () => {
    console.log("Database connected");
  }
);

app.get("/", (req, res) => {
  res.send("hello from simple server :)");
});

const authRoute = require("./routes/authRoute");
app.use("/api/", authRoute); //auth middleware

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server started");
});
