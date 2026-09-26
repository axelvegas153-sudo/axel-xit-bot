const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("memberlist")
    .setDescription("Muestra una lista de los miembros del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    await guild.members.fetch();

    const miembros = guild.members.cache
      .sort((a, b) => a.user.username.localeCompare(b.user.username));

    if (miembros.size === 0) {
      return interaction.reply({
        content: "❌ No se encontraron miembros.",
        ephemeral: true
      });
    }

    const lista = miembros
      .map(member => {
        const etiqueta = member.user.bot ? "🤖" : "👤";
        return `${etiqueta} ${member} — \`${member.user.username}\``;
      })
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`👥 Miembros de ${guild.name}`)
      .setDescription(
        lista.length > 4000
          ? `${lista.slice(0, 3900)}\n\n... y más miembros.`
          : lista
      )
      .setColor(0x5865f2)
      .addFields({
        name: "📊 Total",
        value: `${miembros.size}`,
        inline: true
      })
      .setFooter({
        text: "Axel XIT • Lista de miembros"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
