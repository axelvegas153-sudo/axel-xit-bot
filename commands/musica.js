const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  NoSubscriberBehavior,
  StreamType
} = require("@discordjs/voice");

const prism = require("prism-media");
const ffmpegPath = require("ffmpeg-static");

const { Readable } = require("stream");

const comandos = [];

/* =========================================================
   SISTEMA DE MÚSICA
========================================================= */

const servidores = new Map();

/*
Estructura:

servidores.set(guildId, {
  connection,
  player,
  queue,
  current,
  volume,
  loop,
  voiceChannelId
});
*/

function obtenerServidor(guildId) {
  if (!servidores.has(guildId)) {
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play
      }
    });

    const data = {
      connection: null,
      player,
      queue: [],
      current: null,
      volume: 100,
      loop: false,
      voiceChannelId: null
    };

    /*
     * Cuando termina una canción,
     * reproduce la siguiente.
     */

    player.on(
      AudioPlayerStatus.Idle,
      () => {
        reproducirSiguiente(guildId).catch(
          console.error
        );
      }
    );

    /*
     * Errores del reproductor
     */

    player.on(
      "error",
      error => {
        console.error(
          `[MÚSICA] Error de audio en ${guildId}:`,
          error
        );

        reproducirSiguiente(guildId).catch(
          console.error
        );
      }
    );

    servidores.set(guildId, data);
  }

  return servidores.get(guildId);
}

/* =========================================================
   CONECTAR A VOZ
========================================================= */

async function conectarVoz(interaction) {
  if (!interaction.guild) {
    throw new Error(
      "Este comando solo funciona en un servidor."
    );
  }

  const member = interaction.member;

  const canalVoz =
    member?.voice?.channel;

  if (!canalVoz) {
    throw new Error(
      "Debes estar en un canal de voz."
    );
  }

  const guildId =
    interaction.guild.id;

  const data =
    obtenerServidor(guildId);

  /*
   * Si ya estamos conectados al mismo canal,
   * reutilizamos la conexión.
   */

  if (
    data.connection &&
    data.voiceChannelId === canalVoz.id
  ) {
    return data;
  }

  /*
   * Si estaba conectado a otro canal,
   * destruye la conexión anterior.
   */

  if (data.connection) {
    try {
      data.connection.destroy();
    } catch {}
  }

  const connection =
    joinVoiceChannel({
      channelId: canalVoz.id,
      guildId: interaction.guild.id,
      adapterCreator:
        interaction.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false
    });

  data.connection = connection;
  data.voiceChannelId = canalVoz.id;

  connection.subscribe(
    data.player
  );

  /*
   * Intentar recuperar conexión.
   */

  connection.on(
    VoiceConnectionStatus.Disconnected,
    async () => {
      try {
        await Promise.race([
          new Promise(resolve =>
            setTimeout(resolve, 5000)
          ),
          new Promise((resolve, reject) => {
            connection.once(
              VoiceConnectionStatus.Ready,
              resolve
            );

            connection.once(
              VoiceConnectionStatus.Destroyed,
              reject
            );
          })
        ]);
      } catch {
        connection.destroy();
      }
    }
  );

  return data;
}

/* =========================================================
   VALIDAR URL
========================================================= */

function validarUrl(input) {
  try {
    const url = new URL(input);

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/* =========================================================
   CREAR STREAM DE AUDIO
========================================================= */

async function crearStream(url) {
  const response =
    await fetch(url, {
      headers: {
        "User-Agent":
          "DARK-FF-V1-Music-Bot/1.0"
      },
      redirect: "follow"
    });

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}`
    );
  }

  if (!response.body) {
    throw new Error(
      "La página no devolvió audio."
    );
  }

  /*
   * Convertir Web ReadableStream
   * a Node Readable.
   */

  const nodeStream =
    Readable.fromWeb(
      response.body
    );

  /*
   * FFmpeg convierte el audio a
   * PCM estéreo compatible con Discord.
   */

  const ffmpeg =
    new prism.FFmpeg({
      args: [
        "-analyzeduration",
        "0",
        "-loglevel",
        "0",
        "-f",
        "s16le",
        "-ar",
        "48000",
        "-ac",
        "2"
      ],
      shell: ffmpegPath
    });

  const stream =
    nodeStream.pipe(ffmpeg);

  return stream;
}

/* =========================================================
   REPRODUCIR CANCIÓN
========================================================= */

async function reproducir(guildId, item) {
  const data =
    obtenerServidor(guildId);

  if (!data.connection) {
    throw new Error(
      "El bot no está conectado a voz."
    );
  }

  const stream =
    await crearStream(item.url);

  const resource =
    createAudioResource(
      stream,
      {
        inputType:
          StreamType.Raw,
        inlineVolume: true
      }
    );

  resource.volume?.setVolume(
    Math.max(
      0,
      Math.min(
        1,
        data.volume / 100
      )
    )
  );

  data.current = {
    ...item,
    resource,
    startedAt: Date.now()
  };

  data.player.play(
    resource
  );
}

/* =========================================================
   SIGUIENTE CANCIÓN
========================================================= */

async function reproducirSiguiente(guildId) {
  const data =
    servidores.get(guildId);

  if (!data) return;

  /*
   * Si loop está activado,
   * repetimos la canción actual.
   */

  if (
    data.loop &&
    data.current
  ) {
    try {
      await reproducir(
        guildId,
        {
          name:
            data.current.name,
          url:
            data.current.url,
          requestedBy:
            data.current.requestedBy
        }
      );

      return;
    } catch (error) {
      console.error(
        "[MÚSICA] Error en loop:",
        error
      );
    }
  }

  if (!data.queue.length) {
    data.current = null;
    return;
  }

  const siguiente =
    data.queue.shift();

  try {
    await reproducir(
      guildId,
      siguiente
    );
  } catch (error) {
    console.error(
      "[MÚSICA] Error reproduciendo:",
      error
    );

    /*
     * Intentar automáticamente
     * con la siguiente canción.
     */

    setTimeout(() => {
      reproducirSiguiente(
        guildId
      ).catch(console.error);
    }, 1000);
  }
}

/* =========================================================
   /play
========================================================= */

comandos.push({
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription(
      "Reproduce una URL directa de audio"
    )
    .addStringOption(option =>
      option
        .setName("url")
        .setDescription(
          "URL directa de audio o stream"
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    const url =
      interaction.options.getString(
        "url"
      );

    if (!validarUrl(url)) {
      return interaction.reply({
        content:
          "❌ Introduce una URL HTTP o HTTPS válida.",
        ephemeral: true
      });
    }

    await interaction.deferReply();

    try {
      const data =
        await conectarVoz(
          interaction
        );

      const item = {
        name:
          url.length > 80
            ? `${url.slice(0, 77)}...`
            : url,
        url,
        requestedBy:
          interaction.user.id
      };

      /*
       * Si no hay nada reproduciéndose,
       * empieza inmediatamente.
       */

      if (
        !data.current &&
        data.player.state.status ===
          AudioPlayerStatus.Idle
      ) {
        await reproducir(
          interaction.guild.id,
          item
        );

        return interaction.editReply(
          `▶️ Reproduciendo:\n${url}`
        );
      }

      /*
       * Si ya hay música,
       * entra en la cola.
       */

      data.queue.push(item);

      await interaction.editReply(
        `✅ Añadido a la cola en la posición **${data.queue.length}**.\n${url}`
      );
    } catch (error) {
      console.error(
        "[PLAY]",
        error
      );

      await interaction.editReply(
        `❌ No pude reproducir ese audio.\n\n**Motivo:** ${error.message}`
      );
    }
  }
});

/* =========================================================
   /pause
========================================================= */

comandos.push({
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription(
      "Pausa la música"
    ),

  async execute(interaction) {
    const data =
      servidores.get(
        interaction.guild.id
      );

    if (!data) {
      return interaction.reply(
        "❌ No hay música activa."
      );
    }

    const pausado =
      data.player.pause();

    if (!pausado) {
      return interaction.reply(
        "❌ No hay una canción reproduciéndose."
      );
    }

    await interaction.reply(
      "⏸️ Música pausada."
    );
  }
});

/* =========================================================
   /resume
========================================================= */

comandos.push({
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription(
      "Continúa la música"
    ),

  async execute(interaction) {
    const data =
      servidores.get(
        interaction.guild.id
      );

    if (!data) {
      return interaction.reply(
        "❌ No hay música pausada."
      );
    }

    const reanudado =
      data.player.unpause();

    if (!reanudado) {
      return interaction.reply(
        "❌ No hay una canción pausada."
      );
    }

    await interaction.reply(
      "▶️ Música reanudada."
    );
  }
});

/* =========================================================
   /skip
========================================================= */

comandos.push({
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription(
      "Salta la canción actual"
    ),

  async execute(interaction) {
    const data =
      servidores.get(
        interaction.guild.id
      );

    if (!data?.current) {
      return interaction.reply(
        "❌ No hay ninguna canción reproduciéndose."
      );
    }

    data.player.stop(
      true
    );

    await interaction.reply(
      "⏭️ Canción saltada."
    );
  }
});

/* =========================================================
   /stop
========================================================= */

comandos.push({
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription(
      "Detiene la música y limpia la cola"
    ),

  async execute(interaction) {
    const data =
      servidores.get(
        interaction.guild.id
      );

    if (!data) {
      return interaction.reply(
        "❌ No hay música activa."
      );
    }

    data.queue = [];
    data.current = null;
    data.loop = false;

    data.player.stop(
      true
    );

    await interaction.reply(
      "⏹️ Música detenida y cola limpiada."
    );
  }
});

/* =========================================================
   /queue
========================================================= */

comandos.push({
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription(
      "Muestra la cola de música"
    ),

  async execute(interaction) {
    const data =
      servidores.get(
        interaction.guild.id
      );

    if (!data) {
      return interaction.reply(
        "❌ La cola está vacía."
      );
    }

    const lista = [];

    if (data.current) {
      lista.push(
        `▶️ **Ahora:** ${data.current.name}`
      );
    }

    if (data.queue.length) {
      data.queue
        .slice(0, 15)
        .forEach(
          (item, index) => {
            lista.push(
              `**${index + 1}.** ${item.name}`
            );
          }
        );
    }

    if (!lista.length) {
      return interaction.reply(
        "📭 La cola está vacía."
      );
    }

    const embed =
      new EmbedBuilder()
        .setTitle(
          "🎵 Cola de DARK FF V1"
        )
        .setDescription(
          lista.join("\n")
        )
        .setColor("Blue");

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /nowplaying
========================================================= */

comandos.push({
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription(
      "Muestra la canción actual"
    ),

  async execute(interaction) {
    const data =
      servidores.get(
        interaction.guild.id
      );

    if (!data?.current) {
      return interaction.reply(
        "❌ No hay música reproduciéndose."
      );
    }

    const embed =
      new EmbedBuilder()
        .setTitle(
          "🎵 Reproduciendo ahora"
        )
        .setDescription(
          `[Abrir audio](${data.current.url})`
        )
        .addFields({
          name: "🔊 Volumen",
          value: `${data.volume}%`,
          inline: true
        })
        .setColor("Blue");

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /volume
========================================================= */

comandos.push({
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription(
      "Cambia el volumen"
    )
    .addIntegerOption(option =>
      option
        .setName("nivel")
        .setDescription(
          "Volumen entre 0 y 100"
        )
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true)
    ),

  async execute(interaction) {
    const nivel =
      interaction.options.getInteger(
        "nivel"
      );

    const data =
      servidores.get(
        interaction.guild.id
      );

    if (!data) {
      return interaction.reply(
        "❌ No hay música activa."
      );
    }

    data.volume = nivel;

    const resource =
      data.current?.resource;

    if (resource?.volume) {
      resource.volume.setVolume(
        nivel / 100
      );
    }

    await interaction.reply(
      `🔊 Volumen establecido en **${nivel}%**.`
    );
  }
});

/* =========================================================
   /loop
========================================================= */

comandos.push({
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription(
      "Activa o desactiva el loop"
    ),

  async execute(interaction) {
    const data =
      servidores.get(
        interaction.guild.id
      );

    if (!data) {
      return interaction.reply(
        "❌ No hay música activa."
      );
    }

    data.loop =
      !data.loop;

    await interaction.reply(
      data.loop
        ? "🔁 Loop activado."
        : "➡️ Loop desactivado."
    );
  }
});

/* =========================================================
   /shuffle
========================================================= */

comandos.push({
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription(
      "Mezcla la cola"
    ),

  async execute(interaction) {
    const data =
      servidores.get(
        interaction.guild.id
      );

    if (
      !data ||
      data.queue.length < 2
    ) {
      return interaction.reply(
        "❌ Necesitas al menos 2 canciones en la cola."
      );
    }

    for (
      let i = data.queue.length - 1;
      i > 0;
      i--
    ) {
      const j =
        Math.floor(
          Math.random() * (i + 1)
        );

      [
        data.queue[i],
        data.queue[j]
      ] = [
        data.queue[j],
        data.queue[i]
      ];
    }

    await interaction.reply(
      "🔀 Cola mezclada."
    );
  }
});

/* =========================================================
   /remove
========================================================= */

comandos.push({
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription(
      "Elimina una canción de la cola"
    )
    .addIntegerOption(option =>
      option
        .setName("posicion")
        .setDescription(
          "Posición de la canción"
        )
        .setMinValue(1)
        .setRequired(true)
    ),

  async execute(interaction) {
    const posicion =
      interaction.options.getInteger(
        "posicion"
      );

    const data =
      servidores.get(
        interaction.guild.id
      );

    if (!data) {
      return interaction.reply(
        "❌ La cola está vacía."
      );
    }

    const indice =
      posicion - 1;

    if (
      indice < 0 ||
      indice >= data.queue.length
    ) {
      return interaction.reply(
        "❌ Esa posición no existe."
      );
    }

    const eliminado =
      data.queue.splice(
        indice,
        1
      )[0];

    await interaction.reply(
      `🗑️ Eliminado de la cola:\n${eliminado.name}`
    );
  }
});

/* =========================================================
   /clearqueue
========================================================= */

comandos.push({
  data: new SlashCommandBuilder()
    .setName("clearqueue")
    .setDescription(
      "Limpia la cola"
    ),

  async execute(interaction) {
    const data =
      servidores.get(
        interaction.guild.id
      );

    if (!data) {
      return interaction.reply(
        "❌ La cola ya está vacía."
      );
    }

    data.queue = [];

    await interaction.reply(
      "🧹 Cola limpiada."
    );
  }
});

/* =========================================================
   /join
========================================================= */

comandos.push({
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription(
      "Hace que el bot entre a tu canal de voz"
    ),

  async execute(interaction) {
    try {
      await conectarVoz(
        interaction
      );

      await interaction.reply(
        "🔊 Entré a tu canal de voz."
      );
    } catch (error) {
      await interaction.reply(
        `❌ ${error.message}`
      );
    }
  }
});

/* =========================================================
   /leave
========================================================= */

comandos.push({
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription(
      "Saca al bot del canal de voz"
    ),

  async execute(interaction) {
    const data =
      servidores.get(
        interaction.guild.id
      );

    if (!data?.connection) {
      return interaction.reply(
        "❌ No estoy en ningún canal de voz."
      );
    }

    data.player.stop(
      true
    );

    data.queue = [];
    data.current = null;

    data.connection.destroy();

    data.connection = null;
    data.voiceChannelId = null;

    await interaction.reply(
      "👋 Salí del canal de voz."
    );
  }
});

/* /musichelp */

comandos.push({
  data: new SlashCommandBuilder()
    .setName("musichelp")
    .setDescription(
      "Muestra los comandos de música"
    ),

  async execute(interaction) {
    const embed =
      new EmbedBuilder()
        .setTitle(
          "🎵 DARK FF V1 — Música"
        )
        .setDescription(
          [
            "`/play` — Reproducir una URL directa",
            "`/pause` — Pausar",
            "`/resume` — Reanudar",
            "`/skip` — Siguiente",
            "`/stop` — Detener",
            "`/queue` — Ver cola",
            "`/nowplaying` — Ver actual",
            "`/volume` — Cambiar volumen",
            "`/loop` — Activar/desactivar loop",
            "`/shuffle` — Mezclar cola",
            "`/remove` — Quitar canción",
            "`/clearqueue` — Limpiar cola",
            "`/join` — Entrar al canal",
            "`/leave` — Salir del canal"
          ].join("\n")
        )
        .setColor("Blue")
        .setFooter({
          text: "DARK FF V1 • Música"
        });

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* Exportar comandos */

module.exports = comandos;
