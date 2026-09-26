const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roleid")
    .setDescription("Muestra el ID de un rol")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    ),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    await interaction.reply(
      `🎭 El ID de ${rol} es:\n\`${rol.id}\``
    );
  }
};
