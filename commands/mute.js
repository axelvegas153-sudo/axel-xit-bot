const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Aplica timeout a un miembro")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("minutos")
        .setDescription("Duración")
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const minutos = interaction.options.getInteger("minutos");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro || !miembro.moderatable) {
      return interaction.reply({
        content: "❌ No puedo aplicar mute a ese usuario.",
        ephemeral: true
      });
    }

    await miembro.timeout(
      minutos * 60 * 1000,
      `Mute por ${interaction.user.tag}`
    );

    const embed = new EmbedBuilder()
      .setTitle("🔇 Usuario silenciado")
      .setColor(0x5865f2)
      .addFields(
        { name: "👤 Usuario", value: `${usuario}`, inline: true },
        { name: "⏱️ Duración", value: `${minutos} minutos`, inline: true },
        { name: "🛡️ Moderador", value: `${interaction.user}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: "Axel XIT • Moderación" });

    await interaction.reply({ embeds: [embed] });
  }
};
