const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const comandos = [];

// ======================================================
// AYUDA
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("ayuda")
    .setDescription("Muestra el centro de ayuda de DARK FF V1"),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("🤖 DARK FF V1")
      .setDescription(
        "Bienvenido al centro de ayuda.\n\n" +
        "Selecciona una categoría para ver sus comandos."
      )
      .addFields(
        { name: "📜 Comandos", value: `${client.commands.size}`, inline: true },
        { name: "🌐 Servidores", value: `${client.guilds.cache.size}`, inline: true },
        { name: "🏓 Ping", value: `${client.ws.ping}ms`, inline: true }
      )
      .setFooter({ text: "DARK FF V1 • Centro de ayuda" });

    const botones = new ActionRowBuilder().addComponents(
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
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Muestra la ayuda del bot"),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("📚 Ayuda • DARK FF V1")
      .setDescription(
        `Tengo **${client.commands.size} comandos** disponibles.\n\n` +
        "Usa `/ayuda` para abrir el menú de categorías."
      );

    await interaction.reply({ embeds: [embed] });
  }
});

// ======================================================
// PING
// ======================================================

comandos.push({
  category: "generales",

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
// LATENCIA
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("latencia")
    .setDescription("Muestra la latencia del bot"),

  async execute(interaction, client) {
    await interaction.reply(
      `📡 Latencia de DARK FF V1: **${client.ws.ping}ms**`
    );
  }
});

// ======================================================
// BOTINFO
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Muestra información del bot"),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("🤖 DARK FF V1")
      .setDescription("Información del bot")
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
          value: `${client.guilds.cache.reduce(
            (a, g) => a + (g.memberCount || 0),
            0
          )}`,
          inline: true
        },
        {
          name: "🏓 Ping",
          value: `${client.ws.ping}ms`,
          inline: true
        }
      );

    await interaction.reply({ embeds: [embed] });
  }
});

// ======================================================
// SERVIDOR
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("servidor")
    .setDescription("Muestra información del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🌐 ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 1024 }))
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
        },
        {
          name: "📅 Creado",
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
          inline: true
        }
      );

    await interaction.reply({ embeds: [embed] });
  }
});

// ======================================================
// USUARIO
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("usuario")
    .setDescription("Muestra información de un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres consultar")
        .setRequired(false)
    ),

  async execute(interaction) {
    const user =
      interaction.options.getUser("usuario") || interaction.user;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`👤 ${user.username}`)
      .setThumbnail(user.displayAvatarURL({ size: 1024 }))
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
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`,
          inline: true
        }
      );

    await interaction.reply({ embeds: [embed] });
  }
});

// ======================================================
// AVATAR
// ======================================================

comandos.push({
  category: "generales",

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
      interaction.options.getUser("usuario") || interaction.user;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🖼️ Avatar de ${user.username}`)
      .setImage(user.displayAvatarURL({ size: 1024 }));

    await interaction.reply({ embeds: [embed] });
  }
});

// ======================================================
// ICONO DEL SERVIDOR
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("icono")
    .setDescription("Muestra el icono del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;
    const icon = guild.iconURL({ size: 2048 });

    if (!icon) {
      return interaction.reply("❌ Este servidor no tiene icono.");
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🖼️ Icono de ${guild.name}`)
      .setImage(icon);

    await interaction.reply({ embeds: [embed] });
  }
});

// ======================================================
// SERVERICON
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("servericon")
    .setDescription("Muestra el icono del servidor"),

  async execute(interaction) {
    const icon = interaction.guild.iconURL({ size: 2048 });

    if (!icon) {
      return interaction.reply("❌ Este servidor no tiene icono.");
    }

    await interaction.reply(icon);
  }
});

// ======================================================
// MIEMBROS
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("miembros")
    .setDescription("Muestra la cantidad de miembros"),

  async execute(interaction) {
    await interaction.reply(
      `👥 **${interaction.guild.name}** tiene **${interaction.guild.memberCount} miembros**.`
    );
  }
});

// ======================================================
// MEMBERCOUNT
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("membercount")
    .setDescription("Muestra el número de miembros"),

  async execute(interaction) {
    await interaction.reply(
      `👥 Miembros: **${interaction.guild.memberCount}**`
    );
  }
});

// ======================================================
// ROLES
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Muestra los roles del servidor"),

  async execute(interaction) {
    const roles = interaction.guild.roles.cache
      .filter(role => role.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(role => `<@&${role.id}>`)
      .slice(0, 50);

    const texto = roles.length
      ? roles.join(" ")
      : "No hay roles.";

    await interaction.reply({
      content: `🎭 **Roles:**\n${texto}`
    });
  }
});

// ======================================================
// CANALES
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("canales")
    .setDescription("Muestra los canales del servidor"),

  async execute(interaction) {
    const canales = interaction.guild.channels.cache;

    const texto = canales
      .map(c => `• ${c.name}`)
      .slice(0, 50)
      .join("\n");

    await interaction.reply(
      `📁 **Canales de ${interaction.guild.name}**\n\n${texto || "Sin canales"}`
    );
  }
});

// ======================================================
// BOOSTS
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("boosts")
    .setDescription("Muestra los boosts del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    await interaction.reply(
      `🚀 Este servidor tiene **${guild.premiumSubscriptionCount || 0} boosts** y está en nivel **${guild.premiumTier}**.`
    );
  }
});

// ======================================================
// BOOSTERS
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("boosters")
    .setDescription("Muestra los boosters del servidor"),

  async execute(interaction) {
    const boosters = interaction.guild.members.cache
      .filter(member => member.premiumSince)
      .map(member => `<@${member.id}>`);

    await interaction.reply(
      `🚀 **Boosters:**\n${boosters.join("\n") || "Nadie"}`
    );
  }
});

// ======================================================
// OWNER
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("owner")
    .setDescription("Muestra el dueño del servidor"),

  async execute(interaction) {
    await interaction.reply(
      `👑 El dueño de este servidor es <@${interaction.guild.ownerId}>.`
    );
  }
});

// ======================================================
// FECHA
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("fecha")
    .setDescription("Muestra la fecha actual"),

  async execute(interaction) {
    const fecha = new Date().toLocaleDateString("es-CO");

    await interaction.reply(`📅 Fecha actual: **${fecha}**`);
  }
});

// ======================================================
// HORA
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("hora")
    .setDescription("Muestra la hora actual"),

  async execute(interaction) {
    const hora = new Date().toLocaleTimeString("es-CO");

    await interaction.reply(`🕐 Hora actual: **${hora}**`);
  }
});

// ======================================================
// UPTIME
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Muestra cuánto tiempo lleva online el bot"),

  async execute(interaction, client) {
    const segundos = Math.floor(client.uptime / 1000);

    const dias = Math.floor(segundos / 86400);
    const horas = Math.floor((segundos % 86400) / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);

    await interaction.reply(
      `⏱️ DARK FF V1 lleva online:\n**${dias}d ${horas}h ${minutos}m**`
    );
  }
});

// ======================================================
// ESTADO
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("estado")
    .setDescription("Muestra el estado del bot"),

  async execute(interaction, client) {
    await interaction.reply(
      `🟢 **DARK FF V1 está online**\n🏓 Ping: **${client.ws.ping}ms**`
    );
  }
});

// ======================================================
// ESTADISTICAS
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("estadisticas")
    .setDescription("Muestra las estadísticas del bot"),

  async execute(interaction, client) {
    const usuarios = client.guilds.cache.reduce(
      (total, guild) => total + (guild.memberCount || 0),
      0
    );

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("📊 Estadísticas • DARK FF V1")
      .addFields(
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
          name: "📜 Comandos",
          value: `${client.commands.size}`,
          inline: true
        },
        {
          name: "🏓 Ping",
          value: `${client.ws.ping}ms`,
          inline: true
        }
      );

    await interaction.reply({ embeds: [embed] });
  }
});

// ======================================================
// ID
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("id")
    .setDescription("Muestra tu ID de Discord"),

  async execute(interaction) {
    await interaction.reply(`🆔 Tu ID es: **${interaction.user.id}**`);
  }
});

// ======================================================
// MENCION
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("mencion")
    .setDescription("Menciona a un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("usuario");

    await interaction.reply(`👋 Hola ${user}!`);
  }
});

// ======================================================
// INVITAR
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("invitar")
    .setDescription("Genera el enlace para invitar a DARK FF V1"),

  async execute(interaction, client) {
    const link =
      `https://discord.com/oauth2/authorize?client_id=${client.user.id}` +
      `&permissions=8&scope=bot%20applications.commands`;

    const boton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("➕ Invitar DARK FF V1")
        .setStyle(ButtonStyle.Link)
        .setURL(link)
    );

    await interaction.reply({
      content: "🤖 Invita a **DARK FF V1** a tu servidor:",
      components: [boton]
    });
  }
});

// ======================================================
// COMANDOS
// ======================================================

comandos.push({
  category: "generales",

  data: new SlashCommandBuilder()
    .setName("comandos")
    .setDescription("Muestra cuántos comandos tiene el bot"),

  async execute(interaction, client) {
    await interaction.reply(
      `📜 DARK FF V1 tiene actualmente **${client.commands.size} comandos**.`
    );
  }
});

// ======================================================
// EXPORTAR
// ======================================================

module.exports = comandos;
