const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const CATEGORIA = "diversion";

// GIFs de golpes.
// No se repiten hasta haber usado todos.
const GIFS_PUSH = [
  "https://media.tenor.com/0B6JqQv7v4AAAAAC/anime-punch.gif",
  "https://media.tenor.com/6M4fV8Kx3qAAAAAC/anime-punch.gif",
  "https://media.tenor.com/8Kj3wP2nQxAAAAAC/anime-punch.gif",
  "https://media.tenor.com/Y2w9J7sLmEAAAAAC/anime-punch.gif"
];

const usados = [];

function obtenerGif() {
  const disponibles = GIFS_PUSH.filter(gif => !usados.includes(gif));

  if (disponibles.length === 0) {
    usados.length = 0;
  }

  const lista = disponibles.length > 0 ? disponibles : GIFS_PUSH;
  const gif = lista[Math.floor(Math.random() * lista.length)];

  usados.push(gif);

  return gif;
}

const comandos = [];

comandos.push({
  category: CATEGORIA,

  data: new SlashCommandBuilder()
    .setName("push")
    .setDescription("Dale un golpe a otro usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario al que quieres golpear")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    if (usuario.id === interaction.user.id) {
      return interaction.reply({
        content: "🥊 No puedes golpearte a ti mismo 😂",
        ephemeral: true
      });
    }

    if (usuario.bot) {
      return interaction.reply({
        content: "🤖 No puedes golpear a un bot.",
        ephemeral: true
      });
    }

    const gif = obtenerGif();

    const embed = new EmbedBuilder()
      .setColor(0xFF3B30)
      .setTitle("🥊 ¡PUSH!")
      .setDescription(
        `**${interaction.user.username}** le dio un golpe a **${usuario.username}** 💥`
      )
      .setImage(gif)
      .setFooter({
        text: `DARK FF V1 • Golpeado: ${usuario.username}`
      });

    const boton = new ButtonBuilder()
      .setCustomId(`push_return_${interaction.user.id}_${usuario.id}`)
      .setLabel("🔙 Regresar el golpe")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(boton);

    await interaction.reply({
      content: `${usuario}`,
      embeds: [embed],
      components: [row]
    });
  }
});

module.exports = comandos;
