require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  Events
} = require("discord.js");

// ========================================
// CONFIGURACIÓN
// ========================================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// ========================================
// COMPROBAR VARIABLES
// ========================================

if (!TOKEN) {
  console.error("❌ Falta DISCORD_TOKEN en las variables de entorno.");
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error("❌ Falta CLIENT_ID en las variables de entorno.");
  process.exit(1);
}

// ========================================
// CREAR CLIENTE
// ========================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// ========================================
// COMANDOS
// ========================================

const commands = [

  // /ping
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Comprueba si el bot está funcionando."),

  // /help
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Muestra todos los comandos del bot.")

].map(command => command.toJSON());

// ========================================
// REGISTRAR COMANDOS
// ========================================

async function registerCommands() {

  const rest = new REST({ version: "10" })
    .setToken(TOKEN);

  try {

    console.log(`🔄 Registrando ${commands.length} comandos...`);

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      {
        body: commands
      }
    );

    console.log("✅ Comandos registrados correctamente.");

  } catch (error) {

    console.error("❌ Error registrando comandos:");
    console.error(error);

  }
}

// ========================================
// BOT LISTO
// ========================================

client.once(
  Events.ClientReady,
  async bot => {

    console.log("");
    console.log("================================");
    console.log("🤖 DARK FF V1");
    console.log("================================");

    console.log(`✅ Conectado como: ${bot.user.tag}`);
    console.log(`🌐 Servidores: ${bot.guilds.cache.size}`);
    console.log(`📦 Comandos: ${commands.length}`);
    console.log("🌎 BOT PÚBLICO ACTIVADO");

    console.log("================================");

    await registerCommands();

    console.log("🚀 Bot iniciado correctamente.");

  }
);

// ========================================
// INTERACCIONES
// ========================================

client.on(
  Events.InteractionCreate,
  async interaction => {

    if (!interaction.isChatInputCommand()) {
      return;
    }

    // ====================================
    // /PING
    // ====================================

    if (interaction.commandName === "ping") {

      const ping = client.ws.ping;

      await interaction.reply(
        `🏓 **Pong!**\n📡 Ping: **${ping}ms**`
      );

      return;
    }

    // ====================================
    // /HELP
    // ====================================

    if (interaction.commandName === "help") {

      const embed = new EmbedBuilder()
        .setTitle("🤖 DARK FF V1")
        .setDescription(
          "📚 **Lista de comandos disponibles**"
        )
        .addFields(
          {
            name: "🏓 /ping",
            value: "Comprueba si el bot está funcionando.",
            inline: false
          },
          {
            name: "📚 /help",
            value: "Muestra esta lista de comandos.",
            inline: false
          }
        )
        .setFooter({
          text: "DARK FF V1 • Bot público"
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed]
      });

      return;
    }

  }
);

// ========================================
// ERRORES
// ========================================

process.on(
  "unhandledRejection",
  error => {

    console.error("❌ Error de promesa:");
    console.error(error);

  }
);

process.on(
  "uncaughtException",
  error => {

    console.error("❌ Error inesperado:");
    console.error(error);

  }
);

// ========================================
// INICIAR BOT
// ========================================

client.login(TOKEN);
