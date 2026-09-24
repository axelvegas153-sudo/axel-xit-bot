const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = [
  // ================================
  // /AYUDA
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("ayuda")
      .setDescription("Muestra todos los comandos"),

    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setTitle("📚 DARK FF V1")
        .setDescription(
          "Aquí tienes los comandos disponibles:\n\n" +

          "🛠️ **Generales**\n" +
          "`/ayuda` `/help` `/ping` `/botinfo` `/servidor`\n" +
          "`/usuario` `/avatar` `/banner` `/icono` `/roles`\n" +
          "`/canales` `/fecha` `/hora` `/invitar` `/soporte`\n" +
          "`/estado` `/uptime` `/estadisticas` `/github`\n" +
          "`/comandos` `/latencia`\n\n" +

          "🔨 **Moderación**\n" +
          "`/ban` `/desban` `/kick` `/timeout` `/untimeout`\n" +
          "`/warn` `/warnings` `/clear` `/slowmode` `/lock`\n" +
          "`/unlock` `/nick` `/addrol` `/delrol` `/purge`\n" +
          "`/anuncio` `/reglas` `/modlogs`\n\n" +

          "🎮 **Diversión**\n" +
          "`/8ball` `/dado` `/moneda` `/ppt` `/compatibilidad`\n" +
          "`/broma` `/reto` `/pregunta` `/eleccion` `/random`\n" +
          "`/frase` `/decir` `/color` `/push`\n\n" +

          "⭐ **Niveles**\n" +
          "`/nivel` `/perfil` `/xp` `/rangos` `/rankingxp` `/top`\n" +
          "`/recompensas` `/diario` `/trabajar` `/logros` `/logro`\n" +
          "`/darxp` `/quitarxp` `/resetxp` `/nivelconfig`\n" +
          "`/mensajenivel` `/rolnivel` `/xpconfig`\n\n" +

          "📋 **Información**\n" +
          "`/usuarioinfo` `/serverinfo` `/roleinfo` `/channelinfo`\n" +
          "`/emojiinfo` `/inviteinfo` `/membercount` `/boosts`\n" +
          "`/boosters` `/joined` `/created` `/permissions`\n" +
          "`/rolelist` `/channellist` `/servericon` `/serverbanner`\n" +
          "`/serverowner` `/botservers` `/botstats`"
        )
        .setColor(0x5865F2)
        .setFooter({
          text: "DARK FF V1 • Bot público"
        });

      await interaction.reply({
        embeds: [embed]
      });
    }
  },

  // ================================
  // /HELP
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("help")
      .setDescription("Muestra la ayuda del bot"),

    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setTitle("📜 DARK FF V1 — AYUDA")
        .setDescription(
          "Usa `/ayuda` para ver todas las categorías y comandos disponibles."
        )
        .setColor(0x5865F2);

      await interaction.reply({
        embeds: [embed]
      });
    }
  },

  // ================================
  // /PING
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Muestra la latencia del bot"),

    async execute(interaction, client) {
      await interaction.reply(
        `🏓 Pong!\nLatencia: **${client.ws.ping}ms**`
      );
    }
  },

  // ================================
  // /BOTINFO
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("botinfo")
      .setDescription("Información del bot"),

    async execute(interaction, client) {
      const embed = new EmbedBuilder()
        .setTitle("🤖 DARK FF V1")
        .setDescription(
          `**Bot:** ${client.user.tag}\n` +
          `**ID:** ${client.user.id}\n` +
          `**Servidores:** ${client.guilds.cache.size}\n` +
          `**Comandos:** ${client.commands.size}`
        )
        .setColor(0x5865F2);

      await interaction.reply({
        embeds: [embed]
      });
    }
  },

  // ================================
  // /SERVIDOR
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("servidor")
      .setDescription("Información del servidor"),

    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setTitle(`🛡️ ${interaction.guild.name}`)
        .addFields(
          {
            name: "👥 Miembros",
            value: `${interaction.guild.memberCount}`,
            inline: true
          },
          {
            name: "🆔 ID",
            value: interaction.guild.id,
            inline: true
          },
          {
            name: "👑 Dueño",
            value: `<@${interaction.guild.ownerId}>`,
            inline: true
          }
        )
        .setColor(0x5865F2);

      await interaction.reply({
        embeds: [embed]
      });
    }
  },

  // ================================
  // /USUARIO
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("usuario")
      .setDescription("Información de un usuario"),

    async execute(interaction) {
      await interaction.reply(
        `👤 **${interaction.user.tag}**\n🆔 ${interaction.user.id}`
      );
    }
  },

  // ================================
  // /AVATAR
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("avatar")
      .setDescription("Muestra tu avatar"),

    async execute(interaction) {
      await interaction.reply(
        interaction.user.displayAvatarURL({
          size: 1024,
          extension: "png"
        })
      );
    }
  },

  // ================================
  // /BANNER
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("banner")
      .setDescription("Muestra tu banner"),

    async execute(interaction, client) {
      const usuario = await client.users.fetch(
        interaction.user.id,
        { force: true }
      );

      const banner = usuario.bannerURL({
        size: 1024
      });

      await interaction.reply(
        banner || "❌ No tienes un banner."
      );
    }
  },

  // ================================
  // /ICONO
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("icono")
      .setDescription("Muestra el icono del servidor"),

    async execute(interaction) {
      const icon = interaction.guild.iconURL({
        size: 1024
      });

      await interaction.reply(
        icon || "❌ Este servidor no tiene icono."
      );
    }
  },

  // ================================
  // /ROLES
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("roles")
      .setDescription("Lista los roles del servidor"),

    async execute(interaction) {
      const roles = interaction.guild.roles.cache
        .filter(role => role.id !== interaction.guild.id)
        .map(role => `<@&${role.id}>`)
        .slice(0, 50)
        .join("\n");

      await interaction.reply(
        roles || "❌ No hay roles."
      );
    }
  },

  // ================================
  // /CANALES
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("canales")
      .setDescription("Lista los canales"),

    async execute(interaction) {
      const canales = interaction.guild.channels.cache
        .map(channel => `• ${channel.name}`)
        .slice(0, 50)
        .join("\n");

      await interaction.reply(
        canales || "❌ No hay canales."
      );
    }
  },

  // ================================
  // /FECHA
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("fecha")
      .setDescription("Muestra la fecha actual"),

    async execute(interaction) {
      await interaction.reply(
        `📅 <t:${Math.floor(Date.now() / 1000)}:D>`
      );
    }
  },

  // ================================
  // /HORA
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("hora")
      .setDescription("Muestra la hora local de cada persona"),

    async execute(interaction) {
      const timestamp = Math.floor(Date.now() / 1000);

      await interaction.reply(
        `🕐 Hora local: <t:${timestamp}:t>\n` +
        `📅 Fecha: <t:${timestamp}:D>\n\n` +
        `Discord mostrará la hora según la zona horaria de cada persona.`
      );
    }
  },

  // ================================
  // /INVITAR
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("invitar")
      .setDescription("Muestra el enlace para invitar el bot"),

    async execute(interaction, client) {
      const enlace =
        `https://discord.com/oauth2/authorize?client_id=${client.user.id}` +
        `&permissions=8&scope=bot%20applications.commands`;

      await interaction.reply(
        `🔗 **Invita a DARK FF V1:**\n${enlace}`
      );
    }
  },

  // ================================
  // /SOPORTE
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("soporte")
      .setDescription("Muestra el servidor de soporte"),

    async execute(interaction) {
      await interaction.reply(
        "🛠️ El servidor de soporte estará disponible próximamente."
      );
    }
  },

  // ================================
  // /ESTADO
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("estado")
      .setDescription("Muestra el estado del bot"),

    async execute(interaction) {
      await interaction.reply(
        "🟢 **DARK BIO FF está online y funcionando.**"
      );
    }
  },

  // ================================
  // /UPTIME
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("uptime")
      .setDescription("Muestra cuánto lleva conectado"),

    async execute(interaction, client) {
      const segundos =
        Math.floor(client.uptime / 1000);

      await interaction.reply(
        `⏱️ El bot lleva conectado **${segundos} segundos**.`
      );
    }
  },

  // ================================
  // /ESTADISTICAS
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("estadisticas")
      .setDescription("Muestra estadísticas del bot"),

    async execute(interaction, client) {
      await interaction.reply(
        `📊 **DARK FF V1**\n\n` +
        `🛡️ Servidores: **${client.guilds.cache.size}**\n` +
        `🏓 Ping: **${client.ws.ping}ms**`
      );
    }
  },

  // ================================
  // /COMANDOS
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("comandos")
      .setDescription("Muestra la lista de comandos"),

    async execute(interaction) {
      await interaction.reply(
        "📚 Usa **/ayuda** para ver todos los comandos."
      );
    }
  },

  // ================================
  // /LATENCIA
  // ================================
  {
    data: new SlashCommandBuilder()
      .setName("latencia")
      .setDescription("Muestra la latencia"),

    async execute(interaction, client) {
      await interaction.reply(
        `🏓 Latencia: **${client.ws.ping}ms**`
      );
    }
  }
];
