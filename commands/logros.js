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
  if (!db.logros) db.logros = {};

  if (!db.logros[guildId]) {
    db.logros[guildId] = {
      logros: {},
      usuarios: {}
    };
  }

  if (!db.logros[guildId].logros) {
    db.logros[guildId].logros = {};
  }

  if (!db.logros[guildId].usuarios) {
    db.logros[guildId].usuarios = {};
  }
}

function asegurarUsuario(db, guildId, userId) {
  asegurarGuild(db, guildId);

  if (!db.logros[guildId].usuarios[userId]) {
    db.logros[guildId].usuarios[userId] = {
      desbloqueados: []
    };
  }

  if (!Array.isArray(db.logros[guildId].usuarios[userId].desbloqueados)) {
    db.logros[guildId].usuarios[userId].desbloqueados = [];
  }

  return db.logros[guildId].usuarios[userId];
}

const commands = [];

/* =========================================================
   /achievements
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("achievements")
    .setDescription("Muestra tus logros desbloqueados")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres consultar")
        .setRequired(false)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    const usuario =
      interaction.options.getUser("usuario") || interaction.user;

    const datos = asegurarUsuario(db, guildId, usuario.id);
    const lista = db.logros[guildId].logros;

    const desbloqueados = datos.desbloqueados
      .map(id => lista[id])
      .filter(Boolean);

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle(`🏆 Logros de ${usuario.username}`)
      .setThumbnail(usuario.displayAvatarURL({ size: 256 }));

    if (!desbloqueados.length) {
      embed.setDescription(
        "❌ Este usuario todavía no tiene logros desbloqueados."
      );
    } else {
      embed.setDescription(
        desbloqueados
          .map(
            logro =>
              `${logro.emoji || "🏆"} **${logro.nombre}**\n${logro.descripcion}`
          )
          .join("\n\n")
      );
    }

    embed.setFooter({
      text: `Total: ${desbloqueados.length}`
    });

    await interaction.reply({
      embeds: [embed]
    });

    guardarDB(db);
  }
});

/* =========================================================
   /achievement
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("achievement")
    .setDescription("Muestra información de un logro")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID del logro")
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const id = interaction.options.getString("id").toLowerCase();
    const logro = db.logros[guildId].logros[id];

    if (!logro) {
      return interaction.reply(
        `❌ No existe ningún logro con el ID \`${id}\`.`
      );
    }

    const usuarios = Object.entries(
      db.logros[guildId].usuarios
    ).filter(([, datos]) =>
      datos.desbloqueados?.includes(id)
    );

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle(`${logro.emoji || "🏆"} ${logro.nombre}`)
      .setDescription(logro.descripcion)
      .addFields(
        {
          name: "🆔 ID",
          value: `\`${id}\``,
          inline: true
        },
        {
          name: "👥 Desbloqueados",
          value: `${usuarios.length}`,
          inline: true
        }
      );

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /unlock
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Desbloquea manualmente un logro")
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
        .setDescription("ID del logro")
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const usuario = interaction.options.getUser("usuario");
    const id = interaction.options.getString("id").toLowerCase();

    const logro = db.logros[guildId].logros[id];

    if (!logro) {
      return interaction.reply(
        `❌ No existe el logro \`${id}\`.`
      );
    }

    const datos = asegurarUsuario(db, guildId, usuario.id);

    if (datos.desbloqueados.includes(id)) {
      return interaction.reply(
        `⚠️ ${usuario} ya tiene desbloqueado ese logro.`
      );
    }

    datos.desbloqueados.push(id);

    guardarDB(db);

    await interaction.reply(
      `🏆 Se desbloqueó **${logro.nombre}** para ${usuario}.`
    );
  }
});

/* =========================================================
   /giveachievement
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("giveachievement")
    .setDescription("Entrega un logro a un usuario")
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
        .setDescription("ID del logro")
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const usuario = interaction.options.getUser("usuario");
    const id = interaction.options.getString("id").toLowerCase();

    const logro = db.logros[guildId].logros[id];

    if (!logro) {
      return interaction.reply(
        `❌ No existe el logro \`${id}\`.`
      );
    }

    const datos = asegurarUsuario(db, guildId, usuario.id);

    if (!datos.desbloqueados.includes(id)) {
      datos.desbloqueados.push(id);
    }

    guardarDB(db);

    await interaction.reply(
      `🎁 **${logro.nombre}** fue entregado a ${usuario}.`
    );
  }
});

/* =========================================================
   /removeachievement
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("removeachievement")
    .setDescription("Quita un logro a un usuario")
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
        .setDescription("ID del logro")
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const usuario = interaction.options.getUser("usuario");
    const id = interaction.options.getString("id").toLowerCase();

    const datos = asegurarUsuario(db, guildId, usuario.id);

    if (!datos.desbloqueados.includes(id)) {
      return interaction.reply(
        `❌ ${usuario} no tiene ese logro.`
      );
    }

    datos.desbloqueados =
      datos.desbloqueados.filter(logroId => logroId !== id);

    guardarDB(db);

    await interaction.reply(
      `🗑️ Se quitó el logro \`${id}\` a ${usuario}.`
    );
  }
});

/* =========================================================
   /achievementlist
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("achievementlist")
    .setDescription("Muestra todos los logros disponibles"),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const logros = Object.entries(
      db.logros[guildId].logros
    );

    if (!logros.length) {
      return interaction.reply(
        "📋 No hay logros creados en este servidor."
      );
    }

    const lista = logros
      .slice(0, 25)
      .map(
        ([id, logro]) =>
          `${logro.emoji || "🏆"} **${logro.nombre}** — \`${id}\`\n${logro.descripcion}`
      )
      .join("\n\n");

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle("🏆 Lista de logros")
      .setDescription(lista)
      .setFooter({
        text:
          logros.length > 25
            ? `Mostrando 25 de ${logros.length}`
            : `Total: ${logros.length}`
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /achievementcreate
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("achievementcreate")
    .setDescription("Crea un nuevo logro")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID único del logro")
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(30)
    )
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nombre del logro")
        .setRequired(true)
        .setMaxLength(100)
    )
    .addStringOption(option =>
      option
        .setName("descripcion")
        .setDescription("Descripción del logro")
        .setRequired(true)
        .setMaxLength(500)
    )
    .addStringOption(option =>
      option
        .setName("emoji")
        .setDescription("Emoji del logro")
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

    const nombre = interaction.options.getString("nombre");
    const descripcion =
      interaction.options.getString("descripcion");
    const emoji =
      interaction.options.getString("emoji") || "🏆";

    if (!id) {
      return interaction.reply(
        "❌ El ID proporcionado no es válido."
      );
    }

    if (db.logros[guildId].logros[id]) {
      return interaction.reply(
        `❌ Ya existe un logro con el ID \`${id}\`.`
      );
    }

    db.logros[guildId].logros[id] = {
      nombre,
      descripcion,
      emoji,
      creadoPor: interaction.user.id,
      creadoEn: Date.now()
    };

    guardarDB(db);

    await interaction.reply(
      `✅ Logro creado correctamente.\n\n` +
      `${emoji} **${nombre}**\n` +
      `🆔 ID: \`${id}\``
    );
  }
});

/* =========================================================
   /achievementdelete
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("achievementdelete")
    .setDescription("Elimina un logro")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID del logro")
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const id = interaction.options
      .getString("id")
      .toLowerCase();

    const logro = db.logros[guildId].logros[id];

    if (!logro) {
      return interaction.reply(
        `❌ No existe el logro \`${id}\`.`
      );
    }

    delete db.logros[guildId].logros[id];

    for (const userId of Object.keys(
      db.logros[guildId].usuarios
    )) {
      const datos =
        db.logros[guildId].usuarios[userId];

      datos.desbloqueados =
        datos.desbloqueados.filter(
          logroId => logroId !== id
        );
    }

    guardarDB(db);

    await interaction.reply(
      `🗑️ El logro **${logro.nombre}** fue eliminado.`
    );
  }
});

/* =========================================================
   /achievementedit
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("achievementedit")
    .setDescription("Edita un logro existente")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID del logro")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nuevo nombre")
        .setRequired(false)
        .setMaxLength(100)
    )
    .addStringOption(option =>
      option
        .setName("descripcion")
        .setDescription("Nueva descripción")
        .setRequired(false)
        .setMaxLength(500)
    )
    .addStringOption(option =>
      option
        .setName("emoji")
        .setDescription("Nuevo emoji")
        .setRequired(false)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const id = interaction.options
      .getString("id")
      .toLowerCase();

    const logro = db.logros[guildId].logros[id];

    if (!logro) {
      return interaction.reply(
        `❌ No existe el logro \`${id}\`.`
      );
    }

    const nombre =
      interaction.options.getString("nombre");

    const descripcion =
      interaction.options.getString("descripcion");

    const emoji =
      interaction.options.getString("emoji");

    if (nombre) logro.nombre = nombre;
    if (descripcion) logro.descripcion = descripcion;
    if (emoji) logro.emoji = emoji;

    guardarDB(db);

    await interaction.reply(
      `✅ El logro **${logro.nombre}** fue actualizado correctamente.`
    );
  }
});

/* =========================================================
   /achievementhelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("achievementhelp")
    .setDescription("Muestra la ayuda del sistema de logros"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle("📚 Ayuda — Sistema de logros")
      .setDescription(
        "Sistema de logros de **DARK FF V1**."
      )
      .addFields(
        {
          name: "👤 Usuarios",
          value:
            "`/achievements` — Ver logros desbloqueados\n" +
            "`/achievement` — Ver un logro\n" +
            "`/achievementlist` — Lista de logros"
        },
        {
          name: "🛠️ Administración",
          value:
            "`/unlock` — Desbloquear logro\n" +
            "`/giveachievement` — Entregar logro\n" +
            "`/removeachievement` — Quitar logro"
        },
        {
          name: "⚙️ Gestión",
          value:
            "`/achievementcreate` — Crear logro\n" +
            "`/achievementedit` — Editar logro\n" +
            "`/achievementdelete` — Eliminar logro"
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
