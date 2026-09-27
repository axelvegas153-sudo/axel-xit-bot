const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const categorias = {
    'Moderación': ['ban', 'unban', 'kick', 'timeout', 'warn', 'clear'],
    'Seguridad': ['antiraid', 'antispam', 'lockdown'],
    'Servidor': ['serverinfo', 'serverclone'],
    'IA': ['ask', 'ai', 'chat', 'codeai'],
    'Economía': ['balance', 'daily', 'pay', 'rob'],
    'Tickets': ['ticket', 'ticketcreate', 'ticketclose'],
    'Música': ['play', 'pause', 'skip', 'stop'],
    'Información': ['botinfo', 'ping', 'uptime'],
    'Diversión': ['8ball', 'coin', 'dice', 'joke']
};

module.exports = [{
    data: new SlashCommandBuilder()
       .setName('help')
       .setDescription('Centro de comandos de DARK FF V1'),

    async execute(interaction) {
        await this.showHome(interaction);
    },

    async showHome(interaction) {
        const embed = new EmbedBuilder()
           .setTitle('🤖 DARK FF V1 - Centro de Ayuda')
           .setDescription('Selecciona una categoría para ver los comandos')
           .setColor(0x2B2D31)
           .setFooter({ text: 'DARK FF V1' });

        const menu = new StringSelectMenuBuilder()
           .setCustomId('help_menu')
           .setPlaceholder('Selecciona una categoría')
           .addOptions(Object.keys(categorias).map(cat => ({
                label: cat,
                value: cat,
                description: `${categorias[cat].length} comandos`
            })));

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },

    async handleSelect(interaction, category) {
        const cmds = categorias[category] || [];
        const embed = new EmbedBuilder()
           .setTitle(`📂 ${category}`)
           .setDescription(cmds.map(c => `\`/${c}\``).join('\n'))
           .setColor(0x5865F2);

        const btn = new ButtonBuilder()
           .setCustomId('help_home')
           .setLabel('Inicio')
           .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(btn);
        await interaction.update({ embeds: [embed], components: [row] });
    }
}];
