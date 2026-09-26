const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hex")
    .setDescription("Convierte un color HEX a RGB")
    .addStringOption(option =>
      option
        .setName("color")
        .setDescription("Color HEX, ejemplo: #5865F2")
        .setRequired(true)
    ),

  async execute(interaction) {
    let hex = interaction.options.getString("color").trim();

    if (hex.startsWith("#")) {
      hex = hex.slice(1);
    }

    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
      return interaction.reply({
        content: "❌ Usa un color HEX válido de 6 caracteres.",
        ephemeral: true
      });
    }

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    await interaction.reply(
      `🎨 **Conversión de color**\n\n` +
      `HEX: \`#${hex.toUpperCase()}\`\n` +
      `RGB: \`rgb(${r}, ${g}, ${b})\``
    );
  }
};
