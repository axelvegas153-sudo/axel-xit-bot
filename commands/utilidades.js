const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName("calc")
      .setDescription("Calcula una operación básica")
      .addNumberOption(o =>
        o.setName("numero1").setDescription("Primer número").setRequired(true)
      )
      .addStringOption(o =>
        o.setName("operador")
          .setDescription("Operador")
          .setRequired(true)
          .addChoices(
            { name: "Suma +", value: "+" },
            { name: "Resta -", value: "-" },
            { name: "Multiplicación ×", value: "*" },
            { name: "División ÷", value: "/" }
          )
      )
      .addNumberOption(o =>
        o.setName("numero2").setDescription("Segundo número").setRequired(true)
      ),

    async execute(interaction) {
      const a = interaction.options.getNumber("numero1");
      const operador = interaction.options.getString("operador");
      const b = interaction.options.getNumber("numero2");

      if (operador === "/" && b === 0) {
        return interaction.reply({
          content: "❌ No puedes dividir entre 0.",
          ephemeral: true
        });
      }

      let resultado;

      if (operador === "+") resultado = a + b;
      if (operador === "-") resultado = a - b;
      if (operador === "*") resultado = a * b;
      if (operador === "/") resultado = a / b;

      await interaction.reply(
        `🧮 **${a} ${operador} ${b} = ${resultado}**`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("poll")
      .setDescription("Crea una encuesta")
      .addStringOption(o =>
        o.setName("pregunta")
          .setDescription("Pregunta de la encuesta")
          .setRequired(true)
      ),

    async execute(interaction) {
      const pregunta = interaction.options.getString("pregunta");

      const mensaje = await interaction.reply({
        content: `📊 **ENCUESTA**\n\n${pregunta}\n\n👍 Sí\n👎 No`,
        fetchReply: true
      });

      await mensaje.react("👍");
      await mensaje.react("👎");
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("embed")
      .setDescription("Crea un mensaje embed")
      .addStringOption(o =>
        o.setName("titulo").setDescription("Título").setRequired(true)
      )
      .addStringOption(o =>
        o.setName("mensaje").setDescription("Contenido").setRequired(true)
      ),

    async execute(interaction) {
      const titulo = interaction.options.getString("titulo");
      const mensaje = interaction.options.getString("mensaje");

      const embed = new EmbedBuilder()
        .setTitle(titulo)
        .setDescription(mensaje)
        .setFooter({ text: "DARK FF V1" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("userinfo")
      .setDescription("Muestra información básica de un usuario")
      .addUserOption(o =>
        o.setName("usuario")
          .setDescription("Usuario")
          .setRequired(false)
      ),

    async execute(interaction) {
      const usuario =
        interaction.options.getUser("usuario") || interaction.user;

      await interaction.reply(
        `👤 **${usuario.username}**\n` +
        `🆔 ID: \`${usuario.id}\`\n` +
        `📅 Cuenta: <t:${Math.floor(usuario.createdTimestamp / 1000)}:R>`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("avataruser")
      .setDescription("Muestra el avatar de un usuario")
      .addUserOption(o =>
        o.setName("usuario")
          .setDescription("Usuario")
          .setRequired(false)
      ),

    async execute(interaction) {
      const usuario =
        interaction.options.getUser("usuario") || interaction.user;

      const avatar = usuario.displayAvatarURL({
        size: 1024,
        extension: "png"
      });

      await interaction.reply(`🖼️ **Avatar de ${usuario.username}**\n${avatar}`);
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("timestamp")
      .setDescription("Muestra un timestamp de la fecha actual"),

    async execute(interaction) {
      const timestamp = Math.floor(Date.now() / 1000);

      await interaction.reply(
        `⏰ Timestamp actual:\n\n<t:${timestamp}:F>\n\n\`<t:${timestamp}:F>\``
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("canal")
      .setDescription("Muestra información del canal actual"),

    async execute(interaction) {
      const canal = interaction.channel;

      await interaction.reply(
        `📺 **CANAL**\n\n` +
        `📛 Nombre: **${canal.name}**\n` +
        `🆔 ID: \`${canal.id}\`\n` +
        `📂 Tipo: **${canal.type}**`
      );
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("emoji")
      .setDescription("Muestra un emoji")
      .addStringOption(o =>
        o.setName("emoji")
          .setDescription("Emoji")
          .setRequired(true)
      ),

    async execute(interaction) {
      const emoji = interaction.options.getString("emoji");

      await interaction.reply(`😀 **Emoji:** ${emoji}`);
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("sayembed")
      .setDescription("Envía un mensaje en formato embed")
      .addStringOption(o =>
        o.setName("mensaje")
          .setDescription("Mensaje")
          .setRequired(true)
      ),

    async execute(interaction) {
      const mensaje = interaction.options.getString("mensaje");

      const embed = new EmbedBuilder()
        .setDescription(mensaje)
        .setFooter({ text: "DARK FF V1" });

      await interaction.reply({ embeds: [embed] });
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("server")
      .setDescription("Muestra el servidor actual"),

    async execute(interaction) {
      await interaction.reply(
        `🌐 Estás en **${interaction.guild.name}**\n` +
        `👥 Miembros: **${interaction.guild.memberCount}**`
      );
    }
  }
];
