const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsa a un miembro del servidor")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Usuario que quieres expulsar")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("razon")
        .setDescription("Razón de la expulsión")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const razon = interaction.options.getString("razon") || "Sin razón especificada";

    const miembro = await interaction.guild.members.fetch(usuario.id).catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Ese usuario no está en el servidor.",
        ephemeral: true
      });
    }

    if (!miembro.kickable) {
      return interaction.reply({
        content: "❌ No puedo expulsar a ese usuario. Puede tener un rol superior o ser el propietario.",
        ephemeral: true
      });
    }

    if (miembro.id === interaction.user.id) {
      return interaction.reply({
        content: "❌ No puedes expulsarte a ti mismo.",
        ephemeral: true
      });
    }

    await miembro.kick(razon);

    const embed = new EmbedBuilder()
      .setTitle("👢 Usuario expulsado")
      .setColor(0x5865f2)
      .addFields(
        { name: "👤 Usuario", value: `${usuario}`, inline: true },
        { name: "📝 Razón", value: razon, inline: true },
        { name: "🛡️ Moderador", value: `${interaction.user}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: "Axel XIT • Moderación" });

    await interaction.reply({ embeds: [embed] });
  }
};
