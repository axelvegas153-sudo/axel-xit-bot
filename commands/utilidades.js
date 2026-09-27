const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const commands = [];

/* =========================================================
   /calculator
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("calculator")
    .setDescription("Realiza una operación matemática")
    .addStringOption(option =>
      option
        .setName("operacion")
        .setDescription("Ejemplo: 25 * 4 + 10")
        .setRequired(true)
    ),

  async execute(interaction) {
    const operacion = interaction.options.getString("operacion");

    if (!/^[0-9+\-*/().%\s]+$/.test(operacion)) {
      return interaction.reply({
        content: "❌ La operación contiene caracteres no permitidos.",
        ephemeral: true
      });
    }

    try {
      const resultado = Function(`"use strict"; return (${operacion})`)();

      if (!Number.isFinite(resultado)) {
        return interaction.reply({
          content: "❌ El resultado no es válido.",
          ephemeral: true
        });
      }

      await interaction.reply(`🧮 **Resultado:** \`${resultado}\``);
    } catch {
      await interaction.reply({
        content: "❌ No pude calcular esa operación.",
        ephemeral: true
      });
    }
  }
});

/* =========================================================
   /translate
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("translate")
    .setDescription("Traducción básica")
    .addStringOption(option =>
      option
        .setName("texto")
        .setDescription("Texto que quieres traducir")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("idioma")
        .setDescription("Idioma destino")
        .setRequired(true)
        .addChoices(
          { name: "Español", value: "es" },
          { name: "Inglés", value: "en" },
          { name: "Francés", value: "fr" },
          { name: "Portugués", value: "pt" },
          { name: "Alemán", value: "de" },
          { name: "Italiano", value: "it" }
        )
    ),

  async execute(interaction) {
    const texto = interaction.options.getString("texto");
    const idioma = interaction.options.getString("idioma");

    await interaction.reply(
      `🌐 **Traducción IA**\n\n` +
      `Texto: ${texto}\n` +
      `Idioma: \`${idioma}\`\n\n` +
      `⚠️ Para traducción automática real necesitas conectar una API de traducción o IA.`
    );
  }
});

/* =========================================================
   /qr
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("qr")
    .setDescription("Genera un código QR")
    .addStringOption(option =>
      option
        .setName("texto")
        .setDescription("Texto o enlace para el QR")
        .setRequired(true)
    ),

  async execute(interaction) {
    const texto = interaction.options.getString("texto");

    const url =
      `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=` +
      encodeURIComponent(texto);

    const embed = new EmbedBuilder()
      .setTitle("📱 Código QR")
      .setDescription(`Contenido: \`${texto}\``)
      .setImage(url)
      .setFooter({ text: "DARK FF V1" });

    await interaction.reply({ embeds: [embed] });
  }
});

/* =========================================================
   /shorturl
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("shorturl")
    .setDescription("Acorta un enlace")
    .addStringOption(option =>
      option
        .setName("url")
        .setDescription("URL que quieres acortar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const url = interaction.options.getString("url");

    try {
      new URL(url);
    } catch {
      return interaction.reply({
        content: "❌ Esa URL no parece válida.",
        ephemeral: true
      });
    }

    await interaction.reply(
      `🔗 **URL recibida:**\n${url}\n\n` +
      `⚠️ Para acortarla automáticamente necesitas conectar un servicio de URLs.`
    );
  }
});

/* =========================================================
   /color
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("color")
    .setDescription("Muestra información de un color HEX")
    .addStringOption(option =>
      option
        .setName("hex")
        .setDescription("Ejemplo: #5865F2")
        .setRequired(true)
    ),

  async execute(interaction) {
    let hex = interaction.options.getString("hex").trim();

    if (!hex.startsWith("#")) {
      hex = `#${hex}`;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      return interaction.reply({
        content: "❌ Usa un color HEX válido. Ejemplo: `#5865F2`",
        ephemeral: true
      });
    }

    const numero = parseInt(hex.slice(1), 16);

    const embed = new EmbedBuilder()
      .setTitle("🎨 Información del color")
      .addFields(
        { name: "HEX", value: `\`${hex.toUpperCase()}\``, inline: true },
        { name: "Decimal", value: `\`${numero}\``, inline: true }
      )
      .setColor(numero);

    await interaction.reply({ embeds: [embed] });
  }
});

/* =========================================================
   /timestamp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("timestamp")
    .setDescription("Genera un timestamp de Discord")
    .addIntegerOption(option =>
      option
        .setName("minutos")
        .setDescription("Minutos desde ahora")
        .setRequired(false)
    ),

  async execute(interaction) {
    const minutos = interaction.options.getInteger("minutos") || 0;

    const fecha = new Date(Date.now() + minutos * 60 * 1000);
    const unix = Math.floor(fecha.getTime() / 1000);

    await interaction.reply(
      `⏰ **Timestamp generado**\n\n` +
      `Normal: <t:${unix}:F>\n` +
      `Relativo: <t:${unix}:R>\n\n` +
      `Código: \`<t:${unix}:F>\``
    );
  }
});

/* =========================================================
   /reminder
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("reminder")
    .setDescription("Crea un recordatorio")
    .addIntegerOption(option =>
      option
        .setName("minutos")
        .setDescription("Cuántos minutos esperar")
        .setMinValue(1)
        .setMaxValue(10080)
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("mensaje")
        .setDescription("Mensaje del recordatorio")
        .setRequired(true)
    ),

  async execute(interaction) {
    const minutos = interaction.options.getInteger("minutos");
    const mensaje = interaction.options.getString("mensaje");

    await interaction.reply(
      `⏰ Recordatorio creado para dentro de **${minutos} minutos**.\n` +
      `📝 ${mensaje}`
    );

    setTimeout(async () => {
      try {
        await interaction.user.send(
          `⏰ **Recordatorio de DARK FF V1**\n\n${mensaje}`
        );
      } catch {}
    }, minutos * 60 * 1000);
  }
});

/* =========================================================
   /poll
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Crea una encuesta")
    .addStringOption(option =>
      option
        .setName("pregunta")
        .setDescription("Pregunta de la encuesta")
        .setRequired(true)
    ),

  async execute(interaction) {
    const pregunta = interaction.options.getString("pregunta");

    const embed = new EmbedBuilder()
      .setTitle("📊 Encuesta")
      .setDescription(`**${pregunta}**\n\n👍 Sí\n👎 No`)
      .setFooter({ text: `Creada por ${interaction.user.tag}` });

    const mensaje = await interaction.reply({
      embeds: [embed],
      fetchReply: true
    });

    await mensaje.react("👍");
    await mensaje.react("👎");
  }
});

/* =========================================================
   /timer
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("timer")
    .setDescription("Inicia un temporizador")
    .addIntegerOption(option =>
      option
        .setName("segundos")
        .setDescription("Duración en segundos")
        .setMinValue(1)
        .setMaxValue(3600)
        .setRequired(true)
    ),

  async execute(interaction) {
    const segundos = interaction.options.getInteger("segundos");

    await interaction.reply(
      `⏱️ Temporizador iniciado: **${segundos} segundos**.`
    );

    setTimeout(async () => {
      try {
        await interaction.followUp(
          `⏰ <@${interaction.user.id}> ¡Tu temporizador terminó!`
        );
      } catch {}
    }, segundos * 1000);
  }
});

/* =========================================================
   /makeembed
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("makeembed")
    .setDescription("Crea un embed personalizado")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(option =>
      option
        .setName("titulo")
        .setDescription("Título del embed")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("descripcion")
        .setDescription("Descripción")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("color")
        .setDescription("Color HEX opcional")
        .setRequired(false)
    ),

  async execute(interaction) {
    const titulo = interaction.options.getString("titulo");
    const descripcion = interaction.options.getString("descripcion");
    let color = interaction.options.getString("color") || "#5865F2";

    if (!color.startsWith("#")) {
      color = `#${color}`;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      color = "#5865F2";
    }

    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(descripcion)
      .setColor(parseInt(color.slice(1), 16))
      .setFooter({ text: "DARK FF V1" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

/* =========================================================
   /utilidadeshelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("utilidadeshelp")
    .setDescription("Muestra los comandos de utilidades"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🛠️ Utilidades")
      .setDescription(
        [
          "`/calculator` — Calculadora",
          "`/translate` — Traducción",
          "`/qr` — Código QR",
          "`/shorturl` — Acortar URL",
          "`/color` — Información de colores",
          "`/timestamp` — Timestamp de Discord",
          "`/reminder` — Recordatorio",
          "`/poll` — Encuesta",
          "`/timer` — Temporizador",
          "`/makeembed` — Crear embed",
          "`/utilidadeshelp` — Esta ayuda"
        ].join("\n")
      )
      .setColor(0x5865f2);

    await interaction.reply({ embeds: [embed] });
  }
});

/* =========================================================
   EXPORTACIÓN
========================================================= */

module.exports = commands;
