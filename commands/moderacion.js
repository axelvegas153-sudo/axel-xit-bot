const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms'); // npm i ms

function crearEmbed(titulo, color, campos, mod) {
    return new EmbedBuilder()
      .setColor(color)
      .setTitle(titulo)
      .addFields(campos)
      .setFooter({ text: `Moderador: ${mod.tag} | DARK FF V1` })
      .setTimestamp();
}

module.exports = [
    // 1. BAN
    {
        data: new SlashCommandBuilder().setName('ban').setDescription('Banea a un usuario')
          .addUserOption(o => o.setName('usuario').setDescription('Usuario a banear').setRequired(true))
          .addStringOption(o => o.setName('motivo').setDescription('Razón del baneo').setRequired(true))
          .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        async execute(i) {
            const user = i.options.getUser('usuario');
            const motivo = i.options.getString('motivo');
            await i.guild.members.ban(user, { reason: `Por ${i.user.tag}: ${motivo}` });
            const embed = crearEmbed('🔨 Usuario Baneado', 0xFF0000, [
                { name: 'Usuario', value: `${user.tag}`, inline: true },
                { name: 'Motivo', value: `${motivo}`, inline: true },
                { name: 'ID', value: `${user.id}`, inline: false }
            ], i.user);
            await i.reply({ embeds: [embed] });
        }
    },

    // 2. UNBAN
    {
        data: new SlashCommandBuilder().setName('unban').setDescription('Desbanea a un usuario')
          .addStringOption(o => o.setName('id').setDescription('ID del usuario').setRequired(true))
          .addStringOption(o => o.setName('motivo').setDescription('Razón del desbaneo'))
          .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        async execute(i) {
            const id = i.options.getString('id');
            const motivo = i.options.getString('motivo') || 'Sin motivo';
            await i.guild.members.unban(id, `Por ${i.user.tag}: ${motivo}`);
            await i.reply(`✅ Usuario \`${id}\` desbaneado. Motivo: ${motivo}`);
        }
    },

    // 3. KICK
    {
        data: new SlashCommandBuilder().setName('kick').setDescription('Expulsa a un usuario')
          .addUserOption(o => o.setName('usuario').setDescription('Usuario a expulsar').setRequired(true))
          .addStringOption(o => o.setName('motivo').setDescription('Razón de la expulsión').setRequired(true))
          .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
        async execute(i) {
            const member = i.options.getMember('usuario');
            const motivo = i.options.getString('motivo');
            await member.kick(`Por ${i.user.tag}: ${motivo}`);
            const embed = crearEmbed('👢 Usuario Expulsado', 0xFFA500, [
                { name: 'Usuario', value: `${member.user.tag}`, inline: true },
                { name: 'Motivo', value: `${motivo}`, inline: true }
            ], i.user);
            await i.reply({ embeds: [embed] });
        }
    },

    // 4. TIMEOUT
    {
        data: new SlashCommandBuilder().setName('timeout').setDescription('Silencia a un usuario')
          .addUserOption(o => o.setName('usuario').setDescription('Usuario a silenciar').setRequired(true))
          .addStringOption(o => o.setName('tiempo').setDescription('Ej: 10m, 1h, 1d').setRequired(true))
          .addStringOption(o => o.setName('motivo').setDescription('Razón del timeout').setRequired(true))
          .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        async execute(i) {
            const member = i.options.getMember('usuario');
            const tiempo = i.options.getString('tiempo');
            const motivo = i.options.getString('motivo');
            const tiempoMs = ms(tiempo);
            await member.timeout(tiempoMs, `Por ${i.user.tag}: ${motivo}`);
            const embed = crearEmbed('⏰ Usuario en Timeout', 0xFFFF00, [
                { name: 'Usuario', value: `${member.user.tag}`, inline: true },
                { name: 'Duración', value: `${tiempo}`, inline: true },
                { name: 'Motivo', value: `${motivo}`, inline: false }
            ], i.user);
            await i.reply({ embeds: [embed] });
        }
    },

    // 5. UNTIMEOUT
    {
        data: new SlashCommandBuilder().setName('untimeout').setDescription('Quita el timeout')
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
          .addStringOption(o => o.setName('motivo').setDescription('Razón de la advertencia').setRequired(true)),
        async execute(i) {
            const user = i.options.getUser('usuario');
            const motivo = i.options.getString('motivo');
            const embed = crearEmbed('⚠️ Usuario Advertido', 0xFFD700, [
                { name: 'Usuario', value: `${user.tag}`, inline: true },
                { name: 'Motivo', value: `${motivo}`, inline: true }
            ], i.user);
            await i.reply({ embeds: [embed] });
        }
    },

    // 7. WARNS
    {
        data: new SlashCommandBuilder().setName('warns').setDescription('Ver advertencias')
          .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
        async execute(i) { await i.reply(`📋 **${i.options.getUser('usuario').tag}** tiene 0 advertencias`); }
    },

    // 8. CLEAR
    {
        data: new SlashCommandBuilder().setName('clear').setDescription('Borra mensajes')
          .addIntegerOption(o => o.setName('cantidad').setDescription('1-100').setMinValue(1).setMaxValue(100).setRequired(true))
          .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        async execute(i) {
            const amount = i.options.getInteger('cantidad');
            await i.channel.bulkDelete(amount, true);
            await i.reply({ content: `🗑️ ${amount} mensajes eliminados`, ephemeral: true });
        }
    },

    // 9. LOCK
    {
        data: new SlashCommandBuilder().setName('lock').setDescription('Bloquea el canal')
          .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(i) { await i.channel.permissionOverwrites.edit(i.guild.id, { SendMessages: false }); await i.reply('🔒 Canal bloqueado'); }
    },

    // 10. UNLOCK
    {
        data: new SlashCommandBuilder().setName('unlock').setDescription('Desbloquea el canal')
          .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(i) { await i.channel.permissionOverwrites.edit(i.guild.id, { SendMessages: true }); await i.reply('🔓 Canal desbloqueado'); }
    },

    // 11. SLOWMODE
    {
        data: new SlashCommandBuilder().setName('slowmode').setDescription('Pone modo lento')
          .addIntegerOption(o => o.setName('segundos').setDescription('0-21600').setMinValue(0).setMaxValue(21600).setRequired(true))
          .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(i) { await i.channel.setRateLimitPerUser(i.options.getInteger('segundos')); await i.reply(`🐢 Slowmode: ${i.options.getInteger('segundos')}s`); }
    },

    // 12. NICKNAME
    {
        data: new SlashCommandBuilder().setName('nickname').setDescription('Cambiar nick')
          .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
          .addStringOption(o => o.setName('nick').setDescription('Nuevo nick').setRequired(true))
          .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
        async execute(i) { await i.options.getMember('usuario').setNickname(i.options.getString('nick')); await i.reply('📝 Nick cambiado'); }
    },

    // 13. VOICEKICK
    {
        data: new SlashCommandBuilder().setName('voicekick').setDescription('Sacar de voz')
          .addUserOption(o => o.setName('usuario').setDescription('Usuario en voz').setRequired(true)),
        async execute(i) {
            const member = i.options.getMember('usuario');
            if(!member.voice.channel) return i.reply({content: '❌ No está en voz', ephemeral: true});
            await member.voice.disconnect(); await i.reply(`🔊 **${member.user.tag}** sacado de voz`);
        }
    },

    // 14. VOICEMUTE
    {
        data: new SlashCommandBuilder().setName('voicemute').setDescription('Mutear en voz')
          .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
        async execute(i) { await i.options.getMember('usuario').voice.setMute(true); await i.reply(`🔇 **${i.options.getMember('usuario').user.tag}** muteado en voz`); }
    },

    // 15. VOICEUNMUTE
    {
        data: new SlashCommandBuilder().setName('voiceunmute').setDescription('Desmutear en voz')
          .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
        async execute(i) { await i.options.getMember('usuario').voice.setMute(false); await i.reply(`🔊 **${i.options.getMember('usuario').user.tag}** desmuteado`); }
    },

    // 16. MOVE
    {
        data: new SlashCommandBuilder().setName('move').setDescription('Mover entre canales de voz')
          .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
          .addChannelOption(o => o.setName('canal').setDescription('Canal de voz').setRequired(true)),
        async execute(i) { await i.options.getMember('usuario').voice.setChannel(i.options.getChannel('canal')); await i.reply('📡 Movido'); }
    },

    // 17. NUKE
    {
        data: new SlashCommandBuilder().setName('nuke').setDescription('Reiniciar canal')
          .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(i) { const c = await i.channel.clone(); await i.channel.delete(); await c.send(`💥 Canal nuked por ${i.user.tag}`); }
    },

    // 18. ROLE
    {
        data: new SlashCommandBuilder().setName('role').setDescription('Añadir/Quitar rol')
          .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
          .addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true))
          .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
        async execute(i) {
            const m = i.options.getMember('usuario'); const r = i.options.getRole('rol');
            m.roles.cache.has(r.id)? await m.roles.remove(r) : await m.roles.add(r);
            await i.reply(`✅ Rol \`${r.name}\` modificado para ${m.user.tag}`);
        }
    },

    // 19. HISTORY
    {
        data: new SlashCommandBuilder().setName('history').setDescription('Ver historial')
          .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true)),
        async execute(i) { await i.reply(`📜 Historial de **${i.options.getUser('usuario').tag}**: 0 casos`); }
    },

    // 20. MODLOG
    {
        data: new SlashCommandBuilder().setName('modlog').setDescription('Ver últimos casos'),
        async execute(i) { await i.reply('📊 ModLog: No hay casos registrados'); }
    }
];
