const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName("nivel")
      .setDescription("Muestra tu nivel"),

    async execute(interaction) {
      await interaction.reply(
        `📊 **${interaction.user.username}**\n⭐ Nivel: **1**\n✨ XP: **0 / 100**`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("perfil")
      .setDescription("Muestra tu perfil"),

    async execute(interaction) {
      const embed = new EmbedBuilder()
        .setTitle("👤 PERFIL — DARK FF V1")
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: "👤 Usuario", value: `${interaction.user}`, inline: true },
          { name: "⭐ Nivel", value: "1", inline: true },
          { name: "✨ XP", value: "0 / 100", inline: true }
        )
        .setFooter({ text: "DARK FF V1" });

      await interaction.reply({ embeds: [embed] });
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("xp")
      .setDescription("Muestra tu XP"),

    async execute(interaction) {
      await interaction.reply(
        `✨ **${interaction.user.username}**, tienes **0 XP**.`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("rangos")
      .setDescription("Muestra los rangos de nivel"),

    async execute(interaction) {
      await interaction.reply(
        "🏆 **RANGOS DARK FF V1**\n\n" +
        "⭐ Nivel 1 — Novato\n" +
        "🔥 Nivel 5 — Jugador\n" +
        "💎 Nivel 10 — Élite\n" +
        "👑 Nivel 20 — Experto\n" +
        "⚡ Nivel 50 — Leyenda"
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("rankingxp")
      .setDescription("Muestra el ranking de XP"),

    async execute(interaction) {
      await interaction.reply(
        "🏆 **RANKING XP**\n\n" +
        "🥇 Próximamente: sistema de XP guardado.\n" +
        "📈 El ranking se actualizará automáticamente."
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("top")
      .setDescription("Muestra el top de niveles"),

    async execute(interaction) {
      await interaction.reply(
        "🏆 **TOP DE NIVELES — DARK FF V1**\n\n" +
        "🥇 Sin datos todavía.\n" +
        "✨ ¡Empieza a ganar XP!"
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("recompensas")
      .setDescription("Muestra las recompensas"),

    async execute(interaction) {
      await interaction.reply(
        "🎁 **RECOMPENSAS**\n\n" +
        "⭐ Nivel 5 → Recompensa básica\n" +
        "🔥 Nivel 10 → Recompensa especial\n" +
        "💎 Nivel 20 → Recompensa épica\n" +
        "👑 Nivel 50 → Recompensa legendaria"
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("daily")
      .setDescription("Reclama tu recompensa diaria"),

    async execute(interaction) {
      await interaction.reply(
        `🎁 **${interaction.user.username}**, recibiste tu recompensa diaria de **100 XP**.`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("trabajar")
      .setDescription("Trabaja para ganar XP"),

    async execute(interaction) {
      const xp = Math.floor(Math.random() * 101) + 50;

      await interaction.reply(
        `💼 **${interaction.user.username}** trabajó y ganó **${xp} XP**.`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("buscar")
      .setDescription("Busca una recompensa"),

    async execute(interaction) {
      const resultados = [
        "💰 Encontraste 50 XP.",
        "✨ Encontraste 100 XP.",
        "🎁 Encontraste una recompensa.",
        "😢 No encontraste nada."
      ];

      await interaction.reply(
        resultados[Math.floor(Math.random() * resultados.length)]
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("logros")
      .setDescription("Muestra tus logros"),

    async execute(interaction) {
      await interaction.reply(
        "🏅 **LOGROS**\n\n" +
        "🔒 Primer mensaje — Bloqueado\n" +
        "🔒 Nivel 10 — Bloqueado\n" +
        "🔒 Nivel 20 — Bloqueado\n" +
        "🔒 Leyenda — Bloqueado"
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("logro")
      .setDescription("Muestra un logro"),

    async execute(interaction) {
      await interaction.reply(
        "🏅 **Primer paso**\n💬 Envía tu primer mensaje en el servidor."
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("leaderboard")
      .setDescription("Muestra la tabla de posiciones"),

    async execute(interaction) {
      await interaction.reply(
        "📊 **LEADERBOARD — DARK FF V1**\n\n" +
        "🥇 Sin jugadores registrados todavía."
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("resetxp")
      .setDescription("Reinicia la XP de un usuario"),

    async execute(interaction) {
      await interaction.reply(
        "♻️ Sistema de XP reiniciado para el usuario seleccionado."
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("darxp")
      .setDescription("Da XP a un usuario")
      .addUserOption(o =>
        o.setName("usuario").setDescription("Usuario").setRequired(true)
      )
      .addIntegerOption(o =>
        o.setName("cantidad").setDescription("Cantidad de XP").setRequired(true)
      ),

    async execute(interaction) {
      const usuario = interaction.options.getUser("usuario");
      const cantidad = interaction.options.getInteger("cantidad");

      await interaction.reply(
        `✨ **${usuario.username}** recibió **${cantidad} XP**.`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("quitarxp")
      .setDescription("Quita XP a un usuario")
      .addUserOption(o =>
        o.setName("usuario").setDescription("Usuario").setRequired(true)
      )
      .addIntegerOption(o =>
        o.setName("cantidad").setDescription("Cantidad de XP").setRequired(true)
      ),

    async execute(interaction) {
      const usuario = interaction.options.getUser("usuario");
      const cantidad = interaction.options.getInteger("cantidad");

      await interaction.reply(
        `➖ Se quitaron **${cantidad} XP** a **${usuario.username}**.`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("nivelconfig")
      .setDescription("Configura el sistema de niveles"),

    async execute(interaction) {
      await interaction.reply(
        "⚙️ **Configuración de niveles**\n\nEl sistema de niveles está activo."
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("mensajenivel")
      .setDescription("Configura el mensaje de subida de nivel"),

    async execute(interaction) {
      await interaction.reply(
        "📢 El mensaje de subida de nivel está configurado para **DARK FF V1**."
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("rolnivel")
      .setDescription("Configura roles por nivel"),

    async execute(interaction) {
      await interaction.reply(
        "🎖️ Sistema de roles por nivel preparado para configurarse."
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("xpconfig")
      .setDescription("Configura la cantidad de XP"),

    async execute(interaction) {
      await interaction.reply(
        "⚙️ **XP CONFIG**\n\nLa configuración de XP está activa."
      );
    }
  }
];
