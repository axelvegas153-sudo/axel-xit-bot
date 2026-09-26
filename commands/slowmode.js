const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Configura el modo lento del canal")
    .addIntegerOption(option =>
      option.setName("segundos")
        .setDescription("Segundos entre mensajes")
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const segundos = interaction.options.getInteger("segundos");

    if (!interaction.channel.setRateLimitPerUser) {
      return interaction.reply({
        content: "❌ Este canal no permite configurar modo lento.",
        ephemeral: true
      });
    }

    await interaction.channel.setRateLimitPerUser(segundos);

    const embed = new EmbedBuilder()
      .setTitle("🐌 Modo lento actualizado")
      .setColor(0x5865f2)
      .setDescription(
        segundos === 0
          ? "El modo lento ha sido **desactivado**."
          : `El modo lento ahora es de **${segundos} segundos**.`
      )
      .setTimestamp()
      .setFooter({ text: "Axel XIT • Moderación" });

    await interaction.reply({ embeds: [embed] });
  }
};
