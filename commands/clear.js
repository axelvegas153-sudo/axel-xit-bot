const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Elimina mensajes del canal")
    .addIntegerOption(option =>
      option.setName("cantidad")
        .setDescription("Cantidad de mensajes")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const cantidad = interaction.options.getInteger("cantidad");

    if (!interaction.channel.isTextBased()) {
      return interaction.reply({
        content: "❌ Este canal no admite mensajes.",
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const eliminados = await interaction.channel.bulkDelete(cantidad, true);

      const embed = new EmbedBuilder()
        .setTitle("🧹 Mensajes eliminados")
        .setColor(0x5865f2)
        .setDescription(`Se eliminaron **${eliminados.size}** mensajes.`)
        .setFooter({ text: `Axel XIT • ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error en /clear:", error);

      await interaction.editReply({
        content: "❌ No pude eliminar los mensajes."
      });
    }
  }
};
