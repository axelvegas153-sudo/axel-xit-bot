const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.json");

function cargarDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, "{}");
    }

    const data = fs.readFileSync(DB_PATH, "utf8");
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function guardarDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function obtenerUsuario(db, id) {
  if (!db.economia) db.economia = {};

  if (!db.economia[id]) {
    db.economia[id] = {
      dinero: 0,
      banco: 0,
      ultimoDiario: 0,
      ultimoTrabajo: 0
    };
  }

  return db.economia[id];
}

function dinero(numero) {
  return `${numero.toLocaleString("es-CO")} 🪙`;
}

const comandos = [];

// ======================================================
// SALDO
// ======================================================

comandos.push({
  category: "economia",

  data: new SlashCommandBuilder()
    .setName("saldo")
    .setDescription("Muestra tu saldo")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres consultar")
        .setRequired(false)
    ),

  async execute(interaction) {
    const db = cargarDB();

    const usuario =
      interaction.options.getUser("usuario") || interaction.user;

    const datos = obtenerUsuario(db, usuario.id);

    guardarDB(db);

    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle(`💰 Saldo de ${usuario.username}`)
      .setThumbnail(usuario.displayAvatarURL({ size: 256 }))
      .addFields(
        {
          name: "👛 Dinero",
          value: dinero(datos.dinero),
          inline: true
        },
        {
          name: "🏦 Banco",
          value: dinero(datos.banco),
          inline: true
        },
        {
          name: "💵 Total",
          value: dinero(datos.dinero + datos.banco),
          inline: true
        }
      );

    await interaction.reply({
      embeds: [embed]
    });
  }
});

// ======================================================
// DIARIO
// ======================================================

comandos.push({
  category: "economia",

  data: new SlashCommandBuilder()
    .setName("diario")
    .setDescription("Recibe tu recompensa diaria"),

  async execute(interaction) {
    const db = cargarDB();
    const datos = obtenerUsuario(db, interaction.user.id);

    const ahora = Date.now();
    const unDia = 24 * 60 * 60 * 1000;

    if (ahora - datos.ultimoDiario < unDia) {
      const restante = unDia - (ahora - datos.ultimoDiario);

      const horas = Math.floor(restante / 3600000);
      const minutos = Math.floor((restante % 3600000) / 60000);

      return interaction.reply({
        content:
          `⏰ Ya reclamaste tu recompensa diaria.\n` +
          `Vuelve en **${horas}h ${minutos}m**.`,
        ephemeral: true
      });
    }

    const recompensa = 1000;

    datos.dinero += recompensa;
    datos.ultimoDiario = ahora;

    guardarDB(db);

    await interaction.reply(
      `🎁 Has recibido **${dinero(recompensa)}** de recompensa diaria.\n` +
      `💰 Ahora tienes **${dinero(datos.dinero)}**.`
    );
  }
});

// ======================================================
// TRABAJAR
// ======================================================

comandos.push({
  category: "economia",

  data: new SlashCommandBuilder()
    .setName("trabajar")
    .setDescription("Trabaja para ganar dinero"),

  async execute(interaction) {
    const db = cargarDB();
    const datos = obtenerUsuario(db, interaction.user.id);

    const ahora = Date.now();
    const unaHora = 60 * 60 * 1000;

    if (ahora - datos.ultimoTrabajo < unaHora) {
      const restante = unaHora - (ahora - datos.ultimoTrabajo);

      const minutos = Math.ceil(restante / 60000);

      return interaction.reply({
        content:
          `⏰ Ya trabajaste recientemente.\n` +
          `Puedes volver a trabajar en **${minutos} minutos**.`,
        ephemeral: true
      });
    }

    const recompensa = Math.floor(Math.random() * 501) + 500;

    datos.dinero += recompensa;
    datos.ultimoTrabajo = ahora;

    guardarDB(db);

    await interaction.reply(
      `💼 Has trabajado y ganaste **${dinero(recompensa)}**.\n` +
      `💰 Tu saldo ahora es **${dinero(datos.dinero)}**.`
    );
  }
});

// ======================================================
// DEPOSITAR
// ======================================================

comandos.push({
  category: "economia",

  data: new SlashCommandBuilder()
    .setName("depositar")
    .setDescription("Deposita dinero en el banco")
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad a depositar")
        .setMinValue(1)
        .setRequired(true)
    ),

  async execute(interaction) {
    const cantidad = interaction.options.getInteger("cantidad");

    const db = cargarDB();
    const datos = obtenerUsuario(db, interaction.user.id);

    if (datos.dinero < cantidad) {
      return interaction.reply({
        content: "❌ No tienes suficiente dinero.",
        ephemeral: true
      });
    }

    datos.dinero -= cantidad;
    datos.banco += cantidad;

    guardarDB(db);

    await interaction.reply(
      `🏦 Depositaste **${dinero(cantidad)}**.\n` +
      `🏦 Banco: **${dinero(datos.banco)}**`
    );
  }
});

// ======================================================
// RETIRAR
// ======================================================

comandos.push({
  category: "economia",

  data: new SlashCommandBuilder()
    .setName("retirar")
    .setDescription("Retira dinero del banco")
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad a retirar")
        .setMinValue(1)
        .setRequired(true)
    ),

  async execute(interaction) {
    const cantidad = interaction.options.getInteger("cantidad");

    const db = cargarDB();
    const datos = obtenerUsuario(db, interaction.user.id);

    if (datos.banco < cantidad) {
      return interaction.reply({
        content: "❌ No tienes suficiente dinero en el banco.",
        ephemeral: true
      });
    }

    datos.banco -= cantidad;
    datos.dinero += cantidad;

    guardarDB(db);

    await interaction.reply(
      `🏦 Retiraste **${dinero(cantidad)}**.\n` +
      `👛 Dinero: **${dinero(datos.dinero)}**`
    );
  }
});

// ======================================================
// TRANSFERIR
// ======================================================

comandos.push({
  category: "economia",

  data: new SlashCommandBuilder()
    .setName("transferir")
    .setDescription("Envía dinero a otro usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que recibirá el dinero")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad a enviar")
        .setMinValue(1)
        .setRequired(true)
    ),

  async execute(interaction) {
    const receptor = interaction.options.getUser("usuario");
    const cantidad = interaction.options.getInteger("cantidad");

    if (receptor.bot) {
      return interaction.reply({
        content: "❌ No puedes transferir dinero a un bot.",
        ephemeral: true
      });
    }

    if (receptor.id === interaction.user.id) {
      return interaction.reply({
        content: "❌ No puedes transferirte dinero a ti mismo.",
        ephemeral: true
      });
    }

    const db = cargarDB();

    const emisor = obtenerUsuario(db, interaction.user.id);
    const destino = obtenerUsuario(db, receptor.id);

    if (emisor.dinero < cantidad) {
      return interaction.reply({
        content: "❌ No tienes suficiente dinero.",
        ephemeral: true
      });
    }

    emisor.dinero -= cantidad;
    destino.dinero += cantidad;

    guardarDB(db);

    await interaction.reply(
      `💸 Transferiste **${dinero(cantidad)}** a ${receptor}.\n` +
      `💰 Tu saldo: **${dinero(emisor.dinero)}**`
    );
  }
});

// ======================================================
// TRABAJO INFO
// ======================================================

comandos.push({
  category: "economia",

  data: new SlashCommandBuilder()
    .setName("trabajo")
    .setDescription("Muestra información sobre el trabajo"),

  async execute(interaction) {
    await interaction.reply(
      "💼 **Trabajo**\n\n" +
      "Usa `/trabajar` para trabajar y ganar entre **500 y 1000 🪙**.\n" +
      "⏰ Puedes trabajar una vez cada hora."
    );
  }
});

// ======================================================
// BANCO
// ======================================================

comandos.push({
  category: "economia",

  data: new SlashCommandBuilder()
    .setName("banco")
    .setDescription("Muestra cuánto dinero tienes guardado"),

  async execute(interaction) {
    const db = cargarDB();
    const datos = obtenerUsuario(db, interaction.user.id);

    guardarDB(db);

    await interaction.reply(
      `🏦 Tienes **${dinero(datos.banco)}** guardados en el banco.`
    );
  }
});

// ======================================================
// RANKING
// ======================================================

comandos.push({
  category: "economia",

  data: new SlashCommandBuilder()
    .setName("rich")
    .setDescription("Muestra el ranking de dinero del servidor"),

  async execute(interaction) {
    const db = cargarDB();

    if (!db.economia) db.economia = {};

    const ranking = Object.entries(db.economia)
      .map(([id, datos]) => ({
        id,
        total: (datos.dinero || 0) + (datos.banco || 0)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    if (!ranking.length) {
      return interaction.reply("💰 Todavía no hay datos de economía.");
    }

    const texto = ranking
      .map((usuario, index) =>
        `${index + 1}. <@${usuario.id}> — **${dinero(usuario.total)}**`
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle("🏆 Ranking de riqueza")
      .setDescription(texto);

    await interaction.reply({
      embeds: [embed]
    });
  }
});

// ======================================================
// ECONOMIA
// ======================================================

comandos.push({
  category: "economia",

  data: new SlashCommandBuilder()
    .setName("economia")
    .setDescription("Muestra los comandos de economía"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle("💰 Economía • DARK FF V1")
      .setDescription(
        "Sistema de economía del servidor.\n\n" +
        "💰 `/saldo` — Ver tu dinero\n" +
        "🎁 `/diario` — Recompensa diaria\n" +
        "💼 `/trabajar` — Ganar dinero\n" +
        "🏦 `/banco` — Ver banco\n" +
        "📥 `/depositar` — Depositar\n" +
        "📤 `/retirar` — Retirar\n" +
        "💸 `/transferir` — Enviar dinero\n" +
        "🏆 `/rich` — Ranking de riqueza"
      );

    await interaction.reply({
      embeds: [embed]
    });
  }
});

module.exports = comandos;
