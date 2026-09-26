const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rolecount")
    .setDescription("Muestra cuántos roles tiene el servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    const rolesPersonalizados = guild.roles.cache.filter(
      role => role.id !== guild.id
    );

    const total = guild.roles.cache.size;
    const personalizados = rolesPersonalizados.size;
    const gestionados = rolesPersonalizados.filter(
      role => role.managed
    ).size;

    const embed = new EmbedBuilder()
      .setTitle(`🎭 Cantidad de roles`)
      .setDescription(
        `Aquí tienes las estadísticas de roles de **${guild.name}**.`
      )
      .setColor(0x5865f2)
      .addFields(
        {
          name: "🎭 Total",
          value: `${total}`,
          inline: true
        },
        {
          name: "🛠️ Personalizados",
          value: `${personalizados}`,
          inline: true
        },
        {
          name: "🔗 Gestionados",
          value: `${gestionados}`,
          inline: true
        }
      )
      .setFooter({
        text: "Axel XIT • Estadísticas de roles"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
