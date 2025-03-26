require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
require("./services/scheduler");

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// SOCKET: truyền server instance cho controller
require("./controllers/blockchainSocketController")(server);

// Init APP
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Router: đảm bảo blockchainController được export ra dưới dạng router của Express
const blockchainController = require("./controllers/blockchainController");
const processAIController = require("./controllers/processAIController");
const mailController = require("./controllers/mailController");
app.use("/api", blockchainController);
app.use("/api", processAIController);
app.use("/api", mailController);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
