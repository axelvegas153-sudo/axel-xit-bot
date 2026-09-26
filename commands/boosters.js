const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("boosters")
    .setDescription("Muestra los boosters del servidor"),

  async execute(interaction) {
    const boosters = interaction.guild.members.cache.filter(
      member => member.premiumSince
    );

    const lista = boosters.size
      ? boosters.map(member => `• ${member.user.tag}`).slice(0, 40).join("\n")
      : "No hay boosters actualmente.";

    const embed = new EmbedBuilder()
      .setTitle("🚀 Boosters del servidor")
      .setDescription(lista)
      .addFields({
        name: "Total",
        value: `${boosters.size}`,
        inline: true
      })
      .setColor(0xF47FFF);

    await interaction.reply({ embeds: [embed] });
  }
};
