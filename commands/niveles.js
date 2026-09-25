const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.json");

// =====================================================
// BASE DE DATOS
// =====================================================

function cargarDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(
        DB_PATH,
        JSON.stringify({}, null, 2),
        "utf8"
      );
    }

    const contenido = fs.readFileSync(DB_PATH, "utf8");

    if (!contenido.trim()) {
      return {};
    }

    return JSON.parse(contenido);
  } catch (error) {
    console.error("Error cargando database.json:", error);
    return {};
  }
}

function guardarDB(db) {
  try {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify(db, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("Error guardando database.json:", error);
  }
}

// =====================================================
// ESTRUCTURA DEL SERVIDOR
// =====================================================

function obtenerServidor(db, guildId) {
  if (!db.niveles) {
    db.niveles = {};
  }

  if (!db.niveles[guildId]) {
    db.niveles[guildId] = {
      usuarios: {},
      configuracion: {
        mensajeNivel: true,
        canal: null,
        roles: {}
      }
    };
  }

  if (!db.niveles[guildId].usuarios) {
    db.niveles[guildId].usuarios = {};
  }

  if (!db.niveles[guildId].configuracion) {
    db.niveles[guildId].configuracion = {
      mensajeNivel: true,
      canal: null,
      roles: {}
    };
  }

  if (!db.niveles[guildId].configuracion.roles) {
    db.niveles[guildId].configuracion.roles = {};
  }

  return db.niveles[guildId];
}

// =====================================================
// USUARIO
// =====================================================

function obtenerUsuario(db, guildId, userId) {
  const servidor = obtenerServidor(db, guildId);

  if (!servidor.usuarios[userId]) {
    servidor.usuarios[userId] = {
      xp: 0,
      nivel: 1,
      mensajes: 0,
      ultimoDaily: 0,
      ultimoBuscar: 0
    };
  }

  return servidor.usuarios[userId];
}

// =====================================================
// XP NECESARIA
// =====================================================

function xpNecesaria(nivel) {
  return nivel * 100;
}

// =====================================================
// CALCULAR NIVEL
// =====================================================

function calcularNivel(xp) {
  let nivel = 1;
  let restante = Math.max(0, xp);

  while (restante >= xpNecesaria(nivel)) {
    restante -= xpNecesaria(nivel);
    nivel++;
  }

  return {
    nivel,
    xpActual: restante,
    xpSiguiente: xpNecesaria(nivel)
  };
}

// =====================================================
// AGREGAR XP
// =====================================================

async function agregarXP(interaction, usuario, cantidad) {
  const db = cargarDB();

  const datos = obtenerUsuario(
    db,
    interaction.guild.id,
    usuario.id
  );

  const nivelAnterior = datos.nivel;

  datos.xp += Math.max(0, cantidad);
  datos.mensajes += 1;

  const resultado = calcularNivel(datos.xp);

  datos.nivel = resultado.nivel;

  guardarDB(db);

  if (datos.nivel > nivelAnterior) {
    await procesarSubidaNivel(
      interaction,
      usuario,
      datos.nivel,
      db
    );
  }

  return {
    nivelAnterior,
    nivelNuevo: datos.nivel,
    subio: datos.nivel > nivelAnterior
  };
}

// =====================================================
// SUBIDA DE NIVEL
// =====================================================

async function procesarSubidaNivel(
  interaction,
  usuario,
  nivel,
  db
) {
  try {
    const servidor = obtenerServidor(
      db,
      interaction.guild.id
    );

    const config = servidor.configuracion;

    // Dar rol del nivel
    const roleId = config.roles[String(nivel)];

    if (roleId) {
      const rol = interaction.guild.roles.cache.get(roleId);

      if (
        rol &&
        interaction.guild.members.me &&
        rol.position < interaction.guild.members.me.roles.highest.position
      ) {
        const miembro = await interaction.guild.members
          .fetch(usuario.id)
          .catch(() => null);

        if (miembro && !miembro.roles.cache.has(rol.id)) {
          await miembro.roles.add(rol).catch(() => {});
        }
      }
    }

    // Mensaje de subida
    if (!config.mensajeNivel) {
      return;
    }

    const canal =
      config.canal
        ? interaction.guild.channels.cache.get(config.canal)
        : interaction.channel;

    if (!canal || !canal.isTextBased()) {
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("🎉 ¡SUBIDA DE NIVEL!")
      .setDescription(
        `⭐ ${usuario} subió al **nivel ${nivel}**.`
      )
      .setThumbnail(usuario.displayAvatarURL())
      .setFooter({
        text: "DARK FF V1 • Sistema de niveles"
      });

    await canal.send({
      embeds: [embed]
    }).catch(() => {});

  } catch (error) {
    console.error(
      "Error procesando subida de nivel:",
      error
    );
  }
}

// =====================================================
// EMBED DE PERFIL
// =====================================================

function crearPerfilEmbed(usuario, datos) {
  const resultado = calcularNivel(datos.xp);

  const porcentaje = Math.floor(
    (resultado.xpActual / resultado.xpSiguiente) * 100
  );

  const barras = 10;
  const llenas = Math.round(
    (porcentaje / 100) * barras
  );

  const barra =
    "🟩".repeat(llenas) +
    "⬜".repeat(barras - llenas);

  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`📊 Perfil de ${usuario.username}`)
    .setThumbnail(usuario.displayAvatarURL())
    .addFields(
      {
        name: "⭐ Nivel",
        value: `**${resultado.nivel}**`,
        inline: true
      },
      {
        name: "✨ XP Total",
        value: `**${datos.xp} XP**`,
        inline: true
      },
      {
        name: "💬 Mensajes",
        value: `**${datos.mensajes}**`,
        inline: true
      },
      {
        name: "📈 Progreso",
        value:
          `${barra}\n` +
          `**${resultado.xpActual} / ${resultado.xpSiguiente} XP** (${porcentaje}%)`
      }
    )
    .setFooter({
      text: "DARK FF V1"
    });
}

// =====================================================
// COMANDOS
// =====================================================

const comandos = [];

// =====================================================
// /NIVEL
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("nivel")
    .setDescription("Muestra tu nivel actual")
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    guardarDB(db);

    const resultado = calcularNivel(datos.xp);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle("⭐ Tu nivel")
          .setDescription(
            `${interaction.user}\n\n` +
            `🏆 **Nivel:** ${resultado.nivel}\n` +
            `✨ **XP:** ${datos.xp}\n` +
            `📈 **Progreso:** ${resultado.xpActual}/${resultado.xpSiguiente} XP`
          )
      ]
    });
  }
});

// =====================================================
// /PERFIL
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("perfil")
    .setDescription("Muestra tu perfil de niveles")
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    guardarDB(db);

    return interaction.reply({
      embeds: [
        crearPerfilEmbed(
          interaction.user,
          datos
        )
      ]
    });
  }
});

// =====================================================
// /XP
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("xp")
    .setDescription("Muestra tu XP o la de otro usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(false)
    )
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      usuario.id
    );

    guardarDB(db);

    const resultado = calcularNivel(datos.xp);

    return interaction.reply(
      `✨ **${usuario.username}** tiene **${datos.xp} XP** y está en el **nivel ${resultado.nivel}**.`
    );
  }
});

// =====================================================
// /RANGOS
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("rangos")
    .setDescription("Muestra los niveles y XP necesarios")
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    let texto = "";

    for (let i = 1; i <= 10; i++) {
      texto += `⭐ Nivel **${i}** → ${xpNecesaria(i)} XP\n`;
    }

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle("🏆 Rangos")
          .setDescription(texto)
          .setFooter({
            text: "DARK FF V1"
          })
      ]
    });
  }
});

// =====================================================
// /RANKINGXP
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("rankingxp")
    .setDescription("Muestra el ranking de XP")
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    const db = cargarDB();

    const servidor = obtenerServidor(
      db,
      interaction.guild.id
    );

    guardarDB(db);

    const ranking = Object.entries(
      servidor.usuarios
    )
      .sort((a, b) => b[1].xp - a[1].xp)
      .slice(0, 10);

    if (!ranking.length) {
      return interaction.reply(
        "📊 Todavía no hay usuarios con XP."
      );
    }

    let texto = "";

    for (let i = 0; i < ranking.length; i++) {
      const [userId, datos] = ranking[i];

      const usuario = await interaction.client.users
        .fetch(userId)
        .catch(() => null);

      const nombre =
        usuario?.username || `Usuario ${userId}`;

      texto +=
        `**${i + 1}.** ${nombre} — ` +
        `Nivel ${datos.nivel} • ${datos.xp} XP\n`;
    }

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle("🏆 Ranking de XP")
          .setDescription(texto)
          .setFooter({
            text: "DARK FF V1"
          })
      ]
    });
  }
});

// =====================================================
// /TOP
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Muestra el top 10 del servidor")
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    const db = cargarDB();

    const servidor = obtenerServidor(
      db,
      interaction.guild.id
    );

    const ranking = Object.entries(
      servidor.usuarios
    )
      .sort((a, b) => b[1].xp - a[1].xp)
      .slice(0, 10);

    if (!ranking.length) {
      return interaction.reply(
        "🏆 Aún no hay nadie en el ranking."
      );
    }

    const lineas = [];

    for (let i = 0; i < ranking.length; i++) {
      const [userId, datos] = ranking[i];

      const usuario = await interaction.client.users
        .fetch(userId)
        .catch(() => null);

      lineas.push(
        `**${i + 1}.** ${usuario?.username || userId} — ` +
        `Nivel ${datos.nivel} • ${datos.xp} XP`
      );
    }

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle("🥇 TOP 10")
          .setDescription(lineas.join("\n"))
      ]
    });
  }
});

// =====================================================
// /RECOMPENSAS
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("recompensas")
    .setDescription("Muestra las recompensas por nivel")
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x57f287)
          .setTitle("🎁 Recompensas")
          .setDescription(
            "Las recompensas configuradas por nivel son roles.\n\n" +
            "Usa `/rolnivel` para configurar un rol para un nivel."
          )
      ]
    });
  }
});

// =====================================================
// /DAILY
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Obtén XP diaria")
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    const ahora = Date.now();
    const cooldown = 24 * 60 * 60 * 1000;

    if (ahora - datos.ultimoDaily < cooldown) {
      const restante =
        cooldown - (ahora - datos.ultimoDaily);

      const horas = Math.floor(
        restante / (60 * 60 * 1000)
      );

      const minutos = Math.floor(
        (restante % (60 * 60 * 1000)) /
        (60 * 1000)
      );

      return interaction.reply(
        `⏳ Ya reclamaste tu recompensa diaria. Vuelve en **${horas}h ${minutos}m**.`
      );
    }

    const cantidad = 50;

    datos.ultimoDaily = ahora;
    datos.xp += cantidad;

    const anterior = datos.nivel;
    const resultado = calcularNivel(datos.xp);

    datos.nivel = resultado.nivel;

    guardarDB(db);

    if (datos.nivel > anterior) {
      await procesarSubidaNivel(
        interaction,
        interaction.user,
        datos.nivel,
        db
      );
    }

    return interaction.reply(
      `🎁 ¡Recompensa diaria! Ganaste **${cantidad} XP**.`
    );
  }
});

// =====================================================
// /BUSCAR
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("buscar")
    .setDescription("Busca XP y obtén una pequeña recompensa")
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    const ahora = Date.now();
    const cooldown = 5 * 60 * 1000;

    if (ahora - datos.ultimoBuscar < cooldown) {
      const restante =
        cooldown - (ahora - datos.ultimoBuscar);

      const minutos = Math.ceil(
        restante / 60000
      );

      return interaction.reply(
        `⏳ Espera **${minutos} minutos** antes de usar \`/buscar\` nuevamente.`
      );
    }

    const cantidad =
      Math.floor(Math.random() * 31) + 20;

    datos.ultimoBuscar = ahora;
    datos.xp += cantidad;

    const anterior = datos.nivel;
    const resultado = calcularNivel(datos.xp);

    datos.nivel = resultado.nivel;

    guardarDB(db);

    if (datos.nivel > anterior) {
      await procesarSubidaNivel(
        interaction,
        interaction.user,
        datos.nivel,
        db
      );
    }

    return interaction.reply(
      `🔎 Encontraste **${cantidad} XP**.`
    );
  }
});

// =====================================================
// /LOGROS
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("logros")
    .setDescription("Muestra tus logros")
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    const logros = [
      {
        nombre: "🌱 Principiante",
        cumple: datos.xp >= 100
      },
      {
        nombre: "⭐ Nivel 5",
        cumple: datos.nivel >= 5
      },
      {
        nombre: "🏆 Nivel 10",
        cumple: datos.nivel >= 10
      },
      {
        nombre: "💬 100 mensajes",
        cumple: datos.mensajes >= 100
      },
      {
        nombre: "💬 500 mensajes",
        cumple: datos.mensajes >= 500
      }
    ];

    const texto = logros
      .map(
        logro =>
          `${logro.cumple ? "✅" : "🔒"} ${logro.nombre}`
      )
      .join("\n");

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle(`🏆 Logros de ${interaction.user.username}`)
          .setDescription(texto)
      ]
    });
  }
});

// =====================================================
// /LOGRO
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("logro")
    .setDescription("Consulta un logro específico")
    .addStringOption(o =>
      o.setName("nombre")
        .setDescription("Nombre del logro")
        .setRequired(true)
        .addChoices(
          {
            name: "Principiante",
            value: "principiante"
          },
          {
            name: "Nivel 5",
            value: "nivel5"
          },
          {
            name: "Nivel 10",
            value: "nivel10"
          },
          {
            name: "100 mensajes",
            value: "mensajes100"
          },
          {
            name: "500 mensajes",
            value: "mensajes500"
          }
        )
    )
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    const nombre =
      interaction.options.getString("nombre");

    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      interaction.user.id
    );

    const condiciones = {
      principiante: datos.xp >= 100,
      nivel5: datos.nivel >= 5,
      nivel10: datos.nivel >= 10,
      mensajes100: datos.mensajes >= 100,
      mensajes500: datos.mensajes >= 500
    };

    const conseguido = condiciones[nombre];

    return interaction.reply(
      conseguido
        ? "🏆 ¡Logro conseguido!"
        : "🔒 Todavía no has conseguido este logro."
    );
  }
});

// =====================================================
// /LEADERBOARD
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Muestra la clasificación de niveles")
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    const db = cargarDB();

    const servidor = obtenerServidor(
      db,
      interaction.guild.id
    );

    const ranking = Object.entries(
      servidor.usuarios
    )
      .sort((a, b) => {
        if (b[1].nivel !== a[1].nivel) {
          return b[1].nivel - a[1].nivel;
        }

        return b[1].xp - a[1].xp;
      })
      .slice(0, 10);

    if (!ranking.length) {
      return interaction.reply(
        "📊 No hay datos suficientes para mostrar el ranking."
      );
    }

    let texto = "";

    for (let i = 0; i < ranking.length; i++) {
      const [userId, datos] = ranking[i];

      const usuario = await interaction.client.users
        .fetch(userId)
        .catch(() => null);

      texto +=
        `**${i + 1}.** ${usuario?.username || userId} — ` +
        `Nivel ${datos.nivel} (${datos.xp} XP)\n`;
    }

        return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle("📊 Leaderboard")
          .setDescription(texto)
          .setFooter({
            text: "DARK FF V1"
          })
      ]
    });
  }
});

// =====================================================
// /RESETXP
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("resetxp")
    .setDescription("Reinicia el XP de un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    const db = cargarDB();

    const datos = obtenerUsuario(
      db,
      interaction.guild.id,
      usuario.id
    );

    datos.xp = 0;
    datos.nivel = 1;
    datos.mensajes = 0;

    guardarDB(db);

    return interaction.reply(
      `🔄 Se reinició el XP de **${usuario.tag}**.`
    );
  }
});

// =====================================================
// /DARXP
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("darxp")
    .setDescription("Da XP a un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("cantidad")
        .setDescription("Cantidad de XP")
        .setMinValue(1)
        .setMaxValue(100000)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .setDMPermission(false),

  category: "niveles",

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

    const nivelAnterior = datos.nivel;

    datos.xp += cantidad;

    const resultado = calcularNivel(datos.xp);

    datos.nivel = resultado.nivel;

    guardarDB(db);

    if (datos.nivel > nivelAnterior) {
      await procesarSubidaNivel(
        interaction,
        usuario,
        datos.nivel,
        db
      );
    }

    return interaction.reply(
      `✨ Se dieron **${cantidad} XP** a **${usuario.tag}**.`
    );
  }
});

// =====================================================
// /QUITARXP
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("quitarxp")
    .setDescription("Quita XP a un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("cantidad")
        .setDescription("Cantidad de XP")
        .setMinValue(1)
        .setMaxValue(100000)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .setDMPermission(false),

  category: "niveles",

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

    datos.xp = Math.max(
      0,
      datos.xp - cantidad
    );

    const resultado = calcularNivel(datos.xp);

    datos.nivel = resultado.nivel;

    guardarDB(db);

    return interaction.reply(
      `➖ Se quitaron **${cantidad} XP** a **${usuario.tag}**.`
    );
  }
});

// =====================================================
// /NIVELCONFIG
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("nivelconfig")
    .setDescription("Muestra la configuración de niveles")
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    const db = cargarDB();

    const servidor = obtenerServidor(
      db,
      interaction.guild.id
    );

    const config = servidor.configuracion;

    const canal = config.canal
      ? `<#${config.canal}>`
      : "Canal actual";

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle("⚙️ Configuración de niveles")
          .addFields(
            {
              name: "Mensajes de nivel",
              value: config.mensajeNivel
                ? "🟢 Activados"
                : "🔴 Desactivados",
              inline: true
            },
            {
              name: "Canal",
              value: canal,
              inline: true
            },
            {
              name: "Roles configurados",
              value: String(
                Object.keys(config.roles).length
              ),
              inline: true
            }
          ]
      ]
    });
  }
});

// =====================================================
// /MENSAJENIVEL
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("mensajenivel")
    .setDescription("Activa o desactiva los mensajes de nivel")
    .addBooleanOption(o =>
      o.setName("activo")
        .setDescription("¿Activar mensajes?")
        .setRequired(true)
    )
    .addChannelOption(o =>
      o.setName("canal")
        .setDescription("Canal donde se enviarán")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    const activo =
      interaction.options.getBoolean("activo");

    const canal =
      interaction.options.getChannel("canal");

    const db = cargarDB();

    const servidor = obtenerServidor(
      db,
      interaction.guild.id
    );

    servidor.configuracion.mensajeNivel = activo;

    if (canal) {
      if (!canal.isTextBased()) {
        return interaction.reply(
          "❌ Ese canal no permite enviar mensajes."
        );
      }

      servidor.configuracion.canal = canal.id;
    }

    guardarDB(db);

    return interaction.reply(
      `✅ Mensajes de nivel: **${
        activo ? "ACTIVADOS" : "DESACTIVADOS"
      }**${canal ? `\n📢 Canal: ${canal}` : ""}`
    );
  }
});

// =====================================================
// /ROLNIVEL
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("rolnivel")
    .setDescription("Configura un rol para un nivel")
    .addIntegerOption(o =>
      o.setName("nivel")
        .setDescription("Nivel requerido")
        .setMinValue(1)
        .setMaxValue(1000)
        .setRequired(true)
    )
    .addRoleOption(o =>
      o.setName("rol")
        .setDescription("Rol que se dará")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageRoles
    )
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    const nivel =
      interaction.options.getInteger("nivel");

    const rol =
      interaction.options.getRole("rol");

    const botMember =
      interaction.guild.members.me;

    if (
      !botMember ||
      rol.position >= botMember.roles.highest.position
    ) {
      return interaction.reply(
        "❌ No puedo asignar ese rol porque está por encima o al mismo nivel que mi rol."
      );
    }

    const db = cargarDB();

    const servidor = obtenerServidor(
      db,
      interaction.guild.id
    );

    servidor.configuracion.roles[String(nivel)] =
      rol.id;

    guardarDB(db);

    return interaction.reply(
      `✅ El rol ${rol} se dará al alcanzar el **nivel ${nivel}**.`
    );
  }
});

// =====================================================
// /XPCONFIG
// =====================================================

comandos.push({
  data: new SlashCommandBuilder()
    .setName("xpconfig")
    .setDescription("Muestra cómo funciona el sistema de XP")
    .setDMPermission(false),

  category: "niveles",

  async execute(interaction) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle("✨ Sistema de XP — DARK FF V1")
          .setDescription(
            "📈 **Sistema de XP activo y guardado en database.json.**"
          )
          .addFields(
            {
              name: "⭐ Niveles",
              value:
                "Cada nivel necesita más XP que el anterior."
            },
            {
              name: "🎁 Daily",
              value:
                "Usa `/daily` cada 24 horas."
            },
            {
              name: "🔎 Buscar",
              value:
                "Usa `/buscar` cada 5 minutos."
            },
            {
              name: "🏆 Rankings",
              value:
                "`/top` • `/rankingxp` • `/leaderboard`"
            },
            {
              name: "🛠️ Administración",
              value:
                "`/darxp` • `/quitarxp` • `/resetxp`"
            },
            {
              name: "🎭 Roles",
              value:
                "Configúralos con `/rolnivel`."
            }
          )
      ]
    });
  }
});

// =====================================================
// EXPORTAR
// =====================================================

module.exports = comandos;
      
