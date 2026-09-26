const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("Muestra información detallada de un rol")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("El rol que quieres consultar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    const miembros = rol.members?.size ?? 0;

    const embed = new EmbedBuilder()
      .setTitle(`🎭 Información del rol`)
      .setColor(rol.color || 0x5865f2)
      .addFields(
        {
          name: "📛 Nombre",
          value: rol.name,
          inline: true
        },
        {
          name: "🆔 ID",
          value: rol.id,
          inline: true
        },
        {
          name: "👥 Miembros",
          value: `${miembros}`,
          inline: true
        },
        {
          name: "📌 Posición",
          value: `${rol.position}`,
          inline: true
        },
        {
          name: "🔐 Administrable",
          value: rol.managed ? "❌ Sí, es gestionado" : "✅ No",
          inline: true
        },
        {
          name: "🔗 Mención",
          value: `<@&${rol.id}>`,
          inline: true
        }
      )
      .setFooter({
        text: "Axel XIT • Información de roles"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
