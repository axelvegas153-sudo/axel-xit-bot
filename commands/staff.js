const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType
} = require("discord.js");

const commands = [];


/* =========================================================
   /addrole
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("addrole")
    .setDescription("Añade un rol a un miembro.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario al que añadirás el rol")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol que quieres añadir")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const rol = interaction.options.getRole("rol");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ No encontré a ese usuario.",
        ephemeral: true
      });
    }

    if (rol.managed) {
      return interaction.reply({
        content: "❌ Ese rol es administrado por una integración.",
        ephemeral: true
      });
    }

    if (
      rol.position >= interaction.guild.members.me.roles.highest.position
    ) {
      return interaction.reply({
        content:
          "❌ No puedo administrar ese rol porque está por encima de mi rol.",
        ephemeral: true
      });
    }

    if (miembro.roles.cache.has(rol.id)) {
      return interaction.reply({
        content: "⚠️ Ese usuario ya tiene ese rol.",
        ephemeral: true
      });
    }

    await miembro.roles.add(rol);

    return interaction.reply(
      `✅ Se añadió el rol ${rol} a **${usuario.tag}**.`
    );
  }
});


/* =========================================================
   /removerole
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("removerole")
    .setDescription("Quita un rol a un miembro.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol que quieres quitar")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const rol = interaction.options.getRole("rol");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ No encontré a ese usuario.",
        ephemeral: true
      });
    }

    if (rol.managed) {
      return interaction.reply({
        content: "❌ Ese rol es administrado por una integración.",
        ephemeral: true
      });
    }

    if (
      rol.position >= interaction.guild.members.me.roles.highest.position
    ) {
      return interaction.reply({
        content:
          "❌ No puedo administrar ese rol porque está por encima de mi rol.",
        ephemeral: true
      });
    }

    if (!miembro.roles.cache.has(rol.id)) {
      return interaction.reply({
        content: "⚠️ Ese usuario no tiene ese rol.",
        ephemeral: true
      });
    }

    await miembro.roles.remove(rol);

    return interaction.reply(
      `✅ Se quitó el rol ${rol} a **${usuario.tag}**.`
    );
  }
});


/* =========================================================
   /createrole
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("createrole")
    .setDescription("Crea un nuevo rol.")
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nombre del nuevo rol")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("color")
        .setDescription("Color hexadecimal, por ejemplo #5865F2")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const nombre =
      interaction.options.getString("nombre");

    const color =
      interaction.options.getString("color");

    try {
      const rol = await interaction.guild.roles.create({
        name: nombre,
        color: color || undefined,
        reason: `Creado por ${interaction.user.tag}`
      });

      return interaction.reply(
        `✅ Rol creado correctamente: ${rol}`
      );
    } catch (error) {
      console.error("Error en /createrole:", error);

      return interaction.reply({
        content: "❌ No pude crear el rol.",
        ephemeral: true
      });
    }
  }
});


/* =========================================================
   /deleterole
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("deleterole")
    .setDescription("Elimina un rol.")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol que quieres eliminar")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    if (rol.managed) {
      return interaction.reply({
        content: "❌ No puedes eliminar un rol administrado.",
        ephemeral: true
      });
    }

    if (
      rol.position >= interaction.guild.members.me.roles.highest.position
    ) {
      return interaction.reply({
        content:
          "❌ Ese rol está por encima de mi rol.",
        ephemeral: true
      });
    }

    try {
      await rol.delete(
        `Eliminado por ${interaction.user.tag}`
      );

      return interaction.reply(
        `🗑️ El rol **${rol.name}** fue eliminado.`
      );
    } catch (error) {
      console.error("Error en /deleterole:", error);

      return interaction.reply({
        content: "❌ No pude eliminar ese rol.",
        ephemeral: true
      });
    }
  }
});


/* =========================================================
   /roleinfo
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("Muestra información de un rol.")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol que quieres consultar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    const embed = new EmbedBuilder()
      .setTitle("🎭 Información del rol")
      .setColor(rol.color || 0x5865f2)
      .addFields(
        {
          name: "📛 Nombre",
          value: rol.name,
          inline: true
        },
        {
          name: "🆔 ID",
          value: rol.id,
          inline: true
        },
        {
          name: "👥 Miembros",
          value: `${rol.members.size}`,
          inline: true
        },
        {
          name: "📊 Posición",
          value: `${rol.position}`,
          inline: true
        },
        {
          name: "🔗 Mencionable",
          value: rol.mentionable ? "Sí" : "No",
          inline: true
        },
        {
          name: "🤖 Administrado",
          value: rol.managed ? "Sí" : "No",
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
   /setnick
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("setnick")
    .setDescription("Cambia el apodo de un usuario.")
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
    const usuario = interaction.options.getUser("usuario");
    const nombre = interaction.options.getString("nombre");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Usuario no encontrado.",
        ephemeral: true
      });
    }

    if (!miembro.manageable) {
      return interaction.reply({
        content:
          "❌ No puedo cambiar el apodo de ese usuario.",
        ephemeral: true
      });
    }

    await miembro.setNickname(nombre);

    return interaction.reply(
      `✏️ El apodo de **${usuario.tag}** ahora es **${nombre}**.`
    );
  }
});


/* =========================================================
   /announce
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Envía un anuncio en un embed.")
    .addStringOption(option =>
      option
        .setName("titulo")
        .setDescription("Título del anuncio")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("mensaje")
        .setDescription("Contenido del anuncio")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const titulo =
      interaction.options.getString("titulo");

    const mensaje =
      interaction.options.getString("mensaje");

    const embed = new EmbedBuilder()
      .setTitle(`📢 ${titulo}`)
      .setDescription(mensaje)
      .setFooter({
        text: `Anuncio de ${interaction.guild.name}`
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /say
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Hace que el bot envíe un mensaje.")
    .addStringOption(option =>
      option
        .setName("mensaje")
        .setDescription("Mensaje que enviará el bot")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const mensaje =
      interaction.options.getString("mensaje");

    await interaction.reply({
      content: "✅ Mensaje enviado.",
      ephemeral: true
    });

    await interaction.channel.send(mensaje);
  }
});


/* =========================================================
   /embed
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Crea un mensaje embed.")
    .addStringOption(option =>
      option
        .setName("titulo")
        .setDescription("Título del embed")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("descripcion")
        .setDescription("Descripción del embed")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const titulo =
      interaction.options.getString("titulo");

    const descripcion =
      interaction.options.getString("descripcion");

    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(descripcion)
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /serverlock
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("serverlock")
    .setDescription("Bloquea el canal actual.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        SendMessages: false
      }
    );

    return interaction.reply(
      "🔒 **Servidor/canal bloqueado temporalmente.**"
    );
  }
});


/* =========================================================
   /serverunlock
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("serverunlock")
    .setDescription("Desbloquea el canal actual.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        SendMessages: null
      }
    );

    return interaction.reply(
      "🔓 **Canal desbloqueado.**"
    );
  }
});


/* =========================================================
   /dm
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("dm")
    .setDescription("Envía un mensaje privado a un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario destinatario")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("mensaje")
        .setDescription("Mensaje que quieres enviar")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const mensaje =
      interaction.options.getString("mensaje");

    try {
      await usuario.send(
        `📨 **Mensaje de ${interaction.guild.name}**\n\n${mensaje}`
      );

      return interaction.reply({
        content:
          `✅ Mensaje enviado a **${usuario.tag}**.`,
        ephemeral: true
      });
    } catch {
      return interaction.reply({
        content:
          "❌ No pude enviarle mensaje privado a ese usuario.",
        ephemeral: true
      });
    }
  }
});


/* =========================================================
   /move
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("move")
    .setDescription("Mueve un usuario a otro canal de voz.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres mover")
        .setRequired(true)
    )
    .addChannelOption(option =>
      option
        .setName("canal")
        .setDescription("Canal de voz de destino")
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const canal =
      interaction.options.getChannel("canal");

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

    if (!miembro.voice.channel) {
      return interaction.reply({
        content:
          "❌ Ese usuario no está conectado a un canal de voz.",
        ephemeral: true
      });
    }

    await miembro.voice.setChannel(canal);

    return interaction.reply(
      `🔊 **${usuario.tag}** fue movido a ${canal}.`
    );
  }
});


/* =========================================================
   /disconnect
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("disconnect")
    .setDescription("Desconecta a un usuario del canal de voz.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

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

    if (!miembro.voice.channel) {
      return interaction.reply({
        content:
          "❌ Ese usuario no está en un canal de voz.",
        ephemeral: true
      });
    }

    await miembro.voice.disconnect();

    return interaction.reply(
      `🔌 **${usuario.tag}** fue desconectado del canal de voz.`
    );
  }
});


/* =========================================================
   /voicekick
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("voicekick")
    .setDescription("Expulsa a un usuario de un canal de voz.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const miembro =
      await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

    if (!miembro || !miembro.voice.channel) {
      return interaction.reply({
        content:
          "❌ Ese usuario no está en un canal de voz.",
        ephemeral: true
      });
    }

    await miembro.voice.disconnect();

    return interaction.reply(
      `🚪 **${usuario.tag}** salió del canal de voz.`
    );
  }
});


/* =========================================================
   /staffinfo
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("staffinfo")
    .setDescription("Muestra información del sistema Staff."),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🛡️ DARK FF V1 — STAFF")
      .setDescription(
        "Sistema de herramientas para el equipo de moderación."
      )
      .addFields(
        {
          name: "🎭 Roles",
          value: "/addrole\n/removerole\n/createrole\n/deleterole\n/roleinfo"
        },
        {
          name: "📝 Administración",
          value: "/setnick\n/announce\n/say\n/embed"
        },
        {
          name: "🔊 Voz",
          value: "/move\n/disconnect\n/voicekick"
        },
        {
          name: "🔒 Control",
          value: "/serverlock\n/serverunlock"
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
   EXPORTACIÓN
========================================================= */

module.exports = commands;
