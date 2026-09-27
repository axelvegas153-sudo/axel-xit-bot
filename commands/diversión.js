const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const commands = [];

/* =========================================================
   /8ball
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Hazle una pregunta a la bola mágica")
    .addStringOption(option =>
      option
        .setName("pregunta")
        .setDescription("Tu pregunta")
        .setRequired(true)
    ),

  async execute(interaction) {
    const respuestas = [
      "🎱 Sí, definitivamente.",
      "🎱 No lo creo.",
      "🎱 Puede ser.",
      "🎱 Las posibilidades son altas.",
      "🎱 Definitivamente no.",
      "🎱 Pregunta de nuevo más tarde.",
      "🎱 Todo apunta a que sí.",
      "🎱 No estoy seguro.",
      "🎱 Los astros dicen que sí.",
      "🎱 Mejor no arriesgarse."
    ];

    const respuesta =
      respuestas[Math.floor(Math.random() * respuestas.length)];

    await interaction.reply(
      `🎱 **Pregunta:** ${interaction.options.getString("pregunta")}\n\n**Respuesta:** ${respuesta}`
    );
  }
});

/* =========================================================
   /coin
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("coin")
    .setDescription("Lanza una moneda"),

  async execute(interaction) {
    const resultado = Math.random() < 0.5 ? "🪙 Cara" : "🪙 Cruz";

    await interaction.reply(`La moneda cayó en **${resultado}**.`);
  }
});

/* =========================================================
   /dice
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("dice")
    .setDescription("Lanza un dado")
    .addIntegerOption(option =>
      option
        .setName("caras")
        .setDescription("Cantidad de caras del dado")
        .setMinValue(2)
        .setMaxValue(100)
        .setRequired(false)
    ),

  async execute(interaction) {
    const caras = interaction.options.getInteger("caras") || 6;
    const resultado = Math.floor(Math.random() * caras) + 1;

    await interaction.reply(
      `🎲 Tiraste un dado de **${caras} caras**.\n\nResultado: **${resultado}**`
    );
  }
});

/* =========================================================
   /randomsay
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("randomsay")
    .setDescription("Envía un mensaje aleatorio")
    .addStringOption(option =>
      option
        .setName("texto")
        .setDescription("Texto base")
        .setRequired(true)
    ),

  async execute(interaction) {
    const texto = interaction.options.getString("texto");

    const extras = [
      "🔥",
      "😂",
      "💀",
      "👀",
      "🤣",
      "😈",
      "⚡",
      "🚀"
    ];

    const extra = extras[Math.floor(Math.random() * extras.length)];

    await interaction.reply(`${texto} ${extra}`);
  }
});

/* =========================================================
   /ship
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("ship")
    .setDescription("Calcula una compatibilidad divertida")
    .addUserOption(option =>
      option
        .setName("usuario1")
        .setDescription("Primer usuario")
        .setRequired(true)
    )
    .addUserOption(option =>
      option
        .setName("usuario2")
        .setDescription("Segundo usuario")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario1 = interaction.options.getUser("usuario1");
    const usuario2 = interaction.options.getUser("usuario2");

    const porcentaje = Math.floor(Math.random() * 101);

    await interaction.reply(
      `💘 **Compatibilidad**\n\n` +
      `${usuario1} ❤️ ${usuario2}\n\n` +
      `💞 Compatibilidad: **${porcentaje}%**`
    );
  }
});

/* =========================================================
   /rate
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rate")
    .setDescription("Califica algo del 1 al 100")
    .addStringOption(option =>
      option
        .setName("algo")
        .setDescription("Qué quieres calificar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const algo = interaction.options.getString("algo");
    const porcentaje = Math.floor(Math.random() * 101);

    await interaction.reply(
      `⭐ Yo le doy a **${algo}** un **${porcentaje}/100**.`
    );
  }
});

/* =========================================================
   /choose
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("choose")
    .setDescription("Elige una opción aleatoria")
    .addStringOption(option =>
      option
        .setName("opciones")
        .setDescription("Separa las opciones con comas")
        .setRequired(true)
    ),

  async execute(interaction) {
    const texto = interaction.options.getString("opciones");

    const opciones = texto
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);

    if (opciones.length < 2) {
      return interaction.reply(
        "❌ Debes poner al menos 2 opciones separadas por comas."
      );
    }

    const elegida =
      opciones[Math.floor(Math.random() * opciones.length)];

    await interaction.reply(
      `🎯 Opciones: ${opciones.join(" | ")}\n\n` +
      `👉 Elegí: **${elegida}**`
    );
  }
});

/* =========================================================
   /hug
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Da un abrazo virtual")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario al que abrazar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    await interaction.reply(
      `🤗 ${interaction.user} le dio un abrazo a ${usuario}.`
    );
  }
});

/* =========================================================
   /pat
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("pat")
    .setDescription("Da unas palmaditas")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    await interaction.reply(
      `🥹 ${interaction.user} le dio palmaditas a ${usuario}.`
    );
  }
});

/* =========================================================
   /slap
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("slap")
    .setDescription("Broma: da una bofetada virtual")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    await interaction.reply(
      `👋 ${interaction.user} le dio una bofetada virtual a ${usuario}.`
    );
  }
});

/* =========================================================
   /punch
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("punch")
    .setDescription("Broma: golpe virtual")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    await interaction.reply(
      `🥊 ${interaction.user} lanzó un golpe virtual contra ${usuario}.`
    );
  }
});

/* =========================================================
   /highfive
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("highfive")
    .setDescription("Choca los cinco")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    await interaction.reply(
      `🙌 ${interaction.user} chocó los cinco con ${usuario}.`
    );
  }
});

/* =========================================================
   /dance
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("dance")
    .setDescription("Baila"),

  async execute(interaction) {
    const bailes = [
      "🕺💃 ¡A bailar!",
      "💃🔥 Se prendió la pista.",
      "🕺🎶 Bailando como nunca.",
      "💃✨ Movimiento legendario.",
      "🕺😂 Nadie baila mejor."
    ];

    await interaction.reply(
      bailes[Math.floor(Math.random() * bailes.length)]
    );
  }
});

/* =========================================================
   /joke
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("joke")
    .setDescription("Cuenta un chiste"),

  async execute(interaction) {
    const chistes = [
      "😂 ¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
      "🤣 ¿Qué le dijo un techo a otro? Techo de menos.",
      "😂 ¿Cuál es el colmo de un electricista? No encontrar su corriente de trabajo.",
      "🤣 ¿Qué hace una computadora cuando tiene frío? Cierra Windows.",
      "😂 ¿Por qué el libro de matemáticas estaba triste? Porque tenía demasiados problemas."
    ];

    await interaction.reply(
      chistes[Math.floor(Math.random() * chistes.length)]
    );
  }
});

/* =========================================================
   /fact
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("fact")
    .setDescription("Muestra un dato curioso"),

  async execute(interaction) {
    const datos = [
      "🧠 Los pulpos tienen tres corazones.",
      "🌍 Un día en Venus dura más que un año en Venus.",
      "🦈 Los tiburones existen desde antes que los árboles.",
      "🐝 Las abejas pueden reconocer rostros.",
      "🌌 La luz del Sol tarda aproximadamente 8 minutos en llegar a la Tierra.",
      "🐙 Los pulpos pueden cambiar de color para comunicarse.",
      "🦒 Las jirafas tienen el mismo número de vértebras cervicales que los humanos."
    ];

    await interaction.reply(
      datos[Math.floor(Math.random() * datos.length)]
    );
  }
});

/* =========================================================
   /roast
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("roast")
    .setDescription("Broma ligera sobre un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    const frases = [
      "🔥 Tu WiFi tiene más personalidad que tú.",
      "😂 Hasta el bot tiene más suerte.",
      "💀 Ese fue un roast de cortesía.",
      "🤣 Tu ping tiene mejores reflejos que tú.",
      "🔥 Ni Google sabe cómo ayudarte.",
      "😂 Tu teclado pidió vacaciones."
    ];

    const frase = frases[Math.floor(Math.random() * frases.length)];

    await interaction.reply(
      `${usuario}\n${frase}`
    );
  }
});

/* =========================================================
   /gif
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("gif")
    .setDescription("Envía un GIF mediante una URL")
    .addStringOption(option =>
      option
        .setName("url")
        .setDescription("URL directa del GIF")
        .setRequired(true)
    ),

  async execute(interaction) {
    const url = interaction.options.getString("url");

    if (!/^https?:\/\/.+/i.test(url)) {
      return interaction.reply(
        "❌ Esa no parece ser una URL válida."
      );
    }

    const embed = new EmbedBuilder()
      .setTitle("🎬 GIF")
      .setImage(url)
      .setFooter({
        text: `Enviado por ${interaction.user.username}`
      });

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /poke
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("poke")
    .setDescription("Molesta amistosamente a alguien")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    await interaction.reply(
      `👉 ${interaction.user} le dio un toque a ${usuario}.`
    );
  }
});

/* =========================================================
   /love
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("love")
    .setDescription("Calcula un porcentaje de amor")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const porcentaje = Math.floor(Math.random() * 101);

    await interaction.reply(
      `❤️ **Medidor de amor**\n\n` +
      `${interaction.user} ❤️ ${usuario}\n\n` +
      `💘 Resultado: **${porcentaje}%**`
    );
  }
});

/* =========================================================
   /luck
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("luck")
    .setDescription("Comprueba tu suerte"),

  async execute(interaction) {
    const porcentaje = Math.floor(Math.random() * 101);

    let resultado;

    if (porcentaje >= 80) {
      resultado = "🍀 ¡Tienes muchísima suerte!";
    } else if (porcentaje >= 50) {
      resultado = "🙂 Tienes una suerte normal.";
    } else if (porcentaje >= 25) {
      resultado = "😬 Hoy no estás teniendo tanta suerte.";
    } else {
      resultado = "💀 Mejor inténtalo otro día.";
    }

    await interaction.reply(
      `🍀 Tu suerte de hoy: **${porcentaje}%**\n${resultado}`
    );
  }
});

/* =========================================================
   /random
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("random")
    .setDescription("Genera un número aleatorio")
    .addIntegerOption(option =>
      option
        .setName("min")
        .setDescription("Número mínimo")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("max")
        .setDescription("Número máximo")
        .setRequired(true)
    ),

  async execute(interaction) {
    const min = interaction.options.getInteger("min");
    const max = interaction.options.getInteger("max");

    if (min >= max) {
      return interaction.reply(
        "❌ El mínimo debe ser menor que el máximo."
      );
    }

    const resultado =
      Math.floor(Math.random() * (max - min + 1)) + min;

    await interaction.reply(
      `🎲 Número aleatorio entre **${min}** y **${max}**: **${resultado}**`
    );
  }
});

/* =========================================================
   /funny
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("funny")
    .setDescription("Muestra una frase divertida"),

  async execute(interaction) {
    const frases = [
      "😂 Hoy no se trabaja, hoy se sobrevive.",
      "💀 Mi PC corre... pero hacia el técnico.",
      "🤣 Mi internet tiene más lag que mi vida.",
      "🔥 Entré a jugar una partida y terminé jugando cinco horas.",
      "😂 Yo: una partida más. También yo: 4 horas después."
    ];

    await interaction.reply(
      frases[Math.floor(Math.random() * frases.length)]
    );
  }
});

/* =========================================================
   /diversionhelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("diversionhelp")
    .setDescription("Muestra los comandos de diversión"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xff66cc)
      .setTitle("🎉 Diversión — DARK FF V1")
      .setDescription(
        "Comandos disponibles en la categoría de diversión."
      )
      .addFields(
        {
          name: "🎲 Aleatorio",
          value:
            "`/8ball`\n" +
            "`/coin`\n" +
            "`/dice`\n" +
            "`/choose`\n" +
            "`/random`\n" +
            "`/luck`"
        },
        {
          name: "❤️ Social",
          value:
            "`/ship`\n" +
            "`/love`\n" +
            "`/hug`\n" +
            "`/pat`\n" +
            "`/slap`\n" +
            "`/punch`\n" +
            "`/highfive`\n" +
            "`/poke`"
        },
        {
          name: "😂 Entretenimiento",
          value:
            "`/rate`\n" +
            "`/dance`\n" +
            "`/joke`\n" +
            "`/fact`\n" +
            "`/roast`\n" +
            "`/gif`\n" +
            "`/funny`\n" +
            "`/randomsay`"
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
