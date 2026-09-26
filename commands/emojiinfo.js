const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("emojiinfo")
    .setDescription("Muestra información de un emoji del servidor")
    .addStringOption(option =>
      option
        .setName("emoji")
        .setDescription("El emoji que quieres consultar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const entrada = interaction.options.getString("emoji");

    const personalizado = entrada.match(
      /^<(a?):([a-zA-Z0-9_]+):(\d+)>$/
    );

    if (personalizado) {
      const animado = personalizado[1] === "a";
      const nombre = personalizado[2];
      const id = personalizado[3];

      const extension = animado ? "gif" : "png";
      const url = `https://cdn.discordapp.com/emojis/${id}.${extension}`;

      const embed = new EmbedBuilder()
        .setTitle("😀 Información del emoji")
        .setColor(0x5865f2)
        .setThumbnail(url)
        .addFields(
          {
            name: "📛 Nombre",
            value: nombre,
            inline: true
          },
          {
            name: "🆔 ID",
            value: id,
            inline: true
          },
          {
            name: "🎞️ Animado",
            value: animado ? "✅ Sí" : "❌ No",
            inline: true
          },
          {
            name: "🔗 Enlace",
            value: `[Abrir emoji](${url})`,
            inline: true
          }
        )
        .setFooter({
          text: "Axel XIT • Información de emojis"
        })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }

    const emojiUnicode = entrada.match(
      /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u
    );

    if (emojiUnicode) {
      const codigo = [...entrada]
        .map(char => char.codePointAt(0).toString(16).toUpperCase())
        .join("-");

      const embed = new EmbedBuilder()
        .setTitle("😀 Emoji Unicode")
        .setColor(0x5865f2)
        .addFields(
          {
            name: "😀 Emoji",
            value: entrada,
            inline: true
          },
          {
            name: "🔢 Código",
            value: `\`${codigo}\``,
            inline: true
          }
        )
        .setFooter({
          text: "Axel XIT • Emoji Info"
        })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }

    return interaction.reply({
      content: "❌ No reconocí ese emoji. Usa un emoji válido.",
      ephemeral: true
    });
  }
};
