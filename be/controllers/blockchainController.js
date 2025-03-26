const express = require("express");
const router = express.Router();

// Import model Blockchain
const myBlockchain = require("../models/blockchainInstance");

// Endpoint: Lấy toàn bộ blockchain
router.get("/blocks", (req, res) => {
  res.json(myBlockchain.chain);
});

// Endpoint: Thêm block mới (mine block)
router.post("/mine", (req, res) => {
  const data = req.body.data || "Empty Data";
  const newBlock = myBlockchain.createBlock(data);
  myBlockchain.addBlock(newBlock);
  // Sau khi thêm block, backup lại toàn bộ blockchain
  myBlockchain.backupChain();
  res.json({
    message: "Block mới được thêm vào blockchain!",
    block: newBlock,
  });
});

// Endpoint: Kiểm tra tính hợp lệ của blockchain
router.get("/validate", (req, res) => {
  const isValid = myBlockchain.isChainValid();
  res.json({ isValid });
});

router.get("/search", (req, res) => {
  const searchId = req.query.id;
  if (!searchId) {
    return res.status(400).json({ error: "Thiếu tham số id" });
  }

  // Nếu id truyền vào là số, chuyển đổi nó về kiểu số
  const searchValue = isNaN(searchId) ? searchId : Number(searchId);

  // Lọc ra các block mà block.data có chứa trường "id" bằng với searchValue
  const results = myBlockchain.chain.filter((block) => {
    // Kiểm tra nếu block.data là object và có trường id
    if (
      block.data &&
      typeof block.data === "object" &&
      block.data.id !== undefined
    ) {
      return block.data.id === searchValue;
    }
    return false;
  });

  // Nếu không có block nào tìm thấy thì trả về mảng rỗng
  res.json(results);
});

module.exports = router;
