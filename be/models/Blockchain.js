const fs = require("fs");
const path = require("path");
const Block = require("./Block");
const { encrypt, decrypt } = require("../utils/cryptoUtils");

// Key mã hóa (nên sử dụng biến môi trường cho sản xuất)
const SECRET_KEY = "12345678901234567890123456789012";
const BACKUP_FILE = path.join(__dirname, "../blockchain_backup.dat");

class Blockchain {
  constructor() {
    this.chain = [];
    this.initChain();
  }

  // Tạo Genesis Block
  createGenesisBlock() {
    return new Block(0, new Date().toISOString(), "Genesis Block", "0");
  }

  // Khởi tạo chuỗi blockchain: đọc backup nếu có, ngược lại tạo mới
  initChain() {
    if (fs.existsSync(BACKUP_FILE)) {
      try {
        const encryptedData = fs.readFileSync(BACKUP_FILE, "utf8");
        const decryptedData = decrypt(encryptedData, SECRET_KEY);
        const chainData = JSON.parse(decryptedData);
        this.chain = chainData.map((blockData) => {
          const block = new Block(
            blockData.index,
            blockData.timestamp,
            blockData.data,
            blockData.previousHash
          );
          block.hash = blockData.hash; // Gán lại hash từ dữ liệu đã lưu
          return block;
        });
        console.log("Đã load dữ liệu blockchain từ backup.");
      } catch (error) {
        console.error("Lỗi khi load backup:", error);
        this.chain = [this.createGenesisBlock()];
      }
    } else {
      this.chain = [this.createGenesisBlock()];
    }
  }

  // Lấy block cuối cùng trong chuỗi
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Tạo block mới nhưng không thêm trực tiếp vào chuỗi
  createBlock(data) {
    const index = this.chain.length;
    const timestamp = new Date().toISOString();
    return new Block(index, timestamp, data, this.getLatestBlock().hash);
  }

  // Thêm block mới vào chuỗi
  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  // Kiểm tra tính hợp lệ của chuỗi blockchain
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  // Backup chuỗi blockchain: mã hóa dữ liệu và ghi vào file
  backupChain() {
    try {
      const chainData = JSON.stringify(this.chain, null, 2);
      const encryptedData = encrypt(chainData, SECRET_KEY);
      fs.writeFileSync(BACKUP_FILE, encryptedData, "utf8");
      // console.log("Backup blockchain đã được cập nhật.");
    } catch (error) {
      console.error("Lỗi khi backup blockchain:", error);
    }
  }
}

module.exports = Blockchain;
