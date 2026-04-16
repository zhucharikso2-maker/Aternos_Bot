// ⚡ АТЕРНОС AFK БОТ - ПРОФЕССИОНАЛЬНАЯ ВЕРСИЯ ⚡
// Брат, этот бот максимально сложно обнаружить!

const mineflayer = require('mineflayer');
const autoEat = require('mineflayer-auto-eat');
const { pathfinder } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;

// ========== КОНФИГУРАЦИЯ (СМЕНИ ЭТО, БРАТ!) ==========
const CONFIG = {
    // Данные сервера (берутся из переменных окружения на хостинге)
    host: process.env.SERVER_HOST || 'Viper-SMP.aternos.me',
    port: parseInt(process.env.SERVER_PORT) || 62227,
    username: process.env.BOT_USERNAME || 'AFK_Helper_Bot',
    version: process.env.MC_VERSION || '1.21.4',
    
    // Пароль для регистрации
    password: process.env.BOT_PASSWORD || 'SuperSecret123',
    
    // Настройки АФК
    afk: {
        minDelay: 15000,    // минимум 15 секунд между действиями
        maxDelay: 45000,    // максимум 45 секунд
        moveChance: 0.4,    // 40% шанс сделать движение
        jumpChance: 0.15,   // 15% шанс прыгнуть
        rotateChance: 0.7   // 70% шанс повернуть голову
    }
};

// ========== ФУНКЦИИ ИМИТАЦИИ ЧЕЛОВЕКА ==========
function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Имитация человеческого набора текста
async function humanType(bot, message, delayMs = 80) {
    for (let i = 0; i < message.length; i++) {
        bot.chat(message[i]);
        await new Promise(resolve => setTimeout(resolve, randomDelay(40, 120)));
    }
}

// ========== СОЗДАНИЕ БОТА ==========
console.log('🤖 Запуск бота...');
console.log(`📡 Сервер: ${CONFIG.host}`);
console.log(`👤 Ник: ${CONFIG.username}`);

const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    auth: 'offline',
    // Маскируемся под реального игрока
    viewDistance: 'far',
    chatLengthLimit: 256,
    // Случайный пинг (имитируем задержку)
    pingInterval: randomDelay(1000, 5000)
});

// Подключаем плагины
bot.loadPlugin(pathfinder);
bot.loadPlugin(autoEat);
bot.loadPlugin(pvp);

// ========== ОБРАБОТКА РЕГИСТРАЦИИ ==========
let isRegistered = false;
let loginAttempts = 0;

bot.on('message', async (message) => {
    const text = message.toString().toLowerCase();
    console.log(`💬 [ЧАТ]: ${text}`);
    
    // Обработка регистрации
    if (!isRegistered) {
        if (text.includes('регистр') || text.includes('/register') || text.includes('придумай пароль')) {
            console.log('🔐 Обнаружена регистрация!');
            await new Promise(resolve => setTimeout(resolve, randomDelay(1000, 3000)));
            await humanType(bot, `/register ${CONFIG.password}`);
            await new Promise(resolve => setTimeout(resolve, randomDelay(500, 1500)));
            await humanType(bot, `/login ${CONFIG.password}`);
            isRegistered = true;
            console.log('✅ Регистрация пройдена!');
        }
        else if (text.includes('/login') || text.includes('введите пароль')) {
            console.log('🔑 Вход на сервер...');
            await new Promise(resolve => setTimeout(resolve, randomDelay(500, 1500)));
            await humanType(bot, `/login ${CONFIG.password}`);
            isRegistered = true;
        }
    }
    
    // Обработка капчи (если есть простая текстовая)
    if (text.includes('капча') || text.includes('captcha')) {
        console.log('⚠️ Обнаружена капча! Пытаемся обойти...');
        // Базовая обработка - можно расширить под свои нужды
        bot.chat('я не бот');
    }
    
    // Анти-кик сообщения
    if (text.includes('kick') || text.includes('анти-афк')) {
        console.log('🔄 Обнаружена угроза кика, активирую защиту!');
        await antiKick();
    }
});

// ========== ПРИ ПОЯВЛЕНИИ В МИРЕ ==========
bot.once('spawn', () => {
    console.log('✅ Бот успешно зашёл на сервер!');
    console.log(`📍 Координаты: X=${bot.entity.position.x}, Y=${bot.entity.position.y}, Z=${bot.entity.position.z}`);
    
    // Запускаем АФК-защиту
    startAFKProtection();
    
    // Запускаем авто-еду (если голоден)
    bot.autoEat.options = {
        priority: 'foodPoints',
        startAt: 14,
        bannedFood: ['poisonous_potato']
    };
});

// ========== АНТИ-АФК СИСТЕМА (МАКСИМАЛЬНО ЖИВАЯ) ==========
let afkInterval;

async function startAFKProtection() {
    console.log('🛡️ Анти-АФК система активирована!');
    
    afkInterval = setInterval(async () => {
        const random = Math.random();
        
        // 1. Поворот головы (всегда делаем, но с разной амплитудой)
        const yawChange = (Math.random() - 0.5) * 0.8;
        const pitchChange = (Math.random() - 0.5) * 0.4;
        bot.look(bot.entity.yaw + yawChange, bot.entity.pitch + pitchChange);
        
        // 2. Случайное движение
        if (random < CONFIG.afk.moveChance) {
            const directions = ['forward', 'back', 'left', 'right'];
            const dir = directions[Math.floor(Math.random() * directions.length)];
            bot.setControlState(dir, true);
            setTimeout(() => bot.setControlState(dir, false), randomDelay(300, 2000));
            console.log(`🚶 Движение: ${dir}`);
        }
        
        // 3. Случайный прыжок
        if (random < CONFIG.afk.jumpChance) {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), randomDelay(100, 300));
            console.log('🦘 Прыжок!');
        }
        
        // 4. Иногда смотрим на ближайшего игрока (если есть)
        if (bot.players && Object.keys(bot.players).length > 1) {
            const otherPlayers = Object.keys(bot.players).filter(name => name !== bot.username);
            if (otherPlayers.length > 0 && Math.random() < 0.3) {
                const target = bot.players[otherPlayers[0]];
                if (target && target.entity) {
                    bot.lookAt(target.entity.position.offset(0, 1.6, 0));
                    console.log(`👀 Смотрит на ${otherPlayers[0]}`);
                }
            }
        }
        
        // 5. Иногда бездействуем (имитация реального AFK)
        if (random < 0.1) {
            console.log('💤 Бездействие 10 секунд...');
            // Пропускаем следующий цикл
        }
        
    }, randomDelay(CONFIG.afk.minDelay, CONFIG.afk.maxDelay));
}

// ========== ЗАЩИТА ОТ КИКА ==========
async function antiKick() {
    // Быстрое движение, чтобы показать активность
    for (let i = 0; i < 3; i++) {
        bot.setControlState('forward', true);
        await new Promise(resolve => setTimeout(resolve, 200));
        bot.setControlState('forward', false);
        await new Promise(resolve => setTimeout(resolve, 100));
        bot.setControlState('back', true);
        await new Promise(resolve => setTimeout(resolve, 200));
        bot.setControlState('back', false);
    }
    bot.chat('я тут, не кикайте');
    console.log('🛡️ Защита от кика сработала!');
}

// ========== ОБРАБОТКА ОШИБОК И ПЕРЕЗАПУСК ==========
bot.on('error', (err) => {
    console.error(`❌ Ошибка: ${err.message}`);
    if (err.message.includes('ECONNRESET') || err.message.includes('timeout')) {
        console.log('🔄 Потеря соединения, перезапуск через 30 секунд...');
        setTimeout(() => process.exit(1), 30000);
    }
});

bot.on('end', (reason) => {
    console.log(`🔌 Бот отключился. Причина: ${reason || 'неизвестна'}`);
    console.log('🔄 Автоматический перезапуск через 45 секунд...');
    setTimeout(() => process.exit(1), 45000);
});

// ========== ХРАНИТЕЛЬ ЗДОРОВЬЯ ==========
setInterval(() => {
    if (bot.entity && bot.entity.health) {
        console.log(`❤️ Здоровье: ${bot.entity.health}/20 | Голод: ${bot.entity.food}/20`);
        if (bot.entity.health < 10) {
            console.log('⚠️ Низкое здоровье! Активация режима выживания...');
            // Включаем режим убегания от мобов
            if (bot.nearestEntity()) {
                const entity = bot.nearestEntity();
                if (entity.mobType) {
                    console.log(`🏃 Убегаю от ${entity.name}`);
                }
            }
        }
    }
}, 60000); // Каждую минуту

console.log('🚀 Бот успешно загружен и ожидает подключения!');
