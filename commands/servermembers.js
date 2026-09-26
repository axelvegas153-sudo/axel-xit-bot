const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("servermembers")
    .setDescription("Muestra una lista de miembros del servidor"),

  async execute(interaction) {
    await interaction.guild.members.fetch();

    const miembros = interaction.guild.members.cache
      .filter(member => !member.user.bot)
      .first(30);

    if (!miembros.length) {
      return interaction.reply("❌ No se encontraron miembros.");
    }

    const lista = miembros
      .map((member, index) =>
        `**${index + 1}.** ${member.user.tag}`
      )
      .join("\n");

    await interaction.reply(
      `👥 **Miembros del servidor**\n\n${lista}`
    );
  }
};
