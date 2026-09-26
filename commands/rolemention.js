const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rolemention")
    .setDescription("Activa o desactiva la mención de un rol")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option
        .setName("permitir")
        .setDescription("¿Permitir que el rol sea mencionado?")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");
    const permitir = interaction.options.getBoolean("permitir");

    if (rol.managed) {
      return interaction.reply({
        content: "❌ No puedes modificar un rol administrado.",
        ephemeral: true
      });
    }

    try {
      await rol.setMentionable(
        permitir,
        `Configurado por ${interaction.user.tag}`
      );

      await interaction.reply(
        `🔔 Las menciones de ${rol} ahora están **${permitir ? "activadas" : "desactivadas"}**.`
      );
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ No pude modificar la configuración del rol.",
        ephemeral: true
      });
    }
  }
};
