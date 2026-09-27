const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const commands = [];

/* =========================================================
   /ask
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Haz una pregunta a la IA")
    .addStringOption(option =>
      option
        .setName("pregunta")
        .setDescription("Tu pregunta")
        .setRequired(true)
    ),

  async execute(interaction) {
    const pregunta = interaction.options.getString("pregunta");

    await interaction.reply({
      content:
        "🤖 **DARK IA**\n\n" +
        "⚠️ La conexión con el servicio de IA todavía no está configurada.\n\n" +
        `📝 Tu pregunta: **${pregunta}**`,
      ephemeral: true
    });
  }
});

/* =========================================================
   /ai
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ai")
    .setDescription("Habla con la inteligencia artificial")
    .addStringOption(option =>
      option
        .setName("mensaje")
        .setDescription("Mensaje para la IA")
        .setRequired(true)
    ),

  async execute(interaction) {
    const mensaje = interaction.options.getString("mensaje");

    await interaction.reply({
      content:
        "🤖 **DARK IA**\n\n" +
        "⚠️ La API de IA aún no está configurada.\n\n" +
        `💬 Mensaje recibido: **${mensaje}**`,
      ephemeral: true
    });
  }
});

/* =========================================================
   /chat
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Inicia una conversación con la IA")
    .addStringOption(option =>
      option
        .setName("mensaje")
        .setDescription("Mensaje")
        .setRequired(true)
    ),

  async execute(interaction) {
    const mensaje = interaction.options.getString("mensaje");

    await interaction.reply({
      content:
        "💬 **CHAT IA**\n\n" +
        "La función de conversación necesita una API configurada.\n\n" +
        `📨 Mensaje: **${mensaje}**`,
      ephemeral: true
    });
  }
});

/* =========================================================
   /translateai
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("translateai")
    .setDescription("Traduce un texto usando IA")
    .addStringOption(option =>
      option
        .setName("texto")
        .setDescription("Texto que quieres traducir")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("idioma")
        .setDescription("Idioma de destino")
        .setRequired(true)
    ),

  async execute(interaction) {
    const texto = interaction.options.getString("texto");
    const idioma = interaction.options.getString("idioma");

    await interaction.reply({
      content:
        "🌎 **TRADUCTOR IA**\n\n" +
        "⚠️ La API de IA todavía no está conectada.\n\n" +
        `📝 Texto: **${texto}**\n` +
        `🌐 Idioma: **${idioma}**`,
      ephemeral: true
    });
  }
});

/* =========================================================
   /summarize
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("summarize")
    .setDescription("Resume un texto con IA")
    .addStringOption(option =>
      option
        .setName("texto")
        .setDescription("Texto que quieres resumir")
        .setRequired(true)
    ),

  async execute(interaction) {
    const texto = interaction.options.getString("texto");

    await interaction.reply({
      content:
        "📚 **RESUMEN IA**\n\n" +
        "⚠️ La función necesita una API de IA configurada.\n\n" +
        `📄 Texto recibido: **${texto}**`,
      ephemeral: true
    });
  }
});

/* =========================================================
   /explain
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("explain")
    .setDescription("Pide a la IA que explique un tema")
    .addStringOption(option =>
      option
        .setName("tema")
        .setDescription("Tema que quieres entender")
        .setRequired(true)
    ),

  async execute(interaction) {
    const tema = interaction.options.getString("tema");

    await interaction.reply({
      content:
        "🧠 **EXPLICADOR IA**\n\n" +
        "⚠️ La API de IA todavía no está configurada.\n\n" +
        `📖 Tema: **${tema}**`,
      ephemeral: true
    });
  }
});

/* =========================================================
   /codeai
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("codeai")
    .setDescription("Genera o explica código con IA")
    .addStringOption(option =>
      option
        .setName("solicitud")
        .setDescription("Qué código necesitas")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("lenguaje")
        .setDescription("Lenguaje de programación")
        .setRequired(false)
    ),

  async execute(interaction) {
    const solicitud =
      interaction.options.getString("solicitud");

    const lenguaje =
      interaction.options.getString("lenguaje") ||
      "No especificado";

    await interaction.reply({
      content:
        "💻 **CODE IA**\n\n" +
        "⚠️ La API de IA todavía no está configurada.\n\n" +
        `📝 Solicitud: **${solicitud}**\n` +
        `🔤 Lenguaje: **${lenguaje}**`,
      ephemeral: true
    });
  }
});

/* =========================================================
   /imageprompt
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("imageprompt")
    .setDescription("Crea un prompt para generar una imagen")
    .addStringOption(option =>
      option
        .setName("idea")
        .setDescription("Describe la imagen")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("estilo")
        .setDescription("Estilo visual")
        .setRequired(false)
    ),

  async execute(interaction) {
    const idea = interaction.options.getString("idea");
    const estilo =
      interaction.options.getString("estilo") ||
      "cinematográfico";

    const prompt =
      `${idea}, estilo ${estilo}, alta calidad, ` +
      `iluminación detallada, composición profesional`;

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x9b59b6)
          .setTitle("🎨 Prompt generado")
          .setDescription(`\`\`\`\n${prompt}\n\`\`\``)
          .setFooter({
            text: "DARK FF V1 • Image Prompt"
          })
      ]
    });
  }
});

/* =========================================================
   /aifunctions
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("aifunctions")
    .setDescription("Muestra las funciones de IA"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🤖 Funciones de DARK IA")
      .setDescription(
        "Funciones disponibles en el sistema de inteligencia artificial."
      )
      .addFields(
        {
          name: "💬 Conversación",
          value:
            "`/ask`\n" +
            "`/ai`\n" +
            "`/chat`"
        },
        {
          name: "📚 Texto",
          value:
            "`/translateai`\n" +
            "`/summarize`\n" +
            "`/explain`"
        },
        {
          name: "💻 Programación",
          value:
            "`/codeai`"
        },
        {
          name: "🎨 Imágenes",
          value:
            "`/imageprompt`"
        },
        {
          name: "⚙️ Configuración",
          value:
            "`/aiconfig`\n" +
            "`/aihelp`"
        }
      );

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /aiconfig
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("aiconfig")
    .setDescription("Configura el sistema de IA")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addStringOption(option =>
      option
        .setName("modelo")
        .setDescription("Modelo de IA")
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option
        .setName("activo")
        .setDescription("Activar o desactivar IA")
        .setRequired(false)
    ),

  async execute(interaction) {
    const modelo =
      interaction.options.getString("modelo");

    const activo =
      interaction.options.getBoolean("activo");

    const embed = new EmbedBuilder()
      .setColor(0x00ff88)
      .setTitle("⚙️ Configuración de DARK IA")
      .addFields(
        {
          name: "🤖 Modelo",
          value: modelo || "No especificado"
        },
        {
          name: "🔌 Estado",
          value:
            activo === null
              ? "Sin cambios"
              : activo
                ? "🟢 Activado"
                : "🔴 Desactivado"
        }
      )
      .setFooter({
        text: "La API debe configurarse por separado."
      });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   /aihelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("aihelp")
    .setDescription("Muestra la ayuda de inteligencia artificial"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📚 DARK IA")
      .setDescription(
        "Comandos relacionados con inteligencia artificial."
      )
      .addFields(
        {
          name: "🤖 IA",
          value:
            "`/ask` — Preguntar a la IA\n" +
            "`/ai` — Chat con IA\n" +
            "`/chat` — Conversación"
        },
        {
          name: "📝 Texto",
          value:
            "`/translateai` — Traducción\n" +
            "`/summarize` — Resumen\n" +
            "`/explain` — Explicación"
        },
        {
          name: "💻 Código",
          value:
            "`/codeai` — Asistente de programación"
        },
        {
          name: "🎨 Imágenes",
          value:
            "`/imageprompt` — Crear prompts"
        },
        {
          name: "⚙️ Administración",
          value:
            "`/aiconfig` — Configuración\n" +
            "`/aifunctions` — Funciones"
        }
      )
      .setFooter({
        text: "DARK FF V1"
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   EXPORTACIÓN
========================================================= */

module.exports = commands;
