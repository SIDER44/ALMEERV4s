const fs = require('fs-extra');
const path = require('path');
const config = require('../config');
const database = require('./database');
const color = require('./color');

class CommandHandler {
    constructor() {
        this.commands = new Map();
        this.aliases = new Map();
        this.cooldowns = new Map();
        this.categories = [];
        this.loadCommands();
    }

    loadCommands() {
        const commandsPath = path.join(__dirname, '../commands');
        const categories = fs.readdirSync(commandsPath);

        categories.forEach(category => {
            const categoryPath = path.join(commandsPath, category);
            if (fs.statSync(categoryPath).isDirectory()) {
                this.categories.push(category);
                
                const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
                
                commandFiles.forEach(file => {
                    try {
                        const command = require(path.join(categoryPath, file));
                        
                        // Register command
                        this.commands.set(command.name, {
                            ...command,
                            category,
                            path: path.join(categoryPath, file)
                        });
                        
                        // Register aliases
                        if (command.aliases && Array.isArray(command.aliases)) {
                            command.aliases.forEach(alias => {
                                this.aliases.set(alias, command.name);
                            });
                        }
                        
                        console.log(color(`✓ Loaded: ${command.name} (${category})`, 'green'));
                    } catch (error) {
                        console.log(color(`✗ Failed to load ${file}: ${error.message}`, 'red'));
                    }
                });
            }
        });

        console.log(color(`\n📊 Total: ${this.commands.size} commands from ${this.categories.length} categories\n`, 'cyan'));
    }

    getCommand(name) {
        const cmdName = this.aliases.get(name) || name;
        return this.commands.get(cmdName);
    }

    async handleMessage(sock, msg) {
        try {
            const { key, message } = msg;
            const from = key.remoteJid;
            const sender = key.participant || from;
            const pushName = msg.pushName || 'User';
            const isGroup = from.endsWith('@g.us');
            const senderNumber = sender.split('@')[0];

            // Get message content
            let body = '';
            const messageType = Object.keys(message)[0];
            
            if (messageType === 'conversation') {
                body = message.conversation || '';
            } else if (messageType === 'extendedTextMessage') {
                body = message.extendedTextMessage.text || '';
            } else if (messageType === 'imageMessage') {
                body = message.imageMessage.caption || '';
            } else if (messageType === 'videoMessage') {
                body = message.videoMessage.caption || '';
            }

            // Check prefix
            const prefix = config.prefix;
            if (!body.startsWith(prefix)) return;

            // Parse command
            const args = body.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = this.getCommand(commandName);

            if (!command) return;

            // Get user data
            const user = database.getUser(sender);

            // Check if user is banned
            if (user.banned) {
                return await sock.sendMessage(from, {
                    text: `❌ You are banned from using this bot.\nReason: ${user.banReason || 'No reason provided'}`
                });
            }

            // Check cooldown
            const cooldownKey = `${sender}_${command.name}`;
            const cooldown = this.cooldowns.get(cooldownKey);
            
            if (cooldown && Date.now() - cooldown < (command.cooldown || config.cooldown.default) * 1000) {
                const timeLeft = ((command.cooldown || config.cooldown.default) * 1000 - (Date.now() - cooldown)) / 1000;
                return await sock.sendMessage(from, {
                    text: `⏳ Please wait ${timeLeft.toFixed(1)}s before using this command again.`
                }, { quoted: msg });
            }

            // Check permissions
            if (command.owner && senderNumber !== config.ownerNumber) {
                return await sock.sendMessage(from, {
                    text: '❌ This command is only for the bot owner!'
                }, { quoted: msg });
            }

            if (command.admin && isGroup) {
                const group = database.getGroup(from);
                const isAdmin = await this.isAdmin(sock, from, sender);
                if (!isAdmin) {
                    return await sock.sendMessage(from, {
                        text: '❌ This command is only for group admins!'
                    }, { quoted: msg });
                }
            }

            if (command.group && !isGroup) {
                return await sock.sendMessage(from, {
                    text: '❌ This command can only be used in groups!'
                }, { quoted: msg });
            }

            if (command.nsfw && !config.nsfw) {
                const group = database.getGroup(from);
                if (!group.nsfw) {
                    return await sock.sendMessage(from, {
                        text: '❌ NSFW is disabled in this group!'
                    }, { quoted: msg });
                }
            }

            if (command.premium && !database.checkPremium(sender)) {
                return await sock.sendMessage(from, {
                    text: '❌ This command is only for premium users!\nUse .buyprem to get premium.'
                }, { quoted: msg });
            }

            // Check group mute
            if (isGroup) {
                const group = database.getGroup(from);
                if (group.mute && senderNumber !== config.ownerNumber && !await this.isAdmin(sock, from, sender)) {
                    return;
                }
            }

            // Set cooldown
            this.cooldowns.set(cooldownKey, Date.now());

            // Update user stats
            user.totalCmd = (user.totalCmd || 0) + 1;
            database.updateUser(sender, user);

            // Log command
            console.log(color(`[CMD] ${commandName} from ${senderNumber} in ${isGroup ? from.split('@')[0] : 'PM'}`, 'yellow'));

            // Execute command
            try {
                await command.execute(sock, msg, args, {
                    from,
                    sender,
                    pushName,
                    isGroup,
                    user,
                    db: database,
                    config,
                    prefix
                });
            } catch (error) {
                console.log(color(`[ERROR] ${commandName}: ${error.message}`, 'red'));
                await sock.sendMessage(from, {
                    text: '❌ An error occurred while executing the command.'
                }, { quoted: msg });
            }

        } catch (error) {
            console.log(color('[ERROR] ' + error.message, 'red'));
        }
    }

    async isAdmin(sock, groupId, userId) {
        try {
            const group = await sock.groupMetadata(groupId);
            const participant = group.participants.find(p => p.id === userId);
            return participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch {
            return false;
        }
    }

    async handleGroupParticipants(sock, update) {
        const { id, participants, action } = update;
        const group = database.getGroup(id);

        if (action === 'add' && group.welcome) {
            for (const participant of participants) {
                const name = participant.split('@')[0];
                const groupMetadata = await sock.groupMetadata(id);
                const welcomeText = `👋 Welcome @${name} to *${groupMetadata.subject}*!\n\n📝 Read the group description and enjoy!`;
                
                await sock.sendMessage(id, {
                    text: welcomeText,
                    mentions: [participant]
                });
            }
        } else if (action === 'remove' && group.goodbye) {
            for (const participant of participants) {
                const name = participant.split('@')[0];
                const goodbyeText = `👋 Goodbye @${name}, we'll miss you!`;
                
                await sock.sendMessage(id, {
                    text: goodbyeText,
                    mentions: [participant]
                });
            }
        }
    }

    async handleDeleteMessage(sock, deleteInfo) {
        const { id: chatId, fromMe, participant, remoteJid } = deleteInfo.keys[0];
        
        if (!fromMe && remoteJid.endsWith('@g.us')) {
            const group = database.getGroup(remoteJid);
            if (group.antiDelete) {
                await sock.sendMessage(remoteJid, {
                    text: `⚠️ @${participant.split('@')[0]} deleted a message!`,
                    mentions: [participant]
                });
            }
        }
    }

    getCommandsCount() {
        return this.commands.size;
    }
}

module.exports = new CommandHandler();