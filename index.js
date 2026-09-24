require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
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
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// CARGAR TODOS LOS COMANDOS DE /commands/info Y /commands/fun
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);
const commands = [];

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));
  
  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
      console.log(`✅ Comando cargado: ${command.data.name}`);
    } else {
      console.log(`[ADVERTENCIA] El comando en ${filePath} no tiene "data" o "execute"`);
    }
  }
}

client.once("ready", async () => {
  console.log(`✅ ${client.user.tag} conectado`);
  console.log(`📡 Estoy en ${client.guilds.cache.size} servidores`);

  // Activar XP automática
  handler.client(client);

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
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

// MANEJAR INTERACCIONES /push /punch /help
client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "Hubo un error ejecutando este comando", ephemeral: true });
  }
});

// MANEJAR MENSAJES PARA XP
client.on("messageCreate", handler);

client.on("error", error => {
  console.error("❌ Error del cliente:", error);
});

process.on("unhandledRejection", error => {
  console.error("❌ Error no controlado:", error);
});

client.login(process.env.DISCORD_TOKEN);
