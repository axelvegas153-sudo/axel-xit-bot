const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botlist")
    .setDescription("Muestra todos los bots del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    await guild.members.fetch();

    const bots = guild.members.cache
      .filter(member => member.user.bot)
      .sort((a, b) =>
        a.user.username.localeCompare(b.user.username)
      );

    if (bots.size === 0) {
      return interaction.reply({
        content: "🤖 No hay bots en este servidor.",
        ephemeral: true
      });
    }

    const lista = bots
      .map(
        member =>
          `🤖 ${member} — \`${member.user.username}\``
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`🤖 Bots de ${guild.name}`)
      .setDescription(
        lista.length > 4000
          ? `${lista.slice(0, 3900)}\n\n... y más bots.`
          : lista
      )
      .setColor(0x5865f2)
      .addFields({
        name: "📊 Total de bots",
        value: `${bots.size}`,
        inline: true
      })
      .setFooter({
        text: "Axel XIT • Lista de bots"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
