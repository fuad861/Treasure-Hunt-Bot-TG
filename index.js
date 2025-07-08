const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const TOKEN = '7706724138:AAE_twVLHwe0RPEoHKWv0sfhoUM3mIkUOcM';

const bot = new TelegramBot(TOKEN, { polling: true });

bot.on('polling_error', (error) => {
    console.error('Polling xətası:', error.code, error.message, error.stack);
});

const userData = {};
const leaderboard = fs.existsSync('leaderboard.json') ? JSON.parse(fs.readFileSync('leaderboard.json')) : [];

function showGrid(chatId) {
    const data = userData[chatId];
    const size = data ? data.gridSize : 5;
    if (!data || !Array.isArray(data.guesses)) {
        let grid = '📍 Xəritə:\n';
        for (let y = 1; y <= size; y++) {
            for (let x = 1; x <= size; x++) {
                grid += '⬜ ';
            }
            grid += '\n';
        }
        return grid;
    }
    let grid = `📍 ${size}x${size} xəritə:\n`;
    for (let y = 1; y <= size; y++) {
        for (let x = 1; x <= size; x++) {
            if (data.treasure.x === x && data.treasure.y === y && data.guesses.some(g => g.x === x && g.y === y)) {
                grid += '✔️ ';
            } else {
                grid += data.guesses.some(g => g.x === x && g.y === y) ? '❌ ' : '⬜ ';
            }
        }
        grid += '\n';
    }
    return grid;
}

function getHint(guessX, guessY, treasureX, treasureY) {
    const distance = Math.sqrt((guessX - treasureX) ** 2 + (guessY - treasureY) ** 2);
    if (distance === 0) return '';
    if (distance < 1.5) return '🔥 Çox isti!';
    if (distance < 2.5) return '🌡️ İsti!';
    if (distance < 3.5) return '😐 Soyuq.';
    return '❄️ Çox soyuq!';
}

function checkTimeLimit(chatId) {
    const data = userData[chatId];
    if (!data || !data.lastGuessTime) return true;
    const now = Date.now();
    const timeDiff = (now - data.lastGuessTime) / 1000; // Saniyələrlə
    return timeDiff <= 30; // 30 saniyə limit
}

bot.onText(/\/start(?:\s+(small|medium|large))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const sizeOption = match && match[1] ? match[1] : 'small';
    const size = sizeOption === 'large' ? 9 : sizeOption === 'medium' ? 7 : 5;
    const maxAttempts = size === 9 ? 20 : size === 7 ? 15 : 10;

    userData[chatId] = {
        treasure: { x: Math.floor(Math.random() * size) + 1, y: Math.floor(Math.random() * size) + 1 },
        guesses: [],
        attempts: 0,
        maxAttempts: maxAttempts,
        gridSize: size,
        lastGuessTime: null,
        isGroup: msg.chat.type !== 'private'
    };
    console.log(`Oyun başladı: İstifadəçi ${chatId}, Xəzinə: (${userData[chatId].treasure.x}, ${userData[chatId].treasure.y}), Xəritə: ${size}x${size}`);
    bot.sendMessage(chatId, `🏴‍☠️ Xəzinə Axtarışına xoş gəldin! ${size}x${size} xəritədə xəzinəni tap. Koordinatları "x y" formatında yaz (məsələn, "3 4"). Cəhdlərin: ${maxAttempts}, hər cəhdə 30 saniyə vaxtın var! Başla!\n${showGrid(chatId)}`);
});

bot.onText(/^(?!\/)(\d+)\s(\d+)$|\/guess/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!userData[chatId]) {
        bot.sendMessage(chatId, 'Əvvəlcə /start ilə oyunu başla! 🏴‍☠️');
        return;
    }

    if (userData[chatId].isGroup) {
        if (!userData[chatId].players) userData[chatId].players = {};
        if (!userData[chatId].players[userId]) {
            userData[chatId].players[userId] = { attempts: 0, guesses: [] };
        }
    }

    if (!checkTimeLimit(chatId)) {
        bot.sendMessage(chatId, '⏰ 30 saniyəlik vaxt limitini keçdin! Yeni cəhd üçün təxmin yaz.');
        userData[chatId].lastGuessTime = Date.now();
        return;
    }

    let x, y;
    try {
        if (match) {
            x = parseInt(match[1]);
            y = parseInt(match[2]);
            console.log(`İstifadəçi ${userId} (Çat ${chatId}) koordinat daxil etdi: (${x}, ${y})`);
        } else {
            throw new Error('Format səhvdir!');
        }
        const size = userData[chatId].gridSize;
        if (x < 1 || x > size || y < 1 || y > size) throw new Error(`Koordinatlar 1-${size} arasında olmalıdır!`);
        
        const guesses = userData[chatId].isGroup ? userData[chatId].players[userId].guesses : userData[chatId].guesses;
        if (guesses.some(g => g.x === x && g.y === y)) throw new Error('Bu koordinatı artıq sınaqdan keçirdin!');
    } catch (error) {
        bot.sendMessage(chatId, `❌ Səhv: ${error.message} Koordinatları "x y" formatında yaz (məsələn, "3 4").`);
        return;
    }

    const data = userData[chatId].isGroup ? userData[chatId].players[userId] : userData[chatId];
    data.attempts += 1;
    data.guesses.push({ x, y });
    userData[chatId].lastGuessTime = Date.now();

    const { treasure, maxAttempts } = userData[chatId];
    if (x === treasure.x && y === treasure.y) {
        const score = maxAttempts - data.attempts + 1;
        leaderboard.push({ userId, score, gridSize: userData[chatId].gridSize });
        fs.writeFileSync('leaderboard.json', JSON.stringify(leaderboard));
        bot.sendMessage(chatId, `🪙🎉 Təbrik edirəm! Xəzinəni ${data.attempts} cəhddə tapdın! Xal: ${score}\nYenidən oynamaq üçün /start yaz.\n${showGrid(chatId)}`);
        delete userData[chatId];
    } else {
        const hint = getHint(x, y, treasure.x, treasure.y);
        const remaining = maxAttempts - data.attempts;
        bot.sendMessage(chatId, `${showGrid(chatId)}\n${hint}\nQalan cəhdlər: ${remaining}`);
        if (remaining === 0) {
            bot.sendMessage(chatId, `😢 Oyun bitdi! Xəzinə (${treasure.x}, ${treasure.y}) idi. Yenidən oynamaq üçün /start yaz.\n${showGrid(chatId)}`);
            delete userData[chatId];
        }
    }
});

bot.onText(/\/stop/, (msg) => {
    const chatId = msg.chat.id;
    if (userData[chatId]) {
        bot.sendMessage(chatId, '🛑 Oyun dayandırıldı. Yenidən başlamaq üçün /start yaz.');
        delete userData[chatId];
    } else {
        bot.sendMessage(chatId, 'Aktiv oyun yoxdur! 🏴‍☠️');
    }
});

bot.onText(/\/leaderboard/, (msg) => {
    const chatId = msg.chat.id;
    if (leaderboard.length === 0) {
        bot.sendMessage(chatId, '🏆 Liderlər cədvəli boşdur!');
        return;
    }
    const top = leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((entry, idx) => `${idx + 1}. İstifadəçi ${entry.userId} (${entry.gridSize}x${entry.gridSize}): ${entry.score} xal`)
        .join('\n');
    bot.sendMessage(chatId, `🏆 Liderlər:\n${top}`);
});

bot.onText(/\/info/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `🏴‍☠️ **Xəzinə Axtarışı Məlumat Lövhəsi** 🪙\n\n` +
        `**Oyun qaydaları**:\n` +
        `- Xəzinəni xəritədə tapmaq üçün "x y" formatında koordinatlar daxil et (məsələn, "3 4").\n` +
        `- İpucları: "Çox isti!", "İsti!", "Soyuq.", "Çox soyuq!" məsafəyə görə verilir.\n` +
        `- Hər cəhdə 30 saniyə vaxtın var.\n` +
        `- Səhv təxminlər ❌, xəzinə ✔️ ilə işarələnir.\n\n` +
        `**Xəritə ölçüləri**:\n` +
        `- /start small: 5x5 xəritə, 10 cəhd\n` +
        `- /start medium: 7x7 xəritə, 15 cəhd\n` +
        `- /start large: 9x9 xəritə, 20 cəhd\n\n` +
        `**Əmrlər**:\n` +
        `- /start [small|medium|large]: Oyunu başla\n` +
        `- /stop: Oyunu dayandır\n` +
        `- /leaderboard: Ən yaxşı nəticələri gör\n` +
        `- /info: Bu məlumat lövhəsini göstər`);
});

console.log('Bot işə düşdü... 🏴‍☠️');
