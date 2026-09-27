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
  if (!db.niveles) db.niveles = {};
  if (!db.niveles[guildId]) {
    db.niveles[guildId] = {
      usuarios: {},
      configuracion: {
        xpPorMensaje: 10,
        xpMinimo: 5,
        xpMaximo: 15,
        nivelBase: 100,
        canal: null,
        mensajesActivos: true,
        roles: {}
      }
    };
  }

  if (!db.niveles[guildId].usuarios) {
    db.niveles[guildId].usuarios = {};
  }

  if (!db.niveles[guildId].configuracion) {
    db.niveles[guildId].configuracion = {
      xpPorMensaje: 10,
      xpMinimo: 5,
      xpMaximo: 15,
      nivelBase: 100,
      canal: null,
      mensajesActivos: true,
      roles: {}
    };
  }

  if (!db.niveles[guildId].configuracion.roles) {
    db.niveles[guildId].configuracion.roles = {};
  }
}

function asegurarUsuario(db, guildId, userId) {
  asegurarGuild(db, guildId);

  if (!db.niveles[guildId].usuarios[userId]) {
    db.niveles[guildId].usuarios[userId] = {
      xp: 0,
      nivel: 1,
      mensajes: 0
    };
  }

  return db.niveles[guildId].usuarios[userId];
}

function xpNecesaria(nivel, base = 100) {
  return Math.max(1, nivel * base);
}

function calcularNivel(xp, base = 100) {
  let nivel = 1;
  let restante = Math.max(0, Number(xp) || 0);

  while (restante >= xpNecesaria(nivel, base)) {
    restante -= xpNecesaria(nivel, base);
    nivel++;

    if (nivel > 10000) break;
  }

  return nivel;
}

function xpTotalParaNivel(nivel, base = 100) {
  let total = 0;

  for (let i = 1; i < nivel; i++) {
    total += xpNecesaria(i, base);
  }

  return total;
}

function actualizarNivel(usuario, base) {
  const nivelAnterior = usuario.nivel || 1;
  const nuevoNivel = calcularNivel(usuario.xp || 0, base);

  usuario.nivel = nuevoNivel;

  return {
    nivelAnterior,
    nuevoNivel,
    subio: nuevoNivel > nivelAnterior
  };
}

const commands = [];

/* =========================================================
   /rank
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Muestra tu nivel y experiencia")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres consultar")
        .setRequired(false)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const usuario = interaction.options.getUser("usuario") || interaction.user;
    const datos = asegurarUsuario(db, guildId, usuario.id);

    const config = db.niveles[guildId].configuracion;

    const nivel = datos.nivel || 1;
    const xp = datos.xp || 0;

    const xpActualNivel = xpTotalParaNivel(nivel, config.nivelBase);
    const xpSiguiente = xpTotalParaNivel(nivel + 1, config.nivelBase);

    const progreso = Math.max(0, xp - xpActualNivel);
    const necesario = Math.max(1, xpSiguiente - xpActualNivel);

    const porcentaje = Math.min(
      100,
      Math.floor((progreso / necesario) * 100)
    );

    const miembros = Object.entries(db.niveles[guildId].usuarios);

    const posicion =
      miembros
        .map(([id, datos]) => ({
          id,
          xp: datos.xp || 0
        }))
        .sort((a, b) => b.xp - a.xp)
        .findIndex(x => x.id === usuario.id) + 1;

    const barraTotal = 10;
    const llenos = Math.round((porcentaje / 100) * barraTotal);

    const barra =
      "▰".repeat(llenos) +
      "▱".repeat(barraTotal - llenos);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`📊 Rank de ${usuario.username}`)
      .setThumbnail(usuario.displayAvatarURL({ size: 256 }))
      .addFields(
        {
          name: "🏆 Nivel",
          value: `**${nivel}**`,
          inline: true
        },
        {
          name: "✨ XP",
          value: `**${xp.toLocaleString()}**`,
          inline: true
        },
        {
          name: "🥇 Posición",
          value: `**#${posicion || 1}**`,
          inline: true
        },
        {
          name: "📈 Progreso",
          value: `${barra}\n${progreso.toLocaleString()} / ${necesario.toLocaleString()} XP (**${porcentaje}%**)`
        },
        {
          name: "💬 Mensajes",
          value: `**${(datos.mensajes || 0).toLocaleString()}**`,
          inline: true
        }
      )
      .setFooter({
        text: interaction.guild.name
      })
      .setTimestamp();

    guardarDB(db);

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /level
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Muestra tu nivel actual")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    const usuario = interaction.options.getUser("usuario") || interaction.user;

    const datos = asegurarUsuario(db, guildId, usuario.id);

    await interaction.reply(
      `🎮 **${usuario.username}** está en el **nivel ${datos.nivel || 1}** con **${datos.xp || 0} XP**.`
    );

    guardarDB(db);
  }
});

/* =========================================================
   /xp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("xp")
    .setDescription("Muestra tu experiencia")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    const usuario = interaction.options.getUser("usuario") || interaction.user;
    const datos = asegurarUsuario(db, guildId, usuario.id);

    const embed = new EmbedBuilder()
      .setColor(0x00bfff)
      .setTitle("✨ Experiencia")
      .setDescription(
        `${usuario} tiene **${(datos.xp || 0).toLocaleString()} XP**.`
      )
      .addFields({
        name: "🎮 Nivel",
        value: `${datos.nivel || 1}`,
        inline: true
      });

    await interaction.reply({
      embeds: [embed]
    });

    guardarDB(db);
  }
});

/* =========================================================
   /givexp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("givexp")
    .setDescription("Da XP a un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que recibirá XP")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de XP")
        .setMinValue(1)
        .setMaxValue(1000000)
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    const usuario = interaction.options.getUser("usuario");
    const cantidad = interaction.options.getInteger("cantidad");

    const datos = asegurarUsuario(db, guildId, usuario.id);
    const config = db.niveles[guildId].configuracion;

    const nivelAnterior = datos.nivel || 1;

    datos.xp += cantidad;

    const resultado = actualizarNivel(
      datos,
      config.nivelBase
    );

    guardarDB(db);

    await interaction.reply(
      `✅ Se dieron **${cantidad.toLocaleString()} XP** a ${usuario}.\n` +
      `✨ Nivel: **${nivelAnterior} → ${resultado.nuevoNivel}**`
    );
  }
});

/* =========================================================
   /removexp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("removexp")
    .setDescription("Quita XP a un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
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
        .setMinValue(1)
        .setMaxValue(1000000)
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    const usuario = interaction.options.getUser("usuario");
    const cantidad = interaction.options.getInteger("cantidad");

    const datos = asegurarUsuario(db, guildId, usuario.id);
    const config = db.niveles[guildId].configuracion;

    const nivelAnterior = datos.nivel || 1;

    datos.xp = Math.max(0, (datos.xp || 0) - cantidad);

    const resultado = actualizarNivel(
      datos,
      config.nivelBase
    );

    guardarDB(db);

    await interaction.reply(
      `✅ Se quitaron **${cantidad.toLocaleString()} XP** a ${usuario}.\n` +
      `✨ Nivel: **${nivelAnterior} → ${resultado.nuevoNivel}**`
    );
  }
});

/* =========================================================
   /setxp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("setxp")
    .setDescription("Establece la XP de un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Nueva cantidad de XP")
        .setMinValue(0)
        .setMaxValue(1000000000)
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    const usuario = interaction.options.getUser("usuario");
    const cantidad = interaction.options.getInteger("cantidad");

    const datos = asegurarUsuario(db, guildId, usuario.id);
    const config = db.niveles[guildId].configuracion;

    datos.xp = cantidad;

    const resultado = actualizarNivel(
      datos,
      config.nivelBase
    );

    guardarDB(db);

    await interaction.reply(
      `✅ XP de ${usuario} establecida en **${cantidad.toLocaleString()}**.\n` +
      `🏆 Nivel actual: **${resultado.nuevoNivel}**`
    );
  }
});

/* =========================================================
   /setlevel
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("setlevel")
    .setDescription("Establece el nivel de un usuario")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("nivel")
        .setDescription("Nuevo nivel")
        .setMinValue(1)
        .setMaxValue(10000)
        .setRequired(true)
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    const usuario = interaction.options.getUser("usuario");
    const nivel = interaction.options.getInteger("nivel");

    const datos = asegurarUsuario(db, guildId, usuario.id);
    const config = db.niveles[guildId].configuracion;

    datos.nivel = nivel;

    const xpBase = xpTotalParaNivel(
      nivel,
      config.nivelBase
    );

    datos.xp = xpBase;

    guardarDB(db);

    await interaction.reply(
      `✅ El nivel de ${usuario} ahora es **${nivel}**.\n` +
      `✨ XP establecida: **${xpBase.toLocaleString()}**`
    );
  }
});

/* =========================================================
   /xpleaderboard
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("xpleaderboard")
    .setDescription("Muestra la clasificación de XP"),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const usuarios = Object.entries(
      db.niveles[guildId].usuarios
    )
      .map(([id, datos]) => ({
        id,
        xp: datos.xp || 0,
        nivel: datos.nivel || 1
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10);

    if (!usuarios.length) {
      return interaction.reply(
        "📊 Todavía no hay usuarios registrados en el sistema de niveles."
      );
    }

    const lineas = [];

    for (let i = 0; i < usuarios.length; i++) {
      const usuario = usuarios[i];

      let nombre = `<@${usuario.id}>`;

      try {
        const miembro = await interaction.guild.members.fetch(usuario.id);
        nombre = miembro.user.username;
      } catch {}

      const medalla =
        i === 0 ? "🥇" :
        i === 1 ? "🥈" :
        i === 2 ? "🥉" :
        `**${i + 1}.**`;

      lineas.push(
        `${medalla} ${nombre} — Nivel **${usuario.nivel}** · **${usuario.xp.toLocaleString()} XP**`
      );
    }

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle("🏆 Ranking de XP")
      .setDescription(lineas.join("\n"))
      .setFooter({
        text: interaction.guild.name
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /levelroles
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("levelroles")
    .setDescription("Configura los roles que se entregan por nivel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription("Asigna un rol a un nivel")
        .addIntegerOption(option =>
          option
            .setName("nivel")
            .setDescription("Nivel requerido")
            .setMinValue(1)
            .setMaxValue(10000)
            .setRequired(true)
        )
        .addRoleOption(option =>
          option
            .setName("rol")
            .setDescription("Rol que se entregará")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription("Elimina un rol de nivel")
        .addIntegerOption(option =>
          option
            .setName("nivel")
            .setDescription("Nivel")
            .setMinValue(1)
            .setMaxValue(10000)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("list")
        .setDescription("Muestra los roles configurados")
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const config = db.niveles[guildId].configuracion;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add") {
      const nivel = interaction.options.getInteger("nivel");
      const rol = interaction.options.getRole("rol");

      config.roles[String(nivel)] = rol.id;

      guardarDB(db);

      return interaction.reply(
        `✅ El rol ${rol} se entregará desde el **nivel ${nivel}**.`
      );
    }

    if (subcommand === "remove") {
      const nivel = interaction.options.getInteger("nivel");

      if (!config.roles[String(nivel)]) {
        return interaction.reply(
          `❌ No hay ningún rol configurado para el nivel **${nivel}**.`
        );
      }

      delete config.roles[String(nivel)];

      guardarDB(db);

      return interaction.reply(
        `✅ Se eliminó la recompensa de rol del nivel **${nivel}**.`
      );
    }

    if (subcommand === "list") {
      const roles = Object.entries(config.roles);

      if (!roles.length) {
        return interaction.reply(
          "📋 No hay roles de nivel configurados."
        );
      }

      const lista = [];

      for (const [nivel, roleId] of roles) {
        const rol = interaction.guild.roles.cache.get(roleId);

        lista.push(
          `🏆 Nivel **${nivel}** → ${rol ? rol.toString() : `Rol eliminado (${roleId})`}`
        );
      }

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle("🏆 Roles por nivel")
            .setDescription(lista.join("\n"))
        ]
      });
    }
  }
});

/* =========================================================
   /levelconfig
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("levelconfig")
    .setDescription("Configura el sistema de niveles")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub
        .setName("xp")
        .setDescription("Configura la XP por mensaje")
        .addIntegerOption(option =>
          option
            .setName("cantidad")
            .setDescription("XP por mensaje")
            .setMinValue(0)
            .setMaxValue(10000)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("base")
        .setDescription("Configura la XP base de cada nivel")
        .addIntegerOption(option =>
          option
            .setName("cantidad")
            .setDescription("XP base")
            .setMinValue(1)
            .setMaxValue(100000)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("channel")
        .setDescription("Configura el canal de mensajes de nivel")
        .addChannelOption(option =>
          option
            .setName("canal")
            .setDescription("Canal")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("status")
        .setDescription("Muestra la configuración")
    )
    .addSubcommand(sub =>
      sub
        .setName("toggle")
        .setDescription("Activa o desactiva el sistema")
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const config = db.niveles[guildId].configuracion;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "xp") {
      const cantidad = interaction.options.getInteger("cantidad");

      config.xpPorMensaje = cantidad;

      guardarDB(db);

      return interaction.reply(
        `✅ XP por mensaje establecida en **${cantidad} XP**.`
      );
    }

    if (subcommand === "base") {
      const cantidad = interaction.options.getInteger("cantidad");

      config.nivelBase = cantidad;

      guardarDB(db);

      return interaction.reply(
        `✅ La XP base ahora es **${cantidad}**.`
      );
    }

    if (subcommand === "channel") {
      const canal = interaction.options.getChannel("canal");

      config.canal = canal.id;

      guardarDB(db);

      return interaction.reply(
        `✅ Canal de niveles configurado en ${canal}.`
      );
    }

    if (subcommand === "toggle") {
      config.mensajesActivos = !config.mensajesActivos;

      guardarDB(db);

      return interaction.reply(
        `✅ Sistema de XP por mensajes: **${
          config.mensajesActivos ? "ACTIVADO" : "DESACTIVADO"
        }**`
      );
    }

    if (subcommand === "status") {
      const canal = config.canal
        ? `<#${config.canal}>`
        : "No configurado";

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("⚙️ Configuración de niveles")
        .addFields(
          {
            name: "✨ XP por mensaje",
            value: `${config.xpPorMensaje}`,
            inline: true
          },
          {
            name: "📈 XP base",
            value: `${config.nivelBase}`,
            inline: true
          },
          {
            name: "💬 Sistema",
            value: config.mensajesActivos
              ? "🟢 Activado"
              : "🔴 Desactivado",
            inline: true
          },
          {
            name: "📢 Canal",
            value: canal,
            inline: true
          }
        );

      return interaction.reply({
        embeds: [embed]
      });
    }
  }
});

/* =========================================================
   /levelreset
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("levelreset")
    .setDescription("Reinicia los niveles de un usuario o de todo el servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub
        .setName("usuario")
        .setDescription("Reinicia el nivel de un usuario")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("servidor")
        .setDescription("Reinicia todos los niveles")
    ),

  async execute(interaction) {
    const db = cargarDB();
    const guildId = interaction.guild.id;

    asegurarGuild(db, guildId);

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "usuario") {
      const usuario = interaction.options.getUser("usuario");

      db.niveles[guildId].usuarios[usuario.id] = {
        xp: 0,
        nivel: 1,
        mensajes: 0
      };

      guardarDB(db);

      return interaction.reply(
        `♻️ Se reinició el nivel de ${usuario}.`
      );
    }

    if (subcommand === "servidor") {
      db.niveles[guildId].usuarios = {};

      guardarDB(db);

      return interaction.reply(
        "♻️ Se reiniciaron **todos los niveles del servidor**."
      );
    }
  }
});

/* =========================================================
   /levelhelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("levelhelp")
    .setDescription("Muestra la ayuda del sistema de niveles"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📚 Ayuda — Sistema de niveles")
      .setDescription(
        "Sistema de experiencia y niveles de **DARK FF V1**."
      )
      .addFields(
        {
          name: "👤 Usuarios",
          value:
            "`/rank` — Ver tu ranking\n" +
            "`/level` — Ver nivel\n" +
            "`/xp` — Ver XP\n" +
            "`/xpleaderboard` — Ranking de XP"
        },
        {
          name: "🛠️ Administración",
          value:
            "`/givexp` — Dar XP\n" +
            "`/removexp` — Quitar XP\n" +
            "`/setxp` — Establecer XP\n" +
            "`/setlevel` — Establecer nivel\n" +
            "`/levelreset` — Reiniciar niveles"
        },
        {
          name: "⚙️ Configuración",
          value:
            "`/levelroles` — Roles por nivel\n" +
            "`/levelconfig` — Configuración"
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
