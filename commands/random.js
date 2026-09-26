const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("random")
    .setDescription("Genera un número aleatorio")
    .addIntegerOption(option =>
      option
        .setName("min")
        .setDescription("Número mínimo")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("max")
        .setDescription("Número máximo")
        .setRequired(true)
    ),

  async execute(interaction) {
    const min = interaction.options.getInteger("min");
    const max = interaction.options.getInteger("max");

    if (min >= max) {
      return interaction.reply({
        content: "❌ El mínimo debe ser menor que el máximo.",
        ephemeral: true
      });
    }

    const resultado =
      Math.floor(Math.random() * (max - min + 1)) + min;

    await interaction.reply(
      `🎲 Número aleatorio entre **${min}** y **${max}**:\n\n` +
      `# ${resultado}`
    );
  }
};
