const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Crea un ticket privado de soporte")
    .addStringOption(option =>
      option
        .setName("motivo")
        .setDescription("Motivo del ticket")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "❌ Este comando solo puede usarse dentro de un servidor.",
        ephemeral: true
      });
    }

    const motivo =
      interaction.options.getString("motivo") || "Soporte general";

    const nombreBase = `ticket-${interaction.user.username}`
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "")
      .slice(0, 20);

    const existente = interaction.guild.channels.cache.find(
      channel =>
        channel.type === ChannelType.GuildText &&
        channel.name === nombreBase
    );

    if (existente) {
      return interaction.reply({
        content: `❌ Ya tienes un ticket abierto: ${existente}`,
        ephemeral: true
      });
    }

    try {
      const canal = await interaction.guild.channels.create({
        name: nombreBase,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory
            ]
          },
          {
            id: interaction.client.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.ManageChannels
            ]
          }
        ]
      });

      const embed = new EmbedBuilder()
        .setTitle("🎫 Ticket de soporte")
        .setDescription(
          `Hola ${interaction.user} 👋\n\n` +
          `Tu ticket ha sido creado correctamente.\n\n` +
          `**Motivo:** ${motivo}\n\n` +
          `Un miembro del equipo podrá ayudarte aquí.`
        )
        .setColor(0x5865f2)
        .setTimestamp();

      const botones = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_close")
          .setLabel("Cerrar ticket")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Danger)
      );

      await canal.send({
        content: `${interaction.user}`,
        embeds: [embed],
        components: [botones]
      });

      await interaction.reply({
        content: `✅ Tu ticket ha sido creado: ${canal}`,
        ephemeral: true
      });
    } catch (error) {
      console.error("Error creando ticket:", error);

      await interaction.reply({
        content:
          "❌ No pude crear el ticket. Comprueba que Axel XIT tenga permisos para gestionar canales.",
        ephemeral: true
      });
    }
  }
};
