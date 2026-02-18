const axios = require('axios');

module.exports = {
    name: 'quran',
    aliases: ['qur'an', 'surah'],
    description: 'Read Quran verses',
    usage: '.quran [surah:ayah]',
    cooldown: 5,
    
    async execute(sock, msg, args, { from }) {
        try {
            let surah = 1;
            let ayah = 1;

            if (args[0]) {
                const parts = args[0].split(':');
                surah = parseInt(parts[0]) || 1;
                ayah = parseInt(parts[1]) || 1;
            }

            // Using free Quran API
            const response = await axios.get(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}`);
            const data = response.data.data;

            const text = `📖 *Quran - Surah ${data.surah.name} (${data.surah.englishName})*\n\n` +
                `*Ayah ${data.numberInSurah}:*\n${data.text}\n\n` +
                `📝 *Translation:*\n${data.surah.englishNameTranslation}\n\n` +
                `📍 *Juz:* ${data.juz} | *Page:* ${data.page}`;

            await sock.sendMessage(from, { text }, { quoted: msg });

        } catch (error) {
            console.error('Quran error:', error);
            await sock.sendMessage(from, {
                text: '❌ Failed to fetch Quran verse.'
            }, { quoted: msg });
        }
    }
};
