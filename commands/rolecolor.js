const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rolecolor")
    .setDescription("Cambia el color de un rol")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("color")
        .setDescription("Color HEX, ejemplo: #00ff00")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");
    const color = interaction.options.getString("color");

    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return interaction.reply({
        content: "❌ Usa un color HEX válido, ejemplo `#00ff00`.",
        ephemeral: true
      });
    }

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
      await rol.setColor(color);

      await interaction.reply(
        `🎨 El color de **${rol.name}** ahora es \`${color}\`.`
      );
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ No pude cambiar el color.",
        ephemeral: true
      });
    }
  }
};
