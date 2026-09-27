const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

const commands = [];

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const TICKET_CATEGORY_NAME = "🎫 TICKETS";

function getTicketCategory(guild) {
  return guild.channels.cache.find(
    channel =>
      channel.type === ChannelType.GuildCategory &&
      channel.name === TICKET_CATEGORY_NAME
  );
}

function isTicketChannel(channel) {
  return (
    channel &&
    channel.type === ChannelType.GuildText &&
    channel.name.startsWith("ticket-")
  );
}


/* =========================================================
   /ticket
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Crea un ticket de soporte."),

  async execute(interaction) {
    const guild = interaction.guild;

    const existente = guild.channels.cache.find(
      channel =>
        channel.type === ChannelType.GuildText &&
        channel.name === `ticket-${interaction.user.username.toLowerCase()}`
    );

    if (existente) {
      return interaction.reply({
        content: `⚠️ Ya tienes un ticket abierto: ${existente}`,
        ephemeral: true
      });
    }

    let categoria = getTicketCategory(guild);

    if (!categoria) {
      categoria = await guild.channels.create({
        name: TICKET_CATEGORY_NAME,
        type: ChannelType.GuildCategory
      });
    }

    const canal = await guild.channels.create({
      name: `ticket-${interaction.user.username}`
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "-")
        .slice(0, 90),

      type: ChannelType.GuildText,

      parent: categoria.id,

      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: ["ViewChannel"]
        },
        {
          id: interaction.user.id,
          allow: [
            "ViewChannel",
            "SendMessages",
            "ReadMessageHistory",
            "AttachFiles"
          ]
        },
        {
          id: interaction.client.user.id,
          allow: [
            "ViewChannel",
            "SendMessages",
            "ReadMessageHistory",
            "ManageChannels",
            "ManageMessages"
          ]
        }
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket creado")
      .setDescription(
        `Hola ${interaction.user}, tu ticket ha sido creado.\n\n` +
        "Explica tu problema y un miembro del staff te atenderá."
      )
      .setTimestamp();

    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Cerrar")
        .setEmoji("🔒")
        .setStyle(ButtonStyle.Danger)
    );

    await canal.send({
      content: `${interaction.user}`,
      embeds: [embed],
      components: [botones]
    });

    return interaction.reply({
      content: `✅ Ticket creado: ${canal}`,
      ephemeral: true
    });
  }
});


/* =========================================================
   /ticketcreate
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ticketcreate")
    .setDescription("Crea un ticket para un usuario.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageChannels
    )
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const guild = interaction.guild;

    let categoria = getTicketCategory(guild);

    if (!categoria) {
      categoria = await guild.channels.create({
        name: TICKET_CATEGORY_NAME,
        type: ChannelType.GuildCategory
      });
    }

    const canal = await guild.channels.create({
      name: `ticket-${usuario.username}`
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "-")
        .slice(0, 90),

      type: ChannelType.GuildText,

      parent: categoria.id,

      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: ["ViewChannel"]
        },
        {
          id: usuario.id,
          allow: [
            "ViewChannel",
            "SendMessages",
            "ReadMessageHistory"
          ]
        }
      ]
    });

    await canal.send(
      `🎫 Ticket creado para ${usuario}.`
    );

    return interaction.reply({
      content: `✅ Ticket creado: ${canal}`,
      ephemeral: true
    });
  }
});


/* =========================================================
   /ticketclose
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ticketclose")
    .setDescription("Cierra el ticket actual."),

  async execute(interaction) {
    const canal = interaction.channel;

    if (!isTicketChannel(canal)) {
      return interaction.reply({
        content: "❌ Este canal no parece ser un ticket.",
        ephemeral: true
      });
    }

    await interaction.reply(
      "🔒 Cerrando ticket en 5 segundos..."
    );

    setTimeout(async () => {
      await canal.delete(
        "Ticket cerrado"
      ).catch(() => {});
    }, 5000);
  }
});


/* =========================================================
   /ticketdelete
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ticketdelete")
    .setDescription("Elimina el ticket actual.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageChannels
    ),

  async execute(interaction) {
    const canal = interaction.channel;

    if (!isTicketChannel(canal)) {
      return interaction.reply({
        content: "❌ Este canal no es un ticket.",
        ephemeral: true
      });
    }

    await interaction.reply(
      "🗑️ Eliminando ticket..."
    );

    setTimeout(async () => {
      await canal.delete(
        `Eliminado por ${interaction.user.tag}`
      ).catch(() => {});
    }, 2000);
  }
});


/* =========================================================
   /ticketadd
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ticketadd")
    .setDescription("Añade un usuario al ticket.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageChannels
    )
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres añadir")
        .setRequired(true)
    ),

  async execute(interaction) {
    const canal = interaction.channel;
    const usuario =
      interaction.options.getUser("usuario");

    if (!isTicketChannel(canal)) {
      return interaction.reply({
        content: "❌ Este canal no es un ticket.",
        ephemeral: true
      });
    }

    await canal.permissionOverwrites.edit(
      usuario.id,
      {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
        AttachFiles: true
      }
    );

    return interaction.reply(
      `✅ ${usuario} fue añadido al ticket.`
    );
  }
});


/* =========================================================
   /ticketremove
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ticketremove")
    .setDescription("Quita un usuario del ticket.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageChannels
    )
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres quitar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const canal = interaction.channel;
    const usuario =
      interaction.options.getUser("usuario");

    if (!isTicketChannel(canal)) {
      return interaction.reply({
        content: "❌ Este canal no es un ticket.",
        ephemeral: true
      });
    }

    await canal.permissionOverwrites.delete(
      usuario.id
    ).catch(() => {});

    return interaction.reply(
      `✅ ${usuario} fue retirado del ticket.`
    );
  }
});


/* =========================================================
   /ticketrename
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ticketrename")
    .setDescription("Cambia el nombre del ticket.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageChannels
    )
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nuevo nombre")
        .setRequired(true)
    ),

  async execute(interaction) {
    const canal = interaction.channel;

    if (!isTicketChannel(canal)) {
      return interaction.reply({
        content: "❌ Este canal no es un ticket.",
        ephemeral: true
      });
    }

    const nombre =
      interaction.options.getString("nombre");

    await canal.setName(
      nombre
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "-")
        .slice(0, 90)
    );

    return interaction.reply(
      "✅ Nombre del ticket actualizado."
    );
  }
});


/* =========================================================
   /ticketclaim
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ticketclaim")
    .setDescription("Reclama un ticket.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageChannels
    ),

  async execute(interaction) {
    const canal = interaction.channel;

    if (!isTicketChannel(canal)) {
      return interaction.reply({
        content: "❌ Este canal no es un ticket.",
        ephemeral: true
      });
    }

    await canal.setTopic(
      `Ticket reclamado por ${interaction.user.tag}`
    );

    return interaction.reply(
      `🙋 ${interaction.user} ha reclamado este ticket.`
    );
  }
});


/* =========================================================
   /ticketunclaim
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ticketunclaim")
    .setDescription("Libera un ticket reclamado.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageChannels
    ),

  async execute(interaction) {
    const canal = interaction.channel;

    if (!isTicketChannel(canal)) {
      return interaction.reply({
        content: "❌ Este canal no es un ticket.",
        ephemeral: true
      });
    }

    await canal.setTopic(
      "Ticket sin reclamar"
    );

    return interaction.reply(
      "🔓 Ticket liberado."
    );
  }
});


/* =========================================================
   /tickettranscript
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("tickettranscript")
    .setDescription("Muestra los últimos mensajes del ticket.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageChannels
    ),

  async execute(interaction) {
    const canal = interaction.channel;

    if (!isTicketChannel(canal)) {
      return interaction.reply({
        content: "❌ Este canal no es un ticket.",
        ephemeral: true
      });
    }

    const mensajes =
      await canal.messages.fetch({
        limit: 50
      });

    const transcript =
      mensajes
        .reverse()
        .map(message =>
          `[${message.createdAt.toISOString()}] ${message.author.tag}: ${message.content || "[archivo/embed]"}`
        )
        .join("\n");

    const contenido =
      transcript.length > 1900
        ? transcript.slice(-1900)
        : transcript;

    return interaction.reply({
      content:
        `📄 **Transcript de ${canal.name}**\n\`\`\`\n${contenido}\n\`\`\``,
      ephemeral: true
    });
  }
});


/* =========================================================
   /ticketpanel
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ticketpanel")
    .setDescription("Envía un panel para crear tickets.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageChannels
    ),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Soporte")
      .setDescription(
        "¿Necesitas ayuda?\n\nPulsa el botón de abajo para crear un ticket privado con el equipo de soporte."
      )
      .setTimestamp();

    const botones =
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_create")
          .setLabel("Crear ticket")
          .setEmoji("🎫")
          .setStyle(ButtonStyle.Primary)
      );

    return interaction.reply({
      embeds: [embed],
      components: [botones]
    });
  }
});


/* =========================================================
   /ticketsetup
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ticketsetup")
    .setDescription("Crea la categoría de tickets.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageChannels
    ),

  async execute(interaction) {
    const existente =
      getTicketCategory(interaction.guild);

    if (existente) {
      return interaction.reply({
        content: `⚠️ La categoría ya existe: ${existente}`,
        ephemeral: true
      });
    }

    const categoria =
      await interaction.guild.channels.create({
        name: TICKET_CATEGORY_NAME,
        type: ChannelType.GuildCategory
      });

    return interaction.reply(
      `✅ Categoría de tickets creada: ${categoria.name}`
    );
  }
});


/* =========================================================
   /ticketconfig
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ticketconfig")
    .setDescription("Muestra la configuración de tickets."),

  async execute(interaction) {
    const categoria =
      getTicketCategory(interaction.guild);

    const tickets =
      interaction.guild.channels.cache.filter(
        channel => isTicketChannel(channel)
      ).size;

    const embed = new EmbedBuilder()
      .setTitle("🎫 Configuración de Tickets")
      .addFields(
        {
          name: "📁 Categoría",
          value: categoria
            ? categoria.name
            : "No creada",
          inline: true
        },
        {
          name: "🎟️ Tickets abiertos",
          value: `${tickets}`,
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
   /tickethelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("tickethelp")
    .setDescription("Muestra los comandos de tickets."),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🎫 DARK FF V1 — TICKETS")
      .setDescription(
        "Sistema de soporte mediante tickets."
      )
      .addFields(
        {
          name: "🎟️ Crear",
          value:
            "`/ticket`\n`/ticketcreate`\n`/ticketpanel`"
        },
        {
          name: "🔒 Administración",
          value:
            "`/ticketclose`\n`/ticketdelete`\n`/ticketclaim`\n`/ticketunclaim`"
        },
        {
          name: "👥 Usuarios",
          value:
            "`/ticketadd`\n`/ticketremove`"
        },
        {
          name: "⚙️ Configuración",
          value:
            "`/ticketrename`\n`/ticketsetup`\n`/ticketconfig`\n`/tickettranscript`"
        }
      )
      .setFooter({
        text: "DARK FF V1"
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   EXPORTACIÓN
========================================================= */

module.exports = commands;
