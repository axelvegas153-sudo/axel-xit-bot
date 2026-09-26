const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("online")
    .setDescription("Muestra cuántos miembros están activos"),

  async execute(interaction) {
    await interaction.guild.members.fetch();

    const online = interaction.guild.members.cache.filter(
      member =>
        member.presence?.status &&
        member.presence.status !== "offline"
    ).size;

    await interaction.reply(
      `🟢 Hay aproximadamente **${online}** miembros activos actualmente.`
    );
  }
};
