const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Advierte a un miembro")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Usuario que quieres advertir")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("razon")
        .setDescription("Razón de la advertencia")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const razon = interaction.options.getString("razon") || "Sin razón especificada";

    if (usuario.id === interaction.user.id) {
      return interaction.reply({
        content: "❌ No puedes advertirte a ti mismo.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("⚠️ Advertencia")
      .setColor(0x5865f2)
      .addFields(
        { name: "👤 Usuario", value: `${usuario}`, inline: true },
        { name: "📝 Razón", value: razon, inline: false },
        { name: "🛡️ Moderador", value: `${interaction.user}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: "Axel XIT • Moderación" });

    await interaction.reply({ embeds: [embed] });
  }
};
