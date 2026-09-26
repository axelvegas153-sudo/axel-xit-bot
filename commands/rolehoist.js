const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rolehoist")
    .setDescription("Muestra si un rol aparece separado en la lista de miembros")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    await interaction.reply(
      `📌 El rol **${rol.name}** ${rol.hoist ? "sí" : "no"} aparece separado en la lista de miembros.`
    );
  }
};
