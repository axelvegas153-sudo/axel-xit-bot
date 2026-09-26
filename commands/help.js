const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Muestra el centro de ayuda de Axel XIT"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🤖 Axel XIT")
      .setDescription(
        "Bienvenido al centro de ayuda.\n\n" +
        "Selecciona una categoría en el menú para ver sus comandos."
      )
      .addFields(
        {
          name: "🧠 IA",
          value: "Inteligencia artificial y herramientas.",
          inline: true
        },
        {
          name: "🛡️ Moderación",
          value: "Herramientas para administrar el servidor.",
          inline: true
        },
        {
          name: "🤖 AutoMod",
          value: "Protección automática del servidor.",
          inline: true
        },
        {
          name: "👋 Bienvenida",
          value: "Configura entradas y despedidas.",
          inline: true
        },
        {
          name: "🎫 Tickets",
          value: "Sistema completo de soporte.",
          inline: true
        },
        {
          name: "🎁 Giveaways",
          value: "Crea y administra sorteos.",
          inline: true
        },
        {
          name: "💰 Economía",
          value: "Dinero virtual, tienda y recompensas.",
          inline: true
        },
        {
          name: "⭐ Niveles",
          value: "XP, niveles y recompensas.",
          inline: true
        },
        {
          name: "😂 Diversión",
          value: "Juegos, memes y comandos sociales.",
          inline: true
        },
        {
          name: "🎵 Música",
          value: "Reproduce y controla música.",
          inline: true
        },
        {
          name: "👤 Perfiles",
          value: "Perfiles, estadísticas e información.",
          inline: true
        },
        {
          name: "⚙️ Configuración",
          value: "Configura Axel XIT en tu servidor.",
          inline: true
        }
      )
      .setFooter({
        text: "Axel XIT • Centro de comandos"
      });

    const menu = new StringSelectMenuBuilder()
      .setCustomId("help_category")
      .setPlaceholder("Selecciona una categoría")
      .addOptions([
        {
          label: "Inteligencia Artificial",
          description: "Comandos de IA",
          value: "ia",
          emoji: "🧠"
        },
        {
          label: "Moderación",
          description: "Administración del servidor",
          value: "moderacion",
          emoji: "🛡️"
        },
        {
          label: "AutoMod",
          description: "Protección automática",
          value: "automod",
          emoji: "🤖"
        },
        {
          label: "Bienvenida",
          description: "Bienvenidas y despedidas",
          value: "bienvenida",
          emoji: "👋"
        },
        {
          label: "Tickets",
          description: "Sistema de soporte",
          value: "tickets",
          emoji: "🎫"
        },
        {
          label: "Giveaways",
          description: "Sorteos y premios",
          value: "giveaways",
          emoji: "🎁"
        },
        {
          label: "Economía",
          description: "Economía y tienda",
          value: "economia",
          emoji: "💰"
        },
        {
          label: "Niveles",
          description: "XP y recompensas",
          value: "niveles",
          emoji: "⭐"
        },
        {
          label: "Diversión",
          description: "Juegos y diversión",
          value: "diversion",
          emoji: "😂"
        },
        {
          label: "Música",
          description: "Sistema de música",
          value: "musica",
          emoji: "🎵"
        },
        {
          label: "Perfiles",
          description: "Perfiles de usuarios",
          value: "perfiles",
          emoji: "👤"
        },
        {
          label: "Configuración",
          description: "Configuración del bot",
          value: "configuracion",
          emoji: "⚙️"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};
