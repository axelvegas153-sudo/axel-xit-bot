require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const commands = require("./commands");
const handler = require("./handler");

const app = express();
app.get("/", (req, res) => res.send("DARK FF V1 ONLINE ✅"));
app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("🌐 Servidor web activo para Railway");
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent // Necesario para el XP al hablar
  ]
});

client.once("ready", async () => {
  console.log(`✅ ${client.user.tag} conectado`);
  console.log(`📡 Estoy en ${client.guilds.cache.size} servidores`);

  // Activar XP automática
  handler.client(client);

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  // Si tienes GUILD_ID en .env se registra al instante. Si no, tarda 1 hora
  const route = process.env.GUILD_ID
    ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    : Routes.applicationCommands(process.env.CLIENT_ID);

  try {
    await rest.put(route, { body: commands });
    console.log(`✅ ${commands.length} comandos registrados`);
  } catch (error) {
    console.error("❌ Error registrando comandos:", error);
  }
});

client.on("interactionCreate", handler);

client.on("error", error => {
  console.error("❌ Error del cliente:", error);
});

process.on("unhandledRejection", error => {
  console.error("❌ Error no controlado:", error);
});

client.login(process.env.DISCORD_TOKEN);
