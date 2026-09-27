const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

function error(i, msg) { return i.reply({ content: `❌ ${msg}`, ephemeral: true }); }

module.exports = [
    // 1. BAN
    {
        data: new SlashCommandBuilder().setName('ban').setDescription('Banea a un usuario del servidor')
            .addUserOption(o => o.setName('usuario').setDescription('Usuario a banear').setRequired(true))
            .addStringOption(o => o.setName('razon').setDescription('Razón del ban'))
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        async execute(i) {
            const user = i.options.getUser('usuario');
            const razon = i.options.getString('razon') || 'No especificada';
            await i.guild.members.ban(user, { reason: razon }).catch(() => { return error(i, 'No pude banear a ese usuario'); });
            await i.reply(`🔨 **${user.tag}** ha sido baneado. Razón: ${razon}`);
        }
    },

    // 2. UNBAN
    {
        data: new SlashCommandBuilder().setName('unban').setDescription('Desbanea a un usuario')
            .addStringOption(o => o.setName('id').setDescription('ID del usuario').setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        async execute(i) {
            const id = i.options.getString('id');
            await i.guild.members.unban(id).catch(() => { return error(i, 'ID inválida o usuario no baneado'); });
            await i.reply(`✅ Usuario con ID \`${id}\` desbaneado`);
        }
    },

    // 3. KICK
    {
        data: new SlashCommandBuilder().setName('kick').setDescription('Expulsa a un usuario')
            .addUserOption(o => o.setName('usuario').setRequired(true))
            .addStringOption(o => o.setName('razon'))
            .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
        async execute(i) {
            const member = i.options.getMember('usuario');
            const razon = i.options.getString('razon') || 'No especificada';
            await member.kick(razon).catch(() => { return error(i, 'No pude expulsar a ese usuario'); });
            await i.reply(`👢 **${member.user.tag}** ha sido expulsado. Razón: ${razon}`);
        }
    },

    // 4. TIMEOUT
    {
        data: new SlashCommandBuilder().setName('timeout').setDescription('Silencia a un usuario por tiempo')
            .addUserOption(o => o.setName('usuario').setRequired(true))
            .addStringOption(o => o.setName('tiempo').setDescription('Ej: 10m, 1h, 1d').setRequired(true))
            .addStringOption(o => o.setName('razon'))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        async execute(i) {
            const member = i.options.getMember('usuario');
            const ms = require('ms')(i.options.getString('tiempo'));
            await member.timeout(ms).catch(() => { return error(i, 'No pude poner timeout'); });
            await i.reply(`⏰ **${member.user.tag}** en timeout por ${i.options.getString('tiempo')}`);
        }
    },

    // 5. UNTIMEOUT
    {
        data: new SlashCommandBuilder().setName('untimeout').setDescription('Quita el timeout a un usuario')
            .addUserOption(o => o.setName('usuario').setRequired(true))
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
            .addUserOption(o => o.setName('usuario').setRequired(true))
            .addStringOption(o => o.setName('razon').setRequired(true)),
        async execute(i) { await i.reply(`⚠️ **${i.options.getUser('usuario').tag}** ha sido advertido. Razón: ${i.options.getString('razon')}`); }
    },

    // 7. WARNS
    {
        data: new SlashCommandBuilder().setName('warns').setDescription('Ver advertencias de un usuario')
            .addUserOption(o => o.setName('usuario').setRequired(true)),
        async execute(i) { await i.reply(`📋 Buscando advertencias de **${i.options.getUser('usuario').tag}**...`); }
    },

    // 8. CLEAR
    {
        data: new SlashCommandBuilder().setName('clear').setDescription('Borra mensajes')
            .addIntegerOption(o => o.setName('cantidad').setMinValue(1).setMaxValue(100).setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        async execute(i) {
            const amount = i.options.getInteger('cantidad');
            await i.channel.bulkDelete(amount, true).catch(() => { return error(i, 'No pude borrar mensajes'); });
            await i.reply({ content: `🗑️ ${amount} mensajes eliminados`, ephemeral: true });
        }
    },

    // 9. LOCK
    {
        data: new SlashCommandBuilder().setName('lock').setDescription('Bloquea el canal actual')
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(i) {
            await i.channel.permissionOverwrites.edit(i.guild.id, { SendMessages: false });
            await i.reply('🔒 Canal bloqueado');
        }
    },

    // 10. UNLOCK
    {
        data: new SlashCommandBuilder().setName('unlock').setDescription('Desbloquea el canal actual')
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(i) {
            await i.channel.permissionOverwrites.edit(i.guild.id, { SendMessages: true });
            await i.reply('🔓 Canal desbloqueado');
        }
    },

    // 11. SLOWMODE
    {
        data: new SlashCommandBuilder().setName('slowmode').setDescription('Activa modo lento')
            .addIntegerOption(o => o.setName('segundos').setMinValue(0).setMaxValue(21600).setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(i) {
            await i.channel.setRateLimitPerUser(i.options.getInteger('segundos'));
            await i.reply(`🐢 Slowmode puesto en ${i.options.getInteger('segundos')}s`);
        }
    },

    // 12. NICKNAME
    {
        data: new SlashCommandBuilder().setName('nickname').setDescription('Cambia el nick de un usuario')
            .addUserOption(o => o.setName('usuario').setRequired(true))
            .addStringOption(o => o.setName('nick').setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
        async execute(i) {
            const member = i.options.getMember('usuario');
            await member.setNickname(i.options.getString('nick'));
            await i.reply(`📝 Nick cambiado a \`${i.options.getString('nick')}\``);
        }
    },

    // 13. VOICEKICK
    {
        data: new SlashCommandBuilder().setName('voicekick').setDescription('Saca a un usuario de un canal de voz')
            .addUserOption(o => o.setName('usuario').setRequired(true)),
        async execute(i) {
            const member = i.options.getMember('usuario');
            if (!member.voice.channel) return error(i, 'Ese usuario no está en voz');
            await member.voice.disconnect();
            await i.reply(`🔊 **${member.user.tag}** sacado de voz`);
        }
    },

    // 14. VOICEMUTE
    {
        data: new SlashCommandBuilder().setName('voicemute').setDescription('Mutea a un usuario en voz')
            .addUserOption(o => o.setName('usuario').setRequired(true)),
        async execute(i) {
            const member = i.options.getMember('usuario');
            await member.voice.setMute(true);
            await i.reply(`🔇 **${member.user.tag}** muteado en voz`);
        }
    },

    // 15. VOICEUNMUTE
    {
        data: new SlashCommandBuilder().setName('voiceunmute').setDescription('Quita mute de voz')
            .addUserOption(o => o.setName('usuario').setRequired(true)),
        async execute(i) {
            const member = i.options.getMember('usuario');
            await member.voice.setMute(false);
            await i.reply(`🔊 **${member.user.tag}** desmuteado en voz`);
        }
    },

    // 16. MOVE
    {
        data: new SlashCommandBuilder().setName('move').setDescription('Mueve a un usuario a otro canal de voz')
            .addUserOption(o => o.setName('usuario').setRequired(true))
            .addChannelOption(o => o.setName('canal').setRequired(true)),
        async execute(i) {
            const member = i.options.getMember('usuario');
            const channel = i.options.getChannel('canal');
            await member.voice.setChannel(channel);
            await i.reply(`📡 **${member.user.tag}** movido a ${channel.name}`);
        }
    },

    // 17. NUKE
    {
        data: new SlashCommandBuilder().setName('nuke').setDescription('Reinicia el canal eliminando y clonándolo')
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(i) {
            const newChannel = await i.channel.clone();
            await i.channel.delete();
            await newChannel.send('💥 Canal nuked');
        }
    },

    // 18. ROLE
    {
        data: new SlashCommandBuilder().setName('role').setDescription('Añade o quita un rol')
            .addUserOption(o => o.setName('usuario').setRequired(true))
            .addRoleOption(o => o.setName('rol').setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
        async execute(i) {
            const member = i.options.getMember('usuario');
            const role = i.options.getRole('rol');
            if (member.roles.cache.has(role.id)) { await member.roles.remove(role); await i.reply(`➖ Rol \`${role.name}\` quitado`); }
            else { await member.roles.add(role); await i.reply(`➕ Rol \`${role.name}\` añadido`); }
        }
    },

    // 19. HISTORY
    {
        data: new SlashCommandBuilder().setName('history').setDescription('Ver historial de moderación de un usuario')
            .addUserOption(o => o.setName('usuario').setRequired(true)),
        async execute(i) { await i.reply(`📜 Historial de **${i.options.getUser('usuario').tag}**: Sin datos aún`); }
    },

    // 20. MODLOG
    {
        data: new SlashCommandBuilder().setName('modlog').setDescription('Ver los últimos 10 casos de moderación'),
        async execute(i) { await i.reply('📊 Últimos casos de moderación: Ninguno registrado'); }
    }
];
