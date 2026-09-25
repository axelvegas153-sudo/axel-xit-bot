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

// =====================================================
// BAN
// =====================================================

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

// =====================================================
// UNBAN
// =====================================================

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

// =====================================================
// KICK
// =====================================================

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

// =====================================================
// TIMEOUT
// =====================================================

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
        .setDescription("Duración en minutos")
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
        respuesta("❌ No puedo aplicar timeout a ese usuario.", 0xed4245)
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

// =====================================================
// UNTIMEOUT
// =====================================================

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

// =====================================================
// PURGE
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Elimina mensajes del canal")
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

    try {
      const mensajes = await interaction.channel.bulkDelete(
        cantidad,
        true
      );

      return interaction.reply({
        content: `🧹 Se eliminaron **${mensajes.size}** mensajes.`,
        ephemeral: true
      });
    } catch {
      return interaction.reply({
        content: "❌ No pude eliminar los mensajes.",
        ephemeral: true
      });
    }
  }
});

// =====================================================
// LOCK
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Bloquea el canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    try {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        { SendMessages: false }
      );

      return interaction.reply(
        respuesta("🔒 Canal bloqueado.", 0xed4245)
      );
    } catch {
      return interaction.reply(
        respuesta("❌ No pude bloquear el canal.", 0xed4245)
      );
    }
  }
});

// =====================================================
// UNLOCK
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Desbloquea el canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    try {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        { SendMessages: null }
      );

      return interaction.reply(
        respuesta("🔓 Canal desbloqueado.", 0x57f287)
      );
    } catch {
      return interaction.reply(
        respuesta("❌ No pude desbloquear el canal.", 0xed4245)
      );
    }
  }
});

// =====================================================
// SLOWMODE
// =====================================================

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

    try {
      await interaction.channel.setRateLimitPerUser(segundos);

      return interaction.reply(
        respuesta(
          segundos === 0
            ? "⚡ Modo lento desactivado."
            : `🐌 Modo lento establecido en **${segundos} segundos**.`,
          0x5865f2
        )
      );
    } catch {
      return interaction.reply(
        respuesta("❌ No pude cambiar el modo lento.", 0xed4245)
      );
    }
  }
});

// =====================================================
// WARN
// =====================================================

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
    const servidor = obtenerServidor(db, interaction.guild.id);

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

// =====================================================
// WARNINGS
// =====================================================

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
    const servidor = obtenerServidor(db, interaction.guild.id);
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
      .map((warn, i) =>
        `**${i + 1}.** ${warn.razon}`
      )
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

// =====================================================
// CLEARWARNS
// =====================================================

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
    const servidor = obtenerServidor(db, interaction.guild.id);

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

// =====================================================
// NICK
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("nick")
    .setDescription("Cambia el apodo de un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("apodo")
        .setDescription("Nuevo apodo")
        .setMaxLength(32)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const apodo = interaction.options.getString("apodo");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro) {
      return interaction.reply(
        respuesta("❌ Usuario no encontrado.", 0xed4245)
      );
    }

    if (!miembro.manageable) {
      return interaction.reply(
        respuesta("❌ No puedo cambiar el apodo de ese usuario.", 0xed4245)
      );
    }

    await miembro.setNickname(
      apodo,
      `Apodo cambiado por ${interaction.user.tag}`
    );

    return interaction.reply(
      respuesta(
        `✏️ Apodo de **${usuario.tag}** cambiado a **${apodo}**.`,
        0x57f287
      )
    );
  }
});

// =====================================================
// RESETNICK
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("resetnick")
    .setDescription("Restablece el apodo de un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro || !miembro.manageable) {
      return interaction.reply(
        respuesta("❌ No puedo cambiar el apodo de ese usuario.", 0xed4245)
      );
    }

    await miembro.setNickname(null);

    return interaction.reply(
      respuesta(`♻️ Apodo de **${usuario.tag}** restablecido.`, 0x57f287)
    );
  }
});

// =====================================================
// ADDROLE
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("addrole")
    .setDescription("Añade un rol a un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addRoleOption(o =>
      o.setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const rol = interaction.options.getRole("rol");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro) {
      return interaction.reply(
        respuesta("❌ Usuario no encontrado.", 0xed4245)
      );
    }

    if (rol.managed || rol.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply(
        respuesta("❌ No puedo administrar ese rol.", 0xed4245)
      );
    }

    await miembro.roles.add(rol);

    return interaction.reply(
      respuesta(
        `✅ Se añadió el rol ${rol} a **${usuario.tag}**.`,
        0x57f287
      )
    );
  }
});

// =====================================================
// REMOVEROLE
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("removerole")
    .setDescription("Quita un rol de un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addRoleOption(o =>
      o.setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const rol = interaction.options.getRole("rol");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro) {
      return interaction.reply(
        respuesta("❌ Usuario no encontrado.", 0xed4245)
      );
    }

    if (rol.managed || rol.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply(
        respuesta("❌ No puedo administrar ese rol.", 0xed4245)
      );
    }

    await miembro.roles.remove(rol);

    return interaction.reply(
      respuesta(
        `✅ Se quitó el rol ${rol} a **${usuario.tag}**.`,
        0x57f287
      )
    );
  }
});

// =====================================================
// VOICEKICK
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("voicekick")
    .setDescription("Expulsa a un usuario de un canal de voz")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
        const usuario = interaction.options.getUser("usuario");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro || !miembro.voice.channel) {
      return interaction.reply(
        respuesta(
          "❌ Ese usuario no está en un canal de voz.",
          0xed4245
        )
      );
    }

    try {
      await miembro.voice.disconnect(
        `Desconectado por ${interaction.user.tag}`
      );

      return interaction.reply(
        respuesta(
          `🔊 **${usuario.tag}** fue desconectado del canal de voz.`,
          0x57f287
        )
      );
    } catch (error) {
      console.error("Error en voicekick:", error);

      return interaction.reply(
        respuesta(
          "❌ No pude desconectar a ese usuario.",
          0xed4245
        )
      );
    }
  }
});

// =====================================================
// VOICEMUTE
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("voicemute")
    .setDescription("Silencia a un usuario en voz")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro || !miembro.voice.channel) {
      return interaction.reply(
        respuesta("❌ Ese usuario no está en voz.", 0xed4245)
      );
    }

    try {
      await miembro.voice.setMute(true);

      return interaction.reply(
        respuesta(
          `🔇 **${usuario.tag}** fue silenciado en voz.`,
          0xf1c40f
        )
      );
    } catch {
      return interaction.reply(
        respuesta("❌ No pude silenciar al usuario.", 0xed4245)
      );
    }
  }
});

// =====================================================
// VOICEUNMUTE
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("voiceunmute")
    .setDescription("Quita el silencio de un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro || !miembro.voice.channel) {
      return interaction.reply(
        respuesta("❌ Ese usuario no está en voz.", 0xed4245)
      );
    }

    try {
      await miembro.voice.setMute(false);

      return interaction.reply(
        respuesta(
          `🔊 **${usuario.tag}** puede hablar nuevamente.`,
          0x57f287
        )
      );
    } catch {
      return interaction.reply(
        respuesta("❌ No pude quitar el silencio.", 0xed4245)
      );
    }
  }
});

// =====================================================
// DEHOIST
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("dehoist")
    .setDescription("Limpia símbolos del inicio del apodo")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro || !miembro.manageable) {
      return interaction.reply(
        respuesta(
          "❌ No puedo modificar el apodo de ese usuario.",
          0xed4245
        )
      );
    }

    const nombre = miembro.nickname || usuario.username;

    const nuevoNombre = nombre
      .replace(/^[^a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ]+/, "")
      .trim();

    if (!nuevoNombre) {
      return interaction.reply(
        respuesta("❌ No se pudo crear un apodo válido.", 0xed4245)
      );
    }

    try {
      await miembro.setNickname(nuevoNombre);

      return interaction.reply(
        respuesta(
          `✏️ Apodo actualizado: **${nuevoNombre}**`,
          0x57f287
        )
      );
    } catch {
      return interaction.reply(
        respuesta("❌ No pude cambiar el apodo.", 0xed4245)
      );
    }
  }
});

// =====================================================
// MODINFO
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("modinfo")
    .setDescription("Información de los comandos de moderación")
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🛡️ MODERACIÓN — DARK FF V1")
      .setDescription(
        "Comandos disponibles para moderar el servidor."
      )
      .addFields(
        {
          name: "🔨 Usuarios",
          value: "`ban` `unban` `kick` `timeout` `untimeout`"
        },
        {
          name: "🧹 Mensajes",
          value: "`clear` `purge`"
        },
        {
          name: "🔒 Canales",
          value: "`lock` `unlock` `slowmode`"
        },
        {
          name: "⚠️ Advertencias",
          value: "`warn` `warnings` `clearwarns`"
        },
        {
          name: "🔊 Voz",
          value: "`voicekick` `voicemute` `voiceunmute`"
        }
      )
      .setFooter({
        text: "DARK FF V1"
      });

    return interaction.reply({
      embeds: [embed]
    });
  }
});

// =====================================================
// CHECKPERMS
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("checkperms")
    .setDescription("Muestra tus permisos en el servidor")
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const permisos = interaction.member.permissions;

    const lista = [
      ["Administrador", PermissionFlagsBits.Administrator],
      ["Banear miembros", PermissionFlagsBits.BanMembers],
      ["Expulsar miembros", PermissionFlagsBits.KickMembers],
      ["Moderate Members", PermissionFlagsBits.ModerateMembers],
      ["Gestionar mensajes", PermissionFlagsBits.ManageMessages],
      ["Gestionar canales", PermissionFlagsBits.ManageChannels],
      ["Gestionar roles", PermissionFlagsBits.ManageRoles],
      ["Gestionar apodos", PermissionFlagsBits.ManageNicknames]
    ];

    const texto = lista
      .map(([nombre, permiso]) =>
        `${permisos.has(permiso) ? "✅" : "❌"} ${nombre}`
      )
      .join("\n");

    return interaction.reply(
      respuesta(`🛡️ **TUS PERMISOS**\n\n${texto}`)
    );
  }
});

// =====================================================
// USERINFO
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Muestra información de un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    )
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`👤 ${usuario.tag}`)
      .setThumbnail(usuario.displayAvatarURL())
      .addFields(
        {
          name: "🆔 ID",
          value: `\`${usuario.id}\``,
          inline: true
        },
        {
          name: "📅 Cuenta creada",
          value: `<t:${Math.floor(
            usuario.createdTimestamp / 1000
          )}:R>`,
          inline: true
        }
      );

    if (miembro?.joinedTimestamp) {
      embed.addFields({
        name: "📥 Entró al servidor",
        value: `<t:${Math.floor(
          miembro.joinedTimestamp / 1000
        )}:R>`,
        inline: true
      });
    }

    return interaction.reply({
      embeds: [embed]
    });
  }
});

// =====================================================
// MODERACION
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("moderacion")
    .setDescription("Muestra todos los comandos de moderación")
    .setDMPermission(false),

  category: "moderacion",

  async execute(interaction) {
    return interaction.reply(
      "🛡️ **MODERACIÓN — DARK FF V1**\n\n" +
      "🔨 `/ban` `/unban` `/kick`\n" +
      "🔇 `/timeout` `/untimeout`\n" +
      "🧹 `/clear` `/purge`\n" +
      "🔒 `/lock` `/unlock` `/slowmode`\n" +
      "⚠️ `/warn` `/warnings` `/clearwarns`\n" +
      "✏️ `/dehoist`\n" +
      "🔊 `/voicekick` `/voicemute` `/voiceunmute`\n" +
      "🛡️ `/modinfo` `/checkperms` `/userinfo`"
    );
  }
});

// =====================================================
// FINAL
// =====================================================

module.exports = comandos;
