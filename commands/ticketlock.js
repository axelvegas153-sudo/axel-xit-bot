const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketlock")
    .setDescription("Bloquea temporalmente el ticket actual"),

  async execute(interaction) {
    if (!interaction.guild || !interaction.channel) {
      return interaction.reply({
        content: "❌ Este comando solo puede utilizarse dentro de un servidor.",
        ephemeral: true
      });
    }

    const canal = interaction.channel;

    if (!canal.name.startsWith("ticket-")) {
      return interaction.reply({
        content: "❌ Este canal no parece ser un ticket.",
        ephemeral: true
      });
    }

    if (
      !interaction.member.permissions.has(
        PermissionFlagsBits.ManageChannels
      )
    ) {
      return interaction.reply({
        content: "❌ Necesitas el permiso **Gestionar canales**.",
        ephemeral: true
      });
    }

    try {
      const overwrites = canal.permissionOverwrites.cache;

      let usuariosBloqueados = 0;

      for (const overwrite of overwrites.values()) {
        if (overwrite.type !== 1) continue;

        await canal.permissionOverwrites.edit(overwrite.id, {
          SendMessages: false
        });

        usuariosBloqueados++;
      }

      const embed = new EmbedBuilder()
        .setTitle("🔒 Ticket bloqueado")
        .setDescription(
          `El ticket fue bloqueado por ${interaction.user}.\n\n` +
          "Los usuarios del ticket ya no pueden enviar mensajes."
        )
        .addFields({
          name: "👥 Usuarios afectados",
          value: `${usuariosBloqueados}`,
          inline: true
        })
        .setColor(0xed4245)
        .setTimestamp();

      await interaction.reply({
        embeds: [embed]
      });
    } catch (error) {
      console.error("Error bloqueando ticket:", error);

      await interaction.reply({
        content:
          "❌ No pude bloquear el ticket. Comprueba mis permisos para gestionar los permisos del canal.",
        ephemeral: true
      });
    }
  }
};
