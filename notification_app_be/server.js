const express = require("express");
const cors = require("cors");

const loggingMiddleware = require("../logging_middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use(loggingMiddleware);

app.get("/", (req, res) => {
    res.send("Notification Backend Running");
});

app.listen(5000, () => {
    console.log("Server started on port 5000");
});