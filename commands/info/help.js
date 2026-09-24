const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
  .setName("help")
  .setDescription("📜 Muestra todos los comandos del bot por categorías"),
  async execute(interaction) {
    const menu = new StringSelectMenuBuilder()
    .setCustomId("help_menu")
    .setPlaceholder("📂 Selecciona una categoría")
    .addOptions([
        { label: "Info", value: "info", emoji: "🤖", description: "Info del bot y servidor" },
        { label: "Moderación", value: "mod", emoji: "🔨", description: "Ban, kick, clear" },
        { label: "Utils", value: "utils", emoji: "⚙️", description: "Comandos útiles" },
        { label: "Economía", value: "eco", emoji: "💰", description: "Nivel y monedas" },
        { label: "Diversión", value: "fun", emoji: "🎭", description: "Push, ship, funar" },
        { label: "DARK + IA", value: "dark", emoji: "🧠", description: "IA e imagenes" },
      ]);

    const embed = new EmbedBuilder()
    .setTitle("📜 DARK FF V1 - Centro de Comandos")
    .setDescription("**Selecciona una categoría del menú de abajo**\n\nTienes 30+ comandos disponibles")
    .setColor("Purple")
    .setFooter({ text: "DARK FF Bot" });

    await interaction.reply({ 
      embeds: [embed], 
      components: [new ActionRowBuilder().addComponents(menu)] 
    });
  }
};
