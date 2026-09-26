const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("memberroles")
    .setDescription("Muestra los roles de un miembro")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres consultar")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") || interaction.user;

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Ese usuario no está en este servidor.",
        ephemeral: true
      });
    }

    const roles = miembro.roles.cache
      .filter(role => role.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position);

    const lista = roles.size
      ? roles.map(role => `${role}`).join(", ")
      : "Sin roles personalizados.";

    const embed = new EmbedBuilder()
      .setTitle(`🎭 Roles de ${usuario.username}`)
      .setThumbnail(usuario.displayAvatarURL({ size: 512 }))
      .setDescription(lista.slice(0, 4000))
      .setColor(0x5865f2)
      .setFooter({
        text: "Axel XIT • Roles"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
