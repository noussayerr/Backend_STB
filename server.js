import express from "express"

import cors from "cors"


const app = express();
app.use(express.json());
app.use(cors()); // Allow cross-origin requests

app.get("/", (req, res) => {
  res.json({ message: "Hello from Express!" });
});

app.listen(3000, () => console.log("Server running on port 3000"));