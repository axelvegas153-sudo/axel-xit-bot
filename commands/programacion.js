const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const commands = [];

/* =========================================================
   /code
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("code")
    .setDescription("Muestra código con formato")
    .addStringOption(option =>
      option
        .setName("codigo")
        .setDescription("Código")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("lenguaje")
        .setDescription("Lenguaje del código")
        .setRequired(false)
    ),

  async execute(interaction) {
    const codigo = interaction.options.getString("codigo");
    const lenguaje =
      interaction.options.getString("lenguaje") || "js";

    if (codigo.length > 1800) {
      return interaction.reply({
        content: "❌ El código es demasiado largo.",
        ephemeral: true
      });
    }

    await interaction.reply(
      `\`\`\`${lenguaje}\n${codigo}\n\`\`\``
    );
  }
});

/* =========================================================
   /javascript
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("javascript")
    .setDescription("Información sobre JavaScript")
    .addStringOption(option =>
      option
        .setName("codigo")
        .setDescription("Código JavaScript")
        .setRequired(false)
    ),

  async execute(interaction) {
    const codigo =
      interaction.options.getString("codigo");

    if (!codigo) {
      return interaction.reply(
        "🟨 **JavaScript**\n\n" +
        "Lenguaje utilizado para crear aplicaciones web, bots y muchas otras herramientas."
      );
    }

    await interaction.reply(
      `🟨 **JavaScript**\n\n\`\`\`js\n${codigo}\n\`\`\``
    );
  }
});

/* =========================================================
   /python
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("python")
    .setDescription("Muestra código Python")
    .addStringOption(option =>
      option
        .setName("codigo")
        .setDescription("Código Python")
        .setRequired(true)
    ),

  async execute(interaction) {
    const codigo = interaction.options.getString("codigo");

    if (codigo.length > 1800) {
      return interaction.reply({
        content: "❌ El código es demasiado largo.",
        ephemeral: true
      });
    }

    await interaction.reply(
      `🐍 **Python**\n\n\`\`\`py\n${codigo}\n\`\`\``
    );
  }
});

/* =========================================================
   /html
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("html")
    .setDescription("Muestra código HTML")
    .addStringOption(option =>
      option
        .setName("codigo")
        .setDescription("Código HTML")
        .setRequired(true)
    ),

  async execute(interaction) {
    const codigo = interaction.options.getString("codigo");

    await interaction.reply(
      `🌐 **HTML**\n\n\`\`\`html\n${codigo.slice(0, 1800)}\n\`\`\``
    );
  }
});

/* =========================================================
   /css
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("css")
    .setDescription("Muestra código CSS")
    .addStringOption(option =>
      option
        .setName("codigo")
        .setDescription("Código CSS")
        .setRequired(true)
    ),

  async execute(interaction) {
    const codigo = interaction.options.getString("codigo");

    await interaction.reply(
      `🎨 **CSS**\n\n\`\`\`css\n${codigo.slice(0, 1800)}\n\`\`\``
    );
  }
});

/* =========================================================
   /json
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("json")
    .setDescription("Muestra un JSON")
    .addStringOption(option =>
      option
        .setName("codigo")
        .setDescription("Contenido JSON")
        .setRequired(true)
    ),

  async execute(interaction) {
    const codigo = interaction.options.getString("codigo");

    try {
      const objeto = JSON.parse(codigo);

      await interaction.reply(
        `📋 **JSON válido**\n\n\`\`\`json\n${JSON.stringify(
          objeto,
          null,
          2
        ).slice(0, 1800)}\n\`\`\``
      );
    } catch {
      await interaction.reply(
        "❌ El JSON no es válido."
      );
    }
  }
});

/* =========================================================
   /regex
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("regex")
    .setDescription("Prueba una expresión regular")
    .addStringOption(option =>
      option
        .setName("expresion")
        .setDescription("Expresión regular")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("texto")
        .setDescription("Texto para comprobar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const expresion =
      interaction.options.getString("expresion");

    const texto =
      interaction.options.getString("texto");

    try {
      const regex = new RegExp(expresion);
      const resultado = regex.test(texto);

      await interaction.reply(
        `🔎 **Regex**\n\n` +
        `Expresión: \`${expresion}\`\n` +
        `Resultado: **${resultado ? "Coincide ✅" : "No coincide ❌"}**`
      );
    } catch {
      await interaction.reply(
        "❌ La expresión regular no es válida."
      );
    }
  }
});

/* =========================================================
   /debug
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("debug")
    .setDescription("Analiza un fragmento de código")
    .addStringOption(option =>
      option
        .setName("codigo")
        .setDescription("Código a revisar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const codigo = interaction.options.getString("codigo");

    const problemas = [];

    if (codigo.includes("console.log")) {
      problemas.push("ℹ️ Contiene `console.log()`.");
    }

    if (codigo.includes("TODO")) {
      problemas.push("⚠️ Contiene un comentario `TODO`.");
    }

    if (codigo.includes("password")) {
      problemas.push("🔐 Revisa que no estés exponiendo contraseñas.");
    }

    if (!problemas.length) {
      problemas.push(
        "✅ No encontré patrones básicos problemáticos."
      );
    }

    await interaction.reply(
      `🐛 **DEBUG**\n\n${problemas.join("\n")}`
    );
  }
});

/* =========================================================
   /explaincode
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("explaincode")
    .setDescription("Explica un fragmento de código")
    .addStringOption(option =>
      option
        .setName("codigo")
        .setDescription("Código que quieres explicar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const codigo = interaction.options.getString("codigo");

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00aaff)
          .setTitle("💻 Explicación de código")
          .setDescription(
            "Este comando está preparado para conectarse con el sistema de IA.\n\n" +
            `Código recibido:\n\`\`\`\n${codigo.slice(0, 1500)}\n\`\`\``
          )
      ],
      ephemeral: true
    });
  }
});

/* =========================================================
   /snippet
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("snippet")
    .setDescription("Crea un snippet de código")
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nombre del snippet")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("codigo")
        .setDescription("Código")
        .setRequired(true)
    ),

  async execute(interaction) {
    const nombre =
      interaction.options.getString("nombre");

    const codigo =
      interaction.options.getString("codigo");

    await interaction.reply(
      `📦 **${nombre}**\n\n\`\`\`js\n${codigo.slice(
        0,
        1800
      )}\n\`\`\``
    );
  }
});

/* =========================================================
   /programminghelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("programminghelp")
    .setDescription("Muestra la ayuda de programación"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x00aaff)
      .setTitle("💻 Programación — DARK FF V1")
      .setDescription(
        "Herramientas y utilidades para programación."
      )
      .addFields(
        {
          name: "🧑‍💻 Lenguajes",
          value:
            "`/javascript`\n" +
            "`/python`\n" +
            "`/html`\n" +
            "`/css`\n" +
            "`/json`"
        },
        {
          name: "🛠️ Herramientas",
          value:
            "`/code`\n" +
            "`/regex`\n" +
            "`/debug`\n" +
            "`/explaincode`\n" +
            "`/snippet`"
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
