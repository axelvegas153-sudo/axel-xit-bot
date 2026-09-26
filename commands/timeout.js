const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Aplica un timeout a un miembro")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("minutos")
        .setDescription("Duración en minutos")
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("razon")
        .setDescription("Razón")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const minutos = interaction.options.getInteger("minutos");
    const razon = interaction.options.getString("razon") || "Sin razón especificada";

    const miembro = await interaction.guild.members.fetch(usuario.id).catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Ese usuario no está en el servidor.",
        ephemeral: true
      });
    }

    if (!miembro.moderatable) {
      return interaction.reply({
        content: "❌ No puedo aplicar timeout a ese usuario.",
        ephemeral: true
      });
    }

    if (miembro.id === interaction.user.id) {
      return interaction.reply({
        content: "❌ No puedes aplicarte timeout a ti mismo.",
        ephemeral: true
      });
    }

    await miembro.timeout(minutos * 60 * 1000, razon);

    const embed = new EmbedBuilder()
      .setTitle("⏱️ Timeout aplicado")
      .setColor(0x5865f2)
      .addFields(
        { name: "👤 Usuario", value: `${usuario}`, inline: true },
        { name: "⏳ Duración", value: `${minutos} minutos`, inline: true },
        { name: "📝 Razón", value: razon, inline: false },
        { name: "🛡️ Moderador", value: `${interaction.user}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: "Axel XIT • Moderación" });

    await interaction.reply({ embeds: [embed] });
  }
};
