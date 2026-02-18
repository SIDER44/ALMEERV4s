const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

class Database {
    constructor() {
        this.data = {};
        this.paths = config.dbPath;
    }

    init() {
        // Create database directory
        fs.ensureDirSync('./database');
        
        // Initialize all JSON files
        Object.keys(this.paths).forEach(key => {
            const filePath = this.paths[key];
            if (!fs.existsSync(filePath)) {
                fs.writeJsonSync(filePath, {});
                this.data[key] = {};
            } else {
                try {
                    this.data[key] = fs.readJsonSync(filePath);
                } catch {
                    this.data[key] = {};
                    fs.writeJsonSync(filePath, {});
                }
            }
        });
    }

    save(type) {
        if (!this.paths[type]) return;
        fs.writeJsonSync(this.paths[type], this.data[type], { spaces: 2 });
    }

    // User methods
    getUser(jid) {
        if (!this.data.users) this.data.users = {};
        if (!this.data.users[jid]) {
            this.data.users[jid] = {
                jid,
                name: '',
                level: 1,
                xp: 0,
                limit: config.limits.daily,
                premium: false,
                premiumExpiry: null,
                banned: false,
                afk: false,
                afkReason: '',
                afkTime: null,
                registered: Date.now(),
                lastSeen: Date.now(),
                totalCmd: 0,
                warn: 0
            };
            this.save('users');
        }
        return this.data.users[jid];
    }

    updateUser(jid, data) {
        const user = this.getUser(jid);
        this.data.users[jid] = { ...user, ...data, lastSeen: Date.now() };
        this.save('users');
    }

    // Group methods
    getGroup(jid) {
        if (!this.data.groups) this.data.groups = {};
        if (!this.data.groups[jid]) {
            this.data.groups[jid] = {
                jid,
                name: '',
                welcome: config.welcomeMsg,
                goodbye: config.goodbyeMsg,
                antiLink: config.antiLink,
                antiDelete: config.antiDelete,
                nsfw: false,
                mute: false,
                members: {},
                settings: {
                    events: true,
                    levelup: true
                }
            };
            this.save('groups');
        }
        return this.data.groups[jid];
    }

    updateGroup(jid, data) {
        const group = this.getGroup(jid);
        this.data.groups[jid] = { ...group, ...data };
        this.save('groups');
    }

    // Economy methods
    getEconomy(jid) {
        if (!this.data.economy) this.data.economy = {};
        if (!this.data.economy[jid]) {
            this.data.economy[jid] = {
                wallet: 1000,
                bank: 0,
                daily: 0,
                lastDaily: null,
                lastWork: null,
                lastRob: null,
                inventory: [],
                job: null
            };
            this.save('economy');
        }
        return this.data.economy[jid];
    }

    updateEconomy(jid, data) {
        const eco = this.getEconomy(jid);
        this.data.economy[jid] = { ...eco, ...data };
        this.save('economy');
    }

    // RPG methods
    getRPG(jid) {
        if (!this.data.rpg) this.data.rpg = {};
        if (!this.data.rpg[jid]) {
            this.data.rpg[jid] = {
                health: 100,
                maxHealth: 100,
                mana: 50,
                maxMana: 50,
                exp: 0,
                level: 1,
                gold: 0,
                inventory: [],
                weapon: null,
                armor: null,
                dungeon: null
            };
            this.save('rpg');
        }
        return this.data.rpg[jid];
    }

    updateRPG(jid, data) {
        const rpg = this.getRPG(jid);
        this.data.rpg[jid] = { ...rpg, ...data };
        this.save('rpg');
    }

    // Premium methods
    addPremium(jid, days) {
        const user = this.getUser(jid);
        const expiry = Date.now() + (days * 24 * 60 * 60 * 1000);
        user.premium = true;
        user.premiumExpiry = expiry;
        this.updateUser(jid, user);
    }

    removePremium(jid) {
        const user = this.getUser(jid);
        user.premium = false;
        user.premiumExpiry = null;
        this.updateUser(jid, user);
    }

    checkPremium(jid) {
        const user = this.getUser(jid);
        if (!user.premium) return false;
        if (user.premiumExpiry && user.premiumExpiry < Date.now()) {
            this.removePremium(jid);
            return false;
        }
        return true;
    }

    // Ban methods
    banUser(jid, reason = '') {
        const user = this.getUser(jid);
        user.banned = true;
        user.banReason = reason;
        user.banTime = Date.now();
        this.updateUser(jid, user);
    }

    unbanUser(jid) {
        const user = this.getUser(jid);
        user.banned = false;
        user.banReason = '';
        user.banTime = null;
        this.updateUser(jid, user);
    }

    // Settings methods
    getSettings() {
        if (!this.data.settings) {
            this.data.settings = {
                prefix: config.prefix,
                mode: config.mode,
                nsfw: config.nsfw
            };
            this.save('settings');
        }
        return this.data.settings;
    }

    updateSettings(data) {
        const settings = this.getSettings();
        this.data.settings = { ...settings, ...data };
        this.save('settings');
    }
}

module.exports = new Database();