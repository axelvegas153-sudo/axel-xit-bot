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
  intents: [GatewayIntentBits.Guilds]
});

// ========================================
// COMANDOS
// ========================================

const commandNames = [
  "ping",
  "help",
  "funar",
  "ship",
  "info",
  "server",
  "user",
  "avatar",
  "bot",
  "stats",
  "rank",
  "profile",
  "level",
  "rules",
  "invite",
  "support",
  "website",
  "credits",
  "about",
  "uptime",
  "status",
  "members",
  "online",
  "channels",
  "roles",
  "boosts",
  "owner",
  "news",
  "updates",
  "announce",
  "report",
  "suggest",
  "feedback",
  "ticket",
  "close",
  "clear",
  "mute",
  "unmute",
  "kick",
  "ban",
  "unban",
  "warn",
  "warnings",
  "slowmode",
  "lock",
  "unlock",
  "say",
  "embed",
  "poll",
  "vote",
  "choose",
  "random",
  "coinflip",
  "dice",
  "8ball",
  "joke",
  "meme",
  "fun",
  "emoji",
  "translate",
  "calc",
  "time",
  "date",
  "weather",
  "youtube",
  "tiktok",
  "instagram",
  "twitter",
  "discord",
  "freefire",
  "ff",
  "uid",
  "ffinfo",
  "craftland",
  "guild",
  "clan",
  "diamond",
  "nickname",
  "region",
  "weapon",
  "character",
  "pet",
  "event",
  "redeem",
  "code",
  "daily",
  "bonus",
  "shop",
  "leaderboard",
  "top",
  "invitecheck",
  "permissions",
  "config",
  "setup",
  "prefix",
  "language",
  "premium",
  "donate",
  "helpme",
  "commands",
  "dark",
  "darkff"
];

// ========================================
// CREAR SLASH COMMANDS
// ========================================

const commands = commandNames.map(name => {

  const command = new SlashCommandBuilder()
    .setName(name)
    .setDescription(`Comando ${name} de DARK FF V1.`);

  // /ship necesita dos usuarios
  if (name === "ship") {
    command
      .addUserOption(option =>
        option
          .setName("usuario1")
          .setDescription("Primer usuario")
          .setRequired(true)
      )
      .addUserOption(option =>
        option
          .setName("usuario2")
          .setDescription("Segundo usuario")
          .setRequired(true)
      );
  }

  // /funar necesita un usuario
  if (name === "funar") {
    command.addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres funar")
        .setRequired(true)
    );
  }

  return command.toJSON();
});

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

    const command = interaction.commandName;

    // ====================================
    // /PING
    // ====================================

    if (command === "ping") {

      const ping = client.ws.ping;

      await interaction.reply(
        `🏓 **Pong!**\n📡 Ping: **${ping}ms**`
      );

      return;
    }

    // ====================================
    // /HELP
    // ====================================

    if (command === "help") {

      const embed = new EmbedBuilder()
        .setTitle("🤖 DARK FF V1")
        .setDescription(
          `📚 **Lista de comandos disponibles**\n\n` +
          `Tenemos **${commands.length} comandos** disponibles.`
        )
        .addFields({
          name: "📋 Comandos",
          value: commandNames
            .map(name => `\`/${name}\``)
            .join(" • ")
            .slice(0, 1024)
        })
        .setFooter({
          text: "DARK FF V1 • Bot público"
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed]
      });

      return;
    }

    // ====================================
    // /FUNAR
    // ====================================

    if (command === "funar") {

      const usuario = interaction.options.getUser("usuario");

      const embed = new EmbedBuilder()
        .setTitle("📢 FUNA")
        .setDescription(
          `🚨 **${usuario.username}** ha sido funado/a 😂`
        )
        .addFields({
          name: "👤 Usuario",
          value: `<@${usuario.id}>`
        })
        .setFooter({
          text: "DARK FF V1 • Solo por diversión"
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed]
      });

      return;
    }

    // ====================================
    // /SHIP
    // ====================================

    if (command === "ship") {

      const usuario1 = interaction.options.getUser("usuario1");
      const usuario2 = interaction.options.getUser("usuario2");

      const porcentaje = Math.floor(Math.random() * 101);

      let mensaje;

      if (porcentaje >= 90) {
        mensaje = "💖 ¡Pareja legendaria!";
      } else if (porcentaje >= 70) {
        mensaje = "💕 Hay buena conexión.";
      } else if (porcentaje >= 40) {
        mensaje = "💗 Puede que funcione.";
      } else if (porcentaje >= 20) {
        mensaje = "💔 Está complicado.";
      } else {
        mensaje = "💀 Mejor como amigos.";
      }

      const embed = new EmbedBuilder()
        .setTitle("💘 SHIP CALCULATOR")
        .setDescription(
          `👤 ${usuario1}\n` +
          `❤️\n` +
          `👤 ${usuario2}\n\n` +
          `💞 **Compatibilidad: ${porcentaje}%**\n\n` +
          mensaje
        )
        .setFooter({
          text: "DARK FF V1 • Ship"
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed]
      });

      return;
    }

    // ====================================
    // RESTO DE COMANDOS
    // ====================================

    await interaction.reply({
      content:
        `⚡ **/${command}**\n\n` +
        `Este comando está disponible en **DARK FF V1**. 🚀`
    });

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

Ojo: el "/ship" aquí es un minijuego de compatibilidad aleatorio, y "/funar" es solo una broma del bot; no acusa realmente a nadie de haber cometido algo.

Con este "index.js", Render registrará 100 comandos incluyendo "/ping", "/help", "/funar" y "/ship".
