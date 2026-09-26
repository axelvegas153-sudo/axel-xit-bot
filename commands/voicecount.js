const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("voicecount")
    .setDescription("Cuenta los usuarios conectados a canales de voz"),

  async execute(interaction) {
    const usuarios = interaction.guild.voiceStates.cache.filter(
      voice => voice.channel
    ).size;

    await interaction.reply(
      `🔊 Actualmente hay **${usuarios}** usuarios conectados a voz.`
    );
  }
};
