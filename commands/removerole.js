const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removerole")
    .setDescription("Quita un rol a un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol que quieres quitar")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const rol = interaction.options.getRole("rol");

    const miembro = await interaction.guild.members.fetch(usuario.id);

    try {
      await miembro.roles.remove(rol);

      await interaction.reply(
        `✅ Se quitó ${rol} de **${miembro.user.tag}**.`
      );
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ No pude quitar el rol.",
        ephemeral: true
      });
    }
  }
};
