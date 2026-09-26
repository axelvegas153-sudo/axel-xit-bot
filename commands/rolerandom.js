const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rolerandom")
    .setDescription("Elige aleatoriamente un usuario con un rol")
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
      .filter(member => !member.user.bot && member.roles.cache.has(rol.id))
      .map(member => member);

    if (!miembros.length) {
      return interaction.reply(
        `❌ No hay usuarios disponibles con ${rol}.`
      );
    }

    const elegido = miembros[Math.floor(Math.random() * miembros.length)];

    await interaction.reply(
      `🎲 El usuario elegido con ${rol} es **${elegido.user.tag}**.`
    );
  }
};
