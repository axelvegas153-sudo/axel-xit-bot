const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName("usuarioinfo")
      .setDescription("Muestra información de un usuario")
      .addUserOption(o =>
        o.setName("usuario")
          .setDescription("Usuario")
          .setRequired(false)
      ),

    async execute(interaction) {
      const usuario =
        interaction.options.getUser("usuario") || interaction.user;

      const embed = new EmbedBuilder()
        .setTitle("👤 INFORMACIÓN DEL USUARIO")
        .setThumbnail(usuario.displayAvatarURL())
        .addFields(
          { name: "👤 Usuario", value: `${usuario}`, inline: true },
          { name: "🆔 ID", value: usuario.id, inline: true },
          {
            name: "📅 Cuenta creada",
            value: `<t:${Math.floor(usuario.createdTimestamp / 1000)}:D>`,
            inline: true
          }
        )
        .setFooter({ text: "DARK FF V1" });

      await interaction.reply({ embeds: [embed] });
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("serverinfo")
      .setDescription("Muestra información del servidor"),

    async execute(interaction) {
      const guild = interaction.guild;

      const embed = new EmbedBuilder()
        .setTitle(`📊 ${guild.name}`)
        .setThumbnail(guild.iconURL())
        .addFields(
          { name: "👑 Dueño", value: `<@${guild.ownerId}>`, inline: true },
          { name: "👥 Miembros", value: `${guild.memberCount}`, inline: true },
          { name: "💬 Canales", value: `${guild.channels.cache.size}`, inline: true },
          { name: "🎭 Roles", value: `${guild.roles.cache.size}`, inline: true },
          { name: "🚀 Boosts", value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
          {
            name: "📅 Creado",
            value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
            inline: true
          }
        )
        .setFooter({ text: "DARK FF V1" });

      await interaction.reply({ embeds: [embed] });
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("roleinfo")
      .setDescription("Muestra información de un rol")
      .addRoleOption(o =>
        o.setName("rol")
          .setDescription("Rol")
          .setRequired(true)
      ),

    async execute(interaction) {
      const rol = interaction.options.getRole("rol");

      await interaction.reply(
        `🎭 **${rol.name}**\n\n` +
        `🆔 ID: \`${rol.id}\`\n` +
        `👥 Miembros: **${rol.members.size}**\n` +
        `📌 Posición: **${rol.position}**`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("channelinfo")
      .setDescription("Muestra información del canal"),

    async execute(interaction) {
      const canal = interaction.channel;

      await interaction.reply(
        `📺 **INFORMACIÓN DEL CANAL**\n\n` +
        `📛 Nombre: **${canal.name}**\n` +
        `🆔 ID: \`${canal.id}\`\n` +
        `📂 Tipo: **${canal.type}**`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("emojiinfo")
      .setDescription("Muestra información de un emoji")
      .addStringOption(o =>
        o.setName("emoji")
          .setDescription("Emoji personalizado")
          .setRequired(true)
      ),

    async execute(interaction) {
      const texto = interaction.options.getString("emoji");

      await interaction.reply(
        `😀 **Información del emoji**\n\n` +
        `Emoji: ${texto}`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("membercount")
      .setDescription("Muestra la cantidad de miembros"),

    async execute(interaction) {
      await interaction.reply(
        `👥 Este servidor tiene **${interaction.guild.memberCount} miembros**.`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("boosts")
      .setDescription("Muestra los boosts del servidor"),

    async execute(interaction) {
      const boosts = interaction.guild.premiumSubscriptionCount || 0;

      await interaction.reply(
        `🚀 **Boosts del servidor:** ${boosts}`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("boosters")
      .setDescription("Muestra los usuarios que han dado boost"),

    async execute(interaction) {
      const boosters = interaction.guild.members.cache
        .filter(member => member.premiumSince)
        .map(member => `${member.user}`)
        .slice(0, 20);

      await interaction.reply(
        boosters.length
          ? `🚀 **BOOSTERS**\n\n${boosters.join("\n")}`
          : "🚀 Este servidor todavía no tiene boosters."
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("joined")
      .setDescription("Muestra cuándo entraste al servidor"),

    async execute(interaction) {
      const miembro = await interaction.guild.members.fetch(interaction.user.id);

      await interaction.reply(
        `📅 Entraste al servidor: <t:${Math.floor(
          miembro.joinedTimestamp / 1000
        )}:F>`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("created")
      .setDescription("Muestra cuándo se creó el servidor"),

    async execute(interaction) {
      await interaction.reply(
        `📅 El servidor fue creado: <t:${Math.floor(
          interaction.guild.createdTimestamp / 1000
        )}:F>`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("permissions")
      .setDescription("Muestra tus permisos"),

    async execute(interaction) {
      const permisos = interaction.member.permissions.toArray();

      await interaction.reply(
        `🔐 **TUS PERMISOS**\n\n` +
        (permisos.length
          ? permisos.map(p => `• \`${p}\``).join("\n")
          : "Sin permisos especiales.")
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("rolelist")
      .setDescription("Muestra los roles del servidor"),

    async execute(interaction) {
      const roles = interaction.guild.roles.cache
        .filter(role => role.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(role => `${role}`)
        .slice(0, 50);

      await interaction.reply(
        roles.length
          ? `🎭 **ROLES**\n\n${roles.join("\n")}`
          : "🎭 No hay roles."
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("channellist")
      .setDescription("Muestra los canales del servidor"),

    async execute(interaction) {
      const canales = interaction.guild.channels.cache
        .map(canal => `• ${canal}`)
        .slice(0, 50);

      await interaction.reply(
        `📺 **CANALES**\n\n${canales.join("\n")}`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("servericon")
      .setDescription("Muestra el icono del servidor"),

    async execute(interaction) {
      const icono = interaction.guild.iconURL({
        size: 1024,
        extension: "png"
      });

      await interaction.reply(
        icono
          ? `🖼️ **Icono de ${interaction.guild.name}**\n${icono}`
          : "❌ Este servidor no tiene icono."
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("serverbanner")
      .setDescription("Muestra el banner del servidor"),

    async execute(interaction) {
      const banner = interaction.guild.bannerURL({
        size: 1024,
        extension: "png"
      });

      await interaction.reply(
        banner
          ? `🖼️ **Banner del servidor**\n${banner}`
          : "❌ Este servidor no tiene banner."
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("serverowner")
      .setDescription("Muestra al dueño del servidor"),

    async execute(interaction) {
      await interaction.reply(
        `👑 El dueño de **${interaction.guild.name}** es <@${interaction.guild.ownerId}>.`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("botservers")
      .setDescription("Muestra cuántos servidores tiene el bot"),

    async execute(interaction) {
      await interaction.reply(
        `🌐 **DARK FF V1** está en **${interaction.client.guilds.cache.size} servidores**.`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("botstats")
      .setDescription("Muestra las estadísticas del bot"),

    async execute(interaction) {
      const client = interaction.client;

      const memoria = process.memoryUsage().rss / 1024 / 1024;

      await interaction.reply(
        `🤖 **DARK FF V1 — ESTADÍSTICAS**\n\n` +
        `🌐 Servidores: **${client.guilds.cache.size}**\n` +
        `👥 Usuarios visibles: **${client.users.cache.size}**\n` +
        `📡 Ping: **${client.ws.ping}ms**\n` +
        `💾 RAM: **${memoria.toFixed(1)} MB**`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("inviteinfo")
      .setDescription("Muestra información sobre una invitación")
      .addStringOption(o =>
        o.setName("codigo")
          .setDescription("Código de invitación")
          .setRequired(true)
      ),

    async execute(interaction) {
      const codigo = interaction.options.getString("codigo");

      try {
        const invite = await interaction.client.fetchInvite(codigo);

        await interaction.reply(
          `🔗 **INVITACIÓN**\n\n` +
          `🏠 Servidor: **${invite.guild?.name || "Desconocido"}**\n` +
          `👥 Miembros aproximados: **${invite.approximateMemberCount || "N/D"}**`
        );
      } catch {
        await interaction.reply({
          content: "❌ No pude encontrar esa invitación.",
          ephemeral: true
        });
      }
    }
  }
];
