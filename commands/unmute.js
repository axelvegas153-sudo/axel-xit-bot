const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Quita el timeout de un miembro")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Ese usuario no está en el servidor.",
        ephemeral: true
      });
    }

    await miembro.timeout(null, `Mute retirado por ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setTitle("🔊 Usuario desilenciado")
      .setColor(0x5865f2)
      .addFields(
        { name: "👤 Usuario", value: `${usuario}`, inline: true },
        { name: "🛡️ Moderador", value: `${interaction.user}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: "Axel XIT • Moderación" });

    await interaction.reply({ embeds: [embed] });
  }
};
