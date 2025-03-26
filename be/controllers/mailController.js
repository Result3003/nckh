const express = require("express");
const { sendMail } = require("../services/mailService");
const router = express.Router();

router.post("/mail", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const result = await sendMail(text);

  if (result.success) {
    res.json({ message: result.message });
  } else {
    res.status(500).json({ error: result.message, detail: result.error });
  }
});

module.exports = router;
