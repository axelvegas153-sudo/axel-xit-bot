const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    // 1. CUANDO USAN UN COMANDO /
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: "❌ Hubo un error al ejecutar ese comando", ephemeral: true });
      }
    }

    // 2. CUANDO USAN EL MENÚ DE /HELP
    if (interaction.isStringSelectMenu() && interaction.customId === "help_menu") {
      const cat = interaction.values[0];
      const categorias = {
        info: { title: "🤖 INFO", cmds: "`/help` `/ping` `/botinfo` `/serverinfo` `/avatar` `/userinfo`" },
        mod: { title: "🔨 MODERACIÓN", cmds: "`/ban` `/kick` `/clear` `/timeout`" },
        utils: { title: "⚙️ UTILS", cmds: "`/say` `/choose` `/8ball` `/roll` `/calc`" },
        eco: { title: "💰 ECONOMÍA + NIVEL", cmds: "`/rank` `/xp` `/leaderboard` `/daily` `/balance` `/pay`" },
        fun: { title: "🎭 DIVERSIÓN", cmds: "`/push` `/punch` `/ship` `/funar` `/afk`" },
        dark: { title: "🧠 DARK FF + IA", cmds: "`/lenguaje` `/ia` `/ask` `/crear` `/ticket-setup`" }
      }
      const embed = new EmbedBuilder()
      .setTitle(categorias[cat].title)
      .setDescription(categorias[cat].cmds)
      .setColor("Purple");
      return interaction.update({ embeds: [embed] });
    }
  }
}
