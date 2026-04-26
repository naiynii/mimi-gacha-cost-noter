const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config();

let doc = null;
let masterSheet = null;
let isReady = false;

async function init() {
    if (isReady) return;

    try {
        const credentials = require('../../google-credentials.json');
        const serviceAccountAuth = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();
        
        masterSheet = doc.sheetsByTitle['Master Data'];
        if (!masterSheet) {
            masterSheet = await doc.addSheet({ headerValues: ['ID', 'Timestamp', 'Topup_Date', 'User_ID', 'Username', 'Game_Name', 'Total_Amount', 'Items_Detail', 'Remark'], title: 'Master Data' });
        }
        
        isReady = true;
        console.log(`Connected to Google Sheet: ${doc.title}`);
    } catch (error) {
        console.error('Error connecting to Google Sheets:', error);
    }
}

async function getUserGames(userId) {
    await init();
    if (!isReady || !masterSheet) return [];
    
    // Fetch all rows to extract unique games. 
    // In production with huge datasets, caching should be used.
    const rows = await masterSheet.getRows();
    const games = new Set();
    
    for (const row of rows) {
        if (row.get('User_ID') === userId && row.get('Game_Name')) {
            games.add(row.get('Game_Name'));
        }
    }
    
    return Array.from(games);
}

async function addRecord(record) {
    await init();
    if (!isReady || !masterSheet) throw new Error("Google Sheets not ready.");
    await masterSheet.addRow(record);
}

async function getSummary(userId, gameFilter = null) {
    await init();
    if (!isReady || !masterSheet) throw new Error("Google Sheets not ready.");
    
    const rows = await masterSheet.getRows();
    let total = 0;
    const items = [];

    for (const row of rows) {
        if (row.get('User_ID') === userId) {
            const rowGame = row.get('Game_Name');
            if (gameFilter && rowGame !== gameFilter) continue;
            
            total += parseFloat(row.get('Total_Amount') || 0);
            items.push({
                date: row.get('Topup_Date'),
                game: rowGame,
                amount: row.get('Total_Amount'),
                detail: row.get('Items_Detail')
            });
        }
    }

    return { total, items };
}

module.exports = { init, getUserGames, addRecord, getSummary };
