const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const HABITS_DB_ID = process.env.HABITS_DB_ID;

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
            // 습관 데이터 조회
            if (!HABITS_DB_ID) {
                return res.json({
                    bike: { checked: false, streak: 0, lastDate: null },
                    meditation: { checked: false, streak: 0, lastDate: null }
                });
            }

            const response = await notion.databases.query({
                database_id: HABITS_DB_ID,
                sorts: [{ timestamp: 'created_time', direction: 'descending' }],
                page_size: 1
            });

            if (response.results.length > 0) {
                const page = response.results[0];
                const habits = {
                    bike: {
                        checked: page.properties['자전거체크']?.checkbox || false,
                        streak: page.properties['자전거연속']?.number || 0,
                        lastDate: page.properties['자전거날짜']?.rich_text?.[0]?.plain_text || null
                    },
                    meditation: {
                        checked: page.properties['명상체크']?.checkbox || false,
                        streak: page.properties['명상연속']?.number || 0,
                        lastDate: page.properties['명상날짜']?.rich_text?.[0]?.plain_text || null
                    }
                };
                return res.json(habits);
            } else {
                return res.json({
                    bike: { checked: false, streak: 0, lastDate: null },
                    meditation: { checked: false, streak: 0, lastDate: null }
                });
            }
        } else if (req.method === 'POST') {
            // 습관 데이터 저장
            if (!HABITS_DB_ID) {
                return res.status(400).json({ error: 'HABITS_DB_ID가 설정되지 않았습니다.' });
            }

            const { habits } = req.body;

            await notion.pages.create({
                parent: { database_id: HABITS_DB_ID },
                properties: {
                    '이름': { title: [{ text: { content: new Date().toISOString().split('T')[0] } }] },
                    '자전거체크': { checkbox: habits.bike.checked },
                    '자전거연속': { number: habits.bike.streak },
                    '자전거날짜': { rich_text: [{ text: { content: habits.bike.lastDate || '' } }] },
                    '명상체크': { checkbox: habits.meditation.checked },
                    '명상연속': { number: habits.meditation.streak },
                    '명상날짜': { rich_text: [{ text: { content: habits.meditation.lastDate || '' } }] }
                }
            });

            return res.json({ success: true });
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('습관 API 오류:', error);
        return res.status(500).json({ error: error.message });
    }
};
