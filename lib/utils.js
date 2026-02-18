const axios = require('axios');
const fs = require('fs-extra');
const config = require('../config');

module.exports = {
    // Format time
    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
    },

    // Format number
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // Get random
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    // Sleep
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Check URL
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    },

    // Shorten URL
    async shortenUrl(url) {
        try {
            const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
            return response.data;
        } catch {
            return url;
        }
    },

    // Get file extension
    getExtension(mime) {
        const mimeTypes = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'video/mp4': 'mp4',
            'audio/mpeg': 'mp3',
            'audio/ogg': 'ogg'
        };
        return mimeTypes[mime] || 'bin';
    },

    // Get greeting
    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    },

    // Format bytes
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Parse mentioned
    getMentions(text) {
        const mentions = [];
        const regex = /@(\d+)/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            mentions.push(match[1] + '@s.whatsapp.net');
        }
        return mentions;
    },

    // Fetch with timeout
    async fetch(url, options = {}, timeout = 10000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await axios({
                url,
                signal: controller.signal,
                ...options
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    },

    // Check if admin
    async isAdmin(sock, groupId, userId) {
        try {
            const group = await sock.groupMetadata(groupId);
            const participant = group.participants.find(p => p.id === userId);
            return participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch {
            return false;
        }
    }
};