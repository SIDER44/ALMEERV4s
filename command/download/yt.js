const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const fs = require('fs-extra');

module.exports = {
    name: 'yt',
    aliases: ['youtube', 'ytmp3', 'ytmp4'],
    description: 'Download YouTube videos',
    usage: '.yt (link) or .yt (search)',
    cooldown: 15,
    
    async execute(sock, msg, args, { from }) {
        if (!args[0]) {
            return await sock.sendMessage(from, {
                text: '❌ Please provide a YouTube link or search query!'
            }, { quoted: msg });
        }

        const query = args.join(' ');
        
        try {
            await sock.sendMessage(from, { text: '🔍 *Searching...*' }, { quoted: msg });

            let url = query;
            if (!require('../../lib/utils').isValidUrl(query)) {
                const search = await ytSearch(query);
                if (!search.videos.length) {
                    return await sock.sendMessage(from, {
                        text: '❌ No videos found!'
                    }, { quoted: msg });
                }
                url = search.videos[0].url;
            }

            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title;
            const duration = parseInt(info.videoDetails.lengthSeconds);
            const views = info.videoDetails.viewCount;

            const buttons = [
                {
                    buttonId: `yt_audio_${url}`,
                    buttonText: { displayText: '🎵 Audio (MP3)' },
                    type: 1
                },
                {
                    buttonId: `yt_video_${url}`,
                    buttonText: { displayText: '🎬 Video (MP4)' },
                    type: 1
                }
            ];

            await sock.sendMessage(from, {
                text: `📹 *${title}*\n\n⏱️ Duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}\n👁️ Views: ${views.toLocaleString()}\n\nSelect download type:`,
                buttons: buttons,
                headerType: 1
            }, { quoted: msg });

        } catch (error) {
            console.error('YouTube error:', error);
            await sock.sendMessage(from, {
                text: '❌ Failed to process YouTube video.'
            }, { quoted: msg });
        }
    }
};
