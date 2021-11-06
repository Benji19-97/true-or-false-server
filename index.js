const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Credentials", true);
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
      res.header(
            "Access-Control-Allow-Headers",
            "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
      );
      next();
});

app.use(express.json());

app.listen(process.env.PORT || 3000, () => console.log("Server started..."));

const menu = require("./routes/testroute");
app.use("/lobby", menu);

module.exports = app;
