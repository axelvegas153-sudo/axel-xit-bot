const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nick")
    .setDescription("Cambia el apodo de un miembro")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("apodo")
        .setDescription("Nuevo apodo")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const apodo = interaction.options.getString("apodo");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Ese usuario no está en el servidor.",
        ephemeral: true
      });
    }

    if (!miembro.manageable) {
      return interaction.reply({
        content: "❌ No puedo cambiar el apodo de ese usuario.",
        ephemeral: true
      });
    }

    await miembro.setNickname(apodo || null);

    const embed = new EmbedBuilder()
      .setTitle("✏️ Apodo actualizado")
      .setColor(0x5865f2)
      .setDescription(
        apodo
          ? `El nuevo apodo de ${usuario} es **${apodo}**.`
          : `Se eliminó el apodo de ${usuario}.`
      )
      .setFooter({ text: "Axel XIT • Moderación" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
