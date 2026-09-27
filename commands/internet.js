const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const commands = [];

/* =========================================================
   /search
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Busca información en Internet")
    .addStringOption(option =>
      option
        .setName("consulta")
        .setDescription("Qué quieres buscar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const consulta = interaction.options.getString("consulta");

    await interaction.deferReply();

    try {
      const url =
        `https://www.google.com/search?q=${encodeURIComponent(consulta)}`;

      const embed = new EmbedBuilder()
        .setTitle("🔎 Búsqueda en Internet")
        .setDescription(
          `**Consulta:** ${consulta}\n\n[🔗 Abrir búsqueda en Google](${url})`
        )
        .setColor("Blue")
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply("❌ No se pudo realizar la búsqueda.");
    }
  }
});

/* =========================================================
   /weather
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Consulta el clima de una ciudad")
    .addStringOption(option =>
      option
        .setName("ciudad")
        .setDescription("Nombre de la ciudad")
        .setRequired(true)
    ),

  async execute(interaction) {
    const ciudad = interaction.options.getString("ciudad");

    await interaction.deferReply();

    try {
      const url =
        `https://wttr.in/${encodeURIComponent(ciudad)}?format=j1`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("No se pudo consultar el clima");
      }

      const data = await response.json();
      const current = data.current_condition?.[0];

      if (!current) {
        throw new Error("Datos no encontrados");
      }

      const temperatura = current.temp_C;
      const sensacion = current.FeelsLikeC;
      const humedad = current.humidity;
      const viento = current.windspeedKmph;
      const descripcion =
        current.weatherDesc?.[0]?.value || "Sin información";

      const embed = new EmbedBuilder()
        .setTitle(`🌤️ Clima de ${ciudad}`)
        .addFields(
          {
            name: "🌡️ Temperatura",
            value: `${temperatura} °C`,
            inline: true
          },
          {
            name: "🥵 Sensación",
            value: `${sensacion} °C`,
            inline: true
          },
          {
            name: "💧 Humedad",
            value: `${humedad}%`,
            inline: true
          },
          {
            name: "💨 Viento",
            value: `${viento} km/h`,
            inline: true
          },
          {
            name: "☁️ Estado",
            value: descripcion,
            inline: true
          }
        )
        .setColor("Aqua")
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply(
        "❌ No pude encontrar información del clima para esa ciudad."
      );
    }
  }
});

/* =========================================================
   /news
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("news")
    .setDescription("Busca noticias sobre un tema")
    .addStringOption(option =>
      option
        .setName("tema")
        .setDescription("Tema de las noticias")
        .setRequired(true)
    ),

  async execute(interaction) {
    const tema = interaction.options.getString("tema");

    const url =
      `https://www.google.com/search?tbm=nws&q=${encodeURIComponent(tema)}`;

    const embed = new EmbedBuilder()
      .setTitle("📰 Noticias")
      .setDescription(
        `Noticias relacionadas con **${tema}**.\n\n` +
        `[🔗 Ver noticias en Google](${url})`
      )
      .setColor("Red")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

/* =========================================================
   /website
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("website")
    .setDescription("Obtiene información básica de una página web")
    .addStringOption(option =>
      option
        .setName("url")
        .setDescription("URL de la página")
        .setRequired(true)
    ),

  async execute(interaction) {
    let input = interaction.options.getString("url").trim();

    if (!/^https?:\/\//i.test(input)) {
      input = `https://${input}`;
    }

    let parsed;

    try {
      parsed = new URL(input);
    } catch {
      return interaction.reply("❌ La URL no es válida.");
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return interaction.reply("❌ Solo se permiten URLs HTTP o HTTPS.");
    }

    const embed = new EmbedBuilder()
      .setTitle("🌐 Información de página web")
      .addFields(
        {
          name: "🔗 URL",
          value: input
        },
        {
          name: "🌍 Dominio",
          value: parsed.hostname,
          inline: true
        },
        {
          name: "📡 Protocolo",
          value: parsed.protocol.replace(":", "").toUpperCase(),
          inline: true
        },
        {
          name: "📁 Ruta",
          value: parsed.pathname || "/",
          inline: true
        }
      )
      .setDescription(`[Abrir página](${input})`)
      .setColor("Blue")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

/* =========================================================
   /ipinfo
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ipinfo")
    .setDescription("Consulta información básica de una IP")
    .addStringOption(option =>
      option
        .setName("ip")
        .setDescription("Dirección IP")
        .setRequired(true)
    ),

  async execute(interaction) {
    const ip = interaction.options.getString("ip").trim();

    if (!/^[0-9a-fA-F:.]+$/.test(ip)) {
      return interaction.reply("❌ La IP introducida no es válida.");
    }

    await interaction.deferReply();

    try {
      const response = await fetch(
        `https://ipwho.is/${encodeURIComponent(ip)}`
      );

      const data = await response.json();

      if (!data.success) {
        return interaction.editReply(
          "❌ No se pudo obtener información de esa IP."
        );
      }

      const embed = new EmbedBuilder()
        .setTitle("🌐 Información de IP")
        .addFields(
          {
            name: "📍 IP",
            value: data.ip || ip,
            inline: true
          },
          {
            name: "🌎 País",
            value: data.country || "Desconocido",
            inline: true
          },
          {
            name: "🏙️ Ciudad",
            value: data.city || "Desconocida",
            inline: true
          },
          {
            name: "🏢 ISP",
            value: data.connection?.isp || "Desconocido",
            inline: true
          },
          {
            name: "🛰️ Organización",
            value: data.connection?.org || "Desconocida",
            inline: true
          },
          {
            name: "📡 ASN",
            value: data.connection?.asn
              ? String(data.connection.asn)
              : "Desconocido",
            inline: true
          }
        )
        .setColor("Purple")
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply(
        "❌ Ocurrió un error consultando la IP."
      );
    }
  }
});

/* =========================================================
   /dns
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("dns")
    .setDescription("Consulta registros DNS de un dominio")
    .addStringOption(option =>
      option
        .setName("dominio")
        .setDescription("Dominio, por ejemplo discord.com")
        .setRequired(true)
    ),

  async execute(interaction) {
    const dominio = interaction.options
      .getString("dominio")
      .trim()
      .replace(/^https?:\/\//i, "")
      .split("/")[0];

    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(dominio)) {
      return interaction.reply("❌ El dominio no es válido.");
    }

    await interaction.deferReply();

    try {
      const response = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(dominio)}&type=A`
      );

      const data = await response.json();

      const respuestas = data.Answer || [];

      if (!respuestas.length) {
        return interaction.editReply(
          `❌ No encontré registros A para **${dominio}**.`
        );
      }

      const ips = respuestas
        .map(record => record.data)
        .slice(0, 10)
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("🔍 Consulta DNS")
        .addFields(
          {
            name: "🌐 Dominio",
            value: dominio
          },
          {
            name: "📡 Registros A",
            value: `\`\`\`\n${ips}\n\`\`\``
          }
        )
        .setColor("Green")
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply(
        "❌ No se pudo consultar el DNS."
      );
    }
  }
});

/* =========================================================
   /httpstatus
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("httpstatus")
    .setDescription("Comprueba el estado HTTP de una página")
    .addStringOption(option =>
      option
        .setName("url")
        .setDescription("URL que quieres comprobar")
        .setRequired(true)
    ),

  async execute(interaction) {
    let input = interaction.options.getString("url").trim();

    if (!/^https?:\/\//i.test(input)) {
      input = `https://${input}`;
    }

    let parsed;

    try {
      parsed = new URL(input);
    } catch {
      return interaction.reply("❌ URL inválida.");
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return interaction.reply("❌ Protocolo no permitido.");
    }

    await interaction.deferReply();

    try {
      const inicio = Date.now();

      const response = await fetch(input, {
        method: "HEAD",
        redirect: "follow"
      });

      const tiempo = Date.now() - inicio;

      const embed = new EmbedBuilder()
        .setTitle("📡 Estado HTTP")
        .addFields(
          {
            name: "🌐 Página",
            value: parsed.hostname
          },
          {
            name: "📊 Código",
            value: `\`${response.status}\``,
            inline: true
          },
          {
            name: "📝 Estado",
            value: response.statusText || "Sin descripción",
            inline: true
          },
          {
            name: "⚡ Tiempo",
            value: `${tiempo} ms`,
            inline: true
          }
        )
        .setColor(response.ok ? "Green" : "Red")
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply(
        "❌ No se pudo conectar con esa página."
      );
    }
  }
});

/* =========================================================
   /urlinfo
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("urlinfo")
    .setDescription("Analiza la estructura de una URL")
    .addStringOption(option =>
      option
        .setName("url")
        .setDescription("URL que quieres analizar")
        .setRequired(true)
    ),

  async execute(interaction) {
    let input = interaction.options.getString("url").trim();

    if (!/^https?:\/\//i.test(input)) {
      input = `https://${input}`;
    }

    let url;

    try {
      url = new URL(input);
    } catch {
      return interaction.reply("❌ La URL no es válida.");
    }

    const parametros = [...url.searchParams.entries()];

    const embed = new EmbedBuilder()
      .setTitle("🔗 Información de URL")
      .addFields(
        {
          name: "🌐 Protocolo",
          value: url.protocol,
          inline: true
        },
        {
          name: "🏠 Host",
          value: url.host,
          inline: true
        },
        {
          name: "📁 Ruta",
          value: url.pathname || "/",
          inline: true
        },
        {
          name: "🔎 Parámetros",
          value: parametros.length
            ? parametros
                .slice(0, 10)
                .map(([key, value]) => `\`${key}\` = \`${value}\``)
                .join("\n")
            : "Ninguno"
        }
      )
      .setDescription(`[Abrir URL](${input})`)
      .setColor("Blue")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

/* =========================================================
   /internethelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("internethelp")
    .setDescription("Muestra los comandos de Internet"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🌐 Comandos de Internet")
      .setDescription(
        [
          "**🔎 Búsquedas**",
          "`/search` — Buscar en Internet",
          "`/news` — Buscar noticias",
          "",
          "**🌤️ Información**",
          "`/weather` — Consultar clima",
          "`/ipinfo` — Información básica de una IP",
          "`/dns` — Consultar DNS",
          "",
          "**🌐 Web**",
          "`/website` — Información de una página",
          "`/urlinfo` — Analizar una URL",
          "`/httpstatus` — Comprobar estado HTTP"
        ].join("\n")
      )
      .setColor("Blue")
      .setFooter({
        text: "DARK FF V1 • Internet"
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

/* =========================================================
   EXPORTACIÓN
========================================================= */

module.exports = commands;
