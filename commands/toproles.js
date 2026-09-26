const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("toproles")
    .setDescription("Muestra los roles con más miembros"),

  async execute(interaction) {
    const roles = interaction.guild.roles.cache
      .filter(role => !role.managed && role.id !== interaction.guild.id)
      .sort((a, b) => b.members.size - a.members.size)
      .first(10);

    if (!roles.length) {
      return interaction.reply("❌ No hay roles disponibles.");
    }

    const lista = roles
      .map((role, index) =>
        `**${index + 1}.** ${role} — ${role.members.size} miembros`
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("🎭 Roles más utilizados")
      .setDescription(lista)
      .setColor(0x5865F2);

    await interaction.reply({ embeds: [embed] });
  }
};
