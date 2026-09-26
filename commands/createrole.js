const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("createrole")
    .setDescription("Crea un nuevo rol")
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nombre del rol")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("color")
        .setDescription("Color HEX, ejemplo: #ff0000")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const nombre = interaction.options.getString("nombre");
    const color = interaction.options.getString("color") || "#5865F2";

    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return interaction.reply({
        content: "❌ El color debe tener formato HEX, por ejemplo `#ff0000`.",
        ephemeral: true
      });
    }

    try {
      const rol = await interaction.guild.roles.create({
        name: nombre,
        color,
        reason: `Rol creado por ${interaction.user.tag}`
      });

      await interaction.reply(`✅ Rol **${rol.name}** creado correctamente.`);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ No pude crear el rol.",
        ephemeral: true
      });
    }
  }
};
