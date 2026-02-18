require('dotenv').config();

module.exports = {
    // Bot Info
    botName: process.env.BOT_NAME || 'ALMEERV4',
    ownerNumber: process.env.OWNER_NUMBER || '254720313769',
    ownerJid: process.env.OWNER_NUMBER + '@s.whatsapp.net',
    prefix: process.env.PREFIX || '.',
    sessionName: process.env.SESSION_NAME || 'session',
    
    // Modes
    mode: process.env.MODE || 'public', // public, private, groups
    premiumMode: process.env.PREMIUM_MODE === 'true',
    nsfw: process.env.NSFW === 'true',
    
    // Features
    autoRead: process.env.AUTO_READ === 'true',
    autoTyping: process.env.AUTO_TYPING === 'true',
    antiLink: process.env.ANTI_LINK === 'true',
    antiDelete: process.env.ANTI_DELETE === 'true',
    welcomeMsg: process.env.WELCOME_MSG === 'true',
    goodbyeMsg: process.env.GOODBYE_MSG === 'true',
    
    // Cooldowns (seconds)
    cooldown: {
        default: 3,
        download: 10,
        ai: 15,
        economy: 5,
        game: 30,
        media: 8
    },
    
    // Limits
    limits: {
        daily: 100,
        premiumDaily: 500,
        downloadSize: 50, // MB
        gamePlay: 5 // per day
    },
    
    // APIs
    apis: {
        openai: process.env.OPENAI_API_KEY,
        weather: process.env.WEATHER_API_KEY,
        removebg: process.env.REMOVEBG_API_KEY,
        // Free APIs (no key needed)
        meme: 'https://meme-api.com/gimme',
        quote: 'https://api.quotable.io/random',
        anime: 'https://api.jikan.moe/v4',
        crypto: 'https://api.coingecko.com/api/v3',
        news: 'https://newsapi.org/v2'
    },
    
    // Database paths
    dbPath: {
        users: './database/users.json',
        groups: './database/groups.json',
        economy: './database/economy.json',
        rpg: './database/rpg.json',
        settings: './database/settings.json',
        premium: './database/premium.json',
        banned: './database/banned.json'
    },
    
    // Port
    port: process.env.PORT || 3000,
    
    // Version
    version: '4.0.0'
};