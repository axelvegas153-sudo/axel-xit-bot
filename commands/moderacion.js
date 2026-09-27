const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const commands = [];

/* =========================================================
   /ban
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banea a un miembro del servidor.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres banear")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("razon")
        .setDescription("Razón del baneo")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const razon =
      interaction.options.getString("razon") || "Sin razón especificada";

    if (usuario.id === interaction.user.id) {
      return interaction.reply({
        content: "❌ No puedes banearte a ti mismo.",
        ephemeral: true
      });
    }

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Ese usuario no está en el servidor.",
        ephemeral: true
      });
    }

    if (!miembro.bannable) {
      return interaction.reply({
        content: "❌ No puedo banear a ese usuario.",
        ephemeral: true
      });
    }

    await miembro.ban({ reason: razon });

    return interaction.reply(
      `🔨 **${usuario.tag}** fue baneado.\n📝 Razón: ${razon}`
    );
  }
});


/* =========================================================
   /unban
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Desbanea a un usuario.")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID del usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const id = interaction.options.getString("id");

    try {
      await interaction.guild.members.unban(id);

      return interaction.reply(
        `✅ El usuario con ID **${id}** fue desbaneado.`
      );
    } catch {
      return interaction.reply({
        content: "❌ No encontré un baneo para ese ID.",
        ephemeral: true
      });
    }
  }
});


/* =========================================================
   /kick
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsa a un miembro.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres expulsar")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("razon")
        .setDescription("Razón de la expulsión")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const razon =
      interaction.options.getString("razon") || "Sin razón especificada";

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Ese usuario no está en el servidor.",
        ephemeral: true
      });
    }

    if (!miembro.kickable) {
      return interaction.reply({
        content: "❌ No puedo expulsar a ese usuario.",
        ephemeral: true
      });
    }

    await miembro.kick(razon);

    return interaction.reply(
      `👢 **${usuario.tag}** fue expulsado.\n📝 Razón: ${razon}`
    );
  }
});


/* =========================================================
   /timeout
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Aplica un timeout a un miembro.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("minutos")
        .setDescription("Duración en minutos")
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("razon")
        .setDescription("Razón")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const minutos = interaction.options.getInteger("minutos");
    const razon =
      interaction.options.getString("razon") || "Sin razón especificada";

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro || !miembro.moderatable) {
      return interaction.reply({
        content: "❌ No puedo aplicar timeout a ese usuario.",
        ephemeral: true
      });
    }

    await miembro.timeout(minutos * 60 * 1000, razon);

    return interaction.reply(
      `🔇 **${usuario.tag}** recibió timeout durante **${minutos} minutos**.\n📝 Razón: ${razon}`
    );
  }
});


/* =========================================================
   /untimeout
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Quita el timeout a un miembro.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Usuario no encontrado.",
        ephemeral: true
      });
    }

    await miembro.timeout(null);

    return interaction.reply(
      `🔊 Se quitó el timeout a **${usuario.tag}**.`
    );
  }
});


/* =========================================================
   /warn
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Advierte a un miembro.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("razon")
        .setDescription("Razón de la advertencia")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const razon =
      interaction.options.getString("razon") || "Sin razón especificada";

    return interaction.reply(
      `⚠️ **${usuario.tag}** recibió una advertencia.\n📝 Razón: ${razon}`
    );
  }
});


/* =========================================================
   /unwarn
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("unwarn")
    .setDescription("Retira una advertencia.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    return interaction.reply(
      `✅ Se retiró una advertencia de **${usuario.tag}**.`
    );
  }
});


/* =========================================================
   /warns
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("warns")
    .setDescription("Muestra las advertencias de un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    const embed = new EmbedBuilder()
      .setTitle("⚠️ Advertencias")
      .setColor(0xffcc00)
      .setDescription(`Advertencias de ${usuario}`)
      .addFields({
        name: "📋 Total",
        value: "0 advertencias"
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /clear
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Elimina mensajes del canal.")
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de mensajes")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    try {
      const cantidad =
        interaction.options.getInteger("cantidad");

      const mensajes =
        await interaction.channel.bulkDelete(cantidad, true);

      return interaction.reply({
        content:
          `🧹 Se eliminaron **${mensajes.size} mensajes**.`,
        ephemeral: true
      });
    } catch (error) {
      console.error("Error en /clear:", error);

      return interaction.reply({
        content: "❌ No pude eliminar los mensajes.",
        ephemeral: true
      });
    }
  }
});


/* =========================================================
   /slowmode
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Configura el modo lento del canal.")
    .addIntegerOption(option =>
      option
        .setName("segundos")
        .setDescription("Segundos entre mensajes")
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const segundos =
      interaction.options.getInteger("segundos");

    await interaction.channel.setRateLimitPerUser(segundos);

    return interaction.reply(
      `🐌 Slowmode establecido en **${segundos} segundos**.`
    );
  }
});


/* =========================================================
   /lock
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Bloquea el canal.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        SendMessages: false
      }
    );

    return interaction.reply("🔒 Canal bloqueado.");
  }
});


/* =========================================================
   /unlock
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Desbloquea el canal.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        SendMessages: null
      }
    );

    return interaction.reply("🔓 Canal desbloqueado.");
  }
});


/* =========================================================
   /lockchannel
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("lockchannel")
    .setDescription("Bloquea el canal actual.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        SendMessages: false
      }
    );

    return interaction.reply("🔐 Canal bloqueado.");
  }
});


/* =========================================================
   /unlockchannel
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("unlockchannel")
    .setDescription("Desbloquea el canal actual.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        SendMessages: null
      }
    );

    return interaction.reply("🔓 Canal desbloqueado.");
  }
});


/* =========================================================
   /mute
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Silencia temporalmente a un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("minutos")
        .setDescription("Duración en minutos")
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const minutos =
      interaction.options.getInteger("minutos");

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    if (!miembro || !miembro.moderatable) {
      return interaction.reply({
        content: "❌ No puedo silenciar a ese usuario.",
        ephemeral: true
      });
    }

    await miembro.timeout(
      minutos * 60 * 1000,
      "Mute de moderación"
    );

    return interaction.reply(
      `🔇 **${usuario.tag}** fue silenciado durante **${minutos} minutos**.`
    );
  }
});


/* =========================================================
   /unmute
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Quita el silencio a un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Usuario no encontrado.",
        ephemeral: true
      });
    }

    await miembro.timeout(null);

    return interaction.reply(
      `🔊 **${usuario.tag}** ya puede hablar nuevamente.`
    );
  }
});


/* =========================================================
   /deafen
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("deafen")
    .setDescription("Ensordece a un usuario en voz.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    if (!miembro || !miembro.voice.channel) {
      return interaction.reply({
        content: "❌ El usuario no está en un canal de voz.",
        ephemeral: true
      });
    }

    await miembro.voice.setDeaf(true);

    return interaction.reply(
      `🔇 **${usuario.tag}** fue ensordecido.`
    );
  }
});


/* =========================================================
   /undeafen
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("undeafen")
    .setDescription("Quita el ensordecimiento.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    if (!miembro || !miembro.voice.channel) {
      return interaction.reply({
        content: "❌ El usuario no está en un canal de voz.",
        ephemeral: true
      });
    }

    await miembro.voice.setDeaf(false);

    return interaction.reply(
      `🔊 **${usuario.tag}** puede escuchar nuevamente.`
    );
  }
});


/* =========================================================
   /nickname
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("nickname")
    .setDescription("Cambia el apodo de un miembro.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nuevo apodo")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const nombre =
      interaction.options.getString("nombre");

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    if (!miembro || !miembro.manageable) {
      return interaction.reply({
        content: "❌ No puedo cambiar el apodo de ese usuario.",
        ephemeral: true
      });
    }

    await miembro.setNickname(nombre);

    return interaction.reply(
      `✏️ Apodo de **${usuario.tag}** cambiado a **${nombre}**.`
    );
  }
});


/* =========================================================
   /resetnickname
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("resetnickname")
    .setDescription("Restablece el apodo.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    if (!miembro || !miembro.manageable) {
      return interaction.reply({
        content: "❌ No puedo modificar ese usuario.",
        ephemeral: true
      });
    }

    await miembro.setNickname(null);

    return interaction.reply(
      `🔄 Apodo de **${usuario.tag}** restablecido.`
    );
  }
});

/* =========================================================
   /massban
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("massban")
    .setDescription("Banea varios usuarios por ID.")
    .addStringOption(option =>
      option
        .setName("ids")
        .setDescription("IDs separados por espacios")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("razon")
        .setDescription("Razón del baneo")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const idsTexto =
      interaction.options.getString("ids");

    const razon =
      interaction.options.getString("razon") ||
      "Baneo múltiple";

    const ids = idsTexto
      .split(/[\s,]+/)
      .filter(Boolean)
      .slice(0, 20);

    let exitos = 0;
    let fallidos = 0;

    for (const id of ids) {
      try {
        await interaction.guild.members.ban(id, {
          reason: razon
        });

        exitos++;
      } catch {
        fallidos++;
      }
    }

    return interaction.reply(
      `🔨 **MassBan terminado**\n\n` +
      `✅ Baneados: **${exitos}**\n` +
      `❌ Fallidos: **${fallidos}**`
    );
  }
});


/* =========================================================
   /history
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription("Muestra el historial básico de moderación.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ModerateMembers
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const embed = new EmbedBuilder()
      .setTitle("📋 Historial de moderación")
      .setColor(0x5865f2)
      .setThumbnail(usuario.displayAvatarURL())
      .addFields(
        {
          name: "👤 Usuario",
          value: `${usuario}`,
          inline: true
        },
        {
          name: "🆔 ID",
          value: usuario.id,
          inline: true
        },
        {
          name: "⚠️ Advertencias",
          value: "0",
          inline: true
        },
        {
          name: "🔨 Sanciones",
          value: "0",
          inline: true
        }
      )
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /modlog
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("modlog")
    .setDescription("Consulta el registro de moderación.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ViewAuditLog
    ),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("📑 Registro de moderación")
      .setColor(0x5865f2)
      .setDescription(
        "Información del sistema de moderación de DARK FF V1."
      )
      .addFields(
        {
          name: "🔨 Baneos",
          value: "Sistema preparado",
          inline: true
        },
        {
          name: "👢 Expulsiones",
          value: "Sistema preparado",
          inline: true
        },
        {
          name: "⚠️ Advertencias",
          value: "Sistema preparado",
          inline: true
        },
        {
          name: "🔇 Timeouts",
          value: "Sistema preparado",
          inline: true
        }
      )
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});


/* =========================================================
   EXPORTAR TODOS LOS COMANDOS
========================================================= */

module.exports = commands;
