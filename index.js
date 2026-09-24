require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const commands = require("./commands");
const handler = require("./handler"); // <- ESTO FALTABA

const app = express();
app.get("/", (req, res) => res.send("DARK FF V1 ONLINE"));
app.listen(process.env.PORT || 3000, "0.0.0.0");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages // <- ESTO FALTABA
  ]
});

client.once("ready", async () => {
  console.log(`✅ ${client.user.tag} conectado`);

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  // Si pones GUILD_ID carga en 10s. Si lo dejas vacío tarda 1 hora
  const route = process.env.GUILD_ID
    ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    : Routes.applicationCommands(process.env.CLIENT_ID);

  await rest.put(route, { body: commands });
  console.log(`✅ ${commands.length} comandos registrados`);
});

// <- ESTA LINEA ES LA MAS IMPORTANTE
client.on("interactionCreate", handler);

client.login(process.env.DISCORD_TOKEN);
