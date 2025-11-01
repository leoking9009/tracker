# Vercel 배포 가이드

이 가이드는 습관 트래커 앱을 Vercel에 배포하는 방법을 설명합니다.

## 1. Vercel 계정 준비

1. https://vercel.com 접속
2. GitHub 계정으로 로그인

## 2. 프로젝트 배포

### 방법 1: Vercel 웹사이트에서 배포

1. Vercel 대시보드에서 "Add New..." 클릭
2. "Project" 선택
3. GitHub 저장소 연결
4. `leoking9009/tracker` 저장소 선택
5. "Import" 클릭

### 방법 2: Vercel CLI로 배포

```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 디렉토리에서 실행
vercel

# 프로덕션 배포
vercel --prod
```

## 3. 환경 변수 설정

Vercel 프로젝트 설정에서 다음 환경 변수를 추가해야 합니다:

1. Vercel 대시보드에서 프로젝트 선택
2. "Settings" 탭 클릭
3. "Environment Variables" 메뉴 선택
4. 다음 변수들을 추가:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NOTION_TOKEN` | `ntn_...` | 노션 Integration Token |
| `HABITS_DB_ID` | `xxxxxxxx...` | 습관 데이터베이스 ID |
| `MEDITATION_DB_ID` | `xxxxxxxx...` | 명상 데이터베이스 ID |
| `WEIGHT_DB_ID` | `xxxxxxxx...` | 몸무게 데이터베이스 ID |
| `EXPENSES_DB_ID` | `xxxxxxxx...` | 가계부 데이터베이스 ID |

각 변수는 다음 환경에 체크:
- ✅ Production
- ✅ Preview
- ✅ Development

## 4. 노션 데이터베이스 ID 확인 방법

각 노션 데이터베이스 페이지의 URL에서 ID를 추출:

```
https://www.notion.so/1234567890abcdef1234567890abcdef?v=...
                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                      이 32자리가 Database ID
```

## 5. 배포 확인

1. 환경 변수 설정 후 "Redeploy" 클릭
2. 배포가 완료되면 Vercel이 제공하는 URL로 접속
3. 기본 비밀번호 `tracker2024`로 로그인
4. 노션 데이터베이스와 연동 확인

## 6. 커스텀 도메인 설정 (선택사항)

1. Vercel 프로젝트 설정에서 "Domains" 탭 클릭
2. 원하는 도메인 추가
3. DNS 설정 업데이트

## 프로젝트 구조

```
tracker/
├── api/                          # Vercel Serverless Functions
│   ├── habits.js                 # 습관 API
│   ├── meditation.js             # 명상 추가/조회 API
│   ├── meditation-delete.js      # 명상 삭제 API
│   ├── meditation-reorder.js     # 명상 순서 변경 API
│   ├── weight.js                 # 몸무게 API
│   ├── expenses.js               # 가계부 추가/조회 API
│   └── expenses-delete.js        # 가계부 삭제 API
├── habit-tracker.html            # 메인 웹앱
├── vercel.json                   # Vercel 설정 파일
├── package.json                  # Node.js 의존성
└── .env                          # 로컬 환경 변수 (Git에 커밋 안 됨)
```

## API 엔드포인트

배포 후 다음 엔드포인트들이 사용 가능합니다:

- `GET /api/habits` - 습관 데이터 조회
- `POST /api/habits` - 습관 데이터 저장
- `GET /api/meditation` - 명상 리스트 조회
- `POST /api/meditation` - 명상 항목 추가
- `DELETE /api/meditation-delete?id={id}` - 명상 항목 삭제
- `PUT /api/meditation-reorder` - 명상 순서 변경
- `GET /api/weight` - 몸무게 데이터 조회
- `POST /api/weight` - 몸무게 데이터 추가
- `GET /api/expenses` - 가계부 데이터 조회
- `POST /api/expenses` - 가계부 항목 추가
- `DELETE /api/expenses-delete?id={id}` - 가계부 항목 삭제

## 로컬 개발

로컬에서 테스트하려면:

```bash
# 의존성 설치
npm install

# Express 서버로 실행
npm start

# 또는 Vercel Dev로 실행 (Vercel 환경과 동일)
vercel dev
```

브라우저에서 `http://localhost:3000/habit-tracker.html` 접속

## 문제 해결

### 배포 실패
- Vercel 빌드 로그 확인
- `package.json`에 필요한 의존성이 모두 포함되어 있는지 확인
- `@notionhq/client` 패키지가 설치되어 있는지 확인

### API 오류
- Vercel 프로젝트 설정에서 환경 변수가 올바르게 설정되었는지 확인
- 노션 Integration이 모든 데이터베이스에 연결되어 있는지 확인
- Vercel Function Logs에서 에러 메시지 확인

### CORS 오류
- 각 API 함수에 CORS 헤더가 설정되어 있음
- 문제가 계속되면 Vercel 설정 확인

### 환경 변수 업데이트 후
- 반드시 "Redeploy" 실행
- 환경 변수는 빌드 시점에 주입되므로 재배포 필요

## Vercel 무료 플랜 제한

- 월 100GB 대역폭
- Serverless Function 실행 시간: 10초
- Serverless Function 메모리: 1024MB
- 개인 프로젝트에는 충분합니다

## 보안 팁

1. 노션 토큰은 절대 공개하지 마세요
2. GitHub에 `.env` 파일이 커밋되지 않도록 `.gitignore`에 포함
3. Vercel 환경 변수는 안전하게 암호화되어 저장됩니다
4. 비밀번호를 변경하려면 `habit-tracker.html` 파일 수정 후 재배포

## 자동 배포

- GitHub에 푸시하면 Vercel이 자동으로 배포
- `main` 브랜치 → Production 배포
- 다른 브랜치 → Preview 배포

## 유용한 링크

- Vercel 문서: https://vercel.com/docs
- Notion API 문서: https://developers.notion.com
- 프로젝트 GitHub: https://github.com/leoking9009/tracker
