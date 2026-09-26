const {
  SlashCommandBuilder,
  EmbedBuilder,
  VerificationLevel
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serververification")
    .setDescription("Muestra el nivel de verificación del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    const niveles = {
      [VerificationLevel.None]: "Ninguno",
      [VerificationLevel.Low]: "Bajo",
      [VerificationLevel.Medium]: "Medio",
      [VerificationLevel.High]: "Alto",
      [VerificationLevel.VeryHigh]: "Muy alto"
    };

    const nivel = niveles[guild.verificationLevel] || "Desconocido";

    const embed = new EmbedBuilder()
      .setTitle("🔐 Verificación del servidor")
      .setColor(0x5865f2)
      .addFields({
        name: "🛡️ Nivel",
        value: nivel,
        inline: true
      })
      .setFooter({ text: "Axel XIT • Seguridad" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
