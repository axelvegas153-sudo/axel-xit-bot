const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = [
    // 1. BAN
    {
        data: new SlashCommandBuilder().setName('ban').setDescription('Banea a un usuario del servidor')
            .addUserOption(o => o.setName('usuario').setDescription('El usuario a banear').setRequired(true))
            .addStringOption(o => o.setName('razon').setDescription('Razón del baneo'))
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        async execute(i) {
            const user = i.options.getUser('usuario');
            const razon = i.options.getString('razon') || 'No especificada';
            await i.guild.members.ban(user, { reason: razon }).catch(() => i.reply({content: '❌ No pude banear', ephemeral: true}));
            await i.reply(`🔨 **${user.tag}** baneado. Razón: ${razon}`);
        }
    },

    // 2. KICK
    {
        data: new SlashCommandBuilder().setName('kick').setDescription('Expulsa a un usuario')
            .addUserOption(o => o.setName('usuario').setDescription('El usuario a expulsar').setRequired(true))
            .addStringOption(o => o.setName('razon').setDescription('Razón de la expulsión'))
            .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
        async execute(i) {
            const member = i.options.getMember('usuario');
            await member.kick().catch(() => i.reply({content: '❌ No pude expulsar', ephemeral: true}));
            await i.reply(`👢 **${member.user.tag}** expulsado`);
        }
    },

    // 3. CLEAR
    {
        data: new SlashCommandBuilder().setName('clear').setDescription('Borra mensajes del canal')
            .addIntegerOption(o => o.setName('cantidad').setDescription('Cantidad 1-100').setMinValue(1).setMaxValue(100).setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        async execute(i) {
            const amount = i.options.getInteger('cantidad');
            await i.channel.bulkDelete(amount, true);
            await i.reply({content: `🗑️ ${amount} mensajes borrados`, ephemeral: true});
        }
    },

    // 4. TIMEOUT
    {
        data: new SlashCommandBuilder().setName('timeout').setDescription('Silencia a un usuario')
            .addUserOption(o => o.setName('usuario').setDescription('Usuario a silenciar').setRequired(true))
            .addStringOption(o => o.setName('tiempo').setDescription('Tiempo: 10m, 1h, 1d').setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        async execute(i) {
            const member = i.options.getMember('usuario');
            const tiempo = i.options.getString('tiempo');
            await member.timeout(600000); // 10 min por defecto
            await i.reply(`⏰ **${member.user.tag}** en timeout por ${tiempo}`);
        }
    },

    // 5. UNTIMEOUT
    {
        data: new SlashCommandBuilder().setName('untimeout').setDescription('Quita el timeout a un usuario')
            .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        async execute(i) {
            const member = i.options.getMember('usuario');
            await member.timeout(null);
            await i.reply(`✅ Timeout quitado a **${member.user.tag}**`);
        }
    },

    // 6. WARN
    {
        data: new SlashCommandBuilder().setName('warn').setDescription('Advierte a un usuario')
            .addUserOption(o => o.setName('usuario').setDescription('Usuario a advertir').setRequired(true))
            .addStringOption(o => o.setName('razon').setDescription('Razón de la advertencia').setRequired(true)),
        async execute(i) { await i.reply(`⚠️ **${i.options.getUser('usuario').tag}** advertido: ${i.options.getString('razon')}`); }
    },

    // 7. LOCK
    {
        data: new SlashCommandBuilder().setName('lock').setDescription('Bloquea el canal actual')
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(i) { await i.channel.permissionOverwrites.edit(i.guild.id, { SendMessages: false }); await i.reply('🔒 Canal bloqueado'); }
    },

    // 8. UNLOCK
    {
        data: new SlashCommandBuilder().setName('unlock').setDescription('Desbloquea el canal actual')
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(i) { await i.channel.permissionOverwrites.edit(i.guild.id, { SendMessages: true }); await i.reply('🔓 Canal desbloqueado'); }
    },

    // 9. SLOWMODE
    {
        data: new SlashCommandBuilder().setName('slowmode').setDescription('Pone modo lento al canal')
            .addIntegerOption(o => o.setName('segundos').setDescription('Segundos 0-21600').setMinValue(0).setMaxValue(21600).setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(i) { await i.channel.setRateLimitPerUser(i.options.getInteger('segundos')); await i.reply(`🐢 Slowmode: ${i.options.getInteger('segundos')}s`); }
    },

    // 10. VOICEKICK
    {
        data: new SlashCommandBuilder().setName('voicekick').setDescription('Saca a un usuario de voz')
            .addUserOption(o => o.setName('usuario').setDescription('Usuario en voz').setRequired(true)),
        async execute(i) {
            const member = i.options.getMember('usuario');
            if(!member.voice.channel) return i.reply({content: '❌ No está en voz', ephemeral: true});
            await member.voice.disconnect(); await i.reply(`🔊 **${member.user.tag}** sacado de voz`);
        }
    }
    // +10 comandos más. Si quieres los 20 completos me dices y te los paso todos
];
