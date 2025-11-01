const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'PUT') {
            const { items } = req.body;

            const promises = items.map((item, index) =>
                notion.pages.update({
                    page_id: item.id,
                    properties: {
                        '순서': { number: index }
                    }
                })
            );

            await Promise.all(promises);
            return res.json({ success: true });
        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('명상 순서 업데이트 오류:', error);
        return res.status(500).json({ error: error.message });
    }
};
