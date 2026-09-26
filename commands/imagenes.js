const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("imagenes")
    .setDescription("🎨 Herramientas de IA para imágenes")

    .addSubcommand(sub =>
      sub
        .setName("generar")
        .setDescription("Genera una imagen con IA")
        .addStringOption(option =>
          option
            .setName("prompt")
            .setDescription("Describe la imagen que quieres crear")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("editar")
        .setDescription("Edita una imagen con IA")
        .addAttachmentOption(option =>
          option
            .setName("imagen")
            .setDescription("Imagen que quieres editar")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("cambios")
            .setDescription("Describe los cambios que quieres hacer")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("mejorar")
        .setDescription("Mejora la calidad de una imagen")
        .addAttachmentOption(option =>
          option
            .setName("imagen")
            .setDescription("Imagen que quieres mejorar")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("fondo")
        .setDescription("Cambia o elimina el fondo")
        .addAttachmentOption(option =>
          option
            .setName("imagen")
            .setDescription("Imagen original")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("fondo")
            .setDescription("Describe el nuevo fondo")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("estado")
        .setDescription("Muestra el estado de la IA de imágenes")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "estado") {
      const embed = new EmbedBuilder()
        .setTitle("🎨 IA de imágenes")
        .setDescription(
          "Sistema de generación y edición de imágenes de **Axel XIT**."
        )
        .addFields(
          {
            name: "🖼️ Generación",
            value: "Preparada",
            inline: true
          },
          {
            name: "✏️ Edición",
            value: "Preparada",
            inline: true
          },
          {
            name: "✨ Mejora",
            value: "Preparada",
            inline: true
          },
          {
            name: "🌄 Fondos",
            value: "Preparado",
            inline: true
          }
        )
        .setColor(0x5865f2)
        .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }

    await interaction.deferReply();

    if (sub === "generar") {
      const prompt =
        interaction.options.getString("prompt");

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎨 Generar imagen")
            .setDescription(
              "⚙️ La solicitud fue recibida. Falta conectar el servicio de generación de imágenes."
            )
            .addFields({
              name: "📝 Prompt",
              value:
                prompt.length > 1000
                  ? prompt.slice(0, 997) + "..."
                  : prompt
            })
            .setColor(0x5865f2)
        ]
      });
    }

    if (sub === "editar") {
      const imagen =
        interaction.options.getAttachment("imagen");

      const cambios =
        interaction.options.getString("cambios");

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("✏️ Editar imagen")
            .setDescription(
              "⚙️ La imagen fue recibida. Falta conectar el servicio de edición con IA."
            )
            .addFields(
              {
                name: "🖼️ Imagen",
                value: imagen.name,
                inline: true
              },
              {
                name: "📝 Cambios",
                value:
                  cambios.length > 1000
                    ? cambios.slice(0, 997) + "..."
                    : cambios
              }
            )
            .setColor(0x5865f2)
        ]
      });
    }

    if (sub === "mejorar") {
      const imagen =
        interaction.options.getAttachment("imagen");

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("✨ Mejorar imagen")
            .setDescription(
              "⚙️ La imagen fue recibida. Falta conectar el servicio de mejora con IA."
            )
            .addFields({
              name: "🖼️ Imagen",
              value: imagen.name
            })
            .setColor(0x5865f2)
        ]
      });
    }

    if (sub === "fondo") {
      const imagen =
        interaction.options.getAttachment("imagen");

      const fondo =
        interaction.options.getString("fondo");

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🌄 Cambiar fondo")
            .setDescription(
              "⚙️ La imagen fue recibida. Falta conectar el servicio de edición con IA."
            )
            .addFields(
              {
                name: "🖼️ Imagen",
                value: imagen.name,
                inline: true
              },
              {
                name: "🌄 Nuevo fondo",
                value:
                  fondo.length > 1000
                    ? fondo.slice(0, 997) + "..."
                    : fondo
              }
            )
            .setColor(0x5865f2)
        ]
      });
    }
  }
};
