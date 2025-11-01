const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const EXPENSES_DB_ID = process.env.EXPENSES_DB_ID;

module.exports = async (req, res) => {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // 가계부 데이터 조회
            if (!EXPENSES_DB_ID) {
                return res.json([]);
            }

            const response = await notion.databases.query({
                database_id: EXPENSES_DB_ID,
                sorts: [{ timestamp: 'created_time', direction: 'descending' }]
            });

            const expenses = response.results.map(page => ({
                id: page.id,
                date: page.properties['날짜']?.date?.start || new Date().toISOString(),
                description: page.properties['내용']?.title?.[0]?.plain_text || '',
                amount: page.properties['금액']?.number || 0,
                type: page.properties['유형']?.select?.name || 'expense'
            }));

            return res.json(expenses);
        } else if (req.method === 'POST') {
            // 가계부 항목 추가
            if (!EXPENSES_DB_ID) {
                return res.status(400).json({ error: 'EXPENSES_DB_ID가 설정되지 않았습니다.' });
            }

            const { date, description, amount, type } = req.body;

            const response = await notion.pages.create({
                parent: { database_id: EXPENSES_DB_ID },
                properties: {
                    '내용': { title: [{ text: { content: description } }] },
                    '금액': { number: amount },
                    '유형': { select: { name: type } },
                    '날짜': { date: { start: date } }
                }
            });

            return res.json({ id: response.id, date, description, amount, type });
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('가계부 API 오류:', error);
        return res.status(500).json({ error: error.message });
    }
};
