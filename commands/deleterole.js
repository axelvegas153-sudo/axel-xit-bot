const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deleterole")
    .setDescription("Elimina un rol")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol que quieres eliminar")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    if (rol.managed) {
      return interaction.reply({
        content: "❌ No puedes eliminar un rol administrado por una integración.",
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
      await rol.delete(`Eliminado por ${interaction.user.tag}`);

      await interaction.reply(`🗑️ Rol **${rol.name}** eliminado.`);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ No pude eliminar ese rol.",
        ephemeral: true
      });
    }
  }
};
