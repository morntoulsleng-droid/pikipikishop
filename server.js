require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const fs = require('fs');
const path = require('path');

const BOT_TOKEN = process.env.BOT_TOKEN || '8583374127:AAG18j9SqODa1w8qZo_ZVtDOrq81co7dbPs';
const ADMIN_ID = process.env.ADMIN_ID || '123456789';
const bot = new Telegraf(BOT_TOKEN);
const app = express();

app.use(express.json({ limit: '10mb' }));

const WEB_APP_URL = 'https://morntoulsleng-droid.github.io/pikipikishop/index.html';

function getStock() {
    const filePath = path.join(__dirname, 'stock.json');
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({
            "Roblox Mod (1 ថ្ងៃ)": ["RBX-1D-AAA111", "RBX-1D-BBB222"],
            "Roblox Mod (7 ថ្ងៃ)": ["RBX-7D-XXX999"],
            "Free Fire VIP Key (30 ថ្ងៃ)": ["FF-VIP-ABC123"]
        }, null, 2));
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function consumeKey(itemType) {
    let stock = getStock();
    if (stock[itemType] && stock[itemType].length > 0) {
        const key = stock[itemType].shift();
        fs.writeFileSync(path.join(__dirname, 'stock.json'), JSON.stringify(stock, null, 2));
        return key;
    }
    return null;
}

bot.start((ctx) => {
    ctx.reply(
        '🔥 **សូមស្វាគមន៍មកកាន់ PikiPiki Shop!**\n\nជ្រើសរើសទំនិញតាម Mini App ខាងក្រោម៖',
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.webApp('🛒 បើកហាង (Mini App)', WEB_APP_URL)]
            ])
        }
    );
});

bot.command('addstock', (ctx) => {
    if (String(ctx.from.id) !== String(ADMIN_ID)) {
        return ctx.reply('⛔ អ្នកគ្មានសិទ្ធិប្រើប្រាស់คำสั่งនេះទេ។');
    }
    
    const text = ctx.message.text.replace('/addstock', '').trim();
    const parts = text.split('|');
    if (parts.length < 2) {
        return ctx.reply('⚠️ ទម្រង់ខុស! ប្រើឧទាហរណ៍៖\n`/addstock Roblox Mod (1 ថ្ងៃ) | RBX-1D-NEW001`', { parse_mode: 'Markdown' });
    }

    const itemType = parts[0].trim();
    const newKey = parts.trim(); // Fixed index

    let stock = getStock();
    if (!stock[itemType]) stock[itemType] = [];
    stock[itemType].push(newKey);
    fs.writeFileSync(path.join(__dirname, 'stock.json'), JSON.stringify(stock, null, 2));

    ctx.reply(`✅ បានបន្ថែម Key \`${newKey}\` ចូលទៅក្នុង stock *${itemType}* រួចរាល់!`, { parse_mode: 'Markdown' });
});

bot.on('web_app_data', async (ctx) => {
    try {
        const data = JSON.parse(ctx.webAppData.data);
        const user = ctx.from;
        
        const userMention = user.username 
            ? `@${user.username}` 
            : `[${user.first_name}](tg://user?id=${user.id})`;

        const assignedKey = consumeKey(data.item);

        if (!assignedKey) {
            return ctx.reply(
                `❌ **សូមអភ័យទោស!** ${userMention}\nទំនិញ *${data.item}* ប្រస్తుមានអស់ Stock ហើយ។ សូមទាក់ទង Admin។`,
                { parse_mode: 'Markdown' }
            );
        }

        const reportText = 
            `✅ **ការបញ្ជាទិញ & បង់ប្រាក់ជោគជ័យ!**\n\n` +
            `👤 អតិថិជន: ${userMention}\n` +
            `📝 ឈ្មោះកត់ត្រា: *${data.name}*\n` +
            `📅 ថ្ងៃខែ: *${data.date}*\n` +
            `📦 ទំនិញ: *${data.item}*\n` +
            `💰 តម្លៃ: *$${data.price}*\n` +
            `🔑 Key របស់អ្នក: \`${assignedKey}\`\n\n` +
            `⚠️ សូមរក្សាទុក Key នេះកុំឱ្យបាត់!`;

        if (data.slipBase64) {
            const base64Data = data.slipBase64.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            await ctx.replyWithPhoto({ source: buffer }, { 
                caption: reportText, 
                parse_mode: 'Markdown' 
            });
        } else {
            await ctx.reply(reportText, { parse_mode: 'Markdown' });
        }

    } catch (e) {
        console.error(e);
        ctx.reply('❌ មានកំហុសក្នុងការកែច្នៃទិន្នន័យ។');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Server running on port ${PORT}`);
});

bot.launch().then(() => {
    console.log('🤖 Bot is online with payment slip system!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
