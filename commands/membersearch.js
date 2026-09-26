const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("membersearch")
    .setDescription("Busca un miembro por nombre o usuario")
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nombre o usuario que quieres buscar")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.guild.members.fetch();

    const busqueda = interaction.options
      .getString("nombre")
      .toLowerCase();

    const encontrados = interaction.guild.members.cache.filter(member =>
      member.user.username.toLowerCase().includes(busqueda) ||
      member.displayName.toLowerCase().includes(busqueda)
    );

    if (!encontrados.size) {
      return interaction.reply({
        content: "❌ No encontré ningún miembro con ese nombre.",
        ephemeral: true
      });
    }

    const lista = encontrados
      .first(20)
      .map(member => `👤 ${member} — \`${member.user.username}\``)
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("🔎 Resultados de búsqueda")
      .setDescription(lista)
      .setColor(0x5865f2)
      .setFooter({
        text: `Axel XIT • ${encontrados.size} resultado(s)`
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
