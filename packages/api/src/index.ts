import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("DeepMatch API is alive!");
});

app.listen(port, () => {
  console.log(`[DeepMatch API] Server running at http://localhost:${port}`);
});
