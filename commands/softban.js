const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("softban")
    .setDescription("Banea y elimina los mensajes recientes de un usuario")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setStringOption(option =>
      option.setName("razon")
        .setDescription("Razón")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const razon = interaction.options.getString("razon") || "Sin razón especificada";

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro || !miembro.bannable) {
      return interaction.reply({
        content: "❌ No puedo aplicar softban a ese usuario.",
        ephemeral: true
      });
    }

    await miembro.ban({
      deleteMessageSeconds: 86400,
      reason: razon
    });

    await interaction.guild.members.unban(
      usuario.id,
      `Softban realizado por ${interaction.user.tag}`
    );

    const embed = new EmbedBuilder()
      .setTitle("🧹 Softban realizado")
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
