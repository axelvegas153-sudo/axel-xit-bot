const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("calculadora")
    .setDescription("Realiza una operación matemática")
    .addNumberOption(option =>
      option
        .setName("numero1")
        .setDescription("Primer número")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("operador")
        .setDescription("Operador matemático")
        .addChoices(
          { name: "Suma", value: "+" },
          { name: "Resta", value: "-" },
          { name: "Multiplicación", value: "*" },
          { name: "División", value: "/" }
        )
        .setRequired(true)
    )
    .addNumberOption(option =>
      option
        .setName("numero2")
        .setDescription("Segundo número")
        .setRequired(true)
    ),

  async execute(interaction) {
    const a = interaction.options.getNumber("numero1");
    const operador = interaction.options.getString("operador");
    const b = interaction.options.getNumber("numero2");

    let resultado;

    if (operador === "+") resultado = a + b;
    if (operador === "-") resultado = a - b;
    if (operador === "*") resultado = a * b;

    if (operador === "/") {
      if (b === 0) {
        return interaction.reply({
          content: "❌ No se puede dividir entre cero.",
          ephemeral: true
        });
      }

      resultado = a / b;
    }

    await interaction.reply(
      `🧮 **Calculadora**\n\n` +
      `\`${a} ${operador} ${b} = ${resultado}\``
    );
  }
};
