const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("firstmessage")
    .setDescription("Muestra información básica del primer mensaje visible del canal"),

  async execute(interaction) {
    try {
      const mensajes = await interaction.channel.messages.fetch({ limit: 100 });

      if (!mensajes.size) {
        return interaction.reply("❌ No encontré mensajes en este canal.");
      }

      const primero = mensajes.last();

      await interaction.reply(
        `📜 **Mensaje más antiguo encontrado**\n\n` +
        `👤 Autor: **${primero.author.tag}**\n` +
        `📅 Fecha: <t:${Math.floor(primero.createdTimestamp / 1000)}:F>\n` +
        `🔗 [Ir al mensaje](${primero.url})`
      );
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ No pude obtener los mensajes.",
        ephemeral: true
      });
    }
  }
};
