const fs = require('fs-extra');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

module.exports = {
    name: 'sticker',
    aliases: ['s', 'stiker', 'sgif'],
    description: 'Create sticker from image/video',
    usage: '.sticker (reply to media)',
    cooldown: 8,
    
    async execute(sock, msg, args, { from }) {
        try {
            const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted && !msg.message.imageMessage && !msg.message.videoMessage) {
                return await sock.sendMessage(from, {
                    text: '❌ Please reply to an image or video!'
                }, { quoted: msg });
            }

            // Get media
            let mediaMsg = msg;
            if (quoted) {
                mediaMsg = { message: quoted, key: msg.key };
            }

            const mediaType = mediaMsg.message.imageMessage ? 'image' : 'video';
            
            // Download media
            const media = await sock.downloadMediaMessage(mediaMsg);
            const tempPath = `./media/temp/${Date.now()}.${mediaType === 'image' ? 'jpg' : 'mp4'}`;
            await fs.writeFile(tempPath, media);

            // Create sticker
            const sticker = new Sticker(tempPath, {
                pack: 'ALMEER BOT',
                author: 'ALMEERV4',
                type: StickerTypes.FULL,
                categories: ['🤖', '✨'],
                quality: 70
            });

            const stickerBuffer = await sticker.toBuffer();
            
            // Send sticker
            await sock.sendMessage(from, {
                sticker: stickerBuffer
            }, { quoted: msg });

            // Clean up
            await fs.remove(tempPath);

        } catch (error) {
            console.error('Sticker error:', error);
            await sock.sendMessage(from, {
                text: '❌ Failed to create sticker. Make sure the media is valid.'
            }, { quoted: msg });
        }
    }
};