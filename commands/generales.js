const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName("ayuda")
      .setDescription("Muestra todos los comandos"),

    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setTitle("📚 DARK BIO FF")
        .setDescription(
          "**Comandos disponibles**\n\n" +
          "🛠️ **Generales**\n" +
          "`/ayuda` `/ping` `/botinfo` `/servidor` `/usuario` `/avatar`\n" +
          "`/banner` `/icono` `/roles` `/canales` `/fecha` `/hora`\n" +
          "`/invitar` `/soporte` `/estado` `/uptime` `/estadisticas`\n" +
          "`/github` `/comandos` `/latencia`\n\n" +

          "🔨 **Moderación**\n" +
          "`/ban` `/desban` `/kick` `/timeout` `/untimeout`\n" +
          "`/warn` `/warnings` `/clear` `/slowmode` `/lock` `/unlock`\n" +
          "`/nick` `/addrol` `/delrol` `/purge` `/anuncio` `/reglas` `/modlogs`\n\n" +

          "🎮 **Diversión**\n" +
          "`/8ball` `/dado` `/moneda` `/ppt` `/compatibilidad`\n" +
          "`/broma` `/reto` `/pregunta` `/eleccion` `/random`\n" +
          "`/frase` `/decir` `/color`\n\n" +

          "⭐ **Niveles**\n" +
          "`/nivel` `/perfil` `/xp` `/rangos` `/rankingxp` `/top`\n" +
          "`/recompensas` `/diario` `/trabajar` `/logros` `/logro`\n" +
          "`/darxp` `/quitarxp` `/resetxp` `/nivelconfig`\n" +
          "`/mensajenivel` `/rolnivel` `/xpconfig`\n\n" +

          "📋 **Información**\n" +
          "`/usuarioinfo` `/serverinfo` `/roleinfo` `/channelinfo`\n" +
          "`/emojiinfo` `/inviteinfo` `/membercount` `/boosts` `/boosters`\n" +
          "`/joined` `/created` `/permissions` `/rolelist` `/channellist`\n" +
          "`/servericon` `/serverbanner` `/serverowner` `/botservers` `/botstats`"
        )
        .setColor(0x5865F2)
        .setFooter({
          text: "DARK BIO FF • Bot público"
        });

      await interaction.reply({ embeds: [embed] });
    }
  },

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

  {
    data: new SlashCommandBuilder()
      .setName("botinfo")
      .setDescription("Información del bot"),

    async execute(interaction, client) {
      const embed = new EmbedBuilder()
        .setTitle("🤖 DARK BIO FF")
        .setDescription(
          `**Bot:** ${client.user.tag}\n` +
          `**ID:** ${client.user.id}\n` +
          `**Servidores:** ${client.guilds.cache.size}\n` +
          `**Comandos:** ${client.commands.size}`
        )
        .setColor(0x5865F2);

      await interaction.reply({ embeds: [embed] });
    }
  },

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

      await interaction.reply({ embeds: [embed] });
    }
  },

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

  {
    data: new SlashCommandBuilder()
      .setName("fecha")
      .setDescription("Muestra la fecha actual"),

    async execute(interaction) {
      await interaction.reply(
        `📅 ${new Date().toLocaleDateString("es-CO")}`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("hora")
      .setDescription("Muestra la hora actual"),

    async execute(interaction) {
      await interaction.reply(
        `🕐 ${new Date().toLocaleTimeString("es-CO")}`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("estado")
      .setDescription("Muestra el estado del bot"),

    async execute(interaction) {
      await interaction.reply("🟢 **DARK BIO FF está online.**");
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("uptime")
      .setDescription("Muestra cuánto lleva conectado"),

    async execute(interaction, client) {
      const segundos = Math.floor(client.uptime / 1000);

      await interaction.reply(
        `⏱️ El bot lleva conectado **${segundos} segundos**.`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("estadisticas")
      .setDescription("Muestra estadísticas del bot"),

    async execute(interaction, client) {
      await interaction.reply(
        `📊 **Estadísticas**\n\n` +
        `🛡️ Servidores: **${client.guilds.cache.size}**\n` +
        `⚡ Ping: **${client.ws.ping}ms**`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("comandos")
      .setDescription("Muestra la lista de comandos"),

    async execute(interaction) {
      await interaction.reply(
        "📚 Usa **/ayuda** para ver todos los comandos de DARK BIO FF."
      );
    }
  },

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
