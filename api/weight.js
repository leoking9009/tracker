const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const WEIGHT_DB_ID = process.env.WEIGHT_DB_ID;

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
            // 몸무게 데이터 조회
            if (!WEIGHT_DB_ID) {
                return res.json([]);
            }

            const response = await notion.databases.query({
                database_id: WEIGHT_DB_ID,
                sorts: [{ property: '날짜', direction: 'ascending' }]
            });

            const weightData = response.results.map(page => ({
                id: page.id,
                date: page.properties['날짜']?.date?.start || '',
                weight: page.properties['몸무게']?.number || 0
            }));

            return res.json(weightData);
        } else if (req.method === 'POST') {
            // 몸무게 데이터 추가
            if (!WEIGHT_DB_ID) {
                return res.status(400).json({ error: 'WEIGHT_DB_ID가 설정되지 않았습니다.' });
            }

            const { date, weight } = req.body;

            // 같은 날짜가 있는지 확인
            const existing = await notion.databases.query({
                database_id: WEIGHT_DB_ID,
                filter: {
                    property: '날짜',
                    date: { equals: date }
                }
            });

            if (existing.results.length > 0) {
                // 업데이트
                const response = await notion.pages.update({
                    page_id: existing.results[0].id,
                    properties: {
                        '몸무게': { number: weight }
                    }
                });
                return res.json({ id: response.id, date, weight });
            } else {
                // 새로 추가
                const response = await notion.pages.create({
                    parent: { database_id: WEIGHT_DB_ID },
                    properties: {
                        '이름': { title: [{ text: { content: date } }] },
                        '날짜': { date: { start: date } },
                        '몸무게': { number: weight }
                    }
                });
                return res.json({ id: response.id, date, weight });
            }
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('몸무게 API 오류:', error);
        return res.status(500).json({ error: error.message });
    }
};
