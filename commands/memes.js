const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const commands = [];

/* =========================================================
   /meme
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Crea un meme con texto")
    .addStringOption(option =>
      option
        .setName("arriba")
        .setDescription("Texto de la parte superior")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("abajo")
        .setDescription("Texto de la parte inferior")
        .setRequired(true)
    ),

  async execute(interaction) {
    const arriba = interaction.options.getString("arriba");
    const abajo = interaction.options.getString("abajo");

    const embed = new EmbedBuilder()
      .setColor(0xffcc00)
      .setTitle("😂 MEME")
      .addFields(
        {
          name: "⬆️ Arriba",
          value: arriba
        },
        {
          name: "⬇️ Abajo",
          value: abajo
        }
      )
      .setFooter({
        text: `Creado por ${interaction.user.username}`
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /memerandom
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("memerandom")
    .setDescription("Genera un meme aleatorio"),

  async execute(interaction) {
    const memes = [
      {
        titulo: "💀 Cuando dices una partida más...",
        texto: "3 horas después sigues jugando."
      },
      {
        titulo: "😂 Cuando el ping llega a 999...",
        texto: "El personaje se mueve solo."
      },
      {
        titulo: "🔥 Cuando ganas con 1 HP...",
        texto: "GG EZ 😎"
      },
      {
        titulo: "🤣 Cuando dices que vas a dormir temprano...",
        texto: "Terminas viendo videos hasta las 3 AM."
      },
      {
        titulo: "💀 Cuando el profe dice 'es fácil'...",
        texto: "Procede a explicar algo imposible."
      },
      {
        titulo: "😂 Cuando entras a un servidor nuevo...",
        texto: "¿Dónde están los comandos?"
      },
      {
        titulo: "🔥 Cuando tu squad revive...",
        texto: "Y vuelven a morir en 10 segundos."
      },
      {
        titulo: "💀 Cuando te queda 1% de batería...",
        texto: "Y empieza la partida más importante."
      }
    ];

    const meme =
      memes[Math.floor(Math.random() * memes.length)];

    const embed = new EmbedBuilder()
      .setColor(0xff4444)
      .setTitle(meme.titulo)
      .setDescription(meme.texto)
      .setFooter({
        text: "DARK FF V1 • Meme aleatorio"
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /memes
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("memes")
    .setDescription("Muestra varios memes"),

  async execute(interaction) {
    const memes = [
      "😂 Una partida más = 5 horas.",
      "💀 Mi ping decidió jugar por mí.",
      "🔥 Cuando haces clutch con 1 HP.",
      "🤣 El squad: 'sígueme'. También el squad: muere.",
      "👀 Cuando el admin entra al servidor.",
      "💀 Cuando borras algo y era importante.",
      "😂 Cuando intentas explicar el bug.",
      "🔥 Cuando por fin ganas después de 20 partidas."
    ];

    const seleccionados = memes
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    const embed = new EmbedBuilder()
      .setColor(0xff9900)
      .setTitle("😂 MEMES")
      .setDescription(
        seleccionados
          .map((meme, index) => `**${index + 1}.** ${meme}`)
          .join("\n\n")
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
   /memecreate
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("memecreate")
    .setDescription("Crea un meme personalizado")
    .addStringOption(option =>
      option
        .setName("titulo")
        .setDescription("Título del meme")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("texto")
        .setDescription("Texto del meme")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("emoji")
        .setDescription("Emoji para el meme")
        .setRequired(false)
    ),

  async execute(interaction) {
    const titulo = interaction.options.getString("titulo");
    const texto = interaction.options.getString("texto");
    const emoji =
      interaction.options.getString("emoji") || "😂";

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`${emoji} ${titulo}`)
      .setDescription(texto)
      .setFooter({
        text: `Meme creado por ${interaction.user.username}`
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /memedelete
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("memedelete")
    .setDescription("Elimina un mensaje de meme reciente")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageMessages
    )
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de mensajes a eliminar")
        .setMinValue(1)
        .setMaxValue(20)
        .setRequired(true)
    ),

  async execute(interaction) {
    const cantidad =
      interaction.options.getInteger("cantidad");

    const mensajes =
      await interaction.channel.messages.fetch({
        limit: cantidad + 1
      });

    const eliminables = mensajes
      .filter(message => message.id !== interaction.id)
      .first(cantidad);

    if (!eliminables.length) {
      return interaction.reply({
        content: "❌ No encontré mensajes para eliminar.",
        ephemeral: true
      });
    }

    await interaction.channel.bulkDelete(
      eliminables,
      true
    );

    await interaction.reply({
      content: `🗑️ Eliminé **${eliminables.length}** mensajes.`,
      ephemeral: true
    });
  }
});

/* =========================================================
   /memehelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("memehelp")
    .setDescription("Muestra la ayuda de memes"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xffcc00)
      .setTitle("📚 Ayuda — Memes")
      .setDescription(
        "Comandos de memes disponibles en DARK FF V1."
      )
      .addFields(
        {
          name: "😂 Memes",
          value:
            "`/meme` — Crear un meme\n" +
            "`/memerandom` — Meme aleatorio\n" +
            "`/memes` — Mostrar varios memes\n" +
            "`/memecreate` — Crear meme personalizado"
        },
        {
          name: "🛠️ Moderación",
          value:
            "`/memedelete` — Eliminar mensajes"
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
