const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType
} = require("discord.js");

const comandos = [];

// ======================================================
// LOCK
// ======================================================

comandos.push({
  category: "administracion",

  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Bloquea un canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const canal = interaction.channel;

    await canal.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      { SendMessages: false }
    );

    await interaction.reply("🔒 Canal bloqueado correctamente.");
  }
});

// ======================================================
// UNLOCK
// ======================================================

comandos.push({
  category: "administracion",

  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Desbloquea un canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const canal = interaction.channel;

    await canal.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      { SendMessages: null }
    );

    await interaction.reply("🔓 Canal desbloqueado correctamente.");
  }
});

// ======================================================
// SLOWMODE
// ======================================================

comandos.push({
  category: "administracion",

  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Configura el modo lento")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption(option =>
      option
        .setName("segundos")
        .setDescription("Segundos de modo lento")
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true)
    ),

  async execute(interaction) {
    const segundos = interaction.options.getInteger("segundos");

    await interaction.channel.setRateLimitPerUser(segundos);

    await interaction.reply(
      `🐌 Modo lento establecido en **${segundos} segundos**.`
    );
  }
});

// ======================================================
// CLEAR
// ======================================================

comandos.push({
  category: "administracion",

  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Elimina mensajes del canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de mensajes")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    ),

  async execute(interaction) {
    const cantidad = interaction.options.getInteger("cantidad");

    await interaction.channel.bulkDelete(cantidad, true);

    await interaction.reply({
      content: `🧹 Eliminé **${cantidad} mensajes**.`,
      ephemeral: true
    });
  }
});

// ======================================================
// SAY
// ======================================================

comandos.push({
  category: "administracion",

  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Hace que el bot envíe un mensaje")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(option =>
      option
        .setName("mensaje")
        .setDescription("Mensaje")
        .setRequired(true)
    ),

  async execute(interaction) {
    const mensaje = interaction.options.getString("mensaje");

    await interaction.reply({
      content: "✅ Mensaje enviado.",
      ephemeral: true
    });

    await interaction.channel.send(mensaje);
  }
});

// ======================================================
// ANUNCIO
// ======================================================

comandos.push({
  category: "administracion",

  data: new SlashCommandBuilder()
    .setName("anuncio")
    .setDescription("Envía un anuncio")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(option =>
      option
        .setName("titulo")
        .setDescription("Título del anuncio")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("mensaje")
        .setDescription("Contenido")
        .setRequired(true)
    ),

  async execute(interaction) {
    const titulo = interaction.options.getString("titulo");
    const mensaje = interaction.options.getString("mensaje");

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`📢 ${titulo}`)
      .setDescription(mensaje)
      .setFooter({
        text: `DARK FF V1 • ${interaction.guild.name}`
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
});

// ======================================================
// CREAR ROL
// ======================================================

comandos.push({
  category: "administracion",

  data: new SlashCommandBuilder()
    .setName("crearrol")
    .setDescription("Crea un nuevo rol")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nombre del rol")
        .setRequired(true)
    ),

  async execute(interaction) {
    const nombre = interaction.options.getString("nombre");

    const rol = await interaction.guild.roles.create({
      name: nombre,
      reason: `Creado por ${interaction.user.tag}`
    });

    await interaction.reply(
      `🎭 Rol creado: ${rol}`
    );
  }
});

// ======================================================
// ELIMINAR ROL
// ======================================================

comandos.push({
  category: "administracion",

  data: new SlashCommandBuilder()
    .setName("eliminarrol")
    .setDescription("Elimina un rol")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol que quieres eliminar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    if (!rol.editable) {
      return interaction.reply({
        content: "❌ No puedo eliminar ese rol.",
        ephemeral: true
      });
    }

    await rol.delete(
      `Eliminado por ${interaction.user.tag}`
    );

    await interaction.reply("🗑️ Rol eliminado correctamente.");
  }
});

// ======================================================
// CREAR CANAL
// ======================================================

comandos.push({
  category: "administracion",

  data: new SlashCommandBuilder()
    .setName("crearcanal")
    .setDescription("Crea un canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nombre del canal")
        .setRequired(true)
    ),

  async execute(interaction) {
    const nombre = interaction.options.getString("nombre");

    const canal = await interaction.guild.channels.create({
      name: nombre,
      type: ChannelType.GuildText
    });

    await interaction.reply(
      `📁 Canal creado: ${canal}`
    );
  }
});

// ======================================================
// ELIMINAR CANAL
// ======================================================

comandos.push({
  category: "administracion",

  data: new SlashCommandBuilder()
    .setName("eliminarcanal")
    .setDescription("Elimina el canal actual")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const canal = interaction.channel;

    await interaction.reply("🗑️ Eliminando canal...");

    setTimeout(() => {
      canal.delete().catch(() => {});
    }, 1000);
  }
});

// ======================================================
// RENOMBRAR CANAL
// ======================================================

comandos.push({
  category: "administracion",

  data: new SlashCommandBuilder()
    .setName("renombrarcanal")
    .setDescription("Cambia el nombre del canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nuevo nombre")
        .setRequired(true)
    ),

  async execute(interaction) {
    const nombre = interaction.options.getString("nombre");

    await interaction.channel.setName(nombre);

    await interaction.reply(
      `✏️ Canal renombrado a **${nombre}**.`
    );
  }
});

// ======================================================
// SERVERINFO
// ======================================================

comandos.push({
  category: "administracion",

  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Muestra información administrativa del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setColor(0xE67E22)
      .setTitle(`⚙️ ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 512 }))
      .addFields(
        {
          name: "👥 Miembros",
          value: `${guild.memberCount}`,
          inline: true
        },
        {
          name: "🎭 Roles",
          value: `${guild.roles.cache.size}`,
          inline: true
        },
        {
          name: "📁 Canales",
          value: `${guild.channels.cache.size}`,
          inline: true
        },
        {
          name: "🚀 Boosts",
          value: `${guild.premiumSubscriptionCount || 0}`,
          inline: true
        },
        {
          name: "🆔 ID",
          value: guild.id,
          inline: true
        }
      );

    await interaction.reply({
      embeds: [embed]
    });
  }
});

// ======================================================
// SERVERLOCK
// ======================================================

comandos.push({
  category: "administracion",

  data: new SlashCommandBuilder()
    .setName("serverlock")
    .setDescription("Bloquea el canal actual")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      { SendMessages: false }
    );

    await interaction.reply(
      "🔐 **Server Lock activado.**"
    );
  }
});

// ======================================================
// SERVERUNLOCK
// ======================================================

comandos.push({
  category: "administracion",

  data: new SlashCommandBuilder()
    .setName("serverunlock")
    .setDescription("Desbloquea el canal actual")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      { SendMessages: null }
    );

    await interaction.reply(
      "🔓 **Server Lock desactivado.**"
    );
  }
});

// ======================================================
// AVISO
// ======================================================

comandos.push({
  category: "administracion",

  data: new SlashCommandBuilder()
    .setName("aviso")
    .setDescription("Envía un aviso al canal")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(option =>
      option
        .setName("mensaje")
        .setDescription("Mensaje del aviso")
        .setRequired(true)
    ),

  async execute(interaction) {
    const mensaje = interaction.options.getString("mensaje");

    const embed = new EmbedBuilder()
      .setColor(0xFEE75C)
      .setTitle("⚠️ Aviso")
      .setDescription(mensaje)
      .setFooter({
        text: `Publicado por ${interaction.user.tag}`
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
});

// ======================================================
// EXPORTAR
// ======================================================

module.exports = comandos;
