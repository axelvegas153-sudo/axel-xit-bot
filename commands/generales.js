const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const comandos = [];

const CATEGORIA = "generales";
const COLOR = 0x5865F2;
const ZONA_HORARIA = "America/Bogota";

// ======================================================
// AYUDA
// ======================================================

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("ayuda")
    .setDescription("Muestra el centro de ayuda de DARK FF V1"),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle("🤖 DARK FF V1")
      .setDescription(
        "Bienvenido al centro de ayuda.\n\n" +
        "Selecciona una categoría para ver sus comandos."
      )
      .addFields(
        {
          name: "📜 Comandos",
          value: `${client.commands.size}`,
          inline: true
        },
        {
          name: "🌐 Servidores",
          value: `${client.guilds.cache.size}`,
          inline: true
        },
        {
          name: "🛠️ Soporte",
          value: "@Axel XIT",
          inline: true
        }
      );

    const botones = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("help_general")
          .setLabel("Generales")
          .setEmoji("🛠️")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("help_moderacion")
          .setLabel("Moderación")
          .setEmoji("🛡️")
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId("help_diversion")
          .setLabel("Diversión")
          .setEmoji("🎉")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("help_economia")
          .setLabel("Economía")
          .setEmoji("💰")
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({
      embeds: [embed],
      components: [botones]
    });
  }
});

// ======================================================
// HELP
// ======================================================

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Muestra la ayuda del bot"),

  async execute(interaction, client) {
    await interaction.reply(
      `📚 **DARK FF V1**\n\n` +
      `Tengo **${client.commands.size} comandos** disponibles.\n\n` +
      `Usa \`/ayuda\` para ver las categorías.`
    );
  }
});

// ======================================================
// PING
// ======================================================

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Muestra la latencia del bot"),

  async execute(interaction, client) {
    await interaction.reply(
      `🏓 **Pong!**\nLatencia: **${client.ws.ping}ms**`
    );
  }
});

// ======================================================
// HORA
// ======================================================

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("hora")
    .setDescription("Muestra la hora actual de Colombia"),

  async execute(interaction) {
    const ahora = new Date();

    const hora = ahora.toLocaleTimeString("es-CO", {
      timeZone: ZONA_HORARIA,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });

    const fecha = ahora.toLocaleDateString("es-CO", {
      timeZone: ZONA_HORARIA,
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    await interaction.reply(
      `🕐 **Hora de Colombia**\n\n` +
      `📅 ${fecha}\n` +
      `⏰ **${hora}**\n` +
      `🌎 **America/Bogota (UTC-5)**`
    );
  }
});

// ======================================================
// FECHA
// ======================================================

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("fecha")
    .setDescription("Muestra la fecha actual de Colombia"),

  async execute(interaction) {
    const fecha = new Date().toLocaleDateString("es-CO", {
      timeZone: ZONA_HORARIA,
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    await interaction.reply(
      `📅 **Fecha de Colombia:**\n${fecha}`
    );
  }
});

// ======================================================
// BOTINFO
// ======================================================

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Muestra información de DARK FF V1"),

  async execute(interaction, client) {
    const usuarios = client.guilds.cache.reduce(
      (total, guild) =>
        total + (guild.memberCount || 0),
      0
    );

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle("🤖 DARK FF V1")
      .addFields(
        {
          name: "📜 Comandos",
          value: `${client.commands.size}`,
          inline: true
        },
        {
          name: "🌐 Servidores",
          value: `${client.guilds.cache.size}`,
          inline: true
        },
        {
          name: "👥 Usuarios",
          value: `${usuarios}`,
          inline: true
        },
        {
          name: "🛠️ Soporte",
          value: "@Axel XIT",
          inline: true
        }
      );

    await interaction.reply({
      embeds: [embed]
    });
  }
});

// ======================================================
// SERVIDOR
// ======================================================

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("servidor")
    .setDescription("Muestra información del servidor"),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply(
        "❌ Este comando solo funciona en un servidor."
      );
    }

    const guild = interaction.guild;
    const icon = guild.iconURL({
      size: 1024
    });

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle(`🌐 ${guild.name}`)
      .addFields(
        {
          name: "👥 Miembros",
          value: `${guild.memberCount}`,
          inline: true
        },
        {
          name: "🆔 ID",
          value: guild.id,
          inline: true
        },
        {
          name: "👑 Dueño",
          value: `<@${guild.ownerId}>`,
          inline: true
        }
      );

    if (icon) {
      embed.setThumbnail(icon);
    }

    await interaction.reply({
      embeds: [embed]
    });
  }
});

// ======================================================
// USUARIO
// ======================================================

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("usuario")
    .setDescription("Muestra información de un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  async execute(interaction) {
    const user =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle(`👤 ${user.username}`)
      .setThumbnail(
        user.displayAvatarURL({
          size: 1024
        })
      )
      .addFields(
        {
          name: "🆔 ID",
          value: user.id,
          inline: true
        },
        {
          name: "🤖 Bot",
          value: user.bot ? "Sí" : "No",
          inline: true
        },
        {
          name: "📅 Cuenta creada",
          value:
            `<t:${Math.floor(
              user.createdTimestamp / 1000
            )}:D>`,
          inline: true
        }
      );

    await interaction.reply({
      embeds: [embed]
    });
  }
});

// ======================================================
// AVATAR
// ======================================================

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Muestra el avatar de un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  async execute(interaction) {
    const user =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const embed = new EmbedBuilder()
      .setColor(COLOR)
      .setTitle(`🖼️ Avatar de ${user.username}`)
      .setImage(
        user.displayAvatarURL({
          size: 1024
        })
      );

    await interaction.reply({
      embeds: [embed]
    });
  }
});

// ======================================================
// ROLES
// ======================================================

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Muestra los roles del servidor"),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply(
        "❌ Este comando solo funciona en un servidor."
      );
    }

    const roles = interaction.guild.roles.cache
      .filter(role =>
        role.id !== interaction.guild.id
      )
      .sort(
        (a, b) =>
          b.position - a.position
      )
      .map(role => `<@&${role.id}>`)
      .slice(0, 50);

    await interaction.reply(
      `🎭 **Roles del servidor:**\n\n` +
      `${roles.join("\n") || "No hay roles."}`
    );
  }
});

// ======================================================
// CANALES
// ======================================================

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("canales")
    .setDescription("Muestra los canales del servidor"),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply(
        "❌ Este comando solo funciona en un servidor."
      );
    }

    const canales = interaction.guild.channels.cache
      .map(canal => `• ${canal.name}`)
      .slice(0, 50);

    await interaction.reply(
      `📁 **Canales:**\n\n` +
      `${canales.join("\n") || "No hay canales."}`
    );
  }
});

// ======================================================
// ID
// ======================================================

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("id")
    .setDescription("Muestra tu ID de Discord"),

  async execute(interaction) {
    await interaction.reply(
      `🆔 Tu ID de Discord es:\n\`${interaction.user.id}\``
    );
  }
});

// ======================================================
// UPTIME
// ======================================================

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Muestra cuánto lleva online el bot"),

  async execute(interaction, client) {
    const segundos = Math.floor(
      (client.uptime || 0) / 1000
    );

    const dias = Math.floor(
      segundos / 86400
    );

    const horas = Math.floor(
      (segundos % 86400) / 3600
    );

    const minutos = Math.floor(
      (segundos % 3600) / 60
    );

    await interaction.reply(
      `⏱️ **DARK FF V1** lleva online:\n` +
      `**${dias}d ${horas}h ${minutos}m**`
    );
  }
});

// ======================================================
// ESTADO
// ======================================================

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("estado")
    .setDescription("Muestra el estado del bot"),

  async execute(interaction, client) {
    await interaction.reply(
      `🟢 **DARK FF V1 está online**\n` +
      `🏓 Ping: **${client.ws.ping}ms**`
    );
  }
});

// ======================================================
// INVITAR
// ======================================================

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("invitar")
    .setDescription("Genera el enlace para invitar al bot"),

  async execute(interaction, client) {
    const link =
      `https://discord.com/oauth2/authorize` +
      `?client_id=${client.user.id}` +
      `&permissions=8` +
      `&scope=bot%20applications.commands`;

    const botones =
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("➕ Invitar DARK FF V1")
          .setStyle(ButtonStyle.Link)
          .setURL(link)
      );

    await interaction.reply({
      content:
        "🤖 Invita a **DARK FF V1**:",
      components: [botones]
    });
  }
});

// ======================================================
// COMANDOS
// ======================================================

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("comandos")
    .setDescription("Muestra la cantidad de comandos"),

  async execute(interaction, client) {
    await interaction.reply(
      `📜 **DARK FF V1** tiene actualmente ` +
      `**${client.commands.size} comandos**.`
    );
  }
});

// ======================================================
// EXPORTAR
// ======================================================

module.exports = comandos;
