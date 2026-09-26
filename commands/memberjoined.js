const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("memberjoined")
    .setDescription("Muestra cuándo entró un miembro al servidor")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres consultar")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") || interaction.user;

    const miembro = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    if (!miembro) {
      return interaction.reply({
        content: "❌ Ese usuario no está en este servidor.",
        ephemeral: true
      });
    }

    const timestamp = miembro.joinedTimestamp
      ? Math.floor(miembro.joinedTimestamp / 1000)
      : null;

    const embed = new EmbedBuilder()
      .setTitle(`📅 Entrada de ${usuario.username}`)
      .setThumbnail(usuario.displayAvatarURL({ size: 512 }))
      .setColor(0x5865f2)
      .addFields({
        name: "📥 Se unió",
        value: timestamp
          ? `<t:${timestamp}:F>\n<t:${timestamp}:R>`
          : "No disponible"
      })
      .setFooter({
        text: "Axel XIT • Información de miembros"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
