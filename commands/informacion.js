const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = [

  {
    category: "informacion",
    data: new SlashCommandBuilder()
      .setName("help")
      .setDescription("Muestra los comandos de DARK FF V1"),

    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setColor(0xE11D48)
        .setTitle("🤖 DARK FF V1")
        .setDescription(
          "Bot público de Discord\n\n" +
          "💰 **Economía**\n" +
          "`/balance` `/daily` `/work` `/pay` `/deposit` `/withdraw`\n" +
          "`/bank` `/depositall` `/withdrawall` `/give` `/richest` `/coinflip` `/dice`\n\n" +

          "😂 **Diversión**\n" +
          "`/8ball` `/joke` `/meme` `/roast` `/compliment` `/random` `/rate` `/choose` `/flip`\n\n" +

          "🛡️ **Moderación**\n" +
          "`/clear` `/kick` `/ban` `/timeout` `/untimeout` `/slowmode` `/lock` `/unlock`\n\n" +

          "⭐ **Niveles**\n" +
          "`/rank` `/level` `/xp` `/addxp` `/setlevel` `/topxp`\n\n" +

          "🔧 **Información**\n" +
          "`/help` `/avatar` `/userinfo` `/serverinfo` `/roleinfo` `/channelinfo` `/ping` `/botinfo` `/servericon` `/invite`"
        )
        .setFooter({
          text: "DARK FF V1"
        });

      await interaction.reply({
        embeds: [embed]
      });
    }
  },

  {
    category: "informacion",
    data: new SlashCommandBuilder()
      .setName("avatar")
      .setDescription("Muestra el avatar de un usuario")
      .addUserOption(o =>
        o.setName("usuario")
          .setDescription("Usuario")
          .setRequired(false)
      ),

    async execute(interaction) {
      const usuario =
        interaction.options.getUser("usuario") ||
        interaction.user;

      const embed = new EmbedBuilder()
        .setColor(0xE11D48)
        .setTitle(`🖼️ Avatar de ${usuario.username}`)
        .setImage(usuario.displayAvatarURL({
          size: 1024,
          extension: "png"
        }));

      await interaction.reply({
        embeds: [embed]
      });
    }
  },

  {
    category: "informacion",
    data: new SlashCommandBuilder()
      .setName("userinfo")
      .setDescription("Muestra información de un usuario")
      .addUserOption(o =>
        o.setName("usuario")
          .setDescription("Usuario")
          .setRequired(false)
      ),

    async execute(interaction) {
      const usuario =
        interaction.options.getUser("usuario") ||
        interaction.user;

      const embed = new EmbedBuilder()
        .setColor(0x3B82F6)
        .setTitle("👤 Información")
        .setThumbnail(usuario.displayAvatarURL())
        .addFields(
          {
            name: "Usuario",
            value: `${usuario}`,
            inline: true
          },
          {
            name: "ID",
            value: usuario.id,
            inline: true
          },
          {
            name: "Bot",
            value: usuario.bot ? "Sí" : "No",
            inline: true
          }
        );

      await interaction.reply({
        embeds: [embed]
      });
    }
  },

  {
    category: "informacion",
    data: new SlashCommandBuilder()
      .setName("serverinfo")
      .setDescription("Muestra información del servidor"),

    async execute(interaction) {
      const guild = interaction.guild;

      const embed = new EmbedBuilder()
        .setColor(0x3B82F6)
        .setTitle(`🏠 ${guild.name}`)
        .setThumbnail(guild.iconURL())
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
            name: "📅 Creado",
            value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
            inline: true
          }
        );

      await interaction.reply({
        embeds: [embed]
      });
    }
  },

  {
    category: "informacion",
    data: new SlashCommandBuilder()
      .setName("roleinfo")
      .setDescription("Muestra información de un rol")
      .addRoleOption(o =>
        o.setName("rol")
          .setDescription("Rol")
          .setRequired(true)
      ),

    async execute(interaction) {
      const rol =
        interaction.options.getRole("rol");

      await interaction.reply(
        `🎭 **${rol.name}**\n` +
        `🆔 ${rol.id}\n` +
        `👥 Miembros: **${rol.members.size}**`
      );
    }
  },

  {
    category: "informacion",
    data: new SlashCommandBuilder()
      .setName("channelinfo")
      .setDescription("Muestra información del canal"),

    async execute(interaction) {
      const canal = interaction.channel;

      await interaction.reply(
        `📺 **${canal.name}**\n` +
        `🆔 ${canal.id}\n` +
        `Tipo: **${canal.type}**`
      );
    }
  },

  {
    category: "informacion",
    data: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Muestra la latencia del bot"),

    async execute(interaction) {
      await interaction.reply(
        `🏓 Pong!\n💻 Latencia: **${interaction.client.ws.ping}ms**`
      );
    }
  },

  {
    category: "informacion",
    data: new SlashCommandBuilder()
      .setName("botinfo")
      .setDescription("Muestra información del bot"),

    async execute(interaction) {
      const client = interaction.client;

      const embed = new EmbedBuilder()
        .setColor(0xE11D48)
        .setTitle("🤖 DARK FF V1")
        .setDescription(
          "Bot público de Discord\n\n" +
          `🏠 Servidores: **${client.guilds.cache.size}**\n` +
          `👥 Usuarios: **${client.users.cache.size}**\n` +
          `📡 Ping: **${client.ws.ping}ms**`
        );

      await interaction.reply({
        embeds: [embed]
      });
    }
  },

  {
    category: "informacion",
    data: new SlashCommandBuilder()
      .setName("servericon")
      .setDescription("Muestra el icono del servidor"),

    async execute(interaction) {
      const icon = interaction.guild.iconURL({
        size: 1024
      });

      if (!icon) {
        return interaction.reply(
          "❌ Este servidor no tiene icono."
        );
      }

      const embed = new EmbedBuilder()
        .setTitle(`🖼️ ${interaction.guild.name}`)
        .setImage(icon);

      await interaction.reply({
        embeds: [embed]
      });
    }
  },

  {
    category: "informacion",
    data: new SlashCommandBuilder()
      .setName("invite")
      .setDescription("Muestra el enlace de invitación del bot"),

    async execute(interaction) {
      const clientId = interaction.client.user.id;

      const url =
        `https://discord.com/oauth2/authorize?client_id=${clientId}` +
        `&scope=bot%20applications.commands&permissions=8`;

      await interaction.reply(
        `🤖 **Invita a DARK FF V1**\n${url}`
      );
    }
  }

];
