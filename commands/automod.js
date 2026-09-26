const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.json");

/* =========================
   BASE DE DATOS
========================= */

function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, "{}", "utf8");
    }

    const raw = fs.readFileSync(DB_PATH, "utf8").trim();

    if (!raw) return {};

    const db = JSON.parse(raw);

    if (!db.automod) {
      db.automod = {};
    }

    return db;
  } catch (error) {
    console.error("Error leyendo database.json:", error);

    return {
      automod: {}
    };
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify(db, null, 2),
      "utf8"
    );

    return true;
  } catch (error) {
    console.error("Error guardando database.json:", error);

    return false;
  }
}

/* =========================
   CONFIGURACIÓN
========================= */

function getConfig(db, guildId) {
  if (!db.automod[guildId]) {
    db.automod[guildId] = {
      activado: true,

      antiLinks: true,
      antiSpam: true,
      antiFlood: true,
      antiMentionSpam: true,

      palabras: [],

      spamMax: 5,
      spamVentana: 5000,

      floodMax: 3,
      floodVentana: 3000,

      mentionMax: 5,

      accion: "warn",

      logs: null
    };
  }

  return db.automod[guildId];
}

/* =========================
   DETECTAR LINK
========================= */

function contieneLink(texto) {
  const regex =
    /(https?:\/\/|www\.|discord\.gg\/|discord\.com\/invite\/)/i;

  return regex.test(texto);
}

/* =========================
   NORMALIZAR TEXTO
========================= */

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/* =========================
   VARIABLES TEMPORALES
========================= */

const mensajes = new Map();
const flood = new Map();

/* =========================
   EJECUTAR ACCIÓN
========================= */

async function ejecutarAccion(message, config, motivo) {
  try {
    if (
      config.accion === "delete" ||
      config.accion === "warn"
    ) {
      await message.delete().catch(() => {});
    }

    if (
      config.accion === "timeout" &&
      message.member
    ) {
      await message.member
        .timeout(
          10 * 60 * 1000,
          `AutoMod: ${motivo}`
        )
        .catch(() => {});

      await message.delete().catch(() => {});
    }

    if (config.accion === "warn") {
      await message.channel
        .send({
          content:
            `⚠️ ${message.author}, tu mensaje fue eliminado por **${motivo}**.`
        })
        .then(msg => {
          setTimeout(() => {
            msg.delete().catch(() => {});
          }, 5000);
        })
        .catch(() => {});
    }

    if (config.accion === "delete") {
      await message.channel
        .send({
          content:
            `🛡️ ${message.author}, tu mensaje fue eliminado por **${motivo}**.`
        })
        .then(msg => {
          setTimeout(() => {
            msg.delete().catch(() => {});
          }, 5000);
        })
        .catch(() => {});
    }

    if (config.logs) {
      const canal =
        message.guild.channels.cache.get(
          config.logs
        );

      if (canal) {
        const embed =
          new EmbedBuilder()
            .setTitle("🛡️ AutoMod")
            .setDescription(
              `Se detectó una infracción automáticamente.`
            )
            .addFields(
              {
                name: "👤 Usuario",
                value: `${message.author}`,
                inline: true
              },
              {
                name: "📋 Motivo",
                value: motivo,
                inline: true
              },
              {
                name: "📍 Canal",
                value: `${message.channel}`,
                inline: true
              }
            )
            .setColor(0xed4245)
            .setTimestamp();

        canal.send({
          embeds: [embed]
        }).catch(() => {});
      }
    }
  } catch (error) {
    console.error(
      "Error ejecutando AutoMod:",
      error
    );
  }
}

/* =========================
   COMANDO
========================= */

module.exports = {
  data: new SlashCommandBuilder()
    .setName("automod")
    .setDescription(
      "🛡️ Sistema automático de moderación"
    )

    /* ESTADO */
    .addSubcommand(sub =>
      sub
        .setName("estado")
        .setDescription(
          "Muestra el estado de AutoMod"
        )
    )

    /* ACTIVAR */
    .addSubcommand(sub =>
      sub
        .setName("activar")
        .setDescription(
          "Activa AutoMod"
        )
    )

    /* DESACTIVAR */
    .addSubcommand(sub =>
      sub
        .setName("desactivar")
        .setDescription(
          "Desactiva AutoMod"
        )
    )

    /* CONFIGURAR */
    .addSubcommand(sub =>
      sub
        .setName("configurar")
        .setDescription(
          "Configura AutoMod"
        )
        .addBooleanOption(option =>
          option
            .setName("antilinks")
            .setDescription(
              "Bloquear enlaces"
            )
        )
        .addBooleanOption(option =>
          option
            .setName("antispam")
            .setDescription(
              "Detectar spam"
            )
        )
        .addBooleanOption(option =>
          option
            .setName("antiflood")
            .setDescription(
              "Detectar flood"
            )
        )
        .addBooleanOption(option =>
          option
            .setName("antimention")
            .setDescription(
              "Detectar mention spam"
            )
        )
        .addIntegerOption(option =>
          option
            .setName("maxspam")
            .setDescription(
              "Mensajes permitidos antes de detectar spam"
            )
            .setMinValue(2)
            .setMaxValue(20)
        )
        .addIntegerOption(option =>
          option
            .setName("maxmenciones")
            .setDescription(
              "Menciones máximas"
            )
            .setMinValue(2)
            .setMaxValue(20)
        )
    )

    /* PALABRA */
    .addSubcommand(sub =>
      sub
        .setName("palabra")
        .setDescription(
          "Gestiona palabras bloqueadas"
        )
        .addStringOption(option =>
          option
            .setName("accion")
            .setDescription(
              "Acción"
            )
            .setRequired(true)
            .addChoices(
              {
                name: "➕ Añadir",
                value: "add"
              },
              {
                name: "➖ Eliminar",
                value: "remove"
              },
              {
                name: "📋 Lista",
                value: "list"
              }
            )
        )
        .addStringOption(option =>
          option
            .setName("palabra")
            .setDescription(
              "Palabra que quieres gestionar"
            )
            .setRequired(false)
        )
    )

    /* ACCIÓN */
    .addSubcommand(sub =>
      sub
        .setName("accion")
        .setDescription(
          "Configura la acción automática"
        )
        .addStringOption(option =>
          option
            .setName("tipo")
            .setDescription(
              "Acción"
            )
            .setRequired(true)
            .addChoices(
              {
                name: "⚠️ Advertir",
                value: "warn"
              },
              {
                name: "🗑️ Eliminar",
                value: "delete"
              },
              {
                name: "🔇 Silenciar 10 minutos",
                value: "timeout"
              }
            )
        )
    )

    /* LOGS */
    .addSubcommand(sub =>
      sub
        .setName("logs")
        .setDescription(
          "Configura el canal de logs"
        )
        .addChannelOption(option =>
          option
            .setName("canal")
            .setDescription(
              "Canal donde se enviarán los logs"
            )
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content:
          "❌ Este comando solo funciona en servidores.",
        ephemeral: true
      });
    }

    if (
      !interaction.member.permissions.has(
        PermissionFlagsBits.ManageGuild
      )
    ) {
      return interaction.reply({
        content:
          "❌ Necesitas el permiso **Gestionar servidor**.",
        ephemeral: true
      });
    }

    const sub =
      interaction.options.getSubcommand();

    const db = loadDB();

    const config =
      getConfig(
        db,
        interaction.guild.id
      );

    /* =========================
       ESTADO
    ========================= */

    if (sub === "estado") {
      const embed =
        new EmbedBuilder()
          .setTitle("🛡️ AutoMod")
          .addFields(
            {
              name: "🔘 Estado",
              value:
                config.activado
                  ? "🟢 Activado"
                  : "🔴 Desactivado",
              inline: true
            },
            {
              name: "🔗 AntiLinks",
              value:
                config.antiLinks
                  ? "🟢"
                  : "🔴",
              inline: true
            },
            {
              name: "📨 AntiSpam",
              value:
                config.antiSpam
                  ? "🟢"
                  : "🔴",
              inline: true
            },
            {
              name: "🌊 AntiFlood",
              value:
                config.antiFlood
                  ? "🟢"
                  : "🔴",
              inline: true
            },
            {
              name: "📢 AntiMention",
              value:
                config.antiMentionSpam
                  ? "🟢"
                  : "🔴",
              inline: true
            },
            {
              name: "🚨 Acción",
              value:
                config.accion,
              inline: true
            }
          )
          .setColor(0x5865f2)
          .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }

    /* =========================
       ACTIVAR
    ========================= */

    if (sub === "activar") {
      config.activado = true;

      saveDB(db);

      return interaction.reply({
        content:
          "🟢 **AutoMod activado correctamente.**"
      });
    }

    /* =========================
       DESACTIVAR
    ========================= */

    if (sub === "desactivar") {
      config.activado = false;

      saveDB(db);

      return interaction.reply({
        content:
          "🔴 **AutoMod desactivado.**"
      });
    }

    /* =========================
       CONFIGURAR
    ========================= */

    if (sub === "configurar") {
      const antilinks =
        interaction.options.getBoolean(
          "antilinks"
        );

      const antispam =
        interaction.options.getBoolean(
          "antispam"
        );

      const antiflood =
        interaction.options.getBoolean(
          "antiflood"
        );

      const antimention =
        interaction.options.getBoolean(
          "antimention"
        );

      const maxspam =
        interaction.options.getInteger(
          "maxspam"
        );

      const maxmenciones =
        interaction.options.getInteger(
          "maxmenciones"
        );

      if (antilinks !== null) {
        config.antiLinks =
          antilinks;
      }

      if (antispam !== null) {
        config.antiSpam =
          antispam;
      }

      if (antiflood !== null) {
        config.antiFlood =
          antiflood;
      }

      if (antimention !== null) {
        config.antiMentionSpam =
          antimention;
      }

      if (maxspam !== null) {
        config.spamMax =
          maxspam;
      }

      if (maxmenciones !== null) {
        config.mentionMax =
          maxmenciones;
      }

      saveDB(db);

      return interaction.reply({
        content:
          "✅ Configuración de AutoMod actualizada."
      });
    }

    /* =========================
       PALABRAS
    ========================= */

    if (sub === "palabra") {
      const accion =
        interaction.options.getString(
          "accion"
        );

      const palabra =
        interaction.options.getString(
          "palabra"
        );

      if (accion === "list") {
        if (
          config.palabras.length === 0
        ) {
          return interaction.reply({
            content:
              "📋 No hay palabras bloqueadas."
          });
        }

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(
                "🚫 Palabras bloqueadas"
              )
              .setDescription(
                config.palabras
                  .map(
                    (p, i) =>
                      `**${i + 1}.** \`${p}\``
                  )
                  .join("\n")
              )
              .setColor(0xed4245)
          ]
        });
      }

      if (!palabra) {
        return interaction.reply({
          content:
            "❌ Debes escribir una palabra.",
          ephemeral: true
        });
      }

      const normal =
        normalizar(palabra);

      if (accion === "add") {
        if (
          config.palabras.includes(
            normal
          )
        ) {
          return interaction.reply({
            content:
              "⚠️ Esa palabra ya está bloqueada.",
            ephemeral: true
          });
        }

        config.palabras.push(
          normal
        );

        saveDB(db);

        return interaction.reply({
          content:
            `✅ La palabra \`${normal}\` fue añadida a la lista.`
        });
      }

      if (accion === "remove") {
        const indice =
          config.palabras.indexOf(
            normal
          );

        if (indice === -1) {
          return interaction.reply({
            content:
              "❌ Esa palabra no está en la lista.",
            ephemeral: true
          });
        }

        config.palabras.splice(
          indice,
          1
        );

        saveDB(db);

        return interaction.reply({
          content:
            `✅ La palabra \`${normal}\` fue eliminada.`
        });
      }
    }

    /* =========================
       ACCIÓN
    ========================= */

    if (sub === "accion") {
      const tipo =
        interaction.options.getString(
          "tipo"
        );

      config.accion =
        tipo;

      saveDB(db);

      return interaction.reply({
        content:
          `✅ Acción de AutoMod configurada como **${tipo}**.`
      });
    }

    /* =========================
       LOGS
    ========================= */

    if (sub === "logs") {
      const canal =
        interaction.options.getChannel(
          "canal"
        );

      config.logs =
        canal.id;

      saveDB(db);

      return interaction.reply({
        content:
          `📋 Los logs de AutoMod se enviarán en ${canal}.`
      });
    }
  },

  /* =========================
     EVENTO MESSAGE CREATE
  ========================= */

  async messageCreate(message) {
    if (!message.guild) return;
    if (message.author.bot) return;

    const db = loadDB();

    const config =
      getConfig(
        db,
        message.guild.id
      );

    if (!config.activado) {
      return;
    }

    /* =========================
       ANTI LINKS
    ========================= */

    if (
      config.antiLinks &&
      contieneLink(message.content)
    ) {
      await ejecutarAccion(
        message,
        config,
        "Enlace no permitido"
      );

      return;
    }

    /* =========================
       PALABRAS BLOQUEADAS
    ========================= */

    const texto =
      normalizar(
        message.content
      );

    const palabraBloqueada =
      config.palabras.find(
        palabra =>
          texto.includes(palabra)
      );

    if (palabraBloqueada) {
      await ejecutarAccion(
        message,
        config,
        "Palabra bloqueada"
      );

      return;
    }

    /* =========================
       ANTI MENTION SPAM
    ========================= */

    if (
      config.antiMentionSpam &&
      message.mentions.users.size >=
        config.mentionMax
    ) {
      await ejecutarAccion(
        message,
        config,
        "Mention spam"
      );

      return;
    }

    /* =========================
       ANTI SPAM
    ========================= */

    if (config.antiSpam) {
      const key =
        `${message.guild.id}:${message.author.id}`;

      const ahora =
        Date.now();

      if (!mensajes.has(key)) {
        mensajes.set(key, []);
      }

      const lista =
        mensajes.get(key);

      lista.push(ahora);

      const limite =
        ahora -
        config.spamVentana;

      while (
        lista.length &&
        lista[0] < limite
      ) {
        lista.shift();
      }

      if (
        lista.length >=
        config.spamMax
      ) {
        lista.length = 0;

        await ejecutarAccion(
          message,
          config,
          "Spam"
        );

        return;
      }
    }

    /* =========================
       ANTI FLOOD
    ========================= */

    if (config.antiFlood) {
      const key =
        `${message.guild.id}:${message.author.id}`;

      const contenido =
        normalizar(
          message.content
        );

      if (
        contenido.length > 0
      ) {
        if (!flood.has(key)) {
          flood.set(key, []);
        }

        const lista =
          flood.get(key);

        lista.push({
          contenido,
          tiempo: Date.now()
        });

        const limite =
          Date.now() -
          config.floodVentana;

        while (
          lista.length &&
          lista[0].tiempo <
            limite
        ) {
          lista.shift();
        }

        const repetidos =
          lista.filter(
            item =>
              item.contenido ===
              contenido
          );

        if (
          repetidos.length >=
          config.floodMax
        ) {
          lista.length = 0;

          await ejecutarAccion(
            message,
            config,
            "Flood"
          );
        }
      }
    }
  }
};
