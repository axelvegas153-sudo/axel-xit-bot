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

    if (!db.giveaways) {
      db.giveaways = {};
    }

    return db;
  } catch (error) {
    console.error(
      "Error leyendo database.json:",
      error
    );

    return {
      giveaways: {}
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
    console.error(
      "Error guardando database.json:",
      error
    );

    return false;
  }
}

/* =========================
   UTILIDADES
========================= */

function generarId() {
  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2, 8)
  );
}

function parseDuracion(texto) {
  if (!texto) return null;

  const match = texto
    .toLowerCase()
    .trim()
    .match(/^(\d+)\s*(s|m|h|d|w)$/);

  if (!match) return null;

  const cantidad =
    Number(match[1]);

  const unidad =
    match[2];

  const multiplicadores = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000
  };

  return cantidad * multiplicadores[unidad];
}

function tiempoTexto(ms) {
  const segundos =
    Math.floor(ms / 1000);

  if (segundos < 60) {
    return `${segundos}s`;
  }

  const minutos =
    Math.floor(segundos / 60);

  if (minutos < 60) {
    return `${minutos}m`;
  }

  const horas =
    Math.floor(minutos / 60);

  if (horas < 24) {
    return `${horas}h`;
  }

  const dias =
    Math.floor(horas / 24);

  return `${dias}d`;
}

function obtenerGanadores(
  participantes,
  cantidad
) {
  const disponibles =
    [...participantes];

  const ganadores = [];

  while (
    ganadores.length < cantidad &&
    disponibles.length > 0
  ) {
    const indice =
      Math.floor(
        Math.random() *
          disponibles.length
      );

    ganadores.push(
      disponibles[indice]
    );

    disponibles.splice(
      indice,
      1
    );
  }

  return ganadores;
}

/* =========================
   CREAR EMBED
========================= */

function crearEmbed(giveaway) {
  const ahora = Date.now();

  if (giveaway.finalizado) {
    return new EmbedBuilder()
      .setTitle("🎁 GIVEAWAY FINALIZADO")
      .setDescription(
        `## 🎉 ${giveaway.premio}\n\n` +
        `🏆 Ganador(es): ${
          giveaway.ganadores.length
            ? giveaway.ganadores
                .map(id => `<@${id}>`)
                .join(", ")
            : "Nadie"
        }\n\n` +
        `👥 Participantes: **${giveaway.participantes.length}**`
      )
      .addFields(
        {
          name: "🏆 Ganadores",
          value:
            `${giveaway.cantidadGanadores}`,
          inline: true
        },
        {
          name: "👥 Participantes",
          value:
            `${giveaway.participantes.length}`,
          inline: true
        }
      )
      .setColor(0x57f287)
      .setTimestamp();
  }

  const restante =
    Math.max(
      0,
      giveaway.finaliza - ahora
    );

  return new EmbedBuilder()
    .setTitle("🎁 GIVEAWAY")
    .setDescription(
      `## 🎉 ${giveaway.premio}\n\n` +
      `🏆 **Ganadores:** ${giveaway.cantidadGanadores}\n` +
      `⏰ **Termina:** <t:${Math.floor(
        giveaway.finaliza / 1000
      )}:R>\n\n` +
      `👥 **Participantes:** ${giveaway.participantes.length}\n\n` +
      `🎁 Reacciona con 🎉 para participar.`
    )
    .addFields({
      name: "⏱️ Tiempo restante",
      value:
        tiempoTexto(restante),
      inline: true
    })
    .setColor(0xfee75c)
    .setFooter({
      text:
        `Giveaway ID: ${giveaway.id}`
    })
    .setTimestamp();
}

/* =========================
   FINALIZAR GIVEAWAY
========================= */

async function finalizarGiveaway(
  client,
  id
) {
  const db = loadDB();

  const giveaway =
    db.giveaways[id];

  if (!giveaway) return;

  if (giveaway.finalizado) {
    return;
  }

  giveaway.finalizado = true;

  const ganadores =
    obtenerGanadores(
      giveaway.participantes,
      giveaway.cantidadGanadores
    );

  giveaway.ganadores =
    ganadores;

  saveDB(db);

  try {
    const canal =
      await client.channels.fetch(
        giveaway.canalId
      );

    if (!canal) return;

    const mensaje =
      await canal.messages.fetch(
        giveaway.mensajeId
      );

    const embed =
      crearEmbed(giveaway);

    await mensaje.edit({
      embeds: [embed]
    });

    if (ganadores.length === 0) {
      await canal.send(
        `🎁 **Giveaway terminado:** ${giveaway.premio}\n\n` +
        `❌ No hubo suficientes participantes.`
      );

      return;
    }

    await canal.send(
      `🎉 **¡Giveaway terminado!**\n\n` +
      `🎁 Premio: **${giveaway.premio}**\n` +
      `🏆 Ganador(es): ${ganadores
        .map(id => `<@${id}>`)
        .join(", ")}`
    );
  } catch (error) {
    console.error(
      "Error finalizando giveaway:",
      error
    );
  }
}

/* =========================
   COMANDO
========================= */

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaways")
    .setDescription(
      "🎁 Sistema de sorteos"
    )

    /* CREAR */
    .addSubcommand(sub =>
      sub
        .setName("crear")
        .setDescription(
          "Crea un giveaway"
        )
        .addStringOption(option =>
          option
            .setName("duracion")
            .setDescription(
              "Ejemplo: 10m, 1h, 2d"
            )
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("premio")
            .setDescription(
              "Premio del giveaway"
            )
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName("ganadores")
            .setDescription(
              "Cantidad de ganadores"
            )
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(20)
        )
    )

    /* TERMINAR */
    .addSubcommand(sub =>
      sub
        .setName("terminar")
        .setDescription(
          "Termina un giveaway"
        )
        .addStringOption(option =>
          option
            .setName("id")
            .setDescription(
              "ID del giveaway"
            )
            .setRequired(true)
        )
    )

    /* CANCELAR */
    .addSubcommand(sub =>
      sub
        .setName("cancelar")
        .setDescription(
          "Cancela un giveaway"
        )
        .addStringOption(option =>
          option
            .setName("id")
            .setDescription(
              "ID del giveaway"
            )
            .setRequired(true)
        )
    )

    /* REROLL */
    .addSubcommand(sub =>
      sub
        .setName("reroll")
        .setDescription(
          "Elige nuevos ganadores"
        )
        .addStringOption(option =>
          option
            .setName("id")
            .setDescription(
              "ID del giveaway"
            )
            .setRequired(true)
        )
    )

    /* LISTA */
    .addSubcommand(sub =>
      sub
        .setName("lista")
        .setDescription(
          "Muestra los giveaways"
        )
    )

    /* INFO */
    .addSubcommand(sub =>
      sub
        .setName("info")
        .setDescription(
          "Muestra información de un giveaway"
        )
        .addStringOption(option =>
          option
            .setName("id")
            .setDescription(
              "ID del giveaway"
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

    const sub =
      interaction.options.getSubcommand();

    const db = loadDB();

    /* =========================
       CREAR
    ========================= */

    if (sub === "crear") {
      if (
        !interaction.member.permissions.has(
          PermissionFlagsBits.ManageGuild
        )
      ) {
        return interaction.reply({
          content:
            "❌ Necesitas **Gestionar servidor**.",
          ephemeral: true
        });
      }

      const duracionTexto =
        interaction.options.getString(
          "duracion"
        );

      const premio =
        interaction.options.getString(
          "premio"
        );

      const cantidadGanadores =
        interaction.options.getInteger(
          "ganadores"
        );

      const duracion =
        parseDuracion(
          duracionTexto
        );

      if (!duracion) {
        return interaction.reply({
          content:
            "❌ Duración inválida.\n\nEjemplos: `10s`, `10m`, `1h`, `2d`, `1w`.",
          ephemeral: true
        });
      }

      if (duracion < 10_000) {
        return interaction.reply({
          content:
            "❌ La duración mínima es de **10 segundos**.",
          ephemeral: true
        });
      }

      const id =
        generarId();

      const giveaway = {
        id,
        guildId:
          interaction.guild.id,
        canalId:
          interaction.channel.id,
        mensajeId: null,
        creadorId:
          interaction.user.id,
        premio,
        cantidadGanadores,
        participantes: [],
        ganadores: [],
        creado: Date.now(),
        finaliza:
          Date.now() + duracion,
        finalizado: false,
        cancelado: false
      };

      db.giveaways[id] =
        giveaway;

      saveDB(db);

      const embed =
        crearEmbed(giveaway);

      const mensaje =
        await interaction.reply({
          embeds: [embed],
          fetchReply: true
        });

      giveaway.mensajeId =
        mensaje.id;

      await mensaje.react("🎉");

      saveDB(db);

      const temporizador =
        setTimeout(
          () =>
            finalizarGiveaway(
              interaction.client,
              id
            ),
          duracion
        );

      temporizador.unref?.();

      return;
    }

    /* =========================
       TERMINAR
    ========================= */

    if (sub === "terminar") {
      if (
        !interaction.member.permissions.has(
          PermissionFlagsBits.ManageGuild
        )
      ) {
        return interaction.reply({
          content:
            "❌ Necesitas **Gestionar servidor**.",
          ephemeral: true
        });
      }

      const id =
        interaction.options.getString(
          "id"
        );

      const giveaway =
        db.giveaways[id];

      if (!giveaway) {
        return interaction.reply({
          content:
            "❌ No existe ese giveaway.",
          ephemeral: true
        });
      }

      if (giveaway.finalizado) {
        return interaction.reply({
          content:
            "❌ Ese giveaway ya terminó.",
          ephemeral: true
        });
      }

      await finalizarGiveaway(
        interaction.client,
        id
      );

      return interaction.reply({
        content:
          "✅ Giveaway terminado."
      });
    }

    /* =========================
       CANCELAR
    ========================= */

    if (sub === "cancelar") {
      if (
        !interaction.member.permissions.has(
          PermissionFlagsBits.ManageGuild
        )
      ) {
        return interaction.reply({
          content:
            "❌ Necesitas **Gestionar servidor**.",
          ephemeral: true
        });
      }

      const id =
        interaction.options.getString(
          "id"
        );

      const giveaway =
        db.giveaways[id];

      if (!giveaway) {
        return interaction.reply({
          content:
            "❌ No existe ese giveaway.",
          ephemeral: true
        });
      }

      giveaway.finalizado =
        true;

      giveaway.cancelado =
        true;

      giveaway.ganadores =
        [];

      saveDB(db);

      try {
        const canal =
          await interaction.client.channels.fetch(
            giveaway.canalId
          );

        const mensaje =
          await canal.messages.fetch(
            giveaway.mensajeId
          );

        const embed =
          new EmbedBuilder()
            .setTitle(
              "🎁 GIVEAWAY CANCELADO"
            )
            .setDescription(
              `❌ El giveaway de **${giveaway.premio}** fue cancelado.`
            )
            .setColor(0xed4245)
            .setTimestamp();

        await mensaje.edit({
          embeds: [embed]
        });
      } catch (error) {
        console.error(error);
      }

      return interaction.reply({
        content:
          "🛑 Giveaway cancelado."
      });
    }

    /* =========================
       REROLL
    ========================= */

    if (sub === "reroll") {
      if (
        !interaction.member.permissions.has(
          PermissionFlagsBits.ManageGuild
        )
      ) {
        return interaction.reply({
          content:
            "❌ Necesitas **Gestionar servidor**.",
          ephemeral: true
        });
      }

      const id =
        interaction.options.getString(
          "id"
        );

      const giveaway =
        db.giveaways[id];

      if (!giveaway) {
        return interaction.reply({
          content:
            "❌ No existe ese giveaway.",
          ephemeral: true
        });
      }

      if (
        !giveaway.finalizado ||
        giveaway.cancelado
      ) {
        return interaction.reply({
          content:
            "❌ Ese giveaway todavía no ha terminado.",
          ephemeral: true
        });
      }

      const nuevos =
        obtenerGanadores(
          giveaway.participantes,
          giveaway.cantidadGanadores
        );

      giveaway.ganadores =
        nuevos;

      saveDB(db);

      return interaction.reply({
        content:
          `🎉 **Nuevo(s) ganador(es):** ${nuevos.length
            ? nuevos
                .map(id => `<@${id}>`)
                .join(", ")
            : "Nadie"}`
      });
    }

    /* =========================
       LISTA
    ========================= */

    if (sub === "lista") {
      const todos =
        Object.values(
          db.giveaways
        ).filter(
          giveaway =>
            giveaway.guildId ===
            interaction.guild.id
        );

      if (todos.length === 0) {
        return interaction.reply({
          content:
            "📭 No hay giveaways registrados."
        });
      }

      const activos =
        todos.filter(
          giveaway =>
            !giveaway.finalizado
        );

      const lineas =
        activos
          .slice(0, 10)
          .map(
            giveaway =>
              `🎁 **${giveaway.premio}**\n` +
              `🆔 \`${giveaway.id}\`\n` +
              `⏰ <t:${Math.floor(
                giveaway.finaliza /
                  1000
              )}:R>\n` +
              `👥 ${giveaway.participantes.length} participantes`
          );

      if (lineas.length === 0) {
        return interaction.reply({
          content:
            "📭 No hay giveaways activos."
        });
      }

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(
              "🎁 Giveaways activos"
            )
            .setDescription(
              lineas.join("\n\n")
            )
            .setColor(0xfee75c)
            .setTimestamp()
        ]
      });
    }

    /* =========================
       INFO
    ========================= */

    if (sub === "info") {
      const id =
        interaction.options.getString(
          "id"
        );

      const giveaway =
        db.giveaways[id];

      if (!giveaway) {
        return interaction.reply({
          content:
            "❌ No existe ese giveaway.",
          ephemeral: true
        });
      }

      const estado =
        giveaway.cancelado
          ? "🛑 Cancelado"
          : giveaway.finalizado
          ? "🏁 Finalizado"
          : "🟢 Activo";

      const embed =
        new EmbedBuilder()
          .setTitle(
            "🎁 Información del giveaway"
          )
          .setDescription(
            `## ${giveaway.premio}`
          )
          .addFields(
            {
              name: "🆔 ID",
              value:
                `\`${giveaway.id}\``,
              inline: false
            },
            {
              name: "📊 Estado",
              value: estado,
              inline: true
            },
            {
              name: "🏆 Ganadores",
              value:
                `${giveaway.cantidadGanadores}`,
              inline: true
            },
            {
              name: "👥 Participantes",
              value:
                `${giveaway.participantes.length}`,
              inline: true
            },
            {
              name: "👤 Creador",
              value:
                `<@${giveaway.creadorId}>`,
              inline: true
            },
            {
              name: "📢 Canal",
              value:
                `<#${giveaway.canalId}>`,
              inline: true
            }
          )
          .setColor(0x5865f2)
          .setTimestamp();

      if (giveaway.ganadores.length) {
        embed.addFields({
          name: "🎉 Ganador(es)",
          value:
            giveaway.ganadores
              .map(id => `<@${id}>`)
              .join(", ")
        });
      }

      return interaction.reply({
        embeds: [embed]
      });
    }
  },

  /* =========================
     PARTICIPACIÓN
  ========================= */

  async handleReaction(reaction, user) {
    if (user.bot) return;

    if (
      reaction.emoji.name !== "🎉"
    ) {
      return;
    }

    const db = loadDB();

    const giveaway =
      Object.values(
        db.giveaways
      ).find(
        item =>
          item.mensajeId ===
            reaction.message.id &&
          item.canalId ===
            reaction.message.channel.id
      );

    if (!giveaway) return;

    if (
      giveaway.finalizado ||
      giveaway.cancelado
    ) {
      return;
    }

    if (
      !giveaway.participantes.includes(
        user.id
      )
    ) {
      giveaway.participantes.push(
        user.id
      );

      saveDB(db);
    }
  },

  finalizarGiveaway
};
