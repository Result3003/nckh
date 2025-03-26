const WebSocket = require("ws");
const myBlockchain = require("../models/blockchainInstance");
const { process } = require("../services/processData");

const parseSensorData = (raw) => {
  const result = {
    temp: 0,
    humidity: 0,
    soilMoisture: 0,
    light: 0,
    pressure: 0,
  };

  const tempMatch = raw.match(/Nhiet do DHT11:\s*([\d.]+)/);
  const humidityMatch = raw.match(/Do am khong khi:\s*([\d.]+)/);
  const soilMatch = raw.match(/Do am dat:\s*([\d.]+)/);
  const lightMatch = raw.match(/Light:\s*([\d.]+)/);
  const pressureMatch = raw.match(/Ap suat:\s*([\d.]+)/);

  if (tempMatch) result.temp = parseFloat(tempMatch[1]);
  if (humidityMatch) result.humidity = parseFloat(humidityMatch[1]);
  if (soilMatch) result.soilMoisture = parseFloat(soilMatch[1]);
  if (lightMatch) result.light = parseFloat(lightMatch[1]);
  if (pressureMatch) result.pressure = parseFloat(pressureMatch[1]);

  return result;
};

const checkAndAlert1 = async (rawData) => {
  console.log("listen data", rawData);
  const data = parseSensorData(rawData);
  const alerts = [];
  let title = "";

  if (data.temp < 18 || data.temp > 37) {
    alerts.push("Nhiệt độ đang ở mức không phù hợp với cây lúa.");
    title += "Nhiệt độ không phù hợp | ";
  }

  if (data.humidity < 40 || data.humidity > 90) {
    alerts.push("Độ ẩm không khí không nằm trong mức an toàn.");
    title += "Độ ẩm không khí không phù hợp | ";
  }

  if (data.soilMoisture < 30 || data.soilMoisture > 70) {
    alerts.push("Độ ẩm đất đang không phù hợp.");
    title += "Độ ẩm đất không phù hợp | ";
  }

  if (data.light < 10000) {
    alerts.push("Cường độ ánh sáng quá thấp.");
    title += "Cường độ ánh sáng quá thấp | ";
  }

  if (data.pressure < 980) {
    alerts.push("Áp suất khí quyển thấp – có thể có thời tiết xấu.");
    title += "Áp suất khí quyển thấp | ";
  }

  if (alerts.length > 0) {
    const fullText = `Cây lúa đang gặp vấn đề:\n\n${alerts
      .map((item, idx) => `${idx + 1}. ${item}`)
      .join(
        "\n"
      )}\n\nBạn hãy đưa ra cách khắc phục để giúp cây lúa phát triển tốt. | Dự đoán bệnh tật có thể xảy ra với điều kiện trên`;

    await process(title, fullText, 1);
  } else {
    console.log("✅ Không có cảnh báo – cây đang ổn.");
  }
};

module.exports = function (server) {
  // Tạo WebSocket Server, không cần cấu hình cors vì WebSocket khác với HTTP
  const wss = new WebSocket.Server({ server });

  const baseData1 = {
    id: "ID1",
    product: "Gạo Thơm Lài",
    source: "RVT",
    location: "An Giang",
    from: "10-Dec-2024",
    to: "10-Apr-2025",
    preserve: "Đóng bao",
    transport: "Đường bộ",
    storage: "An Giang",
  };

  const baseData2 = {
    id: "ID2",
    product: "Gạo ST25",
    source: "ST",
    location: "Sóc Trăng",
    from: "5-Jan-2025",
    to: "4-Apr-2025",
    preserve: "Đóng bao",
    transport: "Đường bộ",
    storage: "Sóc Trăng",
  };

  const temp = 0;
  /**
   * Hàm xử lý lưu dữ liệu cho ID1
   * @param {Object} data - Dữ liệu cần lưu vào blockchain
   */
  async function storeDataForID1(data) {
    await checkAndAlert1(data);
    const newData = { ...baseData1, parameter: data };
    const newBlock = myBlockchain.createBlock(newData);
    myBlockchain.addBlock(newBlock);
    myBlockchain.backupChain();
  }

  /**
   * Hàm xử lý lưu dữ liệu cho ID2
   * @param {Object} data - Dữ liệu cần lưu vào blockchain
   */
  function storeDataForID2(data) {
    const newData = { ...baseData2, parameter: data };
    const newBlock = myBlockchain.createBlock(newData);
    myBlockchain.addBlock(newBlock);
    console.log("New block added for ID2:", newBlock);
    myBlockchain.backupChain();
  }

  // Xử lý kết nối từ client
  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket server.");

    ws.on("message", (message) => {
      const decodedMessage = message.toString("utf8");

      const parts = decodedMessage.split("|");
      const msgId = parts[0].trim();
      (async () => {
        try {
          if (msgId === "ID1") {
            await storeDataForID1(decodedMessage);
          } else if (msgId === "ID2") {
            await storeDataForID2(decodedMessage);
          }
        } catch (error) {
          console.error("Error processing received message:", error);
        }
      })();
    });

    ws.on("close", () => {
      console.log("Client disconnected.");
    });
  });

  console.log("WebSocket server is running");
};
