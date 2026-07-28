import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Pollify API is running");
});

app.listen(5000, () => console.log("Server running on port 5000"));
