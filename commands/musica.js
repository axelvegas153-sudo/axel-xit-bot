const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

const commands = [];

/* =========================================================
   SISTEMA DE COLAS
========================================================= */

const colas = new Map();

function obtenerCola(guildId) {
  if (!colas.has(guildId)) {
    colas.set(guildId, {
      canciones: [],
      actual: null,
      volumen: 100,
      loop: false,
      conectado: false
    });
  }

  return colas.get(guildId);
}

/* =========================================================
   /play
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Añade una canción a la cola")
    .addStringOption(option =>
      option
        .setName("cancion")
        .setDescription("Nombre o URL de la canción")
        .setRequired(true)
    ),

  async execute(interaction) {
    const cancion =
      interaction.options.getString("cancion");

    const cola = obtenerCola(interaction.guildId);

    cola.canciones.push({
      nombre: cancion,
      usuario: interaction.user.id,
      agregada: Date.now()
    });

    await interaction.reply(
      `🎵 **Añadido a la cola:**\n\`${cancion}\`\n\n` +
      `📋 Posición: **${cola.canciones.length}**\n\n` +
      `⚠️ El reproductor de audio todavía necesita conectarse a una fuente de música.`
    );
  }
});

/* =========================================================
   /pause
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pausa la reproducción"),

  async execute(interaction) {
    const cola = obtenerCola(interaction.guildId);

    if (!cola.actual) {
      return interaction.reply({
        content:
          "❌ No hay ninguna canción reproduciéndose.",
        ephemeral: true
      });
    }

    cola.pausado = true;

    await interaction.reply(
      `⏸️ Reproducción pausada: **${cola.actual.nombre}**`
    );
  }
});

/* =========================================================
   /resume
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Reanuda la reproducción"),

  async execute(interaction) {
    const cola = obtenerCola(interaction.guildId);

    if (!cola.actual) {
      return interaction.reply({
        content:
          "❌ No hay ninguna canción pausada.",
        ephemeral: true
      });
    }

    cola.pausado = false;

    await interaction.reply(
      `▶️ Reproducción reanudada: **${cola.actual.nombre}**`
    );
  }
});

/* =========================================================
   /skip
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Salta la canción actual"),

  async execute(interaction) {
    const cola = obtenerCola(interaction.guildId);

    if (!cola.actual) {
      return interaction.reply({
        content:
          "❌ No hay ninguna canción reproduciéndose.",
        ephemeral: true
      });
    }

    const anterior = cola.actual.nombre;

    cola.actual =
      cola.canciones.shift() || null;

    cola.pausado = false;

    await interaction.reply(
      `⏭️ Canción saltada: **${anterior}**\n` +
      (
        cola.actual
          ? `🎵 Siguiente: **${cola.actual.nombre}**`
          : "📭 La cola está vacía."
      )
    );
  }
});

/* =========================================================
   /stop
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Detiene la música y limpia la cola"),

  async execute(interaction) {
    const cola = obtenerCola(interaction.guildId);

    cola.canciones = [];
    cola.actual = null;
    cola.pausado = false;

    await interaction.reply(
      "⏹️ Música detenida y cola limpiada."
    );
  }
});

/* =========================================================
   /queue
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Muestra la cola de música"),

  async execute(interaction) {
    const cola = obtenerCola(interaction.guildId);

    if (!cola.actual && !cola.canciones.length) {
      return interaction.reply({
        content:
          "📭 La cola está vacía.",
        ephemeral: true
      });
    }

    let texto = "";

    if (cola.actual) {
      texto +=
        `🎵 **Reproduciendo:** ${cola.actual.nombre}\n\n`;
    }

    if (cola.canciones.length) {
      texto += cola.canciones
        .slice(0, 20)
        .map(
          (cancion, index) =>
            `**${index + 1}.** ${cancion.nombre}`
        )
        .join("\n");
    }

    if (texto.length > 3900) {
      texto =
        texto.slice(0, 3850) +
        "\n...";
    }

    const embed = new EmbedBuilder()
      .setTitle("🎵 Cola de música")
      .setDescription(texto)
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /nowplaying
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Muestra la canción actual"),

  async execute(interaction) {
    const cola = obtenerCola(interaction.guildId);

    if (!cola.actual) {
      return interaction.reply({
        content:
          "📭 No hay ninguna canción reproduciéndose.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🎵 Reproduciendo ahora")
      .setDescription(
        `**${cola.actual.nombre}**\n\n` +
        `🔊 Volumen: **${cola.volumen}%**\n` +
        `🔁 Loop: **${cola.loop ? "Activado" : "Desactivado"}**`
      )
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /volume
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Cambia el volumen")
    .addIntegerOption(option =>
      option
        .setName("nivel")
        .setDescription("Volumen de 0 a 100")
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true)
    ),

  async execute(interaction) {
    const nivel =
      interaction.options.getInteger("nivel");

    const cola = obtenerCola(interaction.guildId);

    cola.volumen = nivel;

    await interaction.reply(
      `🔊 Volumen establecido en **${nivel}%**.`
    );
  }
});

/* =========================================================
   /loop
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Activa o desactiva el loop"),

  async execute(interaction) {
    const cola = obtenerCola(interaction.guildId);

    cola.loop = !cola.loop;

    await interaction.reply(
      `🔁 Loop: **${cola.loop ? "Activado 🟢" : "Desactivado 🔴"}**`
    );
  }
});

/* =========================================================
   /shuffle
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Mezcla la cola"),

  async execute(interaction) {
    const cola = obtenerCola(interaction.guildId);

    if (cola.canciones.length < 2) {
      return interaction.reply({
        content:
          "❌ Necesitas al menos 2 canciones en la cola.",
        ephemeral: true
      });
    }

    for (
      let i = cola.canciones.length - 1;
      i > 0;
      i--
    ) {
      const j =
        Math.floor(Math.random() * (i + 1));

      [
        cola.canciones[i],
        cola.canciones[j]
      ] = [
        cola.canciones[j],
        cola.canciones[i]
      ];
    }

    await interaction.reply(
      "🔀 La cola fue mezclada correctamente."
    );
  }
});

/* =========================================================
   /remove
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Elimina una canción de la cola")
    .addIntegerOption(option =>
      option
        .setName("posicion")
        .setDescription("Posición de la canción")
        .setMinValue(1)
        .setRequired(true)
    ),

  async execute(interaction) {
    const posicion =
      interaction.options.getInteger("posicion");

    const cola = obtenerCola(interaction.guildId);

    if (
      posicion > cola.canciones.length
    ) {
      return interaction.reply({
        content:
          "❌ Esa posición no existe.",
        ephemeral: true
      });
    }

    const eliminada =
      cola.canciones.splice(
        posicion - 1,
        1
      )[0];

    await interaction.reply(
      `🗑️ Eliminada de la cola: **${eliminada.nombre}**`
    );
  }
});

/* =========================================================
   /clearqueue
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("clearqueue")
    .setDescription("Limpia toda la cola"),

  async execute(interaction) {
    const cola = obtenerCola(interaction.guildId);

    const cantidad =
      cola.canciones.length;

    cola.canciones = [];

    await interaction.reply(
      `🗑️ Se eliminaron **${cantidad} canciones** de la cola.`
    );
  }
});

/* =========================================================
   /join
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Prepara el bot para entrar al canal de voz"),

  async execute(interaction) {
    const miembro =
      interaction.member;

    const canal =
      miembro?.voice?.channel;

    if (!canal) {
      return interaction.reply({
        content:
          "❌ Primero entra a un canal de voz.",
        ephemeral: true
      });
    }

    if (
      canal.type !== ChannelType.GuildVoice &&
      canal.type !== ChannelType.GuildStageVoice
    ) {
      return interaction.reply({
        content:
          "❌ Ese canal no es un canal de voz válido.",
        ephemeral: true
      });
    }

    const cola = obtenerCola(interaction.guildId);

    cola.conectado = true;
    cola.canalVoz = canal.id;

    await interaction.reply(
      `🔊 Canal de voz seleccionado: **${canal.name}**\n\n` +
      `⚠️ La conexión de audio real se configurará al instalar el reproductor de voz.`
    );
  }
});

/* =========================================================
   /leave
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Saca el bot del canal de voz"),

  async execute(interaction) {
    const cola = obtenerCola(interaction.guildId);

    cola.conectado = false;
    cola.canalVoz = null;
    cola.actual = null;
    cola.canciones = [];

    await interaction.reply(
      "👋 El bot salió del sistema de música y la cola fue limpiada."
    );
  }
});

/* =========================================================
   /musichelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("musichelp")
    .setDescription("Muestra los comandos de música"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🎵 Comandos de música")
      .setDescription(
        [
          "`/play` — Añadir canción.",
          "`/pause` — Pausar.",
          "`/resume` — Reanudar.",
          "`/skip` — Saltar canción.",
          "`/stop` — Detener.",
          "`/queue` — Ver cola.",
          "`/nowplaying` — Canción actual.",
          "`/volume` — Cambiar volumen.",
          "`/loop` — Activar/desactivar loop.",
          "`/shuffle` — Mezclar cola.",
          "`/remove` — Eliminar canción.",
          "`/clearqueue` — Limpiar cola.",
          "`/join` — Entrar/preparar canal.",
          "`/leave` — Salir.",
          "`/musichelp` — Esta ayuda."
        ].join("\n")
      )
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   EXPORTACIÓN
========================================================= */

module.exports = commands;
