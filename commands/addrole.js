const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addrole")
    .setDescription("Añade un rol a un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol que quieres añadir")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const rol = interaction.options.getRole("rol");

    const miembro = await interaction.guild.members.fetch(usuario.id);

    if (rol.managed) {
      return interaction.reply({
        content: "❌ Ese rol es administrado y no se puede asignar.",
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
      await miembro.roles.add(rol);

      await interaction.reply(
        `✅ Se añadió ${rol} a **${miembro.user.tag}**.`
      );
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ No pude añadir el rol.",
        ephemeral: true
      });
    }
  }
};
