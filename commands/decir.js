const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("decir")
    .setDescription("Hace que el bot diga un mensaje")
    .addStringOption(option =>
      option
        .setName("mensaje")
        .setDescription("Mensaje que quieres enviar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const mensaje = interaction.options.getString("mensaje");

    await interaction.reply({
      content: mensaje
    });
  }
};
