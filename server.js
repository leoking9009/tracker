const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Notion 클라이언트 초기화
const notion = new Client({ auth: process.env.NOTION_TOKEN });

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 노션 데이터베이스 ID들 (나중에 설정 필요)
let HABITS_DB_ID = process.env.HABITS_DB_ID;
let MEDITATION_DB_ID = process.env.MEDITATION_DB_ID;
let WEIGHT_DB_ID = process.env.WEIGHT_DB_ID;
let EXPENSES_DB_ID = process.env.EXPENSES_DB_ID;

// ==================== 습관 트래커 API ====================

// 습관 데이터 조회
app.get('/api/habits', async (req, res) => {
    try {
        if (!HABITS_DB_ID) {
            return res.json({ bike: { checked: false, streak: 0, lastDate: null }, meditation: { checked: false, streak: 0, lastDate: null } });
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
            res.json(habits);
        } else {
            res.json({ bike: { checked: false, streak: 0, lastDate: null }, meditation: { checked: false, streak: 0, lastDate: null } });
        }
    } catch (error) {
        console.error('습관 조회 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 습관 데이터 저장/업데이트
app.post('/api/habits', async (req, res) => {
    try {
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

        res.json({ success: true });
    } catch (error) {
        console.error('습관 저장 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== 명상 리스트 API ====================

// 명상 리스트 조회
app.get('/api/meditation', async (req, res) => {
    try {
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

        res.json(meditationList);
    } catch (error) {
        console.error('명상 조회 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 명상 항목 추가
app.post('/api/meditation', async (req, res) => {
    try {
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

        res.json({ id: response.id, text, order });
    } catch (error) {
        console.error('명상 추가 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 명상 항목 삭제
app.delete('/api/meditation/:id', async (req, res) => {
    try {
        await notion.pages.update({
            page_id: req.params.id,
            archived: true
        });

        res.json({ success: true });
    } catch (error) {
        console.error('명상 삭제 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 명상 순서 업데이트
app.put('/api/meditation/reorder', async (req, res) => {
    try {
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
        res.json({ success: true });
    } catch (error) {
        console.error('명상 순서 업데이트 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== 몸무게 API ====================

// 몸무게 데이터 조회
app.get('/api/weight', async (req, res) => {
    try {
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

        res.json(weightData);
    } catch (error) {
        console.error('몸무게 조회 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 몸무게 데이터 추가
app.post('/api/weight', async (req, res) => {
    try {
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
            res.json({ id: response.id, date, weight });
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
            res.json({ id: response.id, date, weight });
        }
    } catch (error) {
        console.error('몸무게 추가 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== 가계부 API ====================

// 가계부 데이터 조회
app.get('/api/expenses', async (req, res) => {
    try {
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

        res.json(expenses);
    } catch (error) {
        console.error('가계부 조회 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 가계부 항목 추가
app.post('/api/expenses', async (req, res) => {
    try {
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

        res.json({ id: response.id, date, description, amount, type });
    } catch (error) {
        console.error('가계부 추가 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 가계부 항목 삭제
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        await notion.pages.update({
            page_id: req.params.id,
            archived: true
        });

        res.json({ success: true });
    } catch (error) {
        console.error('가계부 삭제 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== 데이터베이스 설정 API ====================

// 데이터베이스 ID 설정
app.post('/api/setup', async (req, res) => {
    try {
        const { habitsDbId, meditationDbId, weightDbId, expensesDbId } = req.body;

        HABITS_DB_ID = habitsDbId;
        MEDITATION_DB_ID = meditationDbId;
        WEIGHT_DB_ID = weightDbId;
        EXPENSES_DB_ID = expensesDbId;

        res.json({ success: true, message: '데이터베이스 ID가 설정되었습니다.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`브라우저에서 http://localhost:${PORT}/habit-tracker.html 을 열어보세요.`);
});
