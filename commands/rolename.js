const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rolename")
    .setDescription("Cambia el nombre de un rol")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nuevo nombre")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");
    const nombre = interaction.options.getString("nombre");

    if (rol.managed) {
      return interaction.reply({
        content: "❌ No puedes modificar un rol administrado.",
        ephemeral: true
      });
    }

    if (rol.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({
        content: "❌ Ese rol está por encima o al mismo nivel que mi rol.",
        ephemeral: true
      });
    }

    try {
      const nombreAnterior = rol.name;

      await rol.setName(nombre);

      await interaction.reply(
        `✏️ **${nombreAnterior}** ahora se llama **${rol.name}**.`
      );
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ No pude cambiar el nombre del rol.",
        ephemeral: true
      });
    }
  }
};
