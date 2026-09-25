const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = [

  {
    category: "diversion",
    data: new SlashCommandBuilder()
      .setName("8ball")
      .setDescription("Hazle una pregunta a la bola mágica")
      .addStringOption(o =>
        o.setName("pregunta")
          .setDescription("Tu pregunta")
          .setRequired(true)
      ),

    async execute(interaction) {
      const respuestas = [
        "🎱 Sí.",
        "🎱 No.",
        "🎱 Probablemente.",
        "🎱 No estoy seguro.",
        "🎱 Definitivamente.",
        "🎱 Pregunta más tarde.",
        "🎱 Las probabilidades son buenas.",
        "🎱 Mejor no."
      ];

      const respuesta =
        respuestas[Math.floor(Math.random() * respuestas.length)];

      await interaction.reply(
        `❓ **${interaction.options.getString("pregunta")}**\n\n${respuesta}`
      );
    }
  },

  {
    category: "diversion",
    data: new SlashCommandBuilder()
      .setName("joke")
      .setDescription("Cuenta un chiste"),

    async execute(interaction) {
      const chistes = [
        "😂 ¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
        "😂 ¿Cuál es el colmo de un electricista? No encontrar su corriente.",
        "😂 ¿Qué le dijo un techo a otro? Techo de menos.",
        "😂 ¿Qué hace una computadora cuando tiene frío? Cierra Windows."
      ];

      await interaction.reply(
        chistes[Math.floor(Math.random() * chistes.length)]
      );
    }
  },

  {
    category: "diversion",
    data: new SlashCommandBuilder()
      .setName("meme")
      .setDescription("Genera una frase meme"),

    async execute(interaction) {
      const memes = [
        "💀 Cuando dices una partida más y terminas jugando 3 horas.",
        "😂 Yo: hoy sí me duermo temprano. También yo: una partida más.",
        "🤣 Cuando el enemigo tiene 1 HP y se escapa.",
        "💀 Cuando entras a una partida y tu equipo se desconecta."
      ];

      await interaction.reply(
        memes[Math.floor(Math.random() * memes.length)]
      );
    }
  },

  {
    category: "diversion",
    data: new SlashCommandBuilder()
      .setName("roast")
      .setDescription("Genera un roast divertido")
      .addUserOption(o =>
        o.setName("usuario")
          .setDescription("Usuario")
          .setRequired(true)
      ),

    async execute(interaction) {
      const usuario = interaction.options.getUser("usuario");

      const frases = [
        "😂 Hasta el bot juega mejor.",
        "💀 Tu WiFi tiene más estabilidad que tú.",
        "🤣 Eso fue tan malo que hasta Discord se sorprendió.",
        "😂 Necesitas practicar un poquito más."
      ];

      await interaction.reply(
        `${usuario} ${frases[Math.floor(Math.random() * frases.length)]}`
      );
    }
  },

  {
    category: "diversion",
    data: new SlashCommandBuilder()
      .setName("compliment")
      .setDescription("Envía un cumplido divertido")
      .addUserOption(o =>
        o.setName("usuario")
          .setDescription("Usuario")
          .setRequired(true)
      ),

    async execute(interaction) {
      const usuario = interaction.options.getUser("usuario");

      await interaction.reply(
        `✨ ${usuario} es oficialmente una leyenda de DARK FF V1.`
      );
    }
  },

  {
    category: "diversion",
    data: new SlashCommandBuilder()
      .setName("random")
      .setDescription("Genera un número aleatorio")
      .addIntegerOption(o =>
        o.setName("min")
          .setDescription("Número mínimo")
          .setRequired(true)
      )
      .addIntegerOption(o =>
        o.setName("max")
          .setDescription("Número máximo")
          .setRequired(true)
      ),

    async execute(interaction) {
      const min = interaction.options.getInteger("min");
      const max = interaction.options.getInteger("max");

      if (max < min) {
        return interaction.reply({
          content: "❌ El máximo debe ser mayor o igual al mínimo.",
          ephemeral: true
        });
      }

      const numero =
        Math.floor(Math.random() * (max - min + 1)) + min;

      await interaction.reply(
        `🎲 Número aleatorio: **${numero}**`
      );
    }
  },

  {
    category: "diversion",
    data: new SlashCommandBuilder()
      .setName("rate")
      .setDescription("Califica algo aleatoriamente")
      .addStringOption(o =>
        o.setName("texto")
          .setDescription("Qué quieres calificar")
          .setRequired(true)
      ),

    async execute(interaction) {
      const porcentaje =
        Math.floor(Math.random() * 101);

      await interaction.reply(
        `⭐ **${interaction.options.getString("texto")}**\n` +
        `Calificación: **${porcentaje}/100**`
      );
    }
  },

  {
    category: "diversion",
    data: new SlashCommandBuilder()
      .setName("choose")
      .setDescription("Elige entre dos opciones")
      .addStringOption(o =>
        o.setName("opcion1")
          .setDescription("Primera opción")
          .setRequired(true)
      )
      .addStringOption(o =>
        o.setName("opcion2")
          .setDescription("Segunda opción")
          .setRequired(true)
      ),

    async execute(interaction) {
      const a = interaction.options.getString("opcion1");
      const b = interaction.options.getString("opcion2");

      const elegido =
        Math.random() < 0.5 ? a : b;

      await interaction.reply(
        `🎯 Elegí: **${elegido}**`
      );
    }
  },

  {
    category: "diversion",
    data: new SlashCommandBuilder()
      .setName("flip")
      .setDescription("Voltea una frase")
      .addStringOption(o =>
        o.setName("texto")
          .setDescription("Texto")
          .setRequired(true)
      ),

    async execute(interaction) {
      const texto =
        interaction.options.getString("texto");

      await interaction.reply(
        `🔄 ${texto.split("").reverse().join("")}`
      );
    }
  }

];
