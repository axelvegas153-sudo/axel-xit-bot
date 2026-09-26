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
  entersState
} = require("@discordjs/voice");

const play = require("play-dl");

/* =========================
   COLAS DE MÚSICA
========================= */

const colas = new Map();

/* =========================
   OBTENER SERVIDOR
========================= */

function obtenerServidor(guildId) {
  if (!colas.has(guildId)) {
    colas.set(guildId, {
      canciones: [],
      indice: 0,
      player: createAudioPlayer(),
      connection: null,
      volumen: 100,
      reproduciendo: false
    });
  }

  return colas.get(guildId);
}

/* =========================
   CONECTAR AL CANAL
========================= */

async function conectar(interaction) {
  const canal = interaction.member.voice.channel;

  if (!canal) {
    throw new Error(
      "Debes estar conectado a un canal de voz."
    );
  }

  const servidor = obtenerServidor(
    interaction.guild.id
  );

  if (
    servidor.connection &&
    servidor.connection.state.status !==
      VoiceConnectionStatus.Destroyed
  ) {
    return servidor;
  }

  const connection = joinVoiceChannel({
    channelId: canal.id,
    guildId: interaction.guild.id,
    adapterCreator:
      interaction.guild.voiceAdapterCreator,
    selfDeaf: true
  });

  servidor.connection = connection;

  connection.subscribe(servidor.player);

  await entersState(
    connection,
    VoiceConnectionStatus.Ready,
    15_000
  );

  return servidor;
}

/* =========================
   REPRODUCIR CANCIÓN
========================= */

async function reproducir(interaction, servidor) {
  if (
    servidor.canciones.length === 0 ||
    servidor.indice >= servidor.canciones.length
  ) {
    servidor.reproduciendo = false;
    return;
  }

  const cancion =
    servidor.canciones[servidor.indice];

  try {
    const stream =
      await play.stream(cancion.url, {
        quality: 2,
        discordPlayerCompatibility: true
      });

    const recurso = createAudioResource(
      stream.stream,
      {
        inputType: stream.type,
        inlineVolume: true
      }
    );

    if (recurso.volume) {
      recurso.volume.setVolume(
        servidor.volumen / 100
      );
    }

    servidor.player.play(recurso);
    servidor.reproduciendo = true;

    servidor.player.once(
      AudioPlayerStatus.Idle,
      async () => {
        servidor.indice++;

        if (
          servidor.indice <
          servidor.canciones.length
        ) {
          await reproducir(
            interaction,
            servidor
          );
        } else {
          servidor.reproduciendo = false;
        }
      }
    );
  } catch (error) {
    console.error(
      "Error reproduciendo música:",
      error
    );

    servidor.indice++;

    if (
      servidor.indice <
      servidor.canciones.length
    ) {
      return reproducir(
        interaction,
        servidor
      );
    }

    servidor.reproduciendo = false;
  }
}

/* =========================
   COMANDO
========================= */

module.exports = {
  data: new SlashCommandBuilder()
    .setName("musica")
    .setDescription(
      "🎵 Sistema de música de Axel XIT"
    )

    /* REPRODUCIR */
    .addSubcommand(sub =>
      sub
        .setName("reproducir")
        .setDescription(
          "Reproduce una canción o añade una a la cola"
        )
        .addStringOption(option =>
          option
            .setName("cancion")
            .setDescription(
              "Nombre o URL de la canción"
            )
            .setRequired(true)
        )
    )

    /* PAUSAR */
    .addSubcommand(sub =>
      sub
        .setName("pausa")
        .setDescription(
          "Pausa la música"
        )
    )

    /* REANUDAR */
    .addSubcommand(sub =>
      sub
        .setName("reanudar")
        .setDescription(
          "Reanuda la música"
        )
    )

    /* SALTAR */
    .addSubcommand(sub =>
      sub
        .setName("saltar")
        .setDescription(
          "Salta la canción actual"
        )
    )

    /* DETENER */
    .addSubcommand(sub =>
      sub
        .setName("detener")
        .setDescription(
          "Detiene la música y limpia la cola"
        )
    )

    /* COLA */
    .addSubcommand(sub =>
      sub
        .setName("cola")
        .setDescription(
          "Muestra la cola de canciones"
        )
    )

    /* VOLUMEN */
    .addSubcommand(sub =>
      sub
        .setName("volumen")
        .setDescription(
          "Cambia el volumen"
        )
        .addIntegerOption(option =>
          option
            .setName("cantidad")
            .setDescription(
              "Volumen del 1 al 100"
            )
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
        )
    )

    /* ACTUAL */
    .addSubcommand(sub =>
      sub
        .setName("actual")
        .setDescription(
          "Muestra la canción actual"
        )
    ),

  async execute(interaction) {
    const sub =
      interaction.options.getSubcommand();

    const servidor =
      obtenerServidor(
        interaction.guild.id
      );

    /* =========================
       REPRODUCIR
    ========================= */

    if (sub === "reproducir") {
      const busqueda =
        interaction.options.getString(
          "cancion"
        );

      if (
        !interaction.member.voice.channel
      ) {
        return interaction.reply({
          content:
            "❌ Primero entra a un canal de voz.",
          ephemeral: true
        });
      }

      await interaction.deferReply();

      try {
        await conectar(interaction);

        let resultados;

        if (
          play.yt_validate(busqueda) ===
          "video"
        ) {
          const info =
            await play.video_basic_info(
              busqueda
            );

          resultados = [
            {
              title:
                info.video_details.title,
              url:
                info.video_details.url,
              duration:
                info.video_details.durationRaw,
              thumbnail:
                info.video_details.thumbnails?.[0]
                  ?.url || null
            }
          ];
        } else {
          const encontrados =
            await play.search(busqueda, {
              limit: 1,
              source: {
                youtube: "video"
              }
            });

          if (
            !encontrados ||
            encontrados.length === 0
          ) {
            return interaction.editReply(
              "❌ No encontré esa canción."
            );
          }

          resultados = [
            {
              title:
                encontrados[0].title,
              url:
                encontrados[0].url,
              duration:
                encontrados[0].durationRaw,
              thumbnail:
                encontrados[0].thumbnails?.[0]
                  ?.url || null
            }
          ];
        }

        const cancion = resultados[0];

        servidor.canciones.push(
          cancion
        );

        const posicion =
          servidor.canciones.length;

        if (!servidor.reproduciendo) {
          servidor.indice =
            servidor.canciones.length - 1;

          await reproducir(
            interaction,
            servidor
          );
        }

        const embed =
          new EmbedBuilder()
            .setTitle("🎵 Música")
            .setDescription(
              `**${cancion.title}**`
            )
            .addFields(
              {
                name: "📍 Posición",
                value:
                  `#${posicion}`,
                inline: true
              },
              {
                name: "⏱️ Duración",
                value:
                  cancion.duration ||
                  "Desconocida",
                inline: true
              }
            )
            .setColor(0x5865f2)
            .setTimestamp();

        if (cancion.thumbnail) {
          embed.setThumbnail(
            cancion.thumbnail
          );
        }

        return interaction.editReply({
          embeds: [embed]
        });
      } catch (error) {
        console.error(
          "Error en /musica reproducir:",
          error
        );

        return interaction.editReply(
          "❌ No pude reproducir esa canción. Revisa que las dependencias de música estén instaladas."
        );
      }
    }

    /* =========================
       PAUSA
    ========================= */

    if (sub === "pausa") {
      const pausado =
        servidor.player.pause();

      if (!pausado) {
        return interaction.reply({
          content:
            "❌ No hay música reproduciéndose.",
          ephemeral: true
        });
      }

      return interaction.reply({
        content:
          "⏸️ Música pausada."
      });
    }

    /* =========================
       REANUDAR
    ========================= */

    if (sub === "reanudar") {
      const reanudado =
        servidor.player.unpause();

      if (!reanudado) {
        return interaction.reply({
          content:
            "❌ No hay música pausada.",
          ephemeral: true
        });
      }

      return interaction.reply({
        content:
          "▶️ Música reanudada."
      });
    }

    /* =========================
       SALTAR
    ========================= */

    if (sub === "saltar") {
      if (
        !servidor.reproduciendo
      ) {
        return interaction.reply({
          content:
            "❌ No hay ninguna canción reproduciéndose.",
          ephemeral: true
        });
      }

      servidor.player.stop();

      return interaction.reply({
        content:
          "⏭️ Canción saltada."
      });
    }

    /* =========================
       DETENER
    ========================= */

    if (sub === "detener") {
      servidor.canciones = [];
      servidor.indice = 0;
      servidor.reproduciendo =
        false;

      servidor.player.stop();

      if (servidor.connection) {
        servidor.connection.destroy();
        servidor.connection = null;
      }

      return interaction.reply({
        content:
          "⏹️ Música detenida y cola limpiada."
      });
    }

    /* =========================
       COLA
    ========================= */

    if (sub === "cola") {
      if (
        servidor.canciones.length === 0
      ) {
        return interaction.reply({
          content:
            "📭 La cola está vacía."
        });
      }

      const lista =
        servidor.canciones
          .slice(
            servidor.indice,
            servidor.indice + 10
          )
          .map(
            (cancion, index) =>
              `**${index + 1}.** ${cancion.title}`
          );

      const embed =
        new EmbedBuilder()
          .setTitle("🎵 Cola de música")
          .setDescription(
            lista.join("\n")
          )
          .setFooter({
            text:
              `${servidor.canciones.length} canción(es) en cola`
          })
          .setColor(0x5865f2);

      return interaction.reply({
        embeds: [embed]
      });
    }

    /* =========================
       VOLUMEN
    ========================= */

    if (sub === "volumen") {
      const cantidad =
        interaction.options.getInteger(
          "cantidad"
        );

      servidor.volumen =
        cantidad;

      return interaction.reply({
        content:
          `🔊 Volumen establecido en **${cantidad}%**.`
      });
    }

    /* =========================
       ACTUAL
    ========================= */

    if (sub === "actual") {
      if (
        servidor.canciones.length === 0 ||
        !servidor.reproduciendo
      ) {
        return interaction.reply({
          content:
            "🎵 No hay ninguna canción reproduciéndose.",
          ephemeral: true
        });
      }

      const actual =
        servidor.canciones[
          servidor.indice
        ];

      const embed =
        new EmbedBuilder()
          .setTitle("🎵 Reproduciendo ahora")
          .setDescription(
            `**${actual.title}**`
          )
          .addFields({
            name: "⏱️ Duración",
            value:
              actual.duration ||
              "Desconocida"
          })
          .setColor(0x5865f2);

      if (actual.thumbnail) {
        embed.setThumbnail(
          actual.thumbnail
        );
      }

      return interaction.reply({
        embeds: [embed]
      });
    }
  }
};
