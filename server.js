const express = require("express");
const router = require("./routes/room");

// server initialisation
const app = express();

// middleware
app.use(express.json());

// app routes
app.use("/api",router);

const PORT = 5000;
app.listen(PORT,()=>console.log("Server is running on Port:", PORT));