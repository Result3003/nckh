const express = require("express");
const router = express.Router();
const { callGroqAPI } = require("../services/groqService");

router.post("/chat", async (req, res) => {
  const { msg } = req.body;
  const result = await callGroqAPI(msg);
  res.json(result);
});

module.exports = router;
