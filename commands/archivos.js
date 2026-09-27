const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.json");
const FILES_DIR = path.join(__dirname, "..", "user_files");

const OWNER_ID = process.env.OWNER_ID || "1483521913429950658";

if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

function cargarDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
    }

    const contenido = fs.readFileSync(DB_PATH, "utf8");

    return contenido.trim()
      ? JSON.parse(contenido)
      : {};
  } catch {
    return {};
  }
}

function guardarDB(db) {
  fs.writeFileSync(
    DB_PATH,
    JSON.stringify(db, null, 2)
  );
}

function prepararArchivos(db) {
  if (!db.archivos) {
    db.archivos = {};
  }

  return db.archivos;
}

function prepararUsuario(db, userId) {
  prepararArchivos(db);

  if (!db.archivos[userId]) {
    db.archivos[userId] = [];
  }

  return db.archivos[userId];
}

function limpiarNombre(nombre) {
  return nombre
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 100);
}

function generarNombre(nombre) {
  const limpio = limpiarNombre(nombre);
  const extension = path.extname(limpio);
  const base = path.basename(limpio, extension);

  return `${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}_${base}${extension}`;
}

function formatoBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function esOwner(interaction) {
  return interaction.user.id === OWNER_ID;
}

const commands = [];

/* =========================================================
   /archivos
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("archivos")
    .setDescription("Muestra tu espacio de archivos"),

  async execute(interaction) {
    const db = cargarDB();
    const archivos = prepararUsuario(
      db,
      interaction.user.id
    );

    guardarDB(db);

    const total = archivos.length;

    const tamaño = archivos.reduce(
      (total, archivo) =>
        total + (archivo.tamaño || 0),
      0
    );

    const embed = new EmbedBuilder()
      .setTitle("📁 Mis archivos")
      .setDescription(
        "Aquí puedes administrar los archivos que DARK FF V1 tiene registrados para tu cuenta."
      )
      .addFields(
        {
          name: "📦 Archivos",
          value: `${total}`,
          inline: true
        },
        {
          name: "💾 Espacio utilizado",
          value: formatoBytes(tamaño),
          inline: true
        }
      )
      .addFields({
        name: "🛠️ Comandos",
        value:
          "`/fileupload` — Subir archivo\n" +
          "`/files` — Ver archivos\n" +
          "`/fileget` — Obtener archivo\n" +
          "`/fileinfo` — Información\n" +
          "`/filedelete` — Eliminar\n" +
          "`/fileclear` — Eliminar todos"
      })
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   /fileupload
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("fileupload")
    .setDescription("Guarda un archivo en tu espacio privado")
    .addAttachmentOption(option =>
      option
        .setName("archivo")
        .setDescription("Archivo que quieres guardar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const archivo =
      interaction.options.getAttachment("archivo");

    if (!archivo) {
      return interaction.reply({
        content: "❌ Debes adjuntar un archivo.",
        ephemeral: true
      });
    }

    const MAX_SIZE = 10 * 1024 * 1024;

    if (
      archivo.size &&
      archivo.size > MAX_SIZE
    ) {
      return interaction.reply({
        content:
          "❌ El archivo supera el límite de **10 MB**.",
        ephemeral: true
      });
    }

    await interaction.deferReply({
      ephemeral: true
    });

    try {
      const respuesta = await fetch(archivo.url);

      if (!respuesta.ok) {
        throw new Error("No se pudo descargar el archivo.");
      }

      const buffer = Buffer.from(
        await respuesta.arrayBuffer()
      );

      if (buffer.length > MAX_SIZE) {
        return interaction.editReply(
          "❌ El archivo supera el límite de **10 MB**."
        );
      }

      const nombreGuardado =
        generarNombre(archivo.name);

      const carpetaUsuario =
        path.join(
          FILES_DIR,
          interaction.user.id
        );

      if (!fs.existsSync(carpetaUsuario)) {
        fs.mkdirSync(carpetaUsuario, {
          recursive: true
        });
      }

      const ruta =
        path.join(
          carpetaUsuario,
          nombreGuardado
        );

      fs.writeFileSync(
        ruta,
        buffer
      );

      const db = cargarDB();
      const lista = prepararUsuario(
        db,
        interaction.user.id
      );

      lista.push({
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        nombre: archivo.name,
        nombreGuardado,
        tamaño: buffer.length,
        tipo: archivo.contentType || "desconocido",
        creado: Date.now()
      });

      guardarDB(db);

      await interaction.editReply(
        `✅ Archivo guardado correctamente.\n\n` +
        `📄 Nombre: **${archivo.name}**\n` +
        `💾 Tamaño: **${formatoBytes(buffer.length)}**`
      );
    } catch (error) {
      console.error("Error fileupload:", error);

      await interaction.editReply(
        "❌ No pude guardar el archivo."
      );
    }
  }
});

/* =========================================================
   /files
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("files")
    .setDescription("Muestra tus archivos guardados"),

  async execute(interaction) {
    const db = cargarDB();

    const archivos = prepararUsuario(
      db,
      interaction.user.id
    );

    if (!archivos.length) {
      return interaction.reply({
        content:
          "📂 No tienes archivos guardados.",
        ephemeral: true
      });
    }

    const lista = archivos
      .slice(-20)
      .reverse()
      .map((archivo, index) => {
        return (
          `**${index + 1}.** ${archivo.nombre}\n` +
          `🆔 \`${archivo.id}\`\n` +
          `💾 ${formatoBytes(archivo.tamaño)}`
        );
      })
      .join("\n\n");

    const embed = new EmbedBuilder()
      .setTitle("📁 Tus archivos")
      .setDescription(lista)
      .setFooter({
        text: `Total: ${archivos.length}`
      })
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   /fileget
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("fileget")
    .setDescription("Obtiene uno de tus archivos")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID del archivo")
        .setRequired(true)
    ),

  async execute(interaction) {
    const id =
      interaction.options.getString("id");

    const db = cargarDB();

    const archivos = prepararUsuario(
      db,
      interaction.user.id
    );

    const archivo =
      archivos.find(item => item.id === id);

    if (!archivo) {
      return interaction.reply({
        content:
          "❌ No encontré ese archivo.",
        ephemeral: true
      });
    }

    const ruta = path.join(
      FILES_DIR,
      interaction.user.id,
      archivo.nombreGuardado
    );

    if (!fs.existsSync(ruta)) {
      return interaction.reply({
        content:
          "❌ El archivo ya no existe físicamente en el almacenamiento del bot.",
        ephemeral: true
      });
    }

    await interaction.reply({
      content:
        `📄 **${archivo.nombre}**\n` +
        `💾 ${formatoBytes(archivo.tamaño)}`,
      files: [
        {
          attachment: ruta,
          name: archivo.nombre
        }
      ],
      ephemeral: true
    });
  }
});

/* =========================================================
   /filedelete
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("filedelete")
    .setDescription("Elimina uno de tus archivos")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID del archivo")
        .setRequired(true)
    ),

  async execute(interaction) {
    const id =
      interaction.options.getString("id");

    const db = cargarDB();

    const archivos = prepararUsuario(
      db,
      interaction.user.id
    );

    const posicion =
      archivos.findIndex(
        archivo => archivo.id === id
      );

    if (posicion === -1) {
      return interaction.reply({
        content:
          "❌ No encontré ese archivo.",
        ephemeral: true
      });
    }

    const archivo = archivos[posicion];

    const ruta = path.join(
      FILES_DIR,
      interaction.user.id,
      archivo.nombreGuardado
    );

    try {
      if (fs.existsSync(ruta)) {
        fs.unlinkSync(ruta);
      }
    } catch {}

    archivos.splice(posicion, 1);

    guardarDB(db);

    await interaction.reply({
      content:
        `🗑️ Archivo **${archivo.nombre}** eliminado.`,
      ephemeral: true
    });
  }
});

/* =========================================================
   /filelist
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("filelist")
    .setDescription("Lista tus archivos"),

  async execute(interaction) {
    const db = cargarDB();

    const archivos = prepararUsuario(
      db,
      interaction.user.id
    );

    if (!archivos.length) {
      return interaction.reply({
        content:
          "📂 Tu lista de archivos está vacía.",
        ephemeral: true
      });
    }

    const texto = archivos
      .map(
        archivo =>
          `• **${archivo.nombre}** — \`${archivo.id}\``
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("📂 Lista de archivos")
      .setDescription(
        texto.length > 3900
          ? texto.slice(0, 3850) + "\n..."
          : texto
      )
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   /fileinfo
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("fileinfo")
    .setDescription("Muestra información de un archivo")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID del archivo")
        .setRequired(true)
    ),

  async execute(interaction) {
    const id =
      interaction.options.getString("id");

    const db = cargarDB();

    const archivos = prepararUsuario(
      db,
      interaction.user.id
    );

    const archivo =
      archivos.find(item => item.id === id);

    if (!archivo) {
      return interaction.reply({
        content:
          "❌ No encontré ese archivo.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("📄 Información del archivo")
      .addFields(
        {
          name: "📄 Nombre",
          value: archivo.nombre,
          inline: false
        },
        {
          name: "🆔 ID",
          value: `\`${archivo.id}\``,
          inline: false
        },
        {
          name: "💾 Tamaño",
          value: formatoBytes(archivo.tamaño),
          inline: true
        },
        {
          name: "📦 Tipo",
          value: archivo.tipo || "Desconocido",
          inline: true
        },
        {
          name: "📅 Creado",
          value: `<t:${Math.floor(
            archivo.creado / 1000
          )}:F>`,
          inline: false
        }
      )
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   /filedownload
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("filedownload")
    .setDescription("Descarga uno de tus archivos")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID del archivo")
        .setRequired(true)
    ),

  async execute(interaction) {
    const id =
      interaction.options.getString("id");

    const db = cargarDB();

    const archivos = prepararUsuario(
      db,
      interaction.user.id
    );

    const archivo =
      archivos.find(item => item.id === id);

    if (!archivo) {
      return interaction.reply({
        content:
          "❌ No encontré ese archivo.",
        ephemeral: true
      });
    }

    const ruta = path.join(
      FILES_DIR,
      interaction.user.id,
      archivo.nombreGuardado
    );

    if (!fs.existsSync(ruta)) {
      return interaction.reply({
        content:
          "❌ El archivo no está disponible en el almacenamiento.",
        ephemeral: true
      });
    }

    await interaction.reply({
      content: `📥 **${archivo.nombre}**`,
      files: [
        {
          attachment: ruta,
          name: archivo.nombre
        }
      ],
      ephemeral: true
    });
  }
});

/* =========================================================
   /fileclear
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("fileclear")
    .setDescription("Elimina todos tus archivos"),

  async execute(interaction) {
    const db = cargarDB();

    const archivos = prepararUsuario(
      db,
      interaction.user.id
    );

    if (!archivos.length) {
      return interaction.reply({
        content:
          "📂 No tienes archivos para eliminar.",
        ephemeral: true
      });
    }

    const carpetaUsuario = path.join(
      FILES_DIR,
      interaction.user.id
    );

    try {
      if (fs.existsSync(carpetaUsuario)) {
        fs.rmSync(carpetaUsuario, {
          recursive: true,
          force: true
        });
      }
    } catch {}

    const cantidad = archivos.length;

    db.archivos[interaction.user.id] = [];

    guardarDB(db);

    await interaction.reply({
      content:
        `🗑️ Se eliminaron **${cantidad} archivos**.`,
      ephemeral: true
    });
  }
});

/* =========================================================
   /fileowner
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("fileowner")
    .setDescription("Panel privado del propietario para revisar archivos"),

  async execute(interaction) {
    if (!esOwner(interaction)) {
      return interaction.reply({
        content:
          "❌ Este comando es exclusivo del propietario del bot.",
        ephemeral: true
      });
    }

    const db = cargarDB();
    prepararArchivos(db);

    const usuarios =
      Object.entries(db.archivos)
        .filter(([, archivos]) =>
          Array.isArray(archivos) &&
          archivos.length > 0
        );

    if (!usuarios.length) {
      return interaction.reply({
        content:
          "📂 No hay archivos registrados.",
        ephemeral: true
      });
    }

    let texto = "";

    for (const [userId, archivos] of usuarios) {
      const tamaño = archivos.reduce(
        (total, archivo) =>
          total + (archivo.tamaño || 0),
        0
      );

      texto +=
        `👤 <@${userId}>\n` +
        `📁 ${archivos.length} archivos\n` +
        `💾 ${formatoBytes(tamaño)}\n\n`;
    }

    if (texto.length > 3900) {
      texto =
        texto.slice(0, 3850) +
        "\n...";
    }

    const embed = new EmbedBuilder()
      .setTitle("🔐 Panel de archivos — OWNER")
      .setDescription(texto)
      .setColor(0xff0000);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   /filehelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("filehelp")
    .setDescription("Muestra los comandos de archivos"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("📁 Comandos de archivos")
      .setDescription(
        [
          "`/archivos` — Panel de archivos.",
          "`/fileupload` — Subir archivo.",
          "`/files` — Ver archivos.",
          "`/fileget` — Obtener archivo.",
          "`/filelist` — Lista de archivos.",
          "`/fileinfo` — Información.",
          "`/filedownload` — Descargar archivo.",
          "`/filedelete` — Eliminar archivo.",
          "`/fileclear` — Eliminar todos.",
          "`/fileowner` — Panel del propietario.",
          "`/filehelp` — Esta ayuda."
        ].join("\n")
      )
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

/* =========================================================
   EXPORTACIÓN
========================================================= */

module.exports = commands;
