const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.json");

function cargarDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
    }

    const contenido = fs.readFileSync(DB_PATH, "utf8");
    return contenido.trim() ? JSON.parse(contenido) : {};
  } catch {
    return {};
  }
}

function guardarDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function obtenerDatosUsuario(db, guildId, userId) {
  const resultado = {};

  for (const [categoria, datos] of Object.entries(db)) {
    if (!datos || typeof datos !== "object") continue;

    if (
      datos[guildId] &&
      typeof datos[guildId] === "object" &&
      datos[guildId][userId] !== undefined
    ) {
      resultado[categoria] = datos[guildId][userId];
    }
  }

  return resultado;
}

const commands = [];

/* =========================================================
   /privacy
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("privacy")
    .setDescription("Muestra la información de privacidad de DARK FF V1"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🔐 Privacidad — DARK FF V1")
      .setDescription(
        "Este comando muestra cómo se manejan los datos almacenados por el bot."
      )
      .addFields(
        {
          name: "📁 Datos",
          value:
            "El bot puede almacenar datos necesarios para funciones como economía, niveles, tickets, automoderación y configuraciones."
        },
        {
          name: "👤 Tus datos",
          value:
            "Puedes consultar los datos que DARK FF V1 tenga guardados sobre tu usuario mediante `/mydata`."
        },
        {
          name: "🗑️ Eliminación",
          value:
            "Puedes solicitar la eliminación de tus datos locales mediante `/deleteaccount`."
        },
        {
          name: "⚠️ Importante",
          value:
            "Estos comandos gestionan únicamente los datos guardados por DARK FF V1. No eliminan datos de Discord."
        }
      )
      .setColor(0x5865f2);

    await interaction.reply({ embeds: [embed] });
  }
});

/* =========================================================
   /mydata
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("mydata")
    .setDescription("Muestra los datos que DARK FF V1 tiene guardados sobre ti"),

  async execute(interaction) {
    const db = cargarDB();

    const datos = obtenerDatosUsuario(
      db,
      interaction.guildId,
      interaction.user.id
    );

    const categorias = Object.keys(datos);

    if (!categorias.length) {
      return interaction.reply({
        content:
          "📂 No encontré datos específicos tuyos almacenados en la base de datos de este servidor.",
        ephemeral: true
      });
    }

    let texto = "";

    for (const categoria of categorias) {
      let valor;

      try {
        valor = JSON.stringify(datos[categoria], null, 2);
      } catch {
        valor = String(datos[categoria]);
      }

      if (valor.length > 700) {
        valor = valor.slice(0, 700) + "...";
      }

      texto += `### 📁 ${categoria}\n\`\`\`json\n${valor}\n\`\`\`\n`;
    }

    if (texto.length > 3900) {
      texto =
        texto.slice(0, 3850) +
        "\n\n...Hay más datos almacenados.";
    }

    const embed = new EmbedBuilder()
      .setTitle("📂 Tus datos")
      .setDescription(texto)
      .setFooter({
        text: `Usuario: ${interaction.user.tag}`
      })
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   /deleteaccount
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("deleteaccount")
    .setDescription("Elimina tus datos personales guardados por DARK FF V1"),

  async execute(interaction) {
    const db = cargarDB();

    let eliminados = 0;

    for (const [categoria, datos] of Object.entries(db)) {
      if (!datos || typeof datos !== "object") continue;

      if (
        datos[interaction.guildId] &&
        typeof datos[interaction.guildId] === "object" &&
        datos[interaction.guildId][interaction.user.id] !== undefined
      ) {
        delete datos[interaction.guildId][interaction.user.id];
        eliminados++;
      }
    }

    guardarDB(db);

    await interaction.reply({
      content:
        `🗑️ Se eliminaron datos tuyos de **${eliminados} categorías** en este servidor.\n\n` +
        "⚠️ Esto solo afecta los datos almacenados localmente por DARK FF V1.",
      ephemeral: true
    });
  }
});

/* =========================================================
   /deletedata
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("deletedata")
    .setDescription("Elimina tus datos locales del bot"),

  async execute(interaction) {
    const db = cargarDB();

    let eliminados = 0;

    for (const datos of Object.values(db)) {
      if (!datos || typeof datos !== "object") continue;

      const servidor = datos[interaction.guildId];

      if (
        servidor &&
        typeof servidor === "object" &&
        servidor[interaction.user.id] !== undefined
      ) {
        delete servidor[interaction.user.id];
        eliminados++;
      }
    }

    guardarDB(db);

    await interaction.reply({
      content:
        `✅ Eliminación completada.\n\n` +
        `Categorías modificadas: **${eliminados}**`,
      ephemeral: true
    });
  }
});

/* =========================================================
   /exportdata
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("exportdata")
    .setDescription("Exporta tus datos almacenados por el bot"),

  async execute(interaction) {
    const db = cargarDB();

    const datos = obtenerDatosUsuario(
      db,
      interaction.guildId,
      interaction.user.id
    );

    const contenido = JSON.stringify(
      {
        usuario: {
          id: interaction.user.id,
          username: interaction.user.tag
        },
        servidor: interaction.guildId,
        datos
      },
      null,
      2
    );

    const archivo = Buffer.from(contenido, "utf8");

    await interaction.reply({
      content: "📦 Aquí tienes los datos almacenados por DARK FF V1.",
      files: [
        {
          attachment: archivo,
          name: "mis-datos-dark-ff.json"
        }
      ],
      ephemeral: true
    });
  }
});

/* =========================================================
   /privacysettings
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("privacysettings")
    .setDescription("Muestra las opciones de privacidad disponibles"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("⚙️ Configuración de privacidad")
      .setDescription(
        [
          "🔎 `/mydata` — Ver tus datos.",
          "📦 `/exportdata` — Exportar tus datos.",
          "🗑️ `/deleteaccount` — Eliminar tus datos.",
          "🗑️ `/deletedata` — Eliminar tus datos locales.",
          "📊 `/datastatus` — Ver el estado de la base de datos.",
          "🔐 `/privacy` — Información de privacidad."
        ].join("\n")
      )
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   /datastatus
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("datastatus")
    .setDescription("Muestra el estado de tus datos"),

  async execute(interaction) {
    const db = cargarDB();

    const datos = obtenerDatosUsuario(
      db,
      interaction.guildId,
      interaction.user.id
    );

    const cantidad = Object.keys(datos).length;

    const embed = new EmbedBuilder()
      .setTitle("📊 Estado de tus datos")
      .addFields(
        {
          name: "📁 Categorías con datos",
          value: `\`${cantidad}\``,
          inline: true
        },
        {
          name: "🗄️ Base de datos",
          value: "🟢 Disponible",
          inline: true
        },
        {
          name: "🔐 Acceso",
          value: "Solo tu cuenta puede solicitar estos datos mediante estos comandos.",
          inline: false
        }
      )
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   /privacyhelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("privacyhelp")
    .setDescription("Muestra los comandos de privacidad"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🔐 Comandos de privacidad")
      .setDescription(
        [
          "`/privacy` — Información de privacidad.",
          "`/mydata` — Ver tus datos.",
          "`/deleteaccount` — Eliminar tus datos.",
          "`/deletedata` — Eliminar datos locales.",
          "`/exportdata` — Exportar tus datos.",
          "`/privacysettings` — Opciones de privacidad.",
          "`/datastatus` — Estado de tus datos.",
          "`/privacyhelp` — Esta ayuda."
        ].join("\n")
      )
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   EXPORTACIÓN
========================================================= */

module.exports = commands;
