const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const commands = [];

/* =========================================================
   /help
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Muestra la ayuda de DARK FF V1"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📚 DARK FF V1 — Ayuda")
      .setDescription(
        "Usa `/help` para consultar las categorías del bot.\n\n" +
        "🎮 Diversión\n" +
        "🛡️ Moderación\n" +
        "💰 Economía\n" +
        "🎫 Tickets\n" +
        "🤖 IA\n" +
        "⚙️ Utilidades\n" +
        "📊 Estadísticas\n" +
        "📁 Archivos\n" +
        "🎵 Música\n" +
        "🌐 Internet"
      )
      .setFooter({
        text: "DARK FF V1"
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /botinfo
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Muestra información del bot"),

  async execute(interaction) {
    const client = interaction.client;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🤖 DARK FF V1")
      .addFields(
        {
          name: "🏠 Servidores",
          value: `${client.guilds.cache.size}`,
          inline: true
        },
        {
          name: "👥 Usuarios",
          value: `${client.guilds.cache.reduce(
            (total, guild) => total + guild.memberCount,
            0
          )}`,
          inline: true
        },
        {
          name: "⚡ Comandos",
          value: `${client.commands?.size || 0}`,
          inline: true
        },
        {
          name: "📡 Estado",
          value: client.ws.status === 0 ? "🟢 Online" : "🔴 Offline",
          inline: true
        }
      )
      .setFooter({
        text: "DARK FF V1"
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /ping
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Muestra la latencia del bot"),

  async execute(interaction) {
    const inicio = Date.now();

    await interaction.reply("🏓 Calculando...");

    const latencia = Date.now() - inicio;

    await interaction.editReply(
      `🏓 **Pong!**\n\n` +
      `📡 Bot: **${latencia}ms**\n` +
      `💻 Discord: **${interaction.client.ws.ping}ms**`
    );
  }
});

/* =========================================================
   /uptime
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Muestra cuánto tiempo lleva conectado el bot"),

  async execute(interaction) {
    const segundos = Math.floor(
      interaction.client.uptime / 1000
    );

    const dias = Math.floor(segundos / 86400);
    const horas = Math.floor((segundos % 86400) / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const secs = segundos % 60;

    await interaction.reply(
      `⏱️ **Uptime de DARK FF V1**\n\n` +
      `📅 ${dias}d ${horas}h ${minutos}m ${secs}s`
    );
  }
});

/* =========================================================
   /version
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("version")
    .setDescription("Muestra la versión del bot"),

  async execute(interaction) {
    await interaction.reply(
      "🤖 **DARK FF V1**\n" +
      "📦 Versión: **1.0.0**\n" +
      "🟢 Estado: **Operativo**"
    );
  }
});

/* =========================================================
   /invite
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Obtiene un enlace para invitar el bot"),

  async execute(interaction) {
    const clientId = interaction.client.user.id;

    const url =
      `https://discord.com/oauth2/authorize?client_id=${clientId}` +
      `&permissions=8&scope=bot%20applications.commands`;

    await interaction.reply({
      content:
        `🔗 **Invita a DARK FF V1**\n\n${url}`
    });
  }
});

/* =========================================================
   /support
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("support")
    .setDescription("Muestra información del soporte"),

  async execute(interaction) {
    await interaction.reply(
      "🛠️ **Soporte DARK FF V1**\n\n" +
      "Si necesitas ayuda con el bot, contacta con el equipo de administración."
    );
  }
});

/* =========================================================
   /commands
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("commands")
    .setDescription("Muestra la cantidad de comandos"),

  async execute(interaction) {
    const cantidad = interaction.client.commands?.size || 0;

    await interaction.reply(
      `📦 **DARK FF V1** tiene actualmente **${cantidad} comandos cargados**.`
    );
  }
});

/* =========================================================
   /about
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("about")
    .setDescription("Información sobre DARK FF V1"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("ℹ️ Sobre DARK FF V1")
      .setDescription(
        "DARK FF V1 es un bot multipropósito para servidores de Discord."
      )
      .addFields(
        {
          name: "🛠️ Funciones",
          value:
            "Moderación, economía, niveles, tickets, diversión, IA y mucho más."
        },
        {
          name: "⚡ Tecnología",
          value: "Node.js + discord.js"
        }
      )
      .setFooter({
        text: "DARK FF V1"
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /status
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Muestra el estado del bot"),

  async execute(interaction) {
    const client = interaction.client;

    const embed = new EmbedBuilder()
      .setColor(client.ws.status === 0 ? 0x00ff88 : 0xff0000)
      .setTitle("📡 Estado de DARK FF V1")
      .addFields(
        {
          name: "🤖 Bot",
          value: client.ws.status === 0 ? "🟢 Online" : "🔴 Offline",
          inline: true
        },
        {
          name: "📶 Ping",
          value: `${client.ws.ping}ms`,
          inline: true
        },
        {
          name: "🏠 Servidores",
          value: `${client.guilds.cache.size}`,
          inline: true
        }
      );

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /informationhelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("informationhelp")
    .setDescription("Muestra la ayuda de información"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x00aaff)
      .setTitle("📚 Información — DARK FF V1")
      .setDescription(
        "Comandos informativos del bot."
      )
      .addFields({
        name: "🤖 Bot",
        value:
          "`/help`\n" +
          "`/botinfo`\n" +
          "`/ping`\n" +
          "`/uptime`\n" +
          "`/version`\n" +
          "`/invite`\n" +
          "`/support`\n" +
          "`/commands`\n" +
          "`/about`\n" +
          "`/status`"
      })
      .setFooter({
        text: "DARK FF V1"
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   EXPORTACIÓN
========================================================= */

module.exports = commands;
