const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Quita el baneo de un usuario")
    .addStringOption(option =>
      option.setName("id")
        .setDescription("ID del usuario baneado")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const id = interaction.options.getString("id");

    if (!/^\d{17,20}$/.test(id)) {
      return interaction.reply({
        content: "❌ Esa no parece una ID de Discord válida.",
        ephemeral: true
      });
    }

    const ban = await interaction.guild.bans.fetch(id).catch(() => null);

    if (!ban) {
      return interaction.reply({
        content: "❌ Ese usuario no está baneado o no pude encontrarlo.",
        ephemeral: true
      });
    }

    await interaction.guild.members.unban(id, `Unban realizado por ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setTitle("🔓 Usuario desbaneado")
      .setColor(0x5865f2)
      .addFields(
        { name: "👤 Usuario", value: `${ban.user.tag}`, inline: true },
        { name: "🆔 ID", value: id, inline: true },
        { name: "🛡️ Moderador", value: `${interaction.user}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: "Axel XIT • Moderación" });

    await interaction.reply({ embeds: [embed] });
  }
};
