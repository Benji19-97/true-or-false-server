const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

var allowCrossDomain = function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");

      // intercept OPTIONS method
      if ("OPTIONS" == req.method) {
            res.send(200);
      } else {
            next();
      }
};

app.use(allowCrossDomain);

app.use(express.json());

app.listen(process.env.PORT || 3000, () => console.log("Server started..."));

const menu = require("./routes/testroute");
app.use("/lobby", menu);

module.exports = app;
