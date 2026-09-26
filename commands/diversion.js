const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const cooldowns = new Map();

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function porcentaje() {
  return Math.floor(Math.random() * 101);
}

function obtenerCooldown(id, segundos = 5) {
  const ahora = Date.now();
  const ultimo = cooldowns.get(id) || 0;

  if (ahora - ultimo < segundos * 1000) {
    return Math.ceil((segundos * 1000 - (ahora - ultimo)) / 1000);
  }

  cooldowns.set(id, ahora);
  return 0;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("diversion")
    .setDescription("Comandos para divertirte")

    .addSubcommand(sub =>
      sub
        .setName("8ball")
        .setDescription("Hazle una pregunta a la bola mágica")
        .addStringOption(option =>
          option
            .setName("pregunta")
            .setDescription("Tu pregunta")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("ship")
        .setDescription("Calcula la compatibilidad entre dos usuarios")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario a comparar")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("gay")
        .setDescription("Calcula un porcentaje divertido")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario")
            .setRequired(false)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("poder")
        .setDescription("Calcula tu nivel de poder")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario")
            .setRequired(false)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("simpatia")
        .setDescription("Calcula tu nivel de simpatía")
        .addUserOption(option =>
          option
            .setName("usuario")
            .setDescription("Usuario")
            .setRequired(false)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("suerte")
        .setDescription("Calcula tu suerte")
    )

    .addSubcommand(sub =>
      sub
        .setName("insulto")
        .setDescription("Genera un insulto completamente de broma")
    )

    .addSubcommand(sub =>
      sub
        .setName("meme")
        .setDescription("Genera una frase meme")
    )

    .addSubcommand(sub =>
      sub
        .setName("verdad")
        .setDescription("Pregunta de verdad")
    )

    .addSubcommand(sub =>
      sub
        .setName("reto")
        .setDescription("Te da un reto divertido")
    )

    .addSubcommand(sub =>
      sub
        .setName("decidir")
        .setDescription("Decide entre dos opciones")
        .addStringOption(option =>
          option
            .setName("opcion1")
            .setDescription("Primera opción")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("opcion2")
            .setDescription("Segunda opción")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("random")
        .setDescription("Genera un número aleatorio")
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
        .setName("emoji")
        .setDescription("Genera un emoji aleatorio")
    )

    .addSubcommand(sub =>
      sub
        .setName("color")
        .setDescription("Genera un color aleatorio")
    )

    .addSubcommand(sub =>
      sub
        .setName("eleccion")
        .setDescription("El bot toma una decisión")
        .addStringOption(option =>
          option
            .setName("opciones")
            .setDescription("Opciones separadas por comas")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    const cooldown = obtenerCooldown(
      `${interaction.guildId}-${interaction.user.id}`
    );

    if (cooldown > 0) {
      return interaction.reply({
        content: `⏳ Espera **${cooldown}s** antes de usar otro comando de diversión.`,
        ephemeral: true
      });
    }

    if (sub === "8ball") {
      const pregunta = interaction.options.getString("pregunta");

      const respuestas = [
        "🎱 Sí, definitivamente.",
        "🎱 No lo creo.",
        "🎱 Puede ser.",
        "🎱 Las probabilidades son altas.",
        "🎱 Las probabilidades son bajas.",
        "🎱 Pregunta más tarde.",
        "🎱 Todo apunta a que sí.",
        "🎱 Todo apunta a que no.",
        "🎱 No puedo saberlo.",
        "🎱 El destino decidirá."
      ];

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎱 Bola mágica")
            .addFields(
              {
                name: "Pregunta",
                value: pregunta
              },
              {
                name: "Respuesta",
                value: random(respuestas)
              }
            )
            .setColor("Random")
        ]
      });
    }

    if (sub === "ship") {
      const usuario = interaction.options.getUser("usuario");
      const porcentajeShip = porcentaje();

      let mensaje;

      if (porcentajeShip < 20) {
        mensaje = "💀 Compatibilidad muy baja.";
      } else if (porcentajeShip < 40) {
        mensaje = "😅 Hay que trabajar en eso.";
      } else if (porcentajeShip < 60) {
        mensaje = "🙂 Puede funcionar.";
      } else if (porcentajeShip < 80) {
        mensaje = "💖 Buena compatibilidad.";
      } else {
        mensaje = "💘 ¡Compatibilidad altísima!";
      }

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("💘 Compatibilidad")
            .setDescription(
              `${interaction.user} + ${usuario}\n\n**${porcentajeShip}%**\n\n${mensaje}`
            )
            .setColor("Random")
        ]
      });
    }

    if (sub === "gay") {
      const usuario =
        interaction.options.getUser("usuario") || interaction.user;

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🌈 Medidor de broma")
            .setDescription(
              `${usuario} tiene un **${porcentaje()}%** en este medidor de diversión 😂`
            )
            .setFooter({
              text: "Solo es una broma aleatoria."
            })
            .setColor("Random")
        ]
      });
    }

    if (sub === "poder") {
      const usuario =
        interaction.options.getUser("usuario") || interaction.user;

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("⚡ Nivel de poder")
            .setDescription(
              `${usuario} tiene **${porcentaje()}%** de poder.`
            )
            .setColor("Random")
        ]
      });
    }

    if (sub === "simpatia") {
      const usuario =
        interaction.options.getUser("usuario") || interaction.user;

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("😊 Medidor de simpatía")
            .setDescription(
              `${usuario} tiene **${porcentaje()}%** de simpatía.`
            )
            .setColor("Random")
        ]
      });
    }

    if (sub === "suerte") {
      const suerte = porcentaje();

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🍀 Tu suerte")
            .setDescription(
              `Hoy tienes un **${suerte}%** de suerte.`
            )
            .setColor("Random")
        ]
      });
    }

    if (sub === "insulto") {
      const insultos = [
        "😂 Tu WiFi tiene más inteligencia que tú.",
        "🤣 Hasta el bot sabe que hoy no es tu día.",
        "💀 Tu suerte pidió vacaciones.",
        "😂 Tu estrategia necesita una actualización.",
        "🤣 Tu cerebro está cargando... 1%.",
        "💀 Ni el tutorial pudo ayudarte."
      ];

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("😂 Insulto de broma")
            .setDescription(random(insultos))
            .setColor("Random")
        ]
      });
    }

    if (sub === "meme") {
      const memes = [
        "💀 Cuando dices 'una partida más' y ya son las 3 AM.",
        "😂 Yo: hoy sí me voy a dormir temprano. También yo:",
        "🤣 Cuando el plan era sencillo y todo sale mal.",
        "💀 El problema no soy yo, es el lag.",
        "😂 Cuando dices que sabes y terminas buscando tutorial."
      ];

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("😂 Generador de memes")
            .setDescription(random(memes))
            .setColor("Random")
        ]
      });
    }

    if (sub === "verdad") {
      const preguntas = [
        "¿Cuál es la cosa más rara que has hecho por diversión?",
        "¿Qué juego podrías jugar durante horas?",
        "¿Cuál es tu mayor habilidad inútil?",
        "¿Qué cosa te da más vergüenza admitir?",
        "¿Cuál fue tu peor fail jugando?",
        "¿Qué aplicación usas demasiado?"
      ];

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🗣️ Verdad")
            .setDescription(random(preguntas))
            .setColor("Random")
        ]
      });
    }

    if (sub === "reto") {
      const retos = [
        "🎮 Juega una partida usando una estrategia diferente.",
        "😂 Envía un meme al chat.",
        "🗣️ Escribe una frase usando solo emojis.",
        "🎲 Deja que alguien elija tu próximo juego.",
        "🤣 Cuenta tu peor fail.",
        "⭐ Consigue que alguien reaccione a tu mensaje."
      ];

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🔥 Reto")
            .setDescription(random(retos))
            .setColor("Random")
        ]
      });
    }

    if (sub === "decidir") {
      const opcion1 = interaction.options.getString("opcion1");
      const opcion2 = interaction.options.getString("opcion2");

      const resultado = Math.random() < 0.5 ? opcion1 : opcion2;

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🤔 Decisión")
            .setDescription(`Mi decisión es:\n\n🎯 **${resultado}**`)
            .setColor("Random")
        ]
      });
    }

    if (sub === "random") {
      const minimo = interaction.options.getInteger("minimo");
      const maximo = interaction.options.getInteger("maximo");

      if (minimo >= maximo) {
        return interaction.reply({
          content: "❌ El mínimo debe ser menor que el máximo.",
          ephemeral: true
        });
      }

      const numero =
        Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎲 Número aleatorio")
            .setDescription(`Resultado: **${numero}**`)
            .setColor("Random")
        ]
      });
    }

    if (sub === "emoji") {
      const emojis = [
        "😀", "😂", "🤣", "😎", "🤔",
        "😈", "👀", "🔥", "💀", "⭐",
        "🎮", "🎯", "🚀", "🍀", "🗿"
      ];

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎲 Emoji aleatorio")
            .setDescription(`Tu emoji es: ${random(emojis)}`)
            .setColor("Random")
        ]
      });
    }

    if (sub === "color") {
      const letras = "0123456789ABCDEF";
      let color = "#";

      for (let i = 0; i < 6; i++) {
        color += letras[Math.floor(Math.random() * 16)];
      }

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎨 Color aleatorio")
            .setDescription(`Tu color es **${color}**`)
            .setColor(color)
        ]
      });
    }

    if (sub === "eleccion") {
      const opcionesTexto =
        interaction.options.getString("opciones");

      const opciones = opcionesTexto
        .split(",")
        .map(x => x.trim())
        .filter(Boolean);

      if (opciones.length < 2) {
        return interaction.reply({
          content:
            "❌ Debes escribir al menos 2 opciones separadas por comas.",
          ephemeral: true
        });
      }

      const resultado = random(opciones);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎯 Elección aleatoria")
            .setDescription(`Elegí:\n\n**${resultado}**`)
            .setColor("Random")
        ]
      });
    }
  }
};
