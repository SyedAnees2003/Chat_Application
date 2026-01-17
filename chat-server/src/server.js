require("dotenv").config();

const http = require("http");
const app = require("./app");
const { sequelize } = require("./models");
const { initSocket } = require("./config/socket");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synced");

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error);
  }
  
})();
