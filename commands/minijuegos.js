const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const commands = [];

function mezclar(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

/* =========================================================
   /trivia
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("trivia")
    .setDescription("Responde una pregunta de trivia"),

  async execute(interaction) {
    const preguntas = [
      {
        pregunta: "¿Cuál es el planeta más grande del sistema solar?",
        opciones: ["Marte", "Júpiter", "Venus", "Mercurio"],
        correcta: "Júpiter"
      },
      {
        pregunta: "¿Cuántos lados tiene un hexágono?",
        opciones: ["5", "6", "7", "8"],
        correcta: "6"
      },
      {
        pregunta: "¿Cuál es el océano más grande?",
        opciones: ["Atlántico", "Índico", "Pacífico", "Ártico"],
        correcta: "Pacífico"
      },
      {
        pregunta: "¿Qué animal es conocido como el rey de la selva?",
        opciones: ["Tigre", "León", "Oso", "Lobo"],
        correcta: "León"
      }
    ];

    const pregunta =
      preguntas[Math.floor(Math.random() * preguntas.length)];

    await interaction.reply(
      `🧠 **TRIVIA**\n\n` +
      `❓ ${pregunta.pregunta}\n\n` +
      pregunta.opciones.map((x, i) => `${i + 1}. ${x}`).join("\n") +
      `\n\n💡 Responde con el número correcto.\n` +
      `✅ Respuesta: ||${pregunta.correcta}||`
    );
  }
});

/* =========================================================
   /rps
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Juega piedra, papel o tijera")
    .addStringOption(option =>
      option
        .setName("opcion")
        .setDescription("Tu elección")
        .setRequired(true)
        .addChoices(
          { name: "🪨 Piedra", value: "piedra" },
          { name: "📄 Papel", value: "papel" },
          { name: "✂️ Tijera", value: "tijera" }
        )
    ),

  async execute(interaction) {
    const jugador = interaction.options.getString("opcion");

    const opciones = ["piedra", "papel", "tijera"];
    const bot = opciones[Math.floor(Math.random() * opciones.length)];

    let resultado;

    if (jugador === bot) {
      resultado = "🤝 ¡Empate!";
    } else if (
      (jugador === "piedra" && bot === "tijera") ||
      (jugador === "papel" && bot === "piedra") ||
      (jugador === "tijera" && bot === "papel")
    ) {
      resultado = "🏆 ¡Ganaste!";
    } else {
      resultado = "🤖 ¡Ganó DARK FF V1!";
    }

    await interaction.reply(
      `🎮 **Piedra, Papel o Tijera**\n\n` +
      `👤 Tú: **${jugador}**\n` +
      `🤖 Bot: **${bot}**\n\n` +
      `${resultado}`
    );
  }
});

/* =========================================================
   /guess
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("guess")
    .setDescription("Adivina un número del 1 al 10")
    .addIntegerOption(option =>
      option
        .setName("numero")
        .setDescription("Tu número")
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(true)
    ),

  async execute(interaction) {
    const numero = interaction.options.getInteger("numero");
    const correcto = Math.floor(Math.random() * 10) + 1;

    if (numero === correcto) {
      await interaction.reply(
        `🎯 ¡Correcto! El número era **${correcto}**.`
      );
    } else {
      await interaction.reply(
        `❌ No era ese.\n\n` +
        `Tu número: **${numero}**\n` +
        `Número correcto: **${correcto}**`
      );
    }
  }
});

/* =========================================================
   /mathgame
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("mathgame")
    .setDescription("Resuelve una operación matemática"),

  async execute(interaction) {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;

    const operaciones = [
      {
        texto: `${a} + ${b}`,
        respuesta: a + b
      },
      {
        texto: `${a} - ${b}`,
        respuesta: a - b
      },
      {
        texto: `${a} × ${b}`,
        respuesta: a * b
      }
    ];

    const operacion =
      operaciones[Math.floor(Math.random() * operaciones.length)];

    await interaction.reply(
      `🧮 **MATEMÁTICAS**\n\n` +
      `Resuelve:\n\n` +
      `### ${operacion.texto}\n\n` +
      `💡 Respuesta: ||${operacion.respuesta}||`
    );
  }
});

/* =========================================================
   /memory
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("memory")
    .setDescription("Juego rápido de memoria"),

  async execute(interaction) {
    const numeros = Array.from(
      { length: 6 },
      () => Math.floor(Math.random() * 10)
    );

    await interaction.reply(
      `🧠 **MEMORIA**\n\n` +
      `Memoriza estos números:\n\n` +
      `### ${numeros.join(" - ")}\n\n` +
      `⏱️ ¡Tienes unos segundos para recordarlos!`
    );
  }
});

/* =========================================================
   /quiz
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("quiz")
    .setDescription("Realiza un quiz rápido"),

  async execute(interaction) {
    const quizzes = [
      {
        pregunta: "¿Cuánto es 5 × 5?",
        respuesta: "25"
      },
      {
        pregunta: "¿Cuántos días tiene una semana?",
        respuesta: "7"
      },
      {
        pregunta: "¿Cuál es la capital de Colombia?",
        respuesta: "Bogotá"
      },
      {
        pregunta: "¿Cuántos continentes hay generalmente?",
        respuesta: "7"
      }
    ];

    const quiz =
      quizzes[Math.floor(Math.random() * quizzes.length)];

    await interaction.reply(
      `❓ **QUIZ**\n\n` +
      `${quiz.pregunta}\n\n` +
      `💡 Respuesta: ||${quiz.respuesta}||`
    );
  }
});

/* =========================================================
   /wordgame
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("wordgame")
    .setDescription("Descubre la palabra mezclada"),

  async execute(interaction) {
    const palabras = [
      "discord",
      "gaming",
      "minecraft",
      "fortnite",
      "javascript",
      "programacion",
      "dragon",
      "servidor"
    ];

    const palabra =
      palabras[Math.floor(Math.random() * palabras.length)];

    const mezclada = mezclar(palabra.split("")).join("");

    await interaction.reply(
      `🔤 **PALABRA REVUELTA**\n\n` +
      `Ordena:\n\n` +
      `### ${mezclada}\n\n` +
      `💡 Respuesta: ||${palabra}||`
    );
  }
});

/* =========================================================
   /reaction
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("reaction")
    .setDescription("Juego de reacción"),

  async execute(interaction) {
    const emojis = ["⚡", "🔥", "💀", "🎯", "🚀", "👀"];
    const emoji =
      emojis[Math.floor(Math.random() * emojis.length)];

    await interaction.reply(
      `⚡ **JUEGO DE REACCIÓN**\n\n` +
      `Cuando aparezca el emoji, ¡reacciona rápido!\n\n` +
      `### ${emoji}`
    );
  }
});

/* =========================================================
   /speed
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("speed")
    .setDescription("Reto rápido de velocidad"),

  async execute(interaction) {
    const retos = [
      "Escribe rápidamente: DARK FF V1",
      "Escribe rápidamente: FREE FIRE",
      "Escribe rápidamente: DISCORD",
      "Escribe rápidamente: GANADOR",
      "Escribe rápidamente: CRAFTLAND"
    ];

    const reto =
      retos[Math.floor(Math.random() * retos.length)];

    await interaction.reply(
      `⚡ **SPEED TEST**\n\n${reto}`
    );
  }
});

/* =========================================================
   /higherlower
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("higherlower")
    .setDescription("Adivina si el siguiente número será mayor o menor"),

  async execute(interaction) {
    const actual = Math.floor(Math.random() * 100) + 1;
    const siguiente = Math.floor(Math.random() * 100) + 1;

    let resultado;

    if (siguiente > actual) {
      resultado = "📈 El siguiente número fue MAYOR.";
    } else if (siguiente < actual) {
      resultado = "📉 El siguiente número fue MENOR.";
    } else {
      resultado = "🤝 Salieron iguales.";
    }

    await interaction.reply(
      `🎲 **HIGHER OR LOWER**\n\n` +
      `Número actual: **${actual}**\n` +
      `Siguiente número: **${siguiente}**\n\n` +
      resultado
    );
  }
});

/* =========================================================
   /blackjack
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("blackjack")
    .setDescription("Juega una ronda rápida de blackjack"),

  async execute(interaction) {
    const carta = () => Math.floor(Math.random() * 10) + 1;

    const jugador1 = carta();
    const jugador2 = carta();
    const bot1 = carta();
    const bot2 = carta();

    const jugador = jugador1 + jugador2;
    const bot = bot1 + bot2;

    let resultado;

    if (jugador > 21) {
      resultado = "💀 Te pasaste de 21.";
    } else if (bot > 21) {
      resultado = "🏆 ¡El bot se pasó de 21!";
    } else if (jugador > bot) {
      resultado = "🏆 ¡Ganaste!";
    } else if (jugador < bot) {
      resultado = "🤖 Ganó el bot.";
    } else {
      resultado = "🤝 Empate.";
    }

    await interaction.reply(
      `🃏 **BLACKJACK**\n\n` +
      `👤 Tus cartas: **${jugador1} + ${jugador2} = ${jugador}**\n` +
      `🤖 Cartas del bot: **${bot1} + ${bot2} = ${bot}**\n\n` +
      resultado
    );
  }
});

/* =========================================================
   /minigame
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("minigame")
    .setDescription("Elige un minijuego aleatorio"),

  async execute(interaction) {
    const juegos = [
      "🧠 Trivia",
      "🎲 Adivina el número",
      "✂️ Piedra, papel o tijera",
      "🧮 Matemáticas",
      "🔤 Palabra revuelta",
      "🃏 Blackjack",
      "⚡ Speed Test"
    ];

    const juego =
      juegos[Math.floor(Math.random() * juegos.length)];

    await interaction.reply(
      `🎮 **MINIJUEGO ALEATORIO**\n\n` +
      `Te tocó: **${juego}**`
    );
  }
});

/* =========================================================
   /minigames
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("minigames")
    .setDescription("Muestra todos los minijuegos"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🎮 Minijuegos — DARK FF V1")
      .setDescription(
        "Lista de juegos disponibles."
      )
      .addFields(
        {
          name: "🧠 Juegos",
          value:
            "`/trivia`\n" +
            "`/rps`\n" +
            "`/guess`\n" +
            "`/mathgame`\n" +
            "`/memory`\n" +
            "`/quiz`\n" +
            "`/wordgame`"
        },
        {
          name: "⚡ Retos",
          value:
            "`/reaction`\n" +
            "`/speed`\n" +
            "`/higherlower`"
        },
        {
          name: "🃏 Otros",
          value:
            "`/blackjack`\n" +
            "`/minigame`\n" +
            "`/minigames`\n" +
            "`/minigamehelp`"
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
   /minigamehelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("minigamehelp")
    .setDescription("Muestra la ayuda de minijuegos"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x00ccff)
      .setTitle("📚 Ayuda — Minijuegos")
      .setDescription(
        "Usa estos comandos para jugar dentro de DARK FF V1."
      )
      .addFields(
        {
          name: "🧠 Preguntas",
          value:
            "`/trivia`\n" +
            "`/quiz`\n" +
            "`/mathgame`"
        },
        {
          name: "🎲 Juegos",
          value:
            "`/rps`\n" +
            "`/guess`\n" +
            "`/memory`\n" +
            "`/wordgame`\n" +
            "`/blackjack`"
        },
        {
          name: "⚡ Retos",
          value:
            "`/reaction`\n" +
            "`/speed`\n" +
            "`/higherlower`"
        },
        {
          name: "🎮 General",
          value:
            "`/minigame`\n" +
            "`/minigames`\n" +
            "`/minigamehelp`"
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
