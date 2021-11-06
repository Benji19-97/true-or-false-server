const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

app.use(express.json());

app.listen(process.env.PORT || 3000, () => console.log("Server started..."));

const menu = require("./routes/testroute");
app.use("/lobby", menu);

module.exports = app;
