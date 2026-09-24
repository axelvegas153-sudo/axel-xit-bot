require("dotenv").config();

const express = require("express");
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const commands = require("./commands");

const app = express();
app.get("/", (req, res) => res.send("DARK FF V1 ONLINE"));
app.listen(process.env.PORT || 3000, "0.0.0.0");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", async () => {
  console.log(`✅ ${client.user.tag} conectado`);

  const rest = new REST({ version: "10" })
    .setToken(process.env.DISCORD_TOKEN);

  const route = process.env.GUILD_ID
    ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    : Routes.applicationCommands(process.env.CLIENT_ID);

  await rest.put(route, { body: commands });

  console.log(`✅ ${commands.length} comandos registrados`);
});

client.login(process.env.DISCORD_TOKEN);
