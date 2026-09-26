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

    if (!db.niveles) {
      db.niveles = {};
    }

    return db;
  } catch (error) {
    console.error("Error leyendo database.json:", error);

    return {
      niveles: {}
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
   USUARIO
========================= */

function getUser(db, guildId, userId) {
  if (!db.niveles) {
    db.niveles = {};
  }

  if (!db.niveles[guildId]) {
    db.niveles[guildId] = {};
  }

  if (!db.niveles[guildId][userId]) {
    db.niveles[guildId][userId] = {
      xp: 0,
      nivel: 0,
      mensajes: 0,
      ultimoMensaje: 0
    };
  }

  return db.niveles[guildId][userId];
}

/* =========================
   CONFIGURACIÓN
========================= */

function getConfig(db, guildId) {
  if (!db.nivelesConfig) {
    db.nivelesConfig = {};
  }

  if (!db.nivelesConfig[guildId]) {
    db.nivelesConfig[guildId] = {
      activado: true,
      xpMin: 10,
      xpMax: 25,
      cooldown: 60000,
      canal: null,
      mensajeNivel: "🎉 ¡Felicidades {usuario}! Has subido al nivel **{nivel}**.",
      ignorarBots: true
    };
  }

  return db.nivelesConfig[guildId];
}

/* =========================
   XP NECESARIA
========================= */

function xpNecesaria(nivel) {
  return 100 + (nivel * 50);
}

/* =========================
   XP TOTAL PARA UN NIVEL
========================= */

function xpTotalParaNivel(nivel) {
  let total = 0;

  for (let i = 0; i < nivel; i++) {
    total += xpNecesaria(i);
  }

  return total;
}

/* =========================
   NIVEL ACTUAL
========================= */

function calcularNivel(xp) {
  let nivel = 0;
  let necesaria = xpNecesaria(nivel);

  while (xp >= necesaria) {
    xp -= necesaria;
    nivel++;
    necesaria = xpNecesaria(nivel);
  }

  return nivel;
}

/* =========================
   BARRA XP
========================= */

function barraXP(actual, necesaria) {
  const total = 10;

  const llenas = Math.round(
    (actual / necesaria) * total
  );

  const vacias = total - llenas;

  return (
    "🟩".repeat(Math.max(0, llenas)) +
    "⬜".repeat(Math.max(0, vacias))
  );
}

/* =========================
   RANDOM
========================= */

function random(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

/* =========================
   COMANDO
========================= */

module.exports = {
  data: new SlashCommandBuilder()
    .setName("niveles")
    .setDescription("Sistema completo de niveles y experiencia")

    /* PERFIL */
    .addSubcommand(sub =>
      sub
        .setName("perfil")
        .setDescription("Muestra tu nivel y experiencia")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario")
            .setRequired(false)
        )
    )

    /* RANKING */
    .addSubcommand(sub =>
      sub
        .setName("ranking")
        .setDescription("Muestra el ranking de niveles")
    )

    /* XP */
    .addSubcommand(sub =>
      sub
        .setName("xp")
        .setDescription("Muestra tu experiencia")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario")
            .setRequired(false)
        )
    )

    /* NIVEL */
    .addSubcommand(sub =>
      sub
        .setName("nivel")
        .setDescription("Muestra el nivel de un usuario")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario")
            .setRequired(false)
        )
    )

    /* DAR XP */
    .addSubcommand(sub =>
      sub
        .setName("darxp")
        .setDescription("Da experiencia a un usuario")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario")
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName("cantidad")
            .setDescription("Cantidad de XP")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100000)
        )
    )

    /* QUITAR XP */
    .addSubcommand(sub =>
      sub
        .setName("quitarxp")
        .setDescription("Quita experiencia a un usuario")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario")
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName("cantidad")
            .setDescription("Cantidad de XP")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100000)
        )
    )

    /* RESET */
    .addSubcommand(sub =>
      sub
        .setName("reset")
        .setDescription("Reinicia el nivel de un usuario")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario")
            .setRequired(true)
        )
    )

    /* ACTIVAR */
    .addSubcommand(sub =>
      sub
        .setName("activar")
        .setDescription("Activa el sistema de niveles")
    )

    /* DESACTIVAR */
    .addSubcommand(sub =>
      sub
        .setName("desactivar")
        .setDescription("Desactiva el sistema de niveles")
    )

    /* CONFIG */
    .addSubcommand(sub =>
      sub
        .setName("config")
        .setDescription("Muestra la configuración de niveles")
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content:
          "❌ Este comando solo funciona dentro de un servidor.",
        ephemeral: true
      });
    }

    const subcommand =
      interaction.options.getSubcommand();

    const db = loadDB();

    const config = getConfig(
      db,
      interaction.guild.id
    );

    /* =========================
       PERFIL
    ========================= */

    if (subcommand === "perfil") {
      const usuario =
        interaction.options.getUser("usuario") ||
        interaction.user;

      const datos = getUser(
        db,
        interaction.guild.id,
        usuario.id
      );

      const nivel = calcularNivel(datos.xp);

      const xpAnterior =
        xpTotalParaNivel(nivel);

      const xpSiguiente =
        xpNecesaria(nivel);

      const xpActual =
        datos.xp - xpAnterior;

      const progreso =
        Math.min(xpActual, xpSiguiente);

      const porcentaje = Math.floor(
        (progreso / xpSiguiente) * 100
      );

      const embed = new EmbedBuilder()
        .setTitle("⭐ Perfil de niveles")
        .setDescription(
          `Perfil de experiencia de ${usuario}`
        )
        .setThumbnail(
          usuario.displayAvatarURL({
            extension: "png",
            size: 256
          })
        )
        .addFields(
          {
            name: "🏆 Nivel",
            value: `**${nivel}**`,
            inline: true
          },
          {
            name: "✨ XP total",
            value: `**${datos.xp.toLocaleString()} XP**`,
            inline: true
          },
          {
            name: "💬 Mensajes",
            value: `**${datos.mensajes.toLocaleString()}**`,
            inline: true
          },
          {
            name: "📈 Progreso",
            value:
              `${barraXP(progreso, xpSiguiente)}\n` +
              `**${progreso} / ${xpSiguiente} XP** (${porcentaje}%)`,
            inline: false
          }
        )
        .setColor(0x5865f2)
        .setTimestamp();

      saveDB(db);

      return interaction.reply({
        embeds: [embed]
      });
    }

    /* =========================
       RANKING
    ========================= */

    if (subcommand === "ranking") {
      const usuarios =
        db.niveles[interaction.guild.id] || {};

      const ranking = Object.entries(usuarios)
        .map(([id, datos]) => ({
          id,
          xp: Number(datos.xp || 0),
          nivel: calcularNivel(
            Number(datos.xp || 0)
          )
        }))
        .sort((a, b) => {
          if (b.nivel !== a.nivel) {
            return b.nivel - a.nivel;
          }

          return b.xp - a.xp;
        })
        .slice(0, 10);

      if (ranking.length === 0) {
        return interaction.reply({
          content:
            "📊 Todavía no hay usuarios con experiencia."
        });
      }

      const lineas = [];

      for (let i = 0; i < ranking.length; i++) {
        const usuario =
          await interaction.client.users
            .fetch(ranking[i].id)
            .catch(() => null);

        const nombre = usuario
          ? usuario.username
          : `Usuario ${ranking[i].id}`;

        lineas.push(
          `**${i + 1}.** ${nombre} — Nivel **${ranking[i].nivel}** • **${ranking[i].xp.toLocaleString()} XP**`
        );
      }

      const embed = new EmbedBuilder()
        .setTitle("🏆 Ranking de niveles")
        .setDescription(
          lineas.join("\n")
        )
        .setColor(0xfee75c)
        .setFooter({
          text: "Axel XIT • Sistema de niveles"
        })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }

    /* =========================
       XP
    ========================= */

    if (subcommand === "xp") {
      const usuario =
        interaction.options.getUser("usuario") ||
        interaction.user;

      const datos = getUser(
        db,
        interaction.guild.id,
        usuario.id
      );

      const nivel =
        calcularNivel(datos.xp);

      return interaction.reply({
        content:
          `✨ **${usuario.username}** tiene ` +
          `**${datos.xp.toLocaleString()} XP** y está en el nivel **${nivel}**.`
      });
    }

    /* =========================
       NIVEL
    ========================= */

    if (subcommand === "nivel") {
      const usuario =
        interaction.options.getUser("usuario") ||
        interaction.user;

      const datos = getUser(
        db,
        interaction.guild.id,
        usuario.id
      );

      const nivel =
        calcularNivel(datos.xp);

      return interaction.reply({
        content:
          `🏆 **${usuario.username}** está en el nivel **${nivel}**.`
      });
    }

    /* =========================
       DAR XP
    ========================= */

    if (subcommand === "darxp") {
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

      const usuario =
        interaction.options.getUser("usuario");

      const cantidad =
        interaction.options.getInteger("cantidad");

      const datos = getUser(
        db,
        interaction.guild.id,
        usuario.id
      );

      const nivelAnterior =
        calcularNivel(datos.xp);

      datos.xp += cantidad;

      const nivelNuevo =
        calcularNivel(datos.xp);

      saveDB(db);

      const embed = new EmbedBuilder()
        .setTitle("✨ XP añadida")
        .setDescription(
          `Se añadieron **${cantidad.toLocaleString()} XP** a ${usuario}.`
        )
        .addFields(
          {
            name: "✨ XP total",
            value: `${datos.xp.toLocaleString()} XP`,
            inline: true
          },
          {
            name: "🏆 Nivel",
            value: `${nivelNuevo}`,
            inline: true
          }
        )
        .setColor(0x57f287)
        .setTimestamp();

      if (nivelNuevo > nivelAnterior) {
        embed.addFields({
          name: "🎉 Subida de nivel",
          value:
            `Subió del nivel **${nivelAnterior}** al **${nivelNuevo}**.`
        });
      }

      return interaction.reply({
        embeds: [embed]
      });
    }

    /* =========================
       QUITAR XP
    ========================= */

    if (subcommand === "quitarxp") {
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

      const usuario =
        interaction.options.getUser("usuario");

      const cantidad =
        interaction.options.getInteger("cantidad");

      const datos = getUser(
        db,
        interaction.guild.id,
        usuario.id
      );

      datos.xp = Math.max(
        0,
        datos.xp - cantidad
      );

      const nivel =
        calcularNivel(datos.xp);

      saveDB(db);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("➖ XP retirada")
            .setDescription(
              `Se quitaron **${cantidad.toLocaleString()} XP** a ${usuario}.`
            )
            .addFields(
              {
                name: "✨ XP actual",
                value: `${datos.xp.toLocaleString()} XP`,
                inline: true
              },
              {
                name: "🏆 Nivel",
                value: `${nivel}`,
                inline: true
              }
            )
            .setColor(0xed4245)
            .setTimestamp()
        ]
      });
    }

    /* =========================
       RESET
    ========================= */

    if (subcommand === "reset") {
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

      const usuario =
        interaction.options.getUser("usuario");

      const datos = getUser(
        db,
        interaction.guild.id,
        usuario.id
      );

      datos.xp = 0;
      datos.nivel = 0;
      datos.mensajes = 0;
      datos.ultimoMensaje = 0;

      saveDB(db);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("♻️ Nivel reiniciado")
            .setDescription(
              `El progreso de ${usuario} fue reiniciado.`
            )
            .setColor(0xed4245)
            .setTimestamp()
        ]
      });
    }

    /* =========================
       ACTIVAR
    ========================= */

    if (subcommand === "activar") {
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

      config.activado = true;

      saveDB(db);

      return interaction.reply({
        content:
          "✅ El sistema de niveles fue **activado**."
      });
    }

    /* =========================
       DESACTIVAR
    ========================= */

    if (subcommand === "desactivar") {
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

      config.activado = false;

      saveDB(db);

      return interaction.reply({
        content:
          "⛔ El sistema de niveles fue **desactivado**."
      });
    }

    /* =========================
       CONFIG
    ========================= */

    if (subcommand === "config") {
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

      const embed = new EmbedBuilder()
        .setTitle("⚙️ Configuración de niveles")
        .addFields(
          {
            name: "🔘 Estado",
            value: config.activado
              ? "🟢 Activado"
              : "🔴 Desactivado",
            inline: true
          },
          {
            name: "✨ XP mínima",
            value: `${config.xpMin}`,
            inline: true
          },
          {
            name: "✨ XP máxima",
            value: `${config.xpMax}`,
            inline: true
          },
          {
            name: "⏱️ Cooldown",
            value: `${config.cooldown / 1000}s`,
            inline: true
          },
          {
            name: "📢 Canal de subida",
            value: config.canal
              ? `<#${config.canal}>`
              : "Canal donde se envía el mensaje",
            inline: true
          },
          {
            name: "🤖 Ignorar bots",
            value: config.ignorarBots
              ? "Sí"
              : "No",
            inline: true
          }
        )
        .setColor(0x5865f2)
        .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }
  },

  /* =========================
     DAR XP AUTOMÁTICAMENTE
  ========================= */

  async messageCreate(message) {
    if (!message.guild) return;

    if (message.author.bot) return;

    const db = loadDB();

    const config = getConfig(
      db,
      message.guild.id
    );

    if (!config.activado) return;

    if (
      config.ignorarBots &&
      message.author.bot
    ) {
      return;
    }

    const datos = getUser(
      db,
      message.guild.id,
      message.author.id
    );

    const ahora = Date.now();

    if (
      ahora - datos.ultimoMensaje <
      config.cooldown
    ) {
      return;
    }

    const nivelAnterior =
      calcularNivel(datos.xp);

    const cantidad =
      random(
        config.xpMin,
        config.xpMax
      );

    datos.xp += cantidad;
    datos.mensajes += 1;
    datos.ultimoMensaje = ahora;

    const nivelNuevo =
      calcularNivel(datos.xp);

    saveDB(db);

    if (nivelNuevo <= nivelAnterior) {
      return;
    }

    const canalId =
      config.canal || message.channel.id;

    const canal =
      message.guild.channels.cache.get(
        canalId
      );

    if (!canal) return;

    const texto =
      config.mensajeNivel
        .replace(
          /{usuario}/g,
          `${message.author}`
        )
        .replace(
          /{nivel}/g,
          `${nivelNuevo}`
        );

    await canal.send({
      content: texto
    }).catch(() => {});
  }
};
