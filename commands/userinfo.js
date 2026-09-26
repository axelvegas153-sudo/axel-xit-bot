const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Muestra información de un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario del que quieres ver la información")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") || interaction.user;

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    const roles = miembro
      ? miembro.roles.cache
          .filter(role => role.id !== interaction.guild.id)
          .sort((a, b) => b.position - a.position)
          .map(role => role.toString())
          .slice(0, 10)
          .join(" ") || "Sin roles"
      : "No disponible";

    const embed = new EmbedBuilder()
      .setTitle(`👤 ${usuario.username}`)
      .setThumbnail(usuario.displayAvatarURL({ size: 512 }))
      .addFields(
        {
          name: "🆔 ID",
          value: `\`${usuario.id}\``,
          inline: true
        },
        {
          name: "🤖 Bot",
          value: usuario.bot ? "Sí" : "No",
          inline: true
        },
        {
          name: "📅 Cuenta creada",
          value: `<t:${Math.floor(usuario.createdTimestamp / 1000)}:F>`,
          inline: false
        },
        {
          name: "🎭 Roles",
          value: roles,
          inline: false
        }
      )
      .setFooter({
        text: "Axel XIT • Información del usuario"
      })
      .setTimestamp();

    if (miembro) {
      embed.addFields({
        name: "📥 Entró al servidor",
        value: miembro.joinedTimestamp
          ? `<t:${Math.floor(miembro.joinedTimestamp / 1000)}:F>`
          : "No disponible",
        inline: false
      });
    }

    await interaction.reply({
      embeds: [embed]
    });
  }
};
