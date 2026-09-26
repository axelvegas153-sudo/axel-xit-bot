const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("membercount")
    .setDescription("Muestra las estadísticas de miembros del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    const total = guild.memberCount;

    const bots = guild.members.cache.filter(member => member.user.bot).size;
    const humanos = guild.members.cache.filter(member => !member.user.bot).size;

    const embed = new EmbedBuilder()
      .setTitle(`👥 Miembros de ${guild.name}`)
      .setColor(0x5865f2)
      .addFields(
        {
          name: "👥 Total",
          value: `${total}`,
          inline: true
        },
        {
          name: "👤 Usuarios",
          value: `${humanos}`,
          inline: true
        },
        {
          name: "🤖 Bots",
          value: `${bots}`,
          inline: true
        }
      )
      .setFooter({
        text: "Axel XIT • Estadísticas"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
