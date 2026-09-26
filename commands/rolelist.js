const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rolelist")
    .setDescription("Muestra la lista de roles del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    const roles = guild.roles.cache
      .filter(role => role.id !== guild.id)
      .sort((a, b) => b.position - a.position);

    if (roles.size === 0) {
      return interaction.reply({
        content: "❌ Este servidor no tiene roles personalizados.",
        ephemeral: true
      });
    }

    const lista = roles
      .map(role => `• ${role} — \`${role.members.size} miembros\``)
      .join("\n");

    const contenido =
      lista.length > 4000
        ? `${lista.slice(0, 3900)}\n... y más roles.`
        : lista;

    const embed = new EmbedBuilder()
      .setTitle(`🎭 Roles de ${guild.name}`)
      .setDescription(contenido)
      .setColor(0x5865f2)
      .addFields({
        name: "📊 Total",
        value: `${roles.size} roles`,
        inline: true
      })
      .setFooter({
        text: "Axel XIT • Lista de roles"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
