const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roleusers")
    .setDescription("Muestra los usuarios que tienen un rol")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    ),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    await interaction.guild.members.fetch();

    const miembros = interaction.guild.members.cache
      .filter(member => member.roles.cache.has(rol.id));

    if (miembros.size === 0) {
      return interaction.reply(
        `👥 Nadie tiene actualmente el rol ${rol}.`
      );
    }

    const lista = miembros
      .map(member => `• ${member.user.tag}`)
      .slice(0, 40)
      .join("\n");

    const extra = miembros.size > 40
      ? `\n\n... y ${miembros.size - 40} más.`
      : "";

    await interaction.reply(
      `👥 **Usuarios con ${rol} (${miembros.size})**\n\n${lista}${extra}`
    );
  }
};
