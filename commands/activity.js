const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("activity")
    .setDescription("Muestra las actividades visibles de un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") || interaction.user;

    const miembro = await interaction.guild.members.fetch(usuario.id);

    const actividades = miembro.presence?.activities || [];

    if (!actividades.length) {
      return interaction.reply(
        `🎮 **${usuario.tag}** no tiene actividades visibles actualmente.`
      );
    }

    const lista = actividades
      .map(activity => `• **${activity.name}** — ${activity.type}`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`🎮 Actividad de ${usuario.username}`)
      .setDescription(lista)
      .setColor(0x5865F2);

    await interaction.reply({ embeds: [embed] });
  }
};
