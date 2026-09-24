const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
  .setName("push")
  .setDescription("🤜 Empuja a alguien")
  .addUserOption(option =>
      option.setName("usuario")
      .setDescription("A quien quieres empujar")
      .setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser("usuario");

    const gifs = [
      "https://media.giphy.com/media/l3vR85PnGsBwu1PFK/giphy.gif",
      "https://media.giphy.com/media/3oGRFZ1aZ7pV0fE2yE/giphy.gif",
      "https://media.giphy.com/media/xT9IgDEI1PIoCYmkEw/giphy.gif",
      "https://media.giphy.com/media/11sBLVxU9sEoSQ/giphy.gif"
    ];

    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

    const embed = new EmbedBuilder()
    .setDescription(`**${interaction.user.username}** empujó a **${user.username}** 🤜💥`)
    .setImage(randomGif)
    .setColor("Red");

    await interaction.reply({ embeds: [embed] });
  }
};
