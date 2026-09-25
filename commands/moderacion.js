const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.json");

function cargarDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
    }

    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return {};
  }
}

function guardarDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function obtenerServidor(db, guildId) {
  if (!db.servidores) db.servidores = {};

  if (!db.servidores[guildId]) {
    db.servidores[guildId] = {};
  }

  if (!db.servidores[guildId].warnings) {
    db.servidores[guildId].warnings = {};
  }

  return db.servidores[guildId];
}

function respuesta(texto, color = 0x5865f2) {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(color)
        .setDescription(texto)
    ]
  };
}

const comandos = [];

// 1. BAN
comandos.push({
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banea a un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("razon")
        .setDescription("Razón")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const razon =
      interaction.options.getString("razon") ||
      "Sin razón especificada";

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro) {
      return interaction.reply(
        respuesta("❌ Ese usuario no está en el servidor.", 0xed4245)
      );
    }

    if (!miembro.bannable) {
      return interaction.reply(
        respuesta("❌ No puedo banear a ese usuario.", 0xed4245)
      );
    }

    await miembro.ban({ reason: razon });

    return interaction.reply(
      respuesta(
        `🔨 **${usuario.tag}** fue baneado.\n📝 Razón: ${razon}`,
        0xed4245
      )
    );
  }
});

// 2. UNBAN
comandos.push({
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Quita el baneo de un usuario")
    .addStringOption(o =>
      o.setName("id")
        .setDescription("ID del usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const id = interaction.options.getString("id");

    try {
      await interaction.guild.members.unban(id);

      return interaction.reply(
        respuesta(`✅ Baneo eliminado para <@${id}>.`, 0x57f287)
      );
    } catch {
      return interaction.reply(
        respuesta("❌ No encontré ese baneo.", 0xed4245)
      );
    }
  }
});

// 3. KICK
comandos.push({
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsa a un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("razon")
        .setDescription("Razón")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const razon =
      interaction.options.getString("razon") ||
      "Sin razón especificada";

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro) {
      return interaction.reply(
        respuesta("❌ Usuario no encontrado.", 0xed4245)
      );
    }

    if (!miembro.kickable) {
      return interaction.reply(
        respuesta("❌ No puedo expulsar a ese usuario.", 0xed4245)
      );
    }

    await miembro.kick(razon);

    return interaction.reply(
      respuesta(
        `👢 **${usuario.tag}** fue expulsado.\n📝 Razón: ${razon}`,
        0xed4245
      )
    );
  }
});

// 4. TIMEOUT
comandos.push({
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Aplica timeout a un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("minutos")
        .setDescription("Duración")
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const minutos = interaction.options.getInteger("minutos");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro || !miembro.moderatable) {
      return interaction.reply(
        respuesta("❌ No puedo aplicar timeout.", 0xed4245)
      );
    }

    await miembro.timeout(
      minutos * 60 * 1000,
      `Timeout aplicado por ${interaction.user.tag}`
    );

    return interaction.reply(
      respuesta(
        `🔇 **${usuario.tag}** recibió timeout por **${minutos} minutos**.`,
        0xf1c40f
      )
    );
  }
});

// 5. UNTIMEOUT
comandos.push({
  data: new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Quita el timeout")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro || !miembro.moderatable) {
      return interaction.reply(
        respuesta("❌ No puedo modificar a ese usuario.", 0xed4245)
      );
    }

    await miembro.timeout(null);

    return interaction.reply(
      respuesta(`🔊 Timeout eliminado para **${usuario.tag}**.`, 0x57f287)
    );
  }
});

// 6. CLEAR
comandos.push({
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Elimina mensajes")
    .addIntegerOption(o =>
      o.setName("cantidad")
        .setDescription("Cantidad de mensajes")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const cantidad = interaction.options.getInteger("cantidad");

    const mensajes = await interaction.channel.bulkDelete(
      cantidad,
      true
    );

    return interaction.reply({
      content: `🧹 Eliminados **${mensajes.size}** mensajes.`,
      ephemeral: true
    });
  }
});

// 7. PURGE
comandos.push({
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Limpia mensajes del canal")
    .addIntegerOption(o =>
      o.setName("cantidad")
        .setDescription("Cantidad")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const cantidad = interaction.options.getInteger("cantidad");

    const mensajes = await interaction.channel.bulkDelete(
      cantidad,
      true
    );

    return interaction.reply({
      content: `🧹 Purga completada: **${mensajes.size}** mensajes.`,
      ephemeral: true
    });
  }
});

// 8. LOCK
comandos.push({
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Bloquea el canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      { SendMessages: false }
    );

    return interaction.reply(
      respuesta("🔒 Canal bloqueado.", 0xed4245)
    );
  }
});

// 9. UNLOCK
comandos.push({
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Desbloquea el canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      { SendMessages: null }
    );

    return interaction.reply(
      respuesta("🔓 Canal desbloqueado.", 0x57f287)
    );
  }
});

// 10. SLOWMODE
comandos.push({
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Configura el modo lento")
    .addIntegerOption(o =>
      o.setName("segundos")
        .setDescription("0 para desactivar")
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const segundos = interaction.options.getInteger("segundos");

    await interaction.channel.setRateLimitPerUser(segundos);

    return interaction.reply(
      respuesta(
        segundos === 0
          ? "⚡ Modo lento desactivado."
          : `🐌 Modo lento: **${segundos}s**.`,
        0x5865f2
      )
    );
  }
});

// 11. WARN
comandos.push({
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Advierte a un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("razon")
        .setDescription("Razón")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const razon =
      interaction.options.getString("razon") ||
      "Sin razón especificada";

    const db = cargarDB();
    const servidor = obtenerServidor(
      db,
      interaction.guild.id
    );

    if (!servidor.warnings[usuario.id]) {
      servidor.warnings[usuario.id] = [];
    }

    servidor.warnings[usuario.id].push({
      razon,
      moderador: interaction.user.id,
      fecha: Date.now()
    });

    guardarDB(db);

    return interaction.reply(
      respuesta(
        `⚠️ **${usuario.tag}** recibió una advertencia.\n` +
        `📝 ${razon}\n` +
        `📊 Total: **${servidor.warnings[usuario.id].length}**`,
        0xf1c40f
      )
    );
  }
});

// 12. WARNINGS
comandos.push({
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Muestra las advertencias")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    const db = cargarDB();
    const servidor = obtenerServidor(
      db,
      interaction.guild.id
    );

    const lista = servidor.warnings[usuario.id] || [];

    if (lista.length === 0) {
      return interaction.reply(
        respuesta(
          `✅ **${usuario.tag}** no tiene advertencias.`,
          0x57f287
        )
      );
    }

    const texto = lista
      .slice(-10)
      .map((warn, i) => `**${i + 1}.** ${warn.razon}`)
      .join("\n");

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle(`⚠️ Advertencias de ${usuario.tag}`)
          .setDescription(texto)
          .setFooter({
            text: `Total: ${lista.length}`
          })
      ]
    });
  }
});

// 13. CLEARWARNS
comandos.push({
  data: new SlashCommandBuilder()
    .setName("clearwarns")
    .setDescription("Elimina las advertencias")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    const db = cargarDB();
    const servidor = obtenerServidor(
      db,
      interaction.guild.id
    );

    servidor.warnings[usuario.id] = [];

    guardarDB(db);

    return interaction.reply(
      respuesta(
        `🧹 Se eliminaron las advertencias de **${usuario.tag}**.`,
        0x57f287
      )
    );
  }
});
