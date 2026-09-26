const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Desbloquea el canal actual")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const everyone = interaction.guild.roles.everyone;

    await interaction.channel.permissionOverwrites.edit(everyone, {
      SendMessages: null
    });

    const embed = new EmbedBuilder()
      .setTitle("🔓 Canal desbloqueado")
      .setDescription("Este canal ha sido desbloqueado.")
      .setColor(0x5865f2)
      .setFooter({ text: "Axel XIT • Moderación" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
