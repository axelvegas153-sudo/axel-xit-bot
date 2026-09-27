const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "database.json");

function cargarDB() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
    }

    const data = fs.readFileSync(dbPath, "utf8");
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error cargando database.json:", error);
    return {};
  }
}

function guardarDB(db) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("Error guardando database.json:", error);
  }
}

function asegurarGuild(db, guildId) {
  if (!db.recompensas) db.recompensas = {};

  if (!db.recompensas[guildId]) {
    db.recompensas[guildId] = {
      recompensas: {},
      usuarios: {}
    };
  }

  if (!db.recompensas[guildId].recompensas) {
    db.recompensas[guildId].recompensas = {};
  }

  if (!db.recompensas[guildId].usuarios) {
    db.recompensas[guildId].usuarios = {};
  }
}

function asegurarUsuario(db, guildId, userId) {
  asegurarGuild(db, guildId);

  if (!db.recompensas[guildId].usuarios[userId]) {
    db.recompensas[guildId].usuarios[userId] = {
      reclamadas: [],
      cooldowns: {}
    };
  }

  if (!Array.isArray(db.recompensas[guildId].usuarios[userId].reclamadas)) {
    db.recompensas[guildId].usuarios[userId].reclamadas = [];
  }

  if (!db.recompensas[guildId].usuarios[userId].cooldowns) {
    db.recompensas[guildId].usuarios[userId].cooldowns = {};
  }

  return db.recompensas[guildId].usuarios[userId];
}

function asegurarEconomia(db, guildId, userId) {
  if (!db.economia) db.economia = {};
  if (!db.economia[guildId]) db.economia[guildId] = {};

  if (!db.economia[guildId][userId]) {
    db.economia[guildId][userId] = {
      wallet: 0,
      bank: 0,
      cooldowns: {}
    };
  }

  if (typeof db.economia[guildId][userId].wallet !== "number") {
    db.economia[guildId][userId].wallet = 0;
  }

  if (typeof db.economia[guildId][userId].bank !== "number") {
    db.economia[guildId][userId].bank = 0;
  }

  if (!db.economia[guildId][userId].cooldowns) {
    db.economia[guildId][userId].cooldowns = {};
  }

  return db.economia[guildId][userId];
}

function tiempoRestante(timestamp, duracion) {
  const restante = duracion - (Date.now() - timestamp);

  if (restante <= 0) return null;

  const segundos = Math.ceil(restante / 1000);

  if (segundos < 60) {
    return `${segundos}s`;
  }

  const minutos = Math.ceil(segundos / 60);

  if (minutos < 60) {
    return `${minutos}m`;
  }

  const horas = Math.ceil(minutos / 60);

  if (horas < 24) {
    return `${horas}h`;
  }

  return `${Math.ceil(horas / 24)}d`;
}

function entregarRecompensa(db, guildId, userId, recompensa) {
  const economia = asegurarEconomia(db, guildId, userId);

  if (recompensa.monedas) {
    economia.wallet += recompensa.monedas;
  }

  return economia;
}

const commands = [];

/* =========================================================
   /reward
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("reward")
    .setDescription("Muestra una recompensa disponible")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID de la recompensa")
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const id = interaction.options
      .getString("id")
      .toLowerCase();

    const recompensa =
      db.recompensas[guildId].recompensas[id];

    if (!recompensa) {
      return interaction.reply(
        `❌ No existe la recompensa \`${id}\`.`
      );
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ff88)
      .setTitle(`${recompensa.emoji || "🎁"} ${recompensa.nombre}`)
      .setDescription(recompensa.descripcion)
      .addFields(
        {
          name: "🆔 ID",
          value: `\`${id}\``,
          inline: true
        },
        {
          name: "💰 Monedas",
          value: `${recompensa.monedas || 0}`,
          inline: true
        },
        {
          name: "⏱️ Cooldown",
          value: recompensa.cooldown
            ? `${recompensa.cooldown / 3600000}h`
            : "Sin cooldown",
          inline: true
        }
      );

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /rewards
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rewards")
    .setDescription("Muestra todas las recompensas disponibles"),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const recompensas = Object.entries(
      db.recompensas[guildId].recompensas
    );

    if (!recompensas.length) {
      return interaction.reply(
        "📋 No hay recompensas disponibles."
      );
    }

    const lista = recompensas
      .slice(0, 25)
      .map(
        ([id, recompensa]) =>
          `${recompensa.emoji || "🎁"} **${recompensa.nombre}** — \`${id}\`\n💰 ${recompensa.monedas || 0} monedas`
      )
      .join("\n\n");

    const embed = new EmbedBuilder()
      .setColor(0x00ff88)
      .setTitle("🎁 Recompensas disponibles")
      .setDescription(lista)
      .setFooter({
        text:
          recompensas.length > 25
            ? `Mostrando 25 de ${recompensas.length}`
            : `Total: ${recompensas.length}`
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /claimreward
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("claimreward")
    .setDescription("Reclama una recompensa")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID de la recompensa")
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    asegurarGuild(db, guildId);

    const id = interaction.options
      .getString("id")
      .toLowerCase();

    const recompensa =
      db.recompensas[guildId].recompensas[id];

    if (!recompensa) {
      return interaction.reply(
        `❌ No existe la recompensa \`${id}\`.`
      );
    }

    const usuario = asegurarUsuario(
      db,
      guildId,
      userId
    );

    const ahora = Date.now();
    const cooldown =
      recompensa.cooldown || 0;

    const ultimoUso =
      usuario.cooldowns[id] || 0;

    if (cooldown > 0) {
      const restante = tiempoRestante(
        ultimoUso,
        cooldown
      );

      if (restante) {
        return interaction.reply(
          `⏳ Ya reclamaste esta recompensa. Podrás volver a reclamarla en **${restante}**.`
        );
      }
    }

    entregarRecompensa(
      db,
      guildId,
      userId,
      recompensa
    );

    usuario.cooldowns[id] = ahora;

    if (!usuario.reclamadas.includes(id)) {
      usuario.reclamadas.push(id);
    }

    guardarDB(db);

    await interaction.reply(
      `🎁 Has reclamado **${recompensa.nombre}** y recibiste **${recompensa.monedas || 0} monedas**.`
    );
  }
});

/* =========================================================
   /giverreward
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("giverreward")
    .setDescription("Entrega una recompensa a un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID de la recompensa")
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const usuario = interaction.options.getUser("usuario");
    const id = interaction.options
      .getString("id")
      .toLowerCase();

    const recompensa =
      db.recompensas[guildId].recompensas[id];

    if (!recompensa) {
      return interaction.reply(
        `❌ No existe la recompensa \`${id}\`.`
      );
    }

    entregarRecompensa(
      db,
      guildId,
      usuario.id,
      recompensa
    );

    const datos =
      asegurarUsuario(
        db,
        guildId,
        usuario.id
      );

    if (!datos.reclamadas.includes(id)) {
      datos.reclamadas.push(id);
    }

    guardarDB(db);

    await interaction.reply(
      `🎁 Se entregó **${recompensa.nombre}** a ${usuario}.`
    );
  }
});

/* =========================================================
   /dailyreward
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("dailyreward")
    .setDescription("Reclama tu recompensa diaria"),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    asegurarGuild(db, guildId);

    const usuario = asegurarUsuario(
      db,
      guildId,
      userId
    );

    const ahora = Date.now();
    const cooldown = 24 * 60 * 60 * 1000;

    const ultimo =
      usuario.cooldowns.dailyreward || 0;

    const restante =
      tiempoRestante(ultimo, cooldown);

    if (restante) {
      return interaction.reply(
        `⏳ Ya reclamaste tu recompensa diaria. Vuelve en **${restante}**.`
      );
    }

    const recompensa = {
      monedas: 500
    };

    entregarRecompensa(
      db,
      guildId,
      userId,
      recompensa
    );

    usuario.cooldowns.dailyreward = ahora;

    guardarDB(db);

    await interaction.reply(
      "🎁 ¡Recompensa diaria reclamada! Recibiste **500 monedas**."
    );
  }
});

/* =========================================================
   /weeklyreward
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("weeklyreward")
    .setDescription("Reclama tu recompensa semanal"),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    asegurarGuild(db, guildId);

    const usuario = asegurarUsuario(
      db,
      guildId,
      userId
    );

    const ahora = Date.now();
    const cooldown = 7 * 24 * 60 * 60 * 1000;

    const ultimo =
      usuario.cooldowns.weeklyreward || 0;

    const restante =
      tiempoRestante(ultimo, cooldown);

    if (restante) {
      return interaction.reply(
        `⏳ Ya reclamaste tu recompensa semanal. Vuelve en **${restante}**.`
      );
    }

    const recompensa = {
      monedas: 3500
    };

    entregarRecompensa(
      db,
      guildId,
      userId,
      recompensa
    );

    usuario.cooldowns.weeklyreward = ahora;

    guardarDB(db);

    await interaction.reply(
      "🎁 ¡Recompensa semanal reclamada! Recibiste **3,500 monedas**."
    );
  }
});

/* =========================================================
   /monthlyreward
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("monthlyreward")
    .setDescription("Reclama tu recompensa mensual"),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    asegurarGuild(db, guildId);

    const usuario = asegurarUsuario(
      db,
      guildId,
      userId
    );

    const ahora = Date.now();
    const cooldown = 30 * 24 * 60 * 60 * 1000;

    const ultimo =
      usuario.cooldowns.monthlyreward || 0;

    const restante =
      tiempoRestante(ultimo, cooldown);

    if (restante) {
      return interaction.reply(
        `⏳ Ya reclamaste tu recompensa mensual. Vuelve en **${restante}**.`
      );
    }

    const recompensa = {
      monedas: 15000
    };

    entregarRecompensa(
      db,
      guildId,
      userId,
      recompensa
    );

    usuario.cooldowns.monthlyreward = ahora;

    guardarDB(db);

    await interaction.reply(
      "🎁 ¡Recompensa mensual reclamada! Recibiste **15,000 monedas**."
    );
  }
});

/* =========================================================
   /rewardlist
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rewardlist")
    .setDescription("Lista las recompensas creadas")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const recompensas =
      Object.entries(
        db.recompensas[guildId].recompensas
      );

    if (!recompensas.length) {
      return interaction.reply(
        "📋 No hay recompensas creadas."
      );
    }

    const lista = recompensas
      .map(
        ([id, recompensa]) =>
          `${recompensa.emoji || "🎁"} **${recompensa.nombre}** — \`${id}\` — 💰 ${recompensa.monedas || 0}`
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor(0x00ff88)
      .setTitle("📋 Recompensas creadas")
      .setDescription(lista.slice(0, 4000));

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /rewardcreate
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rewardcreate")
    .setDescription("Crea una recompensa")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID único")
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(30)
    )
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nombre")
        .setRequired(true)
        .setMaxLength(100)
    )
    .addStringOption(option =>
      option
        .setName("descripcion")
        .setDescription("Descripción")
        .setRequired(true)
        .setMaxLength(500)
    )
    .addIntegerOption(option =>
      option
        .setName("monedas")
        .setDescription("Cantidad de monedas")
        .setMinValue(0)
        .setMaxValue(1000000000)
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("cooldown")
        .setDescription("Cooldown en horas. 0 = sin cooldown")
        .setMinValue(0)
        .setMaxValue(8760)
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName("emoji")
        .setDescription("Emoji")
        .setRequired(false)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const id = interaction.options
      .getString("id")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");

    const nombre =
      interaction.options.getString("nombre");

    const descripcion =
      interaction.options.getString("descripcion");

    const monedas =
      interaction.options.getInteger("monedas");

    const horas =
      interaction.options.getInteger("cooldown") || 0;

    const emoji =
      interaction.options.getString("emoji") || "🎁";

    if (!id) {
      return interaction.reply(
        "❌ El ID no es válido."
      );
    }

    if (
      db.recompensas[guildId].recompensas[id]
    ) {
      return interaction.reply(
        `❌ Ya existe la recompensa \`${id}\`.`
      );
    }

    db.recompensas[guildId].recompensas[id] = {
      nombre,
      descripcion,
      monedas,
      cooldown: horas * 60 * 60 * 1000,
      emoji,
      creadoPor: interaction.user.id,
      creadoEn: Date.now()
    };

    guardarDB(db);

    await interaction.reply(
      `✅ Recompensa creada correctamente.\n\n` +
      `${emoji} **${nombre}**\n` +
      `💰 ${monedas.toLocaleString()} monedas\n` +
      `🆔 \`${id}\``
    );
  }
});

/* =========================================================
   /rewarddelete
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rewarddelete")
    .setDescription("Elimina una recompensa")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID de la recompensa")
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const id = interaction.options
      .getString("id")
      .toLowerCase();

    const recompensa =
      db.recompensas[guildId].recompensas[id];

    if (!recompensa) {
      return interaction.reply(
        `❌ No existe la recompensa \`${id}\`.`
      );
    }

    delete db.recompensas[guildId].recompensas[id];

    guardarDB(db);

    await interaction.reply(
      `🗑️ Se eliminó la recompensa **${recompensa.nombre}**.`
    );
  }
});

/* =========================================================
   /rewardconfig
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rewardconfig")
    .setDescription("Muestra la configuración de recompensas")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const recompensas =
      Object.keys(
        db.recompensas[guildId].recompensas
      ).length;

    const usuarios =
      Object.keys(
        db.recompensas[guildId].usuarios
      ).length;

    const embed = new EmbedBuilder()
      .setColor(0x00ff88)
      .setTitle("⚙️ Configuración de recompensas")
      .addFields(
        {
          name: "🎁 Recompensas",
          value: `${recompensas}`,
          inline: true
        },
        {
          name: "👥 Usuarios",
          value: `${usuarios}`,
          inline: true
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
   /rewardhelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rewardhelp")
    .setDescription("Muestra la ayuda del sistema de recompensas"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x00ff88)
      .setTitle("📚 Ayuda — Recompensas")
      .setDescription(
        "Sistema de recompensas de **DARK FF V1**."
      )
      .addFields(
        {
          name: "🎁 Usuarios",
          value:
            "`/reward` — Ver recompensa\n" +
            "`/rewards` — Ver recompensas\n" +
            "`/claimreward` — Reclamar recompensa\n" +
            "`/dailyreward` — Recompensa diaria\n" +
            "`/weeklyreward` — Recompensa semanal\n" +
            "`/monthlyreward` — Recompensa mensual"
        },
        {
          name: "🛠️ Administración",
          value:
            "`/giverreward` — Entregar recompensa\n" +
            "`/rewardlist` — Lista administrativa\n" +
            "`/rewardcreate` — Crear recompensa\n" +
            "`/rewarddelete` — Eliminar recompensa\n" +
            "`/rewardconfig` — Ver configuración"
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
