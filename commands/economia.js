const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const commands = [];

const DB_PATH = path.join(__dirname, "..", "database.json");

function cargarDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(
        DB_PATH,
        JSON.stringify({}, null, 2)
      );
    }

    const data = fs.readFileSync(DB_PATH, "utf8");

    if (!data.trim()) return {};

    return JSON.parse(data);
  } catch (error) {
    console.error("Error cargando database.json:", error);
    return {};
  }
}

function guardarDB(db) {
  try {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify(db, null, 2)
    );
  } catch (error) {
    console.error("Error guardando database.json:", error);
  }
}

function obtenerUsuario(db, guildId, userId) {
  if (!db.economia) {
    db.economia = {};
  }

  if (!db.economia[guildId]) {
    db.economia[guildId] = {};
  }

  if (!db.economia[guildId][userId]) {
    db.economia[guildId][userId] = {
      wallet: 0,
      bank: 0,
      lastDaily: 0,
      lastWeekly: 0,
      lastWork: 0,
      lastBeg: 0,
      lastRob: 0
    };
  }

  return db.economia[guildId][userId];
}

function dinero(numero) {
  return Number(numero || 0).toLocaleString("es-ES");
}

function cooldownRestante(ultimo, tiempo) {
  const restante = tiempo - (Date.now() - ultimo);

  if (restante <= 0) return null;

  const segundos = Math.ceil(restante / 1000);
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const secs = segundos % 60;

  if (horas > 0) {
    return `${horas}h ${minutos}m`;
  }

  if (minutos > 0) {
    return `${minutos}m ${secs}s`;
  }

  return `${secs}s`;
}


/* =========================================================
   /balance
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Muestra tu dinero o el de otro usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres consultar")
        .setRequired(false)
    ),

  async execute(interaction) {
    const db = cargarDB();

    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const datos =
      obtenerUsuario(
        db,
        interaction.guild.id,
        usuario.id
      );

    guardarDB(db);

    const total =
      datos.wallet + datos.bank;

    const embed = new EmbedBuilder()
      .setTitle("💰 Balance")
      .setDescription(
        `💳 **${usuario.username}**\n\n` +
        `💵 Billetera: **$${dinero(datos.wallet)}**\n` +
        `🏦 Banco: **$${dinero(datos.bank)}**\n` +
        `💰 Total: **$${dinero(total)}**`
      )
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /daily
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Reclama tu recompensa diaria."),

  async execute(interaction) {
    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    const cooldown = 24 * 60 * 60 * 1000;

    const restante = cooldownRestante(
      datos.lastDaily,
      cooldown
    );

    if (restante) {
      return interaction.reply({
        content:
          `⏰ Ya reclamaste tu recompensa diaria.\n` +
          `Podrás volver a reclamarla en **${restante}**.`,
        ephemeral: true
      });
    }

    const recompensa =
      Math.floor(Math.random() * 501) + 500;

    datos.wallet += recompensa;
    datos.lastDaily = Date.now();

    guardarDB(db);

    return interaction.reply(
      `🎁 Recibiste **$${dinero(recompensa)}** por tu recompensa diaria.`
    );
  }
});


/* =========================================================
   /weekly
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("weekly")
    .setDescription("Reclama tu recompensa semanal."),

  async execute(interaction) {
    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    const cooldown = 7 * 24 * 60 * 60 * 1000;

    const restante = cooldownRestante(
      datos.lastWeekly,
      cooldown
    );

    if (restante) {
      return interaction.reply({
        content:
          `⏰ Ya reclamaste tu recompensa semanal.\n` +
          `Disponible nuevamente en **${restante}**.`,
        ephemeral: true
      });
    }

    const recompensa =
      Math.floor(Math.random() * 3001) + 3000;

    datos.wallet += recompensa;
    datos.lastWeekly = Date.now();

    guardarDB(db);

    return interaction.reply(
      `🎁 Recibiste **$${dinero(recompensa)}** por tu recompensa semanal.`
    );
  }
});


/* =========================================================
   /work
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("work")
    .setDescription("Trabaja para ganar dinero."),

  async execute(interaction) {
    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    const cooldown = 30 * 60 * 1000;

    const restante = cooldownRestante(
      datos.lastWork,
      cooldown
    );

    if (restante) {
      return interaction.reply({
        content:
          `⏰ Ya trabajaste recientemente.\n` +
          `Vuelve en **${restante}**.`,
        ephemeral: true
      });
    }

    const trabajos = [
      "programaste una página web",
      "hiciste un mapa de Free Fire",
      "ayudaste a un jugador",
      "moderaste un servidor",
      "creaste contenido",
      "ganaste una partida"
    ];

    const trabajo =
      trabajos[
        Math.floor(Math.random() * trabajos.length)
      ];

    const recompensa =
      Math.floor(Math.random() * 501) + 250;

    datos.wallet += recompensa;
    datos.lastWork = Date.now();

    guardarDB(db);

    return interaction.reply(
      `💼 **Trabajo completado**\n\n` +
      `📋 ${trabajo}.\n` +
      `💰 Ganaste **$${dinero(recompensa)}**.`
    );
  }
});


/* =========================================================
   /beg
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("beg")
    .setDescription("Pide dinero y recibe una cantidad aleatoria."),

  async execute(interaction) {
    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    const cooldown = 5 * 60 * 1000;

    const restante = cooldownRestante(
      datos.lastBeg,
      cooldown
    );

    if (restante) {
      return interaction.reply({
        content:
          `⏰ Espera **${restante}** antes de volver a pedir dinero.`,
        ephemeral: true
      });
    }

    const recompensa =
      Math.floor(Math.random() * 201) + 50;

    datos.wallet += recompensa;
    datos.lastBeg = Date.now();

    guardarDB(db);

    return interaction.reply(
      `🙏 Alguien te dio **$${dinero(recompensa)}**.`
    );
  }
});


/* =========================================================
   /deposit
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("deposit")
    .setDescription("Deposita dinero en el banco.")
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad a depositar")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const cantidad =
      interaction.options.getInteger("cantidad");

    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    if (datos.wallet < cantidad) {
      return interaction.reply({
        content: "❌ No tienes suficiente dinero en tu billetera.",
        ephemeral: true
      });
    }

    datos.wallet -= cantidad;
    datos.bank += cantidad;

    guardarDB(db);

    return interaction.reply(
      `🏦 Depositaste **$${dinero(cantidad)}** en tu banco.`
    );
  }
});


/* =========================================================
   /withdraw
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("withdraw")
    .setDescription("Retira dinero del banco.")
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad a retirar")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const cantidad =
      interaction.options.getInteger("cantidad");

    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    if (datos.bank < cantidad) {
      return interaction.reply({
        content: "❌ No tienes suficiente dinero en el banco.",
        ephemeral: true
      });
    }

    datos.bank -= cantidad;
    datos.wallet += cantidad;

    guardarDB(db);

    return interaction.reply(
      `💵 Retiraste **$${dinero(cantidad)}** del banco.`
    );
  }
});


/* =========================================================
   /pay
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Envía dinero a otro usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que recibirá el dinero")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de dinero")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const cantidad =
      interaction.options.getInteger("cantidad");

    if (usuario.bot) {
      return interaction.reply({
        content: "❌ No puedes enviar dinero a un bot.",
        ephemeral: true
      });
    }

    if (usuario.id === interaction.user.id) {
      return interaction.reply({
        content: "❌ No puedes enviarte dinero a ti mismo.",
        ephemeral: true
      });
    }

    const db = cargarDB();

    const emisor = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    const receptor = obtenerUsuario(
      db,
      interaction.guild.id,
      usuario.id
    );

    if (emisor.wallet < cantidad) {
      return interaction.reply({
        content: "❌ No tienes suficiente dinero.",
        ephemeral: true
      });
    }

    emisor.wallet -= cantidad;
    receptor.wallet += cantidad;

    guardarDB(db);

    return interaction.reply(
      `💸 ${interaction.user} envió **$${dinero(cantidad)}** a ${usuario}.`
    );
  }
});


/* =========================================================
   /give
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("give")
    .setDescription("Da dinero a otro usuario.")
    .setDefaultMemberPermissions(8)
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const cantidad =
      interaction.options.getInteger("cantidad");

    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      usuario.id
    );

    datos.wallet += cantidad;

    guardarDB(db);

    return interaction.reply(
      `💰 Se dieron **$${dinero(cantidad)}** a ${usuario}.`
    );
  }
});


/* =========================================================
   /rob
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rob")
    .setDescription("Intenta robar dinero a otro usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario al que quieres robar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const objetivo =
      interaction.options.getUser("usuario");

    if (objetivo.id === interaction.user.id) {
      return interaction.reply({
        content: "❌ No puedes robarte a ti mismo.",
        ephemeral: true
      });
    }

    if (objetivo.bot) {
      return interaction.reply({
        content: "❌ No puedes robar a un bot.",
        ephemeral: true
      });
    }

    const db = cargarDB();

    const ladron = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    const victima = obtenerUsuario(
      db,
      interaction.guild.id,
      objetivo.id
    );

    const cooldown = 30 * 60 * 1000;

    const restante = cooldownRestante(
      ladron.lastRob,
      cooldown
    );

    if (restante) {
      return interaction.reply({
        content:
          `⏰ Debes esperar **${restante}** para volver a intentarlo.`,
        ephemeral: true
      });
    }

    ladron.lastRob = Date.now();

    if (victima.wallet <= 0) {
      guardarDB(db);

      return interaction.reply(
        `😅 ${objetivo.username} no tiene dinero para robar.`
      );
    }

    const exito =
      Math.random() < 0.45;

    if (!exito) {
      const multa =
        Math.min(
          ladron.wallet,
          Math.floor(Math.random() * 301) + 100
        );

      ladron.wallet -= multa;

      guardarDB(db);

      return interaction.reply(
        `🚨 Te descubrieron intentando robar a ${objetivo}.\n` +
        `💸 Perdiste **$${dinero(multa)}**.`
      );
    }

    const cantidad =
      Math.min(
        victima.wallet,
        Math.floor(Math.random() * 501) + 100
      );

    victima.wallet -= cantidad;
    ladron.wallet += cantidad;

    guardarDB(db);

    return interaction.reply(
      `🕵️ ¡Robo exitoso!\n` +
      `💰 Robaste **$${dinero(cantidad)}** a ${objetivo}.`
    );
  }
});


/* =========================================================
   /coinflip
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Apuesta dinero lanzando una moneda.")
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad a apostar")
        .setRequired(true)
        .setMinValue(1)
    )
    .addStringOption(option =>
      option
        .setName("eleccion")
        .setDescription("Cara o cruz")
        .setRequired(true)
        .addChoices(
          {
            name: "Cara",
            value: "cara"
          },
          {
            name: "Cruz",
            value: "cruz"
          }
        )
    ),

  async execute(interaction) {
    const cantidad =
      interaction.options.getInteger("cantidad");

    const eleccion =
      interaction.options.getString("eleccion");

    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    if (datos.wallet < cantidad) {
      return interaction.reply({
        content: "❌ No tienes suficiente dinero.",
        ephemeral: true
      });
    }

    const resultado =
      Math.random() < 0.5
        ? "cara"
        : "cruz";

    if (resultado === eleccion) {
      datos.wallet += cantidad;

      guardarDB(db);

      return interaction.reply(
        `🪙 Salió **${resultado}**.\n` +
        `🎉 Ganaste **$${dinero(cantidad)}**.`
      );
    }

    datos.wallet -= cantidad;

    guardarDB(db);

    return interaction.reply(
      `🪙 Salió **${resultado}**.\n` +
      `😢 Perdiste **$${dinero(cantidad)}**.`
    );
  }
});


/* =========================================================
   /slots
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("slots")
    .setDescription("Juega una máquina tragamonedas.")
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad a apostar")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const cantidad =
      interaction.options.getInteger("cantidad");

    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    if (datos.wallet < cantidad) {
      return interaction.reply({
        content: "❌ No tienes suficiente dinero.",
        ephemeral: true
      });
    }

    const simbolos = [
      "🍒",
      "🍋",
      "🍉",
      "⭐",
      "💎"
    ];

    const a =
      simbolos[Math.floor(Math.random() * simbolos.length)];

    const b =
      simbolos[Math.floor(Math.random() * simbolos.length)];

    const c =
      simbolos[Math.floor(Math.random() * simbolos.length)];

    const resultado =
      `${a} | ${b} | ${c}`;

    if (a === b && b === c) {
      const premio = cantidad * 5;

      datos.wallet += premio;

      guardarDB(db);

      return interaction.reply(
        `🎰 **${resultado}**\n\n` +
        `💎 ¡JACKPOT!\n` +
        `Ganaste **$${dinero(premio)}**.`
      );
    }

    if (a === b || b === c || a === c) {
      const premio = cantidad * 2;

      datos.wallet += premio;

      guardarDB(db);

      return interaction.reply(
        `🎰 **${resultado}**\n\n` +
        `✨ ¡Dos iguales!\n` +
        `Ganaste **$${dinero(premio)}**.`
      );
    }

    datos.wallet -= cantidad;

    guardarDB(db);

    return interaction.reply(
      `🎰 **${resultado}**\n\n` +
      `😢 No coincidieron.\n` +
      `Perdiste **$${dinero(cantidad)}**.`
    );
  }
});


/* =========================================================
   /economy
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("economy")
    .setDescription("Muestra tu información económica."),

  async execute(interaction) {
    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    guardarDB(db);

    const embed = new EmbedBuilder()
      .setTitle("💰 Tu economía")
      .addFields(
        {
          name: "💵 Billetera",
          value: `$${dinero(datos.wallet)}`,
          inline: true
        },
        {
          name: "🏦 Banco",
          value: `$${dinero(datos.bank)}`,
          inline: true
        },
        {
          name: "💎 Patrimonio",
          value:
            `$${dinero(datos.wallet + datos.bank)}`,
          inline: true
        }
      )
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /leaderboard
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Muestra el ranking económico del servidor."),

  async execute(interaction) {
    const db = cargarDB();

    if (!db.economia) db.economia = {};

    if (!db.economia[interaction.guild.id]) {
      db.economia[interaction.guild.id] = {};
    }

    const usuarios = db.economia[interaction.guild.id];

    const ranking = Object.entries(usuarios)
      .map(([id, datos]) => ({
        id,
        total: (datos.wallet || 0) + (datos.bank || 0)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    if (ranking.length === 0) {
      return interaction.reply({
        content: "📊 Todavía no hay datos económicos.",
        ephemeral: true
      });
    }

    const lineas = [];

    for (let i = 0; i < ranking.length; i++) {
      const usuario = await interaction.client.users
        .fetch(ranking[i].id)
        .catch(() => null);

      const nombre = usuario
        ? usuario.username
        : `Usuario ${ranking[i].id}`;

      lineas.push(
        `**${i + 1}.** ${nombre} — 💰 $${dinero(ranking[i].total)}`
      );
    }

    const embed = new EmbedBuilder()
      .setTitle("🏆 Ranking económico")
      .setDescription(lineas.join("\n"))
      .setFooter({
        text: "DARK FF V1 • Top 10"
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /economyreset
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("economyreset")
    .setDescription("Reinicia la economía de un usuario.")
    .setDefaultMemberPermissions(8)
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres reiniciar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const db = cargarDB();

    if (!db.economia) db.economia = {};

    if (!db.economia[interaction.guild.id]) {
      db.economia[interaction.guild.id] = {};
    }

    db.economia[interaction.guild.id][usuario.id] = {
      wallet: 0,
      bank: 0,
      lastDaily: 0,
      lastWeekly: 0,
      lastWork: 0,
      lastBeg: 0,
      lastRob: 0
    };

    guardarDB(db);

    return interaction.reply(
      `♻️ La economía de ${usuario} fue reiniciada.`
    );
  }
});


/* =========================================================
   /economyhelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("economyhelp")
    .setDescription("Muestra todos los comandos de economía."),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("💰 DARK FF V1 — ECONOMÍA")
      .setDescription(
        "Sistema completo de economía del servidor."
      )
      .addFields(
        {
          name: "💵 Dinero",
          value:
            "`/balance`\n" +
            "`/economy`\n" +
            "`/deposit`\n" +
            "`/withdraw`"
        },
        {
          name: "🎁 Recompensas",
          value:
            "`/daily`\n" +
            "`/weekly`\n" +
            "`/work`\n" +
            "`/beg`"
        },
        {
          name: "💸 Transferencias",
          value:
            "`/pay`\n" +
            "`/give`"
        },
        {
          name: "🎰 Juegos",
          value:
            "`/coinflip`\n" +
            "`/slots`\n" +
            "`/rob`"
        },
        {
          name: "🏆 Ranking",
          value:
            "`/leaderboard`"
        },
        {
          name: "⚙️ Administración",
          value:
            "`/economyreset`"
        }
      )
      .setFooter({
        text: "DARK FF V1"
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   EXPORTACIÓN
========================================================= */

module.exports = commands;
