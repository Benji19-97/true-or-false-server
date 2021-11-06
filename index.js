const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.listen(process.env.PORT || 3000, () => console.log("Server started..."));

const menu = require("./routes/testroute");
app.use("/lobby", menu);

module.exports = app;
