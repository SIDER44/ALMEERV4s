/**
 * ALMEERV4 - Advanced WhatsApp Bot
 * Version: 4.0.0
 * Node Version: 20.18.0
 * Author: ALMEER
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const express = require('express');
const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const color = require('./lib/color');
const database = require('./lib/database');
const commandHandler = require('./lib/handler');

// Ensure directories exist
fs.ensureDirSync('./session');
fs.ensureDirSync('./database');
fs.ensureDirSync('./media/temp');

// Initialize Express
const app = express();
app.use(express.json());

// Health check endpoint for Render
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        bot: config.botName,
        version: config.version,
        node: process.version,
        commands: commandHandler.getCommandsCount(),
        mode: config.mode,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        session: fs.existsSync('./session/creds.json') ? 'active' : 'none'
    });
});

// Additional health check for Render
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Start server
const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(color(`🚀 Server running on port ${config.port}`, 'green'));
    console.log(color(`📊 Node Version: ${process.version}`, 'cyan'));
});

// Increase timeout for Render
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;

// Initialize database
database.init();
console.log(color('📦 Database initialized', 'green'));

// Connect to WhatsApp
async function connectToWhatsApp() {
    try {
        // Check for existing session
        const sessionExists = fs.existsSync(`./${config.sessionName}/creds.json`);
        if (sessionExists) {
            console.log(color('📱 Existing session found', 'green'));
        } else {
            console.log(color('📱 No session found. QR code will be generated.', 'yellow'));
        }

        const { state, saveCreds } = await useMultiFileAuthState(`./${config.sessionName}`);
        const { version, isLatest } = await fetchLatestBaileysVersion();

        console.log(color(`📡 Using Baileys version: ${version}`, 'cyan'));

        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: true,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
            },
            browser: Browsers.appropriate('Desktop'),
            markOnlineOnConnect: true,
            syncFullHistory: false,
            generateHighQualityLinkPreview: true,
            patchMessageBeforeSending: (msg) => {
                if (config.autoTyping && msg.key?.remoteJid) {
                    sock.sendPresenceUpdate('composing', msg.key.remoteJid);
                }
                return msg;
            }
        });

        global.sock = sock;
        global.db = database;

        // Handle connection updates
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log(color('\n📱 SCAN THIS QR CODE WITH WHATSAPP:\n', 'yellow'));
                require('qrcode-terminal').generate(qr, { small: true });
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                
                if (shouldReconnect) {
                    console.log(color('🔄 Connection closed, reconnecting in 5 seconds...', 'yellow'));
                    setTimeout(connectToWhatsApp, 5000);
                } else {
                    console.log(color('❌ Connection closed. You are logged out.', 'red'));
                    // Delete old session
                    fs.removeSync(`./${config.sessionName}`);
                    console.log(color('📱 Session deleted. Restart to get new QR.', 'yellow'));
                }
            } else if (connection === 'open') {
                console.log(color('✅ Bot connected successfully!', 'green'));
                console.log(color(`🤖 Bot Name: ${config.botName}`, 'cyan'));
                console.log(color(`👑 Owner: ${config.ownerNumber}`, 'cyan'));
                console.log(color(`📝 Mode: ${config.mode}`, 'cyan'));
                console.log(color(`📊 Commands: ${commandHandler.getCommandsCount()}`, 'cyan'));
                console.log(color(`💾 Session: ${sessionExists ? 'Restored' : 'New'}`, 'cyan'));
                
                // Send online presence
                sock.sendPresenceUpdate('available');
                
                // Send startup notification to owner
                try {
                    await sock.sendMessage(config.ownerJid, {
                        text: `✅ *${config.botName}* is now online!\n\n📊 *Status:* Online\n⚡ *Mode:* ${config.mode}\n📝 *Commands:* ${commandHandler.getCommandsCount()}\n🕒 *Time:* ${new Date().toLocaleString()}\n💾 *Node:* ${process.version}\n\n_Powered by ALMEERV4_`
                    });
                } catch (e) {}
            }
        });

        // Handle credentials update
        sock.ev.on('creds.update', saveCreds);

        // Handle messages
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type === 'notify') {
                for (const msg of messages) {
                    if (!msg.message) continue;
                    
                    // Auto read messages
                    if (config.autoRead) {
                        await sock.readMessages([msg.key]);
                    }

                    // Handle message
                    await commandHandler.handleMessage(sock, msg);
                }
            }
        });

        // Handle group participants update
        sock.ev.on('group-participants.update', async (update) => {
            if (config.welcomeMsg || config.goodbyeMsg) {
                await commandHandler.handleGroupParticipants(sock, update);
            }
        });

        // Handle message delete
        sock.ev.on('messages.delete', async (deleteInfo) => {
            if (config.antiDelete) {
                await commandHandler.handleDeleteMessage(sock, deleteInfo);
            }
        });

        return sock;

    } catch (error) {
        console.log(color('❌ Connection error:', 'red'), error);
        console.log(color('🔄 Retrying in 10 seconds...', 'yellow'));
        setTimeout(connectToWhatsApp, 10000);
    }
}

// Start bot
connectToWhatsApp().catch(console.error);

// Handle errors
process.on('uncaughtException', (err) => {
    console.log(color('❌ Uncaught Exception:', 'red'), err);
    console.log(color('🔄 Continuing execution...', 'yellow'));
});

process.on('unhandledRejection', (err) => {
    console.log(color('❌ Unhandled Rejection:', 'red'), err);
    console.log(color('🔄 Continuing execution...', 'yellow'));
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log(color('\n📴 Shutting down...', 'yellow'));
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log(color('\n📴 Shutting down...', 'yellow'));
    process.exit(0);
});
