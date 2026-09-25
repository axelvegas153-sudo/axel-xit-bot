require("dotenv").config();

const fs = require("fs");
const path = require("path");
const http = require("http");

const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  Events
} = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN) {
  console.error("❌ Falta DISCORD_TOKEN en las variables de entorno.");
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error("❌ Falta CLIENT_ID en las variables de entorno.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "comandos");

if (!fs.existsSync(commandsPath)) {
  console.error("❌ No existe la carpeta 'comandos'.");
  process.exit(1);
}

const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

const commands = [];

for (const file of commandFiles) {
  try {
    const filePath = path.join(commandsPath, file);
    const loaded = require(filePath);

    const commandList = Array.isArray(loaded)
      ? loaded
      : [loaded];

    for (const command of commandList) {

      if (!command.data || !command.execute) {
        console.error(
          `❌ ${file} contiene un comando inválido.`
        );
        continue;
      }

      const name = command.data.name;

      if (client.commands.has(name)) {
        console.error(
          `❌ Comando duplicado: /${name}`
        );
        continue;
      }

      client.commands.set(name, command);

      commands.push(
        command.data.toJSON()
      );

      console.log(
        `✅ Cargado: /${name}`
      );
    }

  } catch (error) {
    console.error(
      `❌ Error cargando ${file}:`,
      error
    );
  }
}

const rest = new REST({
  version: "10"
}).setToken(TOKEN);

async function registrarComandos() {
  try {
    console.log(
      `🔄 Registrando ${commands.length} comandos...`
    );

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      {
        body: commands
      }
    );

    console.log(
      `✅ ${commands.length} comandos registrados correctamente.`
    );

  } catch (error) {
    console.error(
      "❌ Error registrando comandos:",
      error
    );
  }
}

client.once(Events.ClientReady, async () => {

  console.log(
    `🤖 DARK FF V1 conectado como ${client.user.tag}`
  );

  await registrarComandos();
});

client.on(Events.InteractionCreate, async interaction => {

  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command =
    client.commands.get(interaction.commandName);

  if (!command) {

    return interaction.reply({
      content:
        "❌ Este comando no está disponible. Reinicia el bot y vuelve a intentarlo.",
      ephemeral: true
    });
  }

  try {

    await command.execute(interaction);

  } catch (error) {

    console.error(
      `❌ Error ejecutando /${interaction.commandName}:`,
      error
    );

    const respuesta = {
      content:
        "❌ Ocurrió un error al ejecutar este comando.",
      ephemeral: true
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(respuesta).catch(() => {});
    } else {
      await interaction.reply(respuesta).catch(() => {});
    }
  }
});

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain"
  });

  res.end("DARK FF V1 está funcionando.");
}).listen(PORT, () => {
  console.log(`🌐 Servidor HTTP en puerto ${PORT}`);
});

client.login(TOKEN);
