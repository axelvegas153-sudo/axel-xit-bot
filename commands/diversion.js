const { SlashCommandBuilder } = require("discord.js");

module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName("8ball")
      .setDescription("Haz una pregunta a la bola mágica")
      .addStringOption(o =>
        o.setName("pregunta").setDescription("Tu pregunta").setRequired(true)
      ),

    async execute(interaction) {
      const respuestas = [
        "🎱 Sí, definitivamente.",
        "🎱 No lo creo.",
        "🎱 Puede ser.",
        "🎱 Pregúntame después.",
        "🎱 Todo apunta a que sí.",
        "🎱 Las estrellas dicen que no.",
        "🎱 Es muy probable.",
        "🎱 No estoy seguro."
      ];

      const respuesta =
        respuestas[Math.floor(Math.random() * respuestas.length)];

      await interaction.reply(`❓ **Pregunta:** ${interaction.options.getString("pregunta")}\n${respuesta}`);
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("dado")
      .setDescription("Lanza un dado"),

    async execute(interaction) {
      const numero = Math.floor(Math.random() * 6) + 1;
      await interaction.reply(`🎲 **Salió:** ${numero}`);
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("moneda")
      .setDescription("Lanza una moneda"),

    async execute(interaction) {
      const resultado = Math.random() < 0.5 ? "Cara" : "Cruz";
      await interaction.reply(`🪙 **Resultado:** ${resultado}`);
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("ppt")
      .setDescription("Piedra, papel o tijera")
      .addStringOption(o =>
        o
          .setName("eleccion")
          .setDescription("Tu elección")
          .setRequired(true)
          .addChoices(
            { name: "🪨 Piedra", value: "piedra" },
            { name: "📄 Papel", value: "papel" },
            { name: "✂️ Tijera", value: "tijera" }
          )
      ),

    async execute(interaction) {
      const usuario = interaction.options.getString("eleccion");
      const opciones = ["piedra", "papel", "tijera"];
      const bot = opciones[Math.floor(Math.random() * opciones.length)];

      let resultado;

      if (usuario === bot) {
        resultado = "🤝 ¡Empate!";
      } else if (
        (usuario === "piedra" && bot === "tijera") ||
        (usuario === "papel" && bot === "piedra") ||
        (usuario === "tijera" && bot === "papel")
      ) {
        resultado = "🏆 ¡Ganaste!";
      } else {
        resultado = "😂 ¡Perdiste!";
      }

      await interaction.reply(
        `🎮 Tú: **${usuario}**\n🤖 Bot: **${bot}**\n\n${resultado}`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("ship")
      .setDescription("Calcula una compatibilidad")
      .addUserOption(o =>
        o.setName("usuario1").setDescription("Primera persona").setRequired(true)
      )
      .addUserOption(o =>
        o.setName("usuario2").setDescription("Segunda persona").setRequired(true)
      ),

    async execute(interaction) {
      const usuario1 = interaction.options.getUser("usuario1");
      const usuario2 = interaction.options.getUser("usuario2");
      const porcentaje = Math.floor(Math.random() * 101);

      await interaction.reply(
        `💞 **Compatibilidad**\n\n${usuario1.username} ❤️ ${usuario2.username}\n\n💘 **${porcentaje}%**`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("say")
      .setDescription("Haz que el bot diga algo")
      .addStringOption(o =>
        o.setName("mensaje").setDescription("Mensaje").setRequired(true)
      ),

    async execute(interaction) {
      const mensaje = interaction.options.getString("mensaje");

      await interaction.reply({
        content: mensaje
      });
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("abrazo")
      .setDescription("Manda un abrazo")
      .addUserOption(o =>
        o.setName("usuario").setDescription("Usuario").setRequired(true)
      ),

    async execute(interaction) {
      const usuario = interaction.options.getUser("usuario");

      await interaction.reply(
        `🫂 **${interaction.user.username}** le dio un abrazo a **${usuario.username}**`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("aplaudir")
      .setDescription("Aplaude a un usuario")
      .addUserOption(o =>
        o.setName("usuario").setDescription("Usuario").setRequired(true)
      ),

    async execute(interaction) {
      const usuario = interaction.options.getUser("usuario");

      await interaction.reply(
        `👏👏 **${interaction.user.username}** aplaude a **${usuario.username}**`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("broma")
      .setDescription("Cuenta una broma"),

    async execute(interaction) {
      const bromas = [
        "😂 ¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
        "🤣 ¿Qué le dijo un techo a otro? Techo de menos.",
        "😆 ¿Cuál es el colmo de un electricista? No encontrar su corriente."
      ];

      await interaction.reply(
        bromas[Math.floor(Math.random() * bromas.length)]
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("reto")
      .setDescription("Obtén un reto divertido"),

    async execute(interaction) {
      const retos = [
        "🎯 Escribe una frase usando solo emojis.",
        "😂 Manda un mensaje usando tres palabras al azar.",
        "🎮 Juega una partida y cuenta cómo te fue.",
        "🤔 Describe tu día usando solamente 5 palabras."
      ];

      await interaction.reply(
        retos[Math.floor(Math.random() * retos.length)]
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("pregunta")
      .setDescription("Obtén una pregunta aleatoria"),

    async execute(interaction) {
      const preguntas = [
        "🎮 ¿Cuál es tu juego favorito?",
        "🔥 ¿Qué mapa de Free Fire te gusta más?",
        "😎 ¿Cuál es tu personaje favorito?",
        "🏆 ¿Cuál ha sido tu mejor partida?"
      ];

      await interaction.reply(
        preguntas[Math.floor(Math.random() * preguntas.length)]
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("eleccion")
      .setDescription("Elige aleatoriamente entre dos opciones")
      .addStringOption(o =>
        o.setName("opcion1").setDescription("Primera opción").setRequired(true)
      )
      .addStringOption(o =>
        o.setName("opcion2").setDescription("Segunda opción").setRequired(true)
      ),

    async execute(interaction) {
      const opcion1 = interaction.options.getString("opcion1");
      const opcion2 = interaction.options.getString("opcion2");

      const elegida = Math.random() < 0.5 ? opcion1 : opcion2;

      await interaction.reply(`🎯 **Elijo:** ${elegida}`);
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("random")
      .setDescription("Genera un número aleatorio")
      .addIntegerOption(o =>
        o.setName("minimo").setDescription("Número mínimo").setRequired(true)
      )
      .addIntegerOption(o =>
        o.setName("maximo").setDescription("Número máximo").setRequired(true)
      ),

    async execute(interaction) {
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

      await interaction.reply(`🎲 **Número:** ${numero}`);
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("frase")
      .setDescription("Muestra una frase aleatoria"),

    async execute(interaction) {
      const frases = [
        "🔥 Nunca te rindas.",
        "💪 Sigue mejorando.",
        "🏆 La práctica hace al maestro.",
        "🚀 Cada día puedes hacerlo mejor."
      ];

      await interaction.reply(
        frases[Math.floor(Math.random() * frases.length)]
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("decir")
      .setDescription("Repite un mensaje")
      .addStringOption(o =>
        o.setName("mensaje").setDescription("Mensaje").setRequired(true)
      ),

    async execute(interaction) {
      const mensaje = interaction.options.getString("mensaje");

      await interaction.reply(`💬 ${mensaje}`);
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("color")
      .setDescription("Genera un color hexadecimal aleatorio"),

    async execute(interaction) {
      const color =
        "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

      await interaction.reply(`🎨 **Color aleatorio:** \`${color}\``);
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("dado20")
      .setDescription("Lanza un dado de 20 caras"),

    async execute(interaction) {
      const numero = Math.floor(Math.random() * 20) + 1;
      await interaction.reply(`🎲 **D20:** ${numero}`);
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("coinflip")
      .setDescription("Lanza una moneda"),

    async execute(interaction) {
      const resultado = Math.random() < 0.5 ? "🪙 Cara" : "🪙 Cruz";
      await interaction.reply(`**${resultado}**`);
    }
  }
];
