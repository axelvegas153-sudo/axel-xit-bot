const { EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI("TU_API_KEY"); // sácala gratis en https://aistudio.google.com
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports = {
    name: "ia",
    description: "Pregúntale algo a la IA",
    async execute(client, message, args) {
        const pregunta = args.join(" ");
        if (!pregunta) return message.reply("Uso: `!ia tu pregunta`");

        const msg = await message.reply({ embeds: [new EmbedBuilder().setDescription('⏳ Pensando...').setColor(0xFEE75C)] });

        try {
            const result = await model.generateContent(pregunta);
            const respuesta = result.response.text();

            const embed = new EmbedBuilder()
                .setTitle('🤖 IA Responde')
                .setDescription(respuesta)
                .setColor(0x5865F2)
                .setFooter({ text: `Preguntado por ${message.author.username}` });

            await msg.edit({ embeds: [embed] });
        } catch (e) {
            await msg.edit({ embeds: [new EmbedBuilder().setDescription(`❌ Error: ${e.message}`).setColor(0xED4245)] });
        }
    }
}
