const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Bloquea el canal actual")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const everyone = interaction.guild.roles.everyone;

    await interaction.channel.permissionOverwrites.edit(everyone, {
      SendMessages: false
    });

    const embed = new EmbedBuilder()
      .setTitle("🔒 Canal bloqueado")
      .setDescription("Este canal ha sido bloqueado.")
      .setColor(0x5865f2)
      .setFooter({ text: "Axel XIT • Moderación" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
