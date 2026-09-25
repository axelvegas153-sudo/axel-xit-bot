const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = [

  {
    data: new SlashCommandBuilder()
      .setName("8ball")
      .setDescription("Haz una pregunta y recibe una respuesta")
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
        "🎱 Las probabilidades son altas.",
        "🎱 Pregúntame después.",
        "🎱 Todo apunta a que sí.",
        "🎱 Mejor no.",
        "🎱 Es posible."
      ];

      const respuesta =
        respuestas[Math.floor(Math.random() * respuestas.length)];

      const pregunta =
        interaction.options.getString("pregunta");

      const embed = new EmbedBuilder()
        .setColor(0x8B5CF6)
        .setTitle("🎱 8 Ball")
        .addFields(
          {
            name: "❓ Pregunta",
            value: pregunta
          },
          {
            name: "🔮 Respuesta",
            value: respuesta
          }
        )
        .setFooter({
          text: "DARK FF V1 • Diversión"
        });

      await interaction.reply({
        embeds: [embed]
      });
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("joke")
      .setDescription("Cuenta un chiste"),

    async execute(interaction) {
      const chistes = [
        "😂 ¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
        "😂 ¿Cuál es el colmo de un jardinero? Que siempre lo dejen plantado.",
        "😂 ¿Qué le dijo un techo a otro? Techo de menos.",
        "😂 ¿Qué hace una computadora cuando tiene frío? Cierra Windows.",
        "😂 ¿Por qué el libro de matemáticas estaba triste? Porque tenía demasiados problemas."
      ];

      const chiste =
        chistes[Math.floor(Math.random() * chistes.length)];

      await interaction.reply(chiste);
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("meme")
      .setDescription("Muestra un meme aleatorio"),

    async execute(interaction) {
      const memes = [
        "https://i.imgur.com/8Km9tLL.jpeg",
        "https://i.imgur.com/5cX1YqR.jpeg",
        "https://i.imgur.com/3Q6N9Qe.jpeg"
      ];

      const meme =
        memes[Math.floor(Math.random() * memes.length)];

      const embed = new EmbedBuilder()
        .setColor(0xFACC15)
        .setTitle("😂 Meme")
        .setImage(meme)
        .setFooter({
          text: "DARK FF V1"
        });

      await interaction.reply({
        embeds: [embed]
      });
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("compliment")
      .setDescription("Recibe un cumplido"),

    async execute(interaction) {
      const cumplidos = [
        "⭐ Eres una máquina.",
        "🔥 Tienes muy buena energía.",
        "💎 Eres una persona increíble.",
        "🚀 Vas con todo.",
        "👑 Hoy estás imparable."
      ];

      await interaction.reply(
        cumplidos[Math.floor(Math.random() * cumplidos.length)]
      );
    }
  },

  {
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

      if (min > max) {
        return interaction.reply({
          content: "❌ El mínimo no puede ser mayor que el máximo.",
          ephemeral: true
        });
      }

      const resultado =
        Math.floor(Math.random() * (max - min + 1)) + min;

      await interaction.reply(
        `🎲 Número aleatorio: **${resultado}**`
      );
    }
  },

  {
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
      const algo =
        interaction.options.getString("algo");

      const nota =
        Math.floor(Math.random() * 101);

      await interaction.reply(
        `⭐ **${algo}** tiene una calificación de **${nota}/100**.`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("choose")
      .setDescription("Elige aleatoriamente entre dos opciones")
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
      ),

    async execute(interaction) {
      const opcion1 =
        interaction.options.getString("opcion1");

      const opcion2 =
        interaction.options.getString("opcion2");

      const elegida =
        Math.random() < 0.5
          ? opcion1
          : opcion2;

      await interaction.reply(
        `🎯 Elijo: **${elegida}**`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("flip")
      .setDescription("Lanza una moneda"),

    async execute(interaction) {
      const resultado =
        Math.random() < 0.5
          ? "🪙 Cara"
          : "🪙 Cruz";

      await interaction.reply(
        `🪙 Resultado: **${resultado}**`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("dice")
      .setDescription("Lanza un dado"),

    async execute(interaction) {
      const resultado =
        Math.floor(Math.random() * 6) + 1;

      await interaction.reply(
        `🎲 Salió el número **${resultado}**.`
      );
    }
  },

  {
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
      const usuario1 =
        interaction.options.getUser("usuario1");

      const usuario2 =
        interaction.options.getUser("usuario2");

      const porcentaje =
        Math.floor(Math.random() * 101);

      await interaction.reply(
        `💫 Compatibilidad entre **${usuario1.username}** y **${usuario2.username}**: **${porcentaje}%**`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("say")
      .setDescription("Hace que el bot repita un mensaje")
      .addStringOption(option =>
        option
          .setName("mensaje")
          .setDescription("Mensaje que quieres enviar")
          .setRequired(true)
      ),

    async execute(interaction) {
      const mensaje =
        interaction.options.getString("mensaje");

      await interaction.reply({
        content: mensaje
      });
    }
  }

];
