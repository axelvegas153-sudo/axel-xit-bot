const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("horario")
    .setDescription("Muestra la hora actual")
    .addStringOption(option =>
      option
        .setName("zona")
        .setDescription("Zona horaria, ejemplo: America/Bogota")
        .setRequired(false)
    ),

  async execute(interaction) {
    const zona = interaction.options.getString("zona") || "America/Bogota";

    try {
      const ahora = new Intl.DateTimeFormat("es-CO", {
        timeZone: zona,
        dateStyle: "full",
        timeStyle: "medium"
      }).format(new Date());

      await interaction.reply(
        `🕐 **Hora actual**\n\n${ahora}\n\n🌎 Zona: \`${zona}\``
      );
    } catch {
      await interaction.reply({
        content: "❌ Zona horaria no válida. Ejemplo: `America/Bogota`.",
        ephemeral: true
      });
    }
  }
};
