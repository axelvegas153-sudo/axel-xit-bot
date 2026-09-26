const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("channelid")
    .setDescription("Muestra el ID de un canal")
    .addChannelOption(option =>
      option
        .setName("canal")
        .setDescription("Canal")
        .setRequired(false)
    ),

  async execute(interaction) {
    const canal =
      interaction.options.getChannel("canal") || interaction.channel;

    await interaction.reply(
      `📺 El ID de ${canal} es:\n\`${canal.id}\``
    );
  }
};
