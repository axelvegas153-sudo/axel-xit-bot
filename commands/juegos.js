const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const elecciones = ["piedra", "papel", "tijera"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("juegos")
    .setDescription("🎮 Juegos y minijuegos de Axel XIT")

    .addSubcommand(sub =>
      sub
        .setName("ppt")
        .setDescription("Piedra, papel o tijera")
        .addStringOption(option =>
          option
            .setName("eleccion")
            .setDescription("Tu elección")
            .setRequired(true)
            .addChoices(
              { name: "🪨 Piedra", value: "piedra" },
              { name: "📄 Papel", value: "papel" },
              { name: "✂️ Tijera", value: "tijera" }
            )
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("dado")
        .setDescription("Lanza un dado")
        .addIntegerOption(option =>
          option
            .setName("caras")
            .setDescription("Número de caras del dado")
            .setRequired(false)
            .setMinValue(2)
            .setMaxValue(100)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("moneda")
        .setDescription("Lanza una moneda")
    )

    .addSubcommand(sub =>
      sub
        .setName("numero")
        .setDescription("Adivina un número del 1 al 10")
        .addIntegerOption(option =>
          option
            .setName("numero")
            .setDescription("Tu número")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(10)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("dado2")
        .setDescription("Lanza dos dados")
    )

    .addSubcommand(sub =>
      sub
        .setName("azar")
        .setDescription("Obtén un número aleatorio")
        .addIntegerOption(option =>
          option
            .setName("minimo")
            .setDescription("Número mínimo")
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName("maximo")
            .setDescription("Número máximo")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("duelo")
        .setDescription("Simula un duelo entre dos usuarios")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Rival")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("suerte")
        .setDescription("Comprueba tu suerte")
    )

    .addSubcommand(sub =>
      sub
        .setName("pregunta")
        .setDescription("Pregunta aleatoria")
    ),

  async execute(interaction) {
    const juego = interaction.options.getSubcommand();

    /* =========================
       PIEDRA PAPEL TIJERA
    ========================= */

    if (juego === "ppt") {
      const jugador =
        interaction.options.getString("eleccion");

      const bot =
        elecciones[random(0, 2)];

      let resultado;

      if (jugador === bot) {
        resultado = "🤝 ¡Empate!";
      } else if (
        (jugador === "piedra" && bot === "tijera") ||
        (jugador === "papel" && bot === "piedra") ||
        (jugador === "tijera" && bot === "papel")
      ) {
        resultado = "🎉 ¡Ganaste!";
      } else {
        resultado = "😅 ¡Perdiste!";
      }

      const nombres = {
        piedra: "🪨 Piedra",
        papel: "📄 Papel",
        tijera: "✂️ Tijera"
      };

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎮 Piedra, Papel o Tijera")
            .addFields(
              {
                name: "👤 Tu elección",
                value: nombres[jugador],
                inline: true
              },
              {
                name: "🤖 Axel XIT",
                value: nombres[bot],
                inline: true
              },
              {
                name: "🏆 Resultado",
                value: resultado,
                inline: false
              }
            )
            .setColor(0x5865f2)
            .setTimestamp()
        ]
      });
    }

    /* =========================
       DADO
    ========================= */

    if (juego === "dado") {
      const caras =
        interaction.options.getInteger("caras") || 6;

      const resultado =
        random(1, caras);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎲 Dado")
            .setDescription(
              `🎲 **${interaction.user.username}** lanzó un dado de **${caras} caras**.\n\nResultado: **${resultado}**`
            )
            .setColor(0x5865f2)
        ]
      });
    }

    /* =========================
       MONEDA
    ========================= */

    if (juego === "moneda") {
      const resultado =
        Math.random() < 0.5
          ? "🪙 Cara"
          : "🪙 Cruz";

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🪙 Lanzamiento de moneda")
            .setDescription(
              `La moneda cayó en:\n\n# ${resultado}`
            )
            .setColor(0xfee75c)
        ]
      });
    }

    /* =========================
       ADIVINA EL NÚMERO
    ========================= */

    if (juego === "numero") {
      const elegido =
        interaction.options.getInteger("numero");

      const correcto =
        random(1, 10);

      let resultado;

      if (elegido === correcto) {
        resultado =
          "🎉 ¡Correcto! Adivinaste el número.";
      } else {
        resultado =
          `❌ No era ese. El número era **${correcto}**.`;
      }

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🔢 Adivina el número")
            .setDescription(
              `Tu número: **${elegido}**\n\n${resultado}`
            )
            .setColor(
              elegido === correcto
                ? 0x57f287
                : 0xed4245
            )
        ]
      });
    }

    /* =========================
       DOS DADOS
    ========================= */

    if (juego === "dado2") {
      const dado1 = random(1, 6);
      const dado2 = random(1, 6);
      const total = dado1 + dado2;

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎲🎲 Dos dados")
            .addFields(
              {
                name: "Dado 1",
                value: `${dado1}`,
                inline: true
              },
              {
                name: "Dado 2",
                value: `${dado2}`,
                inline: true
              },
              {
                name: "💥 Total",
                value: `**${total}**`,
                inline: true
              }
            )
            .setColor(0x5865f2)
        ]
      });
    }

    /* =========================
       NÚMERO ALEATORIO
    ========================= */

    if (juego === "azar") {
      const minimo =
        interaction.options.getInteger("minimo");

      const maximo =
        interaction.options.getInteger("maximo");

      if (minimo >= maximo) {
        return interaction.reply({
          content:
            "❌ El mínimo debe ser menor que el máximo.",
          ephemeral: true
        });
      }

      const resultado =
        random(minimo, maximo);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎰 Número aleatorio")
            .setDescription(
              `Entre **${minimo}** y **${maximo}** salió:\n\n# ${resultado}`
            )
            .setColor(0x5865f2)
        ]
      });
    }

    /* =========================
       DUELO
    ========================= */

    if (juego === "duelo") {
      const rival =
        interaction.options.getUser("usuario");

      if (rival.id === interaction.user.id) {
        return interaction.reply({
          content:
            "❌ No puedes enfrentarte contigo mismo.",
          ephemeral: true
        });
      }

      if (rival.bot) {
        return interaction.reply({
          content:
            "❌ No puedes desafiar a un bot.",
          ephemeral: true
        });
      }

      const ganador =
        Math.random() < 0.5
          ? interaction.user
          : rival;

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("⚔️ Duelo")
            .setDescription(
              `⚔️ ${interaction.user} **VS** ${rival}\n\n🏆 Ganador: ${ganador}`
            )
            .setColor(0xfee75c)
            .setTimestamp()
        ]
      });
    }

    /* =========================
       SUERTE
    ========================= */

    if (juego === "suerte") {
      const porcentaje =
        random(1, 100);

      let mensaje;

      if (porcentaje >= 90) {
        mensaje = "🍀 ¡Tienes muchísima suerte!";
      } else if (porcentaje >= 70) {
        mensaje = "😎 ¡Buena suerte!";
      } else if (porcentaje >= 40) {
        mensaje = "🙂 Tu suerte está normal.";
      } else {
        mensaje = "😭 Hoy no parece ser tu día.";
      }

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🍀 Tu suerte")
            .setDescription(
              `Tu nivel de suerte es **${porcentaje}%**.\n\n${mensaje}`
            )
            .setColor(0x57f287)
        ]
      });
    }

    /* =========================
       PREGUNTA
    ========================= */

    if (juego === "pregunta") {
      const preguntas = [
        "¿Qué superpoder elegirías si pudieras tener uno?",
        "¿Cuál sería tu videojuego favorito para jugar durante un año?",
        "¿Qué lugar te gustaría visitar?",
        "¿Qué personaje de ficción invitarías a tu servidor?",
        "¿Qué habilidad te gustaría aprender?"
      ];

      const pregunta =
        preguntas[
          random(0, preguntas.length - 1)
        ];

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❓ Pregunta aleatoria")
            .setDescription(
              `**${pregunta}**`
            )
            .setFooter({
              text: "Axel XIT • Juegos"
            })
            .setColor(0x5865f2)
        ]
      });
    }
  }
};
