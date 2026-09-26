const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketunlock")
    .setDescription("Desbloquea el ticket actual"),

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

      let usuariosDesbloqueados = 0;

      for (const overwrite of overwrites.values()) {
        if (overwrite.type !== 1) continue;

        await canal.permissionOverwrites.edit(overwrite.id, {
          SendMessages: true
        });

        usuariosDesbloqueados++;
      }

      const embed = new EmbedBuilder()
        .setTitle("🔓 Ticket desbloqueado")
        .setDescription(
          `El ticket fue desbloqueado por ${interaction.user}.\n\n` +
          "Los usuarios autorizados pueden volver a escribir."
        )
        .addFields({
          name: "👥 Usuarios afectados",
          value: `${usuariosDesbloqueados}`,
          inline: true
        })
        .setColor(0x57f287)
        .setTimestamp();

      await interaction.reply({
        embeds: [embed]
      });
    } catch (error) {
      console.error("Error desbloqueando ticket:", error);

      await interaction.reply({
        content:
          "❌ No pude desbloquear el ticket. Comprueba mis permisos para gestionar los permisos del canal.",
        ephemeral: true
      });
    }
  }
};
