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

    if (!db.economia) {
      db.economia = {};
    }

    return db;
  } catch (error) {
    console.error("Error leyendo database.json:", error);

    return {
      economia: {}
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

function getUser(db, guildId, userId) {
  if (!db.economia) {
    db.economia = {};
  }

  if (!db.economia[guildId]) {
    db.economia[guildId] = {};
  }

  if (!db.economia[guildId][userId]) {
    db.economia[guildId][userId] = {
      wallet: 100,
      bank: 0,
      totalEarned: 100,
      totalSpent: 0,
      work: 0,
      daily: 0,
      robberies: 0,
      successfulRobberies: 0,
      failedRobberies: 0,
      lastDaily: 0,
      lastWork: 0,
      lastRob: 0
    };
  }

  return db.economia[guildId][userId];
}

/* =========================
   FUNCIONES
========================= */

function money(amount) {
  return `${Number(amount || 0).toLocaleString("es-CO")} 🪙`;
}

function random(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

function remainingTime(last, cooldown) {
  return Math.max(
    0,
    cooldown - (Date.now() - last)
  );
}

function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );
  const seconds = totalSeconds % 60;

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  if (seconds > 0 && hours === 0) {
    parts.push(`${seconds}s`);
  }

  return parts.join(" ") || "0s";
}

/* =========================
   COMANDO
========================= */

module.exports = {
  data: new SlashCommandBuilder()
    .setName("economia")
    .setDescription("Sistema completo de economía de Axel XIT")

    /* BALANCE */
    .addSubcommand(sub =>
      sub
        .setName("balance")
        .setDescription("Muestra el balance de un usuario")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario")
            .setRequired(false)
        )
    )

    /* DAILY */
    .addSubcommand(sub =>
      sub
        .setName("daily")
        .setDescription("Recibe tu recompensa diaria")
    )

    /* TRABAJAR */
    .addSubcommand(sub =>
      sub
        .setName("trabajar")
        .setDescription("Trabaja para ganar monedas")
    )

    /* ROBAR */
    .addSubcommand(sub =>
      sub
        .setName("robar")
        .setDescription("Intenta robar dinero a otro usuario")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario objetivo")
            .setRequired(true)
        )
    )

    /* PAGAR */
    .addSubcommand(sub =>
      sub
        .setName("pagar")
        .setDescription("Paga monedas a otro usuario")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario que recibirá el dinero")
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName("cantidad")
            .setDescription("Cantidad")
            .setRequired(true)
            .setMinValue(1)
        )
    )

    /* DEPOSITAR */
    .addSubcommand(sub =>
      sub
        .setName("depositar")
        .setDescription("Deposita dinero en el banco")
        .addIntegerOption(option =>
          option
            .setName("cantidad")
            .setDescription("Cantidad")
            .setRequired(true)
            .setMinValue(1)
        )
    )

    /* RETIRAR */
    .addSubcommand(sub =>
      sub
        .setName("retirar")
        .setDescription("Retira dinero del banco")
        .addIntegerOption(option =>
          option
            .setName("cantidad")
            .setDescription("Cantidad")
            .setRequired(true)
            .setMinValue(1)
        )
    )

    /* TRANSFERIR */
    .addSubcommand(sub =>
      sub
        .setName("transferir")
        .setDescription("Mueve dinero entre cartera y banco")
        .addStringOption(option =>
          option
            .setName("tipo")
            .setDescription("Tipo de transferencia")
            .setRequired(true)
            .addChoices(
              {
                name: "Cartera → Banco",
                value: "depositar"
              },
              {
                name: "Banco → Cartera",
                value: "retirar"
              }
            )
        )
        .addIntegerOption(option =>
          option
            .setName("cantidad")
            .setDescription("Cantidad")
            .setRequired(true)
            .setMinValue(1)
        )
    )

    /* PERFIL */
    .addSubcommand(sub =>
      sub
        .setName("perfil")
        .setDescription("Muestra tu perfil económico")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario")
            .setRequired(false)
        )
    )

    /* ESTADÍSTICAS */
    .addSubcommand(sub =>
      sub
        .setName("estadisticas")
        .setDescription("Muestra estadísticas económicas")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario")
            .setRequired(false)
        )
    )

    /* LEADERBOARD */
    .addSubcommand(sub =>
      sub
        .setName("leaderboard")
        .setDescription("Muestra el ranking económico")
    )

    /* DINERO */
    .addSubcommand(sub =>
      sub
        .setName("dinero")
        .setDescription("Muestra el dinero total de un usuario")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario")
            .setRequired(false)
        )
    )

    /* RESET */
    .addSubcommand(sub =>
      sub
        .setName("reset")
        .setDescription("Reinicia la cuenta económica de un usuario")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario")
            .setRequired(true)
        )
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

    /* =========================
       BALANCE
    ========================= */

    if (subcommand === "balance") {
      const usuario =
        interaction.options.getUser("usuario") ||
        interaction.user;

      const datos = getUser(
        db,
        interaction.guild.id,
        usuario.id
      );

      saveDB(db);

      const total =
        datos.wallet + datos.bank;

      const embed = new EmbedBuilder()
        .setTitle("💰 Balance")
        .setDescription(
          `Balance económico de ${usuario}`
        )
        .setThumbnail(
          usuario.displayAvatarURL({
            extension: "png",
            size: 256
          })
        )
        .addFields(
          {
            name: "👛 Cartera",
            value: money(datos.wallet),
            inline: true
          },
          {
            name: "🏦 Banco",
            value: money(datos.bank),
            inline: true
          },
          {
            name: "💎 Total",
            value: money(total),
            inline: true
          }
        )
        .setColor(0x57f287)
        .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }

    /* =========================
       DAILY
    ========================= */

    if (subcommand === "daily") {
      const datos = getUser(
        db,
        interaction.guild.id,
        interaction.user.id
      );

      const cooldown =
        24 * 60 * 60 * 1000;

      const restante = remainingTime(
        datos.lastDaily,
        cooldown
      );

      if (restante > 0) {
        return interaction.reply({
          content:
            `⏰ Ya recogiste tu recompensa diaria.\n` +
            `Podrás volver a reclamarla en **${formatTime(restante)}**.`,
          ephemeral: true
        });
      }

      const recompensa = random(500, 1500);

      datos.wallet += recompensa;
      datos.totalEarned += recompensa;
      datos.daily += 1;
      datos.lastDaily = Date.now();

      saveDB(db);

      const embed = new EmbedBuilder()
        .setTitle("🎁 Recompensa diaria")
        .setDescription(
          `Has recibido **${money(recompensa)}**.`
        )
        .addFields({
          name: "💰 Nuevo balance",
          value: money(
            datos.wallet + datos.bank
          )
        })
        .setColor(0xfee75c)
        .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }

    /* =========================
       TRABAJAR
    ========================= */

    if (subcommand === "trabajar") {
      const datos = getUser(
        db,
        interaction.guild.id,
        interaction.user.id
      );

      const cooldown =
        30 * 60 * 1000;

      const restante = remainingTime(
        datos.lastWork,
        cooldown
      );

      if (restante > 0) {
        return interaction.reply({
          content:
            `⏰ Debes esperar **${formatTime(restante)}** para volver a trabajar.`,
          ephemeral: true
        });
      }

      const trabajos = [
        "programaste una página web",
        "hiciste un diseño",
        "ayudaste en una tienda",
        "arreglaste un servidor",
        "hiciste un trabajo freelance",
        "creaste contenido",
        "ayudaste a un cliente",
        "editaste un vídeo",
        "hiciste una miniatura"
      ];

      const trabajo =
        trabajos[
          random(0, trabajos.length - 1)
        ];

      const recompensa =
        random(150, 700);

      datos.wallet += recompensa;
      datos.totalEarned += recompensa;
      datos.work += 1;
      datos.lastWork = Date.now();

      saveDB(db);

      const embed = new EmbedBuilder()
        .setTitle("💼 Trabajo completado")
        .setDescription(
          `Has trabajado y **${trabajo}**.`
        )
        .addFields(
          {
            name: "💵 Ganancia",
            value: money(recompensa),
            inline: true
          },
          {
            name: "👛 Cartera",
            value: money(datos.wallet),
            inline: true
          },
          {
            name: "📊 Trabajos",
            value: `${datos.work}`,
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
       ROBAR
    ========================= */

    if (subcommand === "robar") {
      const objetivo =
        interaction.options.getUser("usuario");

      if (objetivo.id === interaction.user.id) {
        return interaction.reply({
          content:
            "❌ No puedes robarte a ti mismo.",
          ephemeral: true
        });
      }

      if (objetivo.bot) {
        return interaction.reply({
          content:
            "❌ No puedes robar a un bot.",
          ephemeral: true
        });
      }

      const ladron = getUser(
        db,
        interaction.guild.id,
        interaction.user.id
      );

      const victima = getUser(
        db,
        interaction.guild.id,
        objetivo.id
      );

      const cooldown =
        60 * 60 * 1000;

      const restante = remainingTime(
        ladron.lastRob,
        cooldown
      );

      if (restante > 0) {
        return interaction.reply({
          content:
            `⏰ Podrás volver a intentarlo en **${formatTime(restante)}**.`,
          ephemeral: true
        });
      }

      if (victima.wallet < 100) {
        return interaction.reply({
          content:
            "❌ Ese usuario no tiene suficiente dinero en su cartera.",
          ephemeral: true
        });
      }

      ladron.lastRob = Date.now();
      ladron.robberies += 1;

      const exito =
        Math.random() < 0.55;

      if (exito) {
        const maximo =
          Math.min(500, victima.wallet);

        const cantidad =
          random(50, maximo);

        victima.wallet -= cantidad;

        ladron.wallet += cantidad;
        ladron.totalEarned += cantidad;
        ladron.successfulRobberies += 1;

        saveDB(db);

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("🕵️ Robo exitoso")
              .setDescription(
                `${interaction.user} consiguió robar **${money(cantidad)}** a ${objetivo}.`
              )
              .setColor(0x57f287)
              .setTimestamp()
          ]
        });
      }

      const multa =
        Math.min(
          random(50, 250),
          ladron.wallet
        );

      ladron.wallet -= multa;
      ladron.totalSpent += multa;
      ladron.failedRobberies += 1;

      saveDB(db);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🚨 Robo fallido")
            .setDescription(
              `La policía atrapó a ${interaction.user}.`
            )
            .addFields({
              name: "💸 Multa",
              value: money(multa)
            })
            .setColor(0xed4245)
            .setTimestamp()
        ]
      });
    }

    /* =========================
       PAGAR
    ========================= */

    if (subcommand === "pagar") {
      const usuario =
        interaction.options.getUser("usuario");

      const cantidad =
        interaction.options.getInteger("cantidad");

      if (usuario.id === interaction.user.id) {
        return interaction.reply({
          content:
            "❌ No puedes pagarte a ti mismo.",
          ephemeral: true
        });
      }

      if (usuario.bot) {
        return interaction.reply({
          content:
            "❌ No puedes pagarle a un bot.",
          ephemeral: true
        });
      }

      const emisor = getUser(
        db,
        interaction.guild.id,
        interaction.user.id
      );

      const receptor = getUser(
        db,
        interaction.guild.id,
        usuario.id
      );

      if (emisor.wallet < cantidad) {
        return interaction.reply({
          content:
            `❌ No tienes suficiente dinero.\n` +
            `Disponible: **${money(emisor.wallet)}**`,
          ephemeral: true
        });
      }

      emisor.wallet -= cantidad;
      receptor.wallet += cantidad;

      emisor.totalSpent += cantidad;
      receptor.totalEarned += cantidad;

      saveDB(db);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("💸 Pago realizado")
            .setDescription(
              `${interaction.user} pagó **${money(cantidad)}** a ${usuario}.`
            )
            .addFields({
              name: "💰 Tu cartera",
              value: money(emisor.wallet)
            })
            .setColor(0x57f287)
            .setTimestamp()
        ]
      });
    }

    /* =========================
       DEPOSITAR
    ========================= */

    if (subcommand === "depositar") {
      const cantidad =
        interaction.options.getInteger("cantidad");

      const datos = getUser(
        db,
        interaction.guild.id,
        interaction.user.id
      );

      if (datos.wallet < cantidad) {
        return interaction.reply({
          content:
            `❌ No tienes suficiente dinero.\n` +
            `Cartera: **${money(datos.wallet)}**`,
          ephemeral: true
        });
      }

      datos.wallet -= cantidad;
      datos.bank += cantidad;

      saveDB(db);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🏦 Depósito realizado")
            .addFields(
              {
                name: "👛 Cartera",
                value: money(datos.wallet),
                inline: true
              },
              {
                name: "🏦 Banco",
                value: money(datos.bank),
                inline: true
              }
            )
            .setColor(0x5865f2)
            .setTimestamp()
        ]
      });
    }

    /* =========================
       RETIRAR
    ========================= */

    if (subcommand === "retirar") {
      const cantidad =
        interaction.options.getInteger("cantidad");

      const datos = getUser(
        db,
        interaction.guild.id,
        interaction.user.id
      );

      if (datos.bank < cantidad) {
        return interaction.reply({
          content:
            `❌ No tienes suficiente dinero en el banco.\n` +
            `Banco: **${money(datos.bank)}**`,
          ephemeral: true
        });
      }

      datos.bank -= cantidad;
      datos.wallet += cantidad;

      saveDB(db);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🏦 Retiro realizado")
            .addFields(
              {
                name: "👛 Cartera",
                value: money(datos.wallet),
                inline: true
              },
              {
                name: "🏦 Banco",
                value: money(datos.bank),
                inline: true
              }
            )
            .setColor(0x57f287)
            .setTimestamp()
        ]
      });
    }

    /* =========================
       TRANSFERIR
    ========================= */

    if (subcommand === "transferir") {
      const tipo =
        interaction.options.getString("tipo");

      const cantidad =
        interaction.options.getInteger("cantidad");

      const datos = getUser(
        db,
        interaction.guild.id,
        interaction.user.id
      );

      if (tipo === "depositar") {
        if (datos.wallet < cantidad) {
          return interaction.reply({
            content:
              "❌ No tienes suficiente dinero en la cartera.",
            ephemeral: true
          });
        }

        datos.wallet -= cantidad;
        datos.bank += cantidad;
      }

      if (tipo === "retirar") {
        if (datos.bank < cantidad) {
          return interaction.reply({
            content:
              "❌ No tienes suficiente dinero en el banco.",
            ephemeral: true
          });
        }

        datos.bank -= cantidad;
        datos.wallet += cantidad;
      }

      saveDB(db);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🔄 Transferencia realizada")
            .setDescription(
              `Se movieron **${money(cantidad)}** correctamente.`
            )
            .addFields(
              {
                name: "👛 Cartera",
                value: money(datos.wallet),
                inline: true
              },
              {
                name: "🏦 Banco",
                value: money(datos.bank),
                inline: true
              }
            )
            .setColor(0x5865f2)
            .setTimestamp()
        ]
      });
    }
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

      saveDB(db);

      const total =
        datos.wallet + datos.bank;

      const embed = new EmbedBuilder()
        .setTitle("💰 Perfil económico")
        .setDescription(`${usuario}`)
        .setThumbnail(
          usuario.displayAvatarURL({
            extension: "png",
            size: 256
          })
        )
        .addFields(
          {
            name: "👛 Cartera",
            value: money(datos.wallet),
            inline: true
          },
          {
            name: "🏦 Banco",
            value: money(datos.bank),
            inline: true
          },
          {
            name: "💎 Patrimonio",
            value: money(total),
            inline: true
          },
          {
            name: "💵 Ganado",
            value: money(datos.totalEarned),
            inline: true
          },
          {
            name: "💸 Gastado",
            value: money(datos.totalSpent),
            inline: true
          },
          {
            name: "💼 Trabajos",
            value: `${datos.work}`,
            inline: true
          },
          {
            name: "🎁 Dailys",
            value: `${datos.daily}`,
            inline: true
          },
          {
            name: "🕵️ Robos",
            value: `${datos.robberies}`,
            inline: true
          },
          {
            name: "✅ Robos exitosos",
            value: `${datos.successfulRobberies}`,
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
       ESTADÍSTICAS
    ========================= */

    if (subcommand === "estadisticas") {
      const usuario =
        interaction.options.getUser("usuario") ||
        interaction.user;

      const datos = getUser(
        db,
        interaction.guild.id,
        usuario.id
      );

      saveDB(db);

      const total =
        datos.wallet + datos.bank;

      const embed = new EmbedBuilder()
        .setTitle("📊 Estadísticas económicas")
        .setDescription(`${usuario}`)
        .addFields(
          {
            name: "💎 Patrimonio",
            value: money(total),
            inline: true
          },
          {
            name: "💵 Total ganado",
            value: money(datos.totalEarned),
            inline: true
          },
          {
            name: "💸 Total gastado",
            value: money(datos.totalSpent),
            inline: true
          },
          {
            name: "💼 Trabajos",
            value: `${datos.work}`,
            inline: true
          },
          {
            name: "🎁 Dailys",
            value: `${datos.daily}`,
            inline: true
          },
          {
            name: "🕵️ Intentos de robo",
            value: `${datos.robberies}`,
            inline: true
          },
          {
            name: "✅ Robos exitosos",
            value: `${datos.successfulRobberies}`,
            inline: true
          },
          {
            name: "❌ Robos fallidos",
            value: `${datos.failedRobberies}`,
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
       LEADERBOARD
    ========================= */

    if (subcommand === "leaderboard") {
      const servidores =
        db.economia[interaction.guild.id] || {};

      const ranking = Object.entries(
        servidores
      )
        .map(([id, datos]) => ({
          id,
          total:
            Number(datos.wallet || 0) +
            Number(datos.bank || 0)
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      if (ranking.length === 0) {
        return interaction.reply({
          content:
            "📊 Todavía no hay usuarios registrados."
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
          `**${i + 1}.** ${nombre} — **${money(
            ranking[i].total
          )}**`
        );
      }

      const embed = new EmbedBuilder()
        .setTitle("🏆 Ranking económico")
        .setDescription(
          lineas.join("\n")
        )
        .setColor(0xfee75c)
        .setFooter({
          text: "Axel XIT • Economía"
        })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }

    /* =========================
       DINERO
    ========================= */

    if (subcommand === "dinero") {
      const usuario =
        interaction.options.getUser("usuario") ||
        interaction.user;

      const datos = getUser(
        db,
        interaction.guild.id,
        usuario.id
      );

      saveDB(db);

      const total =
        datos.wallet + datos.bank;

      return interaction.reply({
        content:
          `💰 **${usuario.username}** tiene ` +
          `**${money(total)}** en total.`
      });
    }

    /* =========================
       RESET
    ========================= */

    if (subcommand === "reset") {
      if (
        !interaction.member.permissions.has(
          PermissionFlagsBits.Administrator
        )
      ) {
        return interaction.reply({
          content:
            "❌ Necesitas el permiso **Administrador**.",
          ephemeral: true
        });
      }

      const usuario =
        interaction.options.getUser("usuario");

      if (
        db.economia[
          interaction.guild.id
        ]?.[usuario.id]
      ) {
        delete db.economia[
          interaction.guild.id
        ][usuario.id];
      }

      saveDB(db);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("♻️ Cuenta reiniciada")
            .setDescription(
              `La economía de ${usuario} volvió a su estado inicial.`
            )
            .setColor(0xed4245)
            .setTimestamp()
        ]
      });
    }
  }
};
