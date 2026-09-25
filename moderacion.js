const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

module.exports = [

  {
    category: "moderacion",
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
      .setDefaultMemberPermissions(
        PermissionFlagsBits.ManageMessages
      ),

    async execute(interaction) {
      const cantidad =
        interaction.options.getInteger("cantidad");

      const mensajes =
        await interaction.channel.bulkDelete(
          cantidad,
          true
        );

      await interaction.reply({
        content: `🧹 Eliminé **${mensajes.size} mensajes**.`,
        ephemeral: true
      });
    }
  },

  {
    category: "moderacion",
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
      .setDefaultMemberPermissions(
        PermissionFlagsBits.KickMembers
      ),

    async execute(interaction) {
      const usuario =
        interaction.options.getUser("usuario");

      const razon =
        interaction.options.getString("razon") ||
        "Sin razón";

      const miembro =
        await interaction.guild.members.fetch(usuario.id);

      if (!miembro.kickable) {
        return interaction.reply({
          content: "❌ No puedo expulsar a ese usuario.",
          ephemeral: true
        });
      }

      await miembro.kick(razon);

      await interaction.reply(
        `👢 **${usuario.username}** fue expulsado.\nRazón: ${razon}`
      );
    }
  },

  {
    category: "moderacion",
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
      .setDefaultMemberPermissions(
        PermissionFlagsBits.BanMembers
      ),

    async execute(interaction) {
      const usuario =
        interaction.options.getUser("usuario");

      const razon =
        interaction.options.getString("razon") ||
        "Sin razón";

      const miembro =
        await interaction.guild.members.fetch(usuario.id);

      if (!miembro.bannable) {
        return interaction.reply({
          content: "❌ No puedo banear a ese usuario.",
          ephemeral: true
        });
      }

      await miembro.ban({
        reason: razon
      });

      await interaction.reply(
        `🔨 **${usuario.username}** fue baneado.\nRazón: ${razon}`
      );
    }
  },

  {
    category: "moderacion",
    data: new SlashCommandBuilder()
      .setName("timeout")
      .setDescription("Silencia temporalmente a un usuario")
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
      .setDefaultMemberPermissions(
        PermissionFlagsBits.ModerateMembers
      ),

    async execute(interaction) {
      const usuario =
        interaction.options.getUser("usuario");

      const minutos =
        interaction.options.getInteger("minutos");

      const miembro =
        await interaction.guild.members.fetch(usuario.id);

      if (!miembro.moderatable) {
        return interaction.reply({
          content: "❌ No puedo aplicar timeout a ese usuario.",
          ephemeral: true
        });
      }

      await miembro.timeout(
        minutos * 60 * 1000,
        `Timeout aplicado por ${interaction.user.username}`
      );

      await interaction.reply(
        `🔇 ${usuario} recibió **${minutos} minutos** de timeout.`
      );
    }
  },

  {
    category: "moderacion",
    data: new SlashCommandBuilder()
      .setName("untimeout")
      .setDescription("Quita el timeout")
      .addUserOption(o =>
        o.setName("usuario")
          .setDescription("Usuario")
          .setRequired(true)
      )
      .setDefaultMemberPermissions(
        PermissionFlagsBits.ModerateMembers
      ),

    async execute(interaction) {
      const usuario =
        interaction.options.getUser("usuario");

      const miembro =
        await interaction.guild.members.fetch(usuario.id);

      await miembro.timeout(null);

      await interaction.reply(
        `🔊 Se quitó el timeout a **${usuario.username}**.`
      );
    }
  },

  {
    category: "moderacion",
    data: new SlashCommandBuilder()
      .setName("slowmode")
      .setDescription("Configura el modo lento")
      .addIntegerOption(o =>
        o.setName("segundos")
          .setDescription("Segundos")
          .setMinValue(0)
          .setMaxValue(21600)
          .setRequired(true)
      )
      .setDefaultMemberPermissions(
        PermissionFlagsBits.ManageChannels
      ),

    async execute(interaction) {
      const segundos =
        interaction.options.getInteger("segundos");

      await interaction.channel.setRateLimitPerUser(segundos);

      await interaction.reply(
        `🐌 Modo lento establecido en **${segundos} segundos**.`
      );
    }
  },

  {
    category: "moderacion",
    data: new SlashCommandBuilder()
      .setName("lock")
      .setDescription("Bloquea el canal")
      .setDefaultMemberPermissions(
        PermissionFlagsBits.ManageChannels
      ),

    async execute(interaction) {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        {
          SendMessages: false
        }
      );

      await interaction.reply("🔒 Canal bloqueado.");
    }
  },

  {
    category: "moderacion",
    data: new SlashCommandBuilder()
      .setName("unlock")
      .setDescription("Desbloquea el canal")
      .setDefaultMemberPermissions(
        PermissionFlagsBits.ManageChannels
      ),

    async execute(interaction) {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        {
          SendMessages: null
        }
      );

      await interaction.reply("🔓 Canal desbloqueado.");
    }
  }

];
