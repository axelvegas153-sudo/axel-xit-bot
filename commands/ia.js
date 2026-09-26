const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ia")
    .setDescription("🧠 Herramientas de inteligencia artificial")

    .addSubcommand(sub =>
      sub
        .setName("preguntar")
        .setDescription("Haz una pregunta a la IA")
        .addStringOption(option =>
          option
            .setName("pregunta")
            .setDescription("Escribe tu pregunta")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("explicar")
        .setDescription("Pide a la IA que explique un tema")
        .addStringOption(option =>
          option
            .setName("tema")
            .setDescription("Tema que quieres entender")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("resumir")
        .setDescription("Resume un texto")
        .addStringOption(option =>
          option
            .setName("texto")
            .setDescription("Texto que quieres resumir")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("mejorar")
        .setDescription("Mejora un texto")
        .addStringOption(option =>
          option
            .setName("texto")
            .setDescription("Texto que quieres mejorar")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("traducir")
        .setDescription("Traduce un texto")
        .addStringOption(option =>
          option
            .setName("texto")
            .setDescription("Texto que quieres traducir")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("idioma")
            .setDescription("Idioma al que quieres traducir")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("codigo")
        .setDescription("Ayuda con programación")
        .addStringOption(option =>
          option
            .setName("peticion")
            .setDescription("Qué quieres programar o solucionar")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("estado")
        .setDescription("Muestra el estado de la IA")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "estado") {
      const embed = new EmbedBuilder()
        .setTitle("🧠 IA de Axel XIT")
        .setDescription(
          "Sistema de inteligencia artificial de **Axel XIT**."
        )
        .addFields(
          {
            name: "🤖 Motor",
            value: "Preparado para conectar",
            inline: true
          },
          {
            name: "💬 Chat",
            value: "Disponible al conectar API",
            inline: true
          },
          {
            name: "🎨 Imágenes",
            value: "Sistema independiente",
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

    /*
      ==========================================
      IA REAL
      ==========================================

      Aquí conectaremos la API de IA.

      Las funciones serán:

      /ia preguntar
      /ia explicar
      /ia resumir
      /ia mejorar
      /ia traducir
      /ia codigo

      No se colocan respuestas falsas.
      La respuesta vendrá del modelo de IA
      cuando configuremos la API.
    */

    const textos = {
      preguntar: interaction.options.getString("pregunta"),
      explicar: interaction.options.getString("tema"),
      resumir: interaction.options.getString("texto"),
      mejorar: interaction.options.getString("texto"),
      traducir: interaction.options.getString("texto"),
      codigo: interaction.options.getString("peticion")
    };

    let prompt = "";

    if (sub === "preguntar") {
      prompt = textos.preguntar;
    }

    if (sub === "explicar") {
      prompt =
        `Explica de forma sencilla y clara este tema: ${textos.explicar}`;
    }

    if (sub === "resumir") {
      prompt =
        `Resume de forma clara y breve el siguiente texto:\n\n${textos.resumir}`;
    }

    if (sub === "mejorar") {
      prompt =
        `Mejora este texto manteniendo su significado:\n\n${textos.mejorar}`;
    }

    if (sub === "traducir") {
      const idioma =
        interaction.options.getString("idioma");

      prompt =
        `Traduce el siguiente texto al idioma ${idioma}:\n\n${textos.traducir}`;
    }

    if (sub === "codigo") {
      prompt =
        `Ayúdame con programación. Responde con una solución clara para: ${textos.codigo}`;
    }

    /*
      API pendiente.
    */

    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🧠 IA de Axel XIT")
          .setDescription(
            "⚙️ El sistema está preparado, pero todavía falta conectar la API de inteligencia artificial."
          )
          .addFields({
            name: "📝 Solicitud recibida",
            value:
              prompt.length > 1000
                ? prompt.slice(0, 997) + "..."
                : prompt
          })
          .setColor(0x5865f2)
          .setFooter({
            text: "Axel XIT • IA"
          })
      ]
    });
  }
};
