# 노션 데이터베이스 설정 가이드

이 가이드는 습관 트래커 앱을 노션 데이터베이스와 연동하는 방법을 설명합니다.

## 1. 노션 데이터베이스 생성

노션에서 4개의 데이터베이스를 생성해야 합니다.

### 1.1 습관 데이터베이스 (Habits Database)

새 데이터베이스를 만들고 다음 속성들을 추가하세요:

- **이름** (Title) - 날짜를 기록
- **자전거체크** (Checkbox)
- **자전거연속** (Number)
- **자전거날짜** (Text)
- **명상체크** (Checkbox)
- **명상연속** (Number)
- **명상날짜** (Text)

### 1.2 명상 리스트 데이터베이스 (Meditation Database)

- **내용** (Title) - 명상 내용
- **순서** (Number) - 순서 정렬용

### 1.3 몸무게 데이터베이스 (Weight Database)

- **이름** (Title) - 날짜 문자열
- **날짜** (Date)
- **몸무게** (Number)

### 1.4 가계부 데이터베이스 (Expenses Database)

- **내용** (Title) - 지출/수입 내용
- **금액** (Number)
- **유형** (Select) - 옵션: "income", "expense"
- **날짜** (Date)

## 2. 노션 Integration 생성

1. https://www.notion.so/my-integrations 접속
2. "+ New integration" 클릭
3. 이름 설정 (예: "Habit Tracker")
4. Capabilities에서 다음 권한 선택:
   - ✅ Read content
   - ✅ Update content
   - ✅ Insert content
5. "Submit" 클릭
6. **Internal Integration Token 복사** (ntn_으로 시작)

## 3. 데이터베이스에 Integration 연결

각 데이터베이스마다:
1. 데이터베이스 페이지 열기
2. 우측 상단 "..." 메뉴 클릭
3. "Add connections" 선택
4. 생성한 Integration 선택

## 4. 데이터베이스 ID 확인

각 데이터베이스의 ID를 확인합니다:

데이터베이스 페이지 URL 예시:
```
https://www.notion.so/1234567890abcdef1234567890abcdef?v=...
                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                      이 부분이 Database ID입니다
```

## 5. 환경 변수 설정

`.env` 파일을 열고 다음 내용을 추가/수정하세요:

```env
NOTION_TOKEN=your_notion_integration_token_here
HABITS_DB_ID=your_habits_database_id
MEDITATION_DB_ID=your_meditation_database_id
WEIGHT_DB_ID=your_weight_database_id
EXPENSES_DB_ID=your_expenses_database_id
PORT=3000
```

각 `your_xxx_database_id`를 실제 데이터베이스 ID로 교체하세요.

## 6. 서버 실행

### 패키지 설치
```bash
npm install
```

### 서버 시작
```bash
npm start
```

또는 개발 모드 (자동 재시작):
```bash
npm run dev
```

## 7. 웹앱 접속

브라우저에서 다음 주소로 접속:
```
http://localhost:3000/habit-tracker.html
```

기본 비밀번호: `tracker2024`

## 문제 해결

### 데이터가 로드되지 않는 경우
1. 서버가 실행 중인지 확인 (`http://localhost:3000`)
2. `.env` 파일에 모든 데이터베이스 ID가 올바르게 설정되었는지 확인
3. 노션 Integration이 모든 데이터베이스에 연결되어 있는지 확인
4. 브라우저 콘솔(F12)에서 에러 메시지 확인

### CORS 에러가 발생하는 경우
- 서버가 올바르게 실행되고 있는지 확인
- 브라우저에서 `http://localhost:3000/habit-tracker.html`로 직접 접속 (파일을 직접 열지 말고)

### 노션 API 에러
- Integration Token이 올바른지 확인
- Integration이 모든 데이터베이스에 연결되어 있는지 확인
- 데이터베이스 속성 이름이 정확히 일치하는지 확인 (대소문자 구분)

## 데이터 구조

### 습관 (Habits)
- 매일 체크 상태와 연속 달성일이 노션에 저장됩니다
- 날짜가 바뀌면 자동으로 체크박스가 리셋됩니다

### 명상 (Meditation)
- 명상 내용과 순서가 노션에 저장됩니다
- 드래그 앤 드롭으로 순서 변경 시 노션에도 반영됩니다

### 몸무게 (Weight)
- 날짜별 몸무게 기록이 노션에 저장됩니다
- 같은 날짜에 다시 입력하면 업데이트됩니다

### 가계부 (Expenses)
- 모든 수입/지출 내역이 노션에 저장됩니다
- 삭제 시 노션에서도 아카이브됩니다

## 비밀번호 변경

`habit-tracker.html` 파일의 486번째 줄에서 비밀번호를 변경할 수 있습니다:

```javascript
const PASSWORD = 'tracker2024';  // 원하는 비밀번호로 변경
```

## 참고 사항

- 모든 데이터는 노션에 실시간으로 저장됩니다
- 로컬 스토리지는 더 이상 사용하지 않습니다
- 여러 기기에서 동일한 노션 데이터베이스에 접근 가능합니다
- 노션 Integration Token은 절대 공개하지 마세요!
