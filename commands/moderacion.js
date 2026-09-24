const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName("ban")
      .setDescription("Banea a un usuario")
      .addUserOption(o =>
        o.setName("usuario").setDescription("Usuario a banear").setRequired(true)
      )
      .addStringOption(o =>
        o.setName("razon").setDescription("Razón del baneo").setRequired(false)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
      const usuario = interaction.options.getUser("usuario");
      const razon = interaction.options.getString("razon") || "Sin razón";

      const miembro = await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

      if (!miembro) {
        return interaction.reply({ content: "❌ No encontré a ese miembro.", ephemeral: true });
      }

      if (!miembro.bannable) {
        return interaction.reply({
          content: "❌ No puedo banear a ese usuario.",
          ephemeral: true
        });
      }

      await miembro.ban({ reason: razon });

      await interaction.reply(
        `🔨 **${usuario.username}** fue baneado.\n📝 Razón: ${razon}`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("kick")
      .setDescription("Expulsa a un usuario")
      .addUserOption(o =>
        o.setName("usuario").setDescription("Usuario a expulsar").setRequired(true)
      )
      .addStringOption(o =>
        o.setName("razon").setDescription("Razón").setRequired(false)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
      const usuario = interaction.options.getUser("usuario");
      const razon = interaction.options.getString("razon") || "Sin razón";

      const miembro = await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

      if (!miembro || !miembro.kickable) {
        return interaction.reply({
          content: "❌ No puedo expulsar a ese usuario.",
          ephemeral: true
        });
      }

      await miembro.kick(razon);

      await interaction.reply(
        `👢 **${usuario.username}** fue expulsado.\n📝 Razón: ${razon}`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("timeout")
      .setDescription("Silencia temporalmente a un usuario")
      .addUserOption(o =>
        o.setName("usuario").setDescription("Usuario").setRequired(true)
      )
      .addIntegerOption(o =>
        o
          .setName("minutos")
          .setDescription("Duración en minutos")
          .setMinValue(1)
          .setMaxValue(40320)
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
      const usuario = interaction.options.getUser("usuario");
      const minutos = interaction.options.getInteger("minutos");

      const miembro = await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

      if (!miembro || !miembro.moderatable) {
        return interaction.reply({
          content: "❌ No puedo aplicar timeout a ese usuario.",
          ephemeral: true
        });
      }

      await miembro.timeout(minutos * 60 * 1000, `Timeout de ${minutos} minutos`);

      await interaction.reply(
        `🔇 **${usuario.username}** recibió un timeout de **${minutos} minutos**.`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("untimeout")
      .setDescription("Quita el timeout a un usuario")
      .addUserOption(o =>
        o.setName("usuario").setDescription("Usuario").setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
      const usuario = interaction.options.getUser("usuario");

      const miembro = await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

      if (!miembro || !miembro.moderatable) {
        return interaction.reply({
          content: "❌ No puedo modificar a ese usuario.",
          ephemeral: true
        });
      }

      await miembro.timeout(null);

      await interaction.reply(
        `🔊 Se quitó el timeout a **${usuario.username}**.`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("clear")
      .setDescription("Elimina mensajes")
      .addIntegerOption(o =>
        o
          .setName("cantidad")
          .setDescription("Cantidad de mensajes")
          .setMinValue(1)
          .setMaxValue(100)
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
      const cantidad = interaction.options.getInteger("cantidad");

      const mensajes = await interaction.channel.bulkDelete(cantidad, true);

      await interaction.reply({
        content: `🧹 Eliminé **${mensajes.size} mensajes**.`,
        ephemeral: true
      });
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("lock")
      .setDescription("Bloquea el canal")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        { SendMessages: false }
      );

      await interaction.reply("🔒 Canal bloqueado.");
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("unlock")
      .setDescription("Desbloquea el canal")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        { SendMessages: null }
      );

      await interaction.reply("🔓 Canal desbloqueado.");
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("nick")
      .setDescription("Cambia el apodo de un usuario")
      .addUserOption(o =>
        o.setName("usuario").setDescription("Usuario").setRequired(true)
      )
      .addStringOption(o =>
        o.setName("nombre").setDescription("Nuevo apodo").setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

    async execute(interaction) {
      const usuario = interaction.options.getUser("usuario");
      const nombre = interaction.options.getString("nombre");

      const miembro = await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

      if (!miembro || !miembro.manageable) {
        return interaction.reply({
          content: "❌ No puedo cambiar el apodo de ese usuario.",
          ephemeral: true
        });
      }

      await miembro.setNickname(nombre);

      await interaction.reply(
        `✏️ Apodo de **${usuario.username}** cambiado a **${nombre}**.`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("warn")
      .setDescription("Advierte a un usuario")
      .addUserOption(o =>
        o.setName("usuario").setDescription("Usuario").setRequired(true)
      )
      .addStringOption(o =>
        o.setName("razon").setDescription("Razón").setRequired(false)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
      const usuario = interaction.options.getUser("usuario");
      const razon = interaction.options.getString("razon") || "Sin razón";

      await interaction.reply(
        `⚠️ **${usuario.username}** recibió una advertencia.\n📝 Razón: ${razon}`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("anuncio")
      .setDescription("Envía un anuncio en este canal")
      .addStringOption(o =>
        o.setName("mensaje").setDescription("Mensaje del anuncio").setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
      const mensaje = interaction.options.getString("mensaje");

      await interaction.channel.send(
        `📢 **ANUNCIO**\n\n${mensaje}\n\n— DARK FF V1`
      );

      await interaction.reply({
        content: "✅ Anuncio enviado.",
        ephemeral: true
      });
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("reglas")
      .setDescription("Muestra las reglas del servidor"),

    async execute(interaction) {
      await interaction.reply(
        "📜 **REGLAS DEL SERVIDOR**\n\n" +
        "1️⃣ Respeta a los demás.\n" +
        "2️⃣ No hagas spam.\n" +
        "3️⃣ No compartas contenido prohibido.\n" +
        "4️⃣ Respeta Al Mods, Staff, miembros\n" +
        "5️⃣ Diviértete y mantén el servidor limpio."
      );
    }
  }
];
