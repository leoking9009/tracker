const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const MEDITATION_DB_ID = process.env.MEDITATION_DB_ID;

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
            // 명상 리스트 조회
            if (!MEDITATION_DB_ID) {
                return res.json([]);
            }

            const response = await notion.databases.query({
                database_id: MEDITATION_DB_ID,
                sorts: [{ property: '순서', direction: 'ascending' }]
            });

            const meditationList = response.results.map((page, index) => ({
                id: page.id,
                text: page.properties['내용']?.title?.[0]?.plain_text || '',
                order: page.properties['순서']?.number || index
            }));

            return res.json(meditationList);
        } else if (req.method === 'POST') {
            // 명상 항목 추가
            if (!MEDITATION_DB_ID) {
                return res.status(400).json({ error: 'MEDITATION_DB_ID가 설정되지 않았습니다.' });
            }

            const { text, order } = req.body;

            const response = await notion.pages.create({
                parent: { database_id: MEDITATION_DB_ID },
                properties: {
                    '내용': { title: [{ text: { content: text } }] },
                    '순서': { number: order }
                }
            });

            return res.json({ id: response.id, text, order });
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('명상 API 오류:', error);
        return res.status(500).json({ error: error.message });
    }
};
