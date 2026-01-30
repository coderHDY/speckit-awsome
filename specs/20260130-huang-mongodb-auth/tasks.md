---
description: "Task list for MongoDB authentication migration feature"
---

# Tasks: MongoDB Authentication Migration

**Feature Branch**: `001-mongodb-auth`  
**Input**: Design documents from `/specs/001-mongodb-auth/`
**Prerequisites**: spec.md ✅, plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Tests are MANDATORY per Constitution. Every implementation task is paired with corresponding test tasks in `/test` directory. Target: 80% coverage (branches, functions, lines, statements).

**Organization**: Tasks are grouped by user story (US1, US2) for independent implementation and testing. Setup and Foundational phases enable all user stories.

---

## Constitution Compliance Checklist

すべてのタスクは以下の Constitution 原則に従う必要があります：

- [ ] **日本語コメント**: コード内のコメント（クラス、関数、インライン）はすべて日本語で記述
- [ ] **第三者ライブラリ抽象化**: 外部ライブラリ（MongoDB, console）は `@/utils` でラップ
- [ ] **テスト駆動開発**: `/test` ディレクトリにテストコード配置（カバレッジ 80% 以上）
- [ ] **API ドキュメント**: 新規 API は `/doc` ディレクトリにドキュメント作成
- [ ] **アーカイブドキュメント**: `.md` ファイルは日本語で記述
- [ ] **コミュニケーション言語**: コミット・エラーメッセージは中国語

---

## Format: Task Structure

```
- [ ] [TaskID] [P?] [Story?] Description with exact file path
```

**Format Components**:
- **Checkbox**: `- [ ]` (markdown checkbox)
- **Task ID**: Sequential (T001, T002, T003...)
- **[P]**: Parallelizable (different files, no incomplete dependencies)
- **[Story]**: [US1], [US2] - for user story phase tasks only
- **Description**: Action + exact file path

**Examples**:
- ✅ `- [ ] T001 Create project structure per implementation plan`
- ✅ `- [ ] T005 [P] Implement MongoDB connection module in utils/mongoConnection.js`
- ✅ `- [ ] T012 [P] [US1] Create user registration unit test in test/routes/auth.test.js`

---

## Phase 1: Setup - MongoDB Infrastructure & Utilities

Setup tasks establish shared infrastructure that blocks all user story implementations.

### Dependencies Installation

- [X] T001 Install MongoDB Node.js driver (mongodb ^5.0.0) via npm
- [X] T002 Install mongodb-memory-server as devDependency for testing

### MongoDB Connection Management

- [X] T003 [P] Create mongoConnection.js module in utils/ with:
  - MongoClient singleton connection management
  - connectMongoDB() async function with error handling
  - ensureIndexes() function to create username unique index
  - getDb() function to retrieve database instance
  - closeMongoDB() function for cleanup
  - Complete Japanese comments for all functions
  - Connection timeout set to 5000ms, maxPoolSize 10, minPoolSize 1

- [X] T004 [P] Create unit test for mongoConnection in test/utils/mongoConnection.test.js with:
  - mongodb-memory-server integration
  - Test connectMongoDB() connects successfully
  - Test ensureIndexes() creates username unique index
  - Test getDb() returns same database instance (singleton)
  - Test closeMongoDB() closes connection cleanly
  - Minimum 80% code coverage

### Utility Wrapper Functions

- [X] T005 [P] Create logger.js module in utils/ with:
  - logger.info(message) function (console.log)
  - logger.warn(message) function (console.warn)
  - logger.error(message, error) function (console.error with stack trace)
  - logger.debug(message) function (conditional on DEBUG env var)
  - ISO 8601 timestamp formatting: [LEVEL] YYYY-MM-DDTHH:mm:ss.SSSZ - message
  - Complete Japanese comments

- [X] T006 [P] Create unit test for logger in test/utils/logger.test.js with:
  - Mock console methods (log, warn, error)
  - Verify logger.info() calls console.log with [INFO] prefix
  - Verify logger.warn() calls console.warn with [WARN] prefix
  - Verify logger.error() calls console.error with [ERROR] prefix and stack trace
  - Verify logger.debug() respects DEBUG environment variable
  - Minimum 80% code coverage

### Environment Configuration

- [X] T007 Create .env.local file with:
  - MONGODB_URI=mongodb://localhost:27017
  - MONGODB_DB=speckit
  - DEBUG=false (or true for testing)

---

## Phase 2: Foundational - User Storage Abstraction Layer

Foundational tasks implement core abstractions needed by all user stories.

### MongoDB User Storage Implementation

- [X] T008 [P] Create mongoStorage.js module in utils/ with:
  - async readUsers() - retrieve all users from MongoDB
  - async findUserByUsername(username) - find single user by username
  - async addUser(user) - insert new user into MongoDB
  - Return same interface signature as existing userStorage.js
  - Handle MongoDB errors (E11000 duplicate key, connection errors)
  - Complete Japanese comments

- [X] T009 [P] Create unit test for mongoStorage in test/utils/mongoStorage.test.js with:
  - mongodb-memory-server test database setup
  - Test addUser(user) inserts user and returns with _id
  - Test findUserByUsername(username) returns correct user
  - Test findUserByUsername(nonexistent) returns null
  - Test readUsers() returns all users in collection
  - Test E11000 duplicate key error handling for username uniqueness
  - Test MongoDB connection error handling
  - Minimum 80% code coverage

### Test Setup Infrastructure

- [X] T010 Update test/setup.js with:
  - Global beforeAll() hook to start mongodb-memory-server
  - Set MONGODB_URI environment variable to memory server URI
  - Global afterAll() hook to stop mongodb-memory-server
  - Global beforeEach() hook to clear users collection before each test
  - Add MONGODB_DB=speckit environment variable

---

## Phase 3: User Story 1 - User Registration with MongoDB (P1)

**Story Goal**: Users can register new accounts with credentials securely stored in MongoDB

**Independent Test**: Running only US1 tasks should result in a fully functional registration API that passes all acceptance tests

**Test Criteria**:
- POST /register endpoint accepts valid credentials
- User data is persisted to MongoDB
- Validation errors return 400 with appropriate Chinese messages
- Duplicate username returns 409 with "用户名已存在" message
- Successful registration returns 201 with user ID and username

### User Story 1 - Test-First Implementation

- [X] T011 [P] [US1] Create test/routes/auth.test.js registration tests with:
  - Test POST /register with valid username and password → 201 with user ID
  - Test POST /register with duplicate username → 409 with "用户名已存在"
  - Test POST /register missing username field → 400 with "用户名和密码不能为空"
  - Test POST /register missing password field → 400 with "用户名和密码不能为空"
  - Test POST /register username too short (< 3 chars) → 400 with "用户名必须是3-20个字符..."
  - Test POST /register username too long (> 20 chars) → 400 with "用户名必须是3-20个字符..."
  - Test POST /register username with invalid characters → 400 with "用户名必须是3-20个字符..."
  - Test POST /register password too short (< 6 chars) → 400 with "密码长度必须在6-50个字符之间"
  - Test POST /register password too long (> 50 chars) → 400 with "密码长度必须在6-50个字符之间"
  - Test POST /register with MongoDB connection failure → 500 with "服务器内部错误"
  - Verify user is actually stored in MongoDB with correct fields (id, username, passwordHash, createdAt)
  - Verify passwordHash is bcryptjs hashed, not plaintext
  - Minimum 80% code coverage

### User Story 1 - Implementation

- [X] T012 [P] [US1] Update routes/auth.js POST /register endpoint with:
  - Replace userStorage references with mongoStorage (async/await)
  - Keep existing validation logic (validateUsername, validatePassword, validateRequiredFields from utils/validator.js)
  - Use logger.info() for successful registration with format: "ユーザー登録成功: {username}"
  - Use logger.warn() for validation failures
  - Use logger.error() for MongoDB errors with stack trace
  - Handle E11000 duplicate key error specifically (return 409)
  - Keep all response messages in Chinese
  - Keep HTTP status codes unchanged (201, 400, 409, 500)
  - Ensure all comments in code are Japanese

- [X] T013 [P] [US1] Create doc/register.md API documentation with:
  - Endpoint: POST /register
  - Request format (username, password fields)
  - Response formats for all status codes (201, 400, 409, 500)
  - Complete request/response examples
  - 10-step processing flow description
  - Security notes (password hashing, no password in response)
  - All documentation in Japanese

---

## Phase 4: User Story 2 - User Login with MongoDB (P1)

**Story Goal**: Users can log in to existing accounts using credentials validated against MongoDB

**Independent Test**: Running only US2 tasks (after Foundational + US1) should result in fully functional login API

**Test Criteria**:
- POST /login endpoint accepts valid username and password
- Credentials are validated against MongoDB stored password hash
- Invalid credentials return 401 with "用户名或密码不正确" message
- Successful login returns 200 with user ID and username
- Same error message for non-existent user and wrong password (security)

### User Story 2 - Test-First Implementation

- [X] T014 [P] [US2] Create test/routes/auth.test.js login tests with:
  - Setup: Create test user with known password in beforeEach()
  - Test POST /login with correct username and password → 200 with user ID
  - Test POST /login with non-existent username → 401 with "用户名或密码不正确"
  - Test POST /login with correct username, wrong password → 401 with "用户名或密码不正确"
  - Test POST /login missing username field → 400 with "用户名和密码不能为空"
  - Test POST /login missing password field → 400 with "用户名和密码不能为空"
  - Test POST /login with MongoDB connection failure → 500 with "服务器内部错误"
  - Verify both invalid user and wrong password return same error (no user enumeration)
  - Verify response does NOT include password hash or any sensitive data
  - Minimum 80% code coverage

### User Story 2 - Implementation

- [X] T015 [P] [US2] Update routes/auth.js POST /login endpoint with:
  - Replace userStorage references with mongoStorage (async/await)
  - Keep existing password verification logic (verifyPassword from utils/passwordHelper.js)
  - Use logger.info() for successful login with format: "ログイン成功: {username}"
  - Use logger.warn() for authentication failures with format: "ログイン失敗: ユーザーなし - {username}"
  - Use logger.error() for MongoDB errors with stack trace
  - Return same error message for non-existent user and wrong password
  - Keep all response messages in Chinese
  - Keep HTTP status codes unchanged (200, 400, 401, 500)
  - Ensure all comments in code are Japanese

- [X] T016 [P] [US2] Create doc/login.md API documentation with:
  - Endpoint: POST /login
  - Request format (username, password fields)
  - Response formats for all status codes (200, 400, 401, 500)
  - Complete request/response examples
  - 8-step processing flow description
  - Security notes (same error for user/password, no plaintext password in response)
  - All documentation in Japanese

---

## Phase 5: Cleanup & Manual Data Import

### Manual Data Import (No Automated Migration)

- [ ] T017 Create migration guide doc in data/ (optional):
  - Instructions for manually importing existing users.json data to MongoDB
  - Example MongoDB insertMany() command
  - Backup strategy (copy users.json to users.json.backup)
  - Data integrity verification checklist

- [ ] T018 Create data/users.json.backup by copying current data/users.json

---

## Phase 6: Polish & Cross-Cutting Concerns

### Documentation Updates

- [X] T019 Update README.md with:
  - MongoDB dependency installation: npm install mongodb
  - MongoDB environment variable setup instructions
  - Test setup with mongodb-memory-server
  - China-language example API calls

- [ ] T020 [P] Validate Constitution compliance:
  - Verify all code comments are in Japanese
  - Verify all external libraries (MongoDB, console) wrapped in utils/
  - Verify all test files exist with 80%+ coverage
  - Verify API documentation in /doc directory
  - Verify all .md files are in Japanese
  - Verify all user-facing messages in Chinese

### Code Review & Quality Gates

- [ ] T021 [P] Create PR with all changes:
  - Title: "feat: MongoDB认证集成完成" (Chinese)
  - Description: Links to spec.md clarifications, constitution compliance checklist
  - All commits with Chinese messages
  - Checklist for reviewer: Constitution compliance items

- [ ] T022 [P] Code review checklist:
  - All comments are Japanese ✓
  - All libraries wrapped in utils/ ✓
  - All tests in /test directory with 80%+ coverage ✓
  - API documentation in /doc ✓
  - All error messages to users in Chinese ✓
  - No NEEDS CLARIFICATION markers ✓

---

## Task Dependencies & Parallelization

### Dependency Graph

```
Phase 1: Setup (blocking all user stories)
  ├─ T001 (Install mongodb driver)
  ├─ T002 (Install mongodb-memory-server)
  ├─ T003 [P] (mongoConnection.js)
  ├─ T004 [P] (mongoConnection test)
  ├─ T005 [P] (logger.js)
  ├─ T006 [P] (logger test)
  └─ T007 (Create .env.local)

Phase 2: Foundational (blocking user stories)
  ├─ T008 [P] (mongoStorage.js)
    └─ Requires: T003, T004
  ├─ T009 [P] (mongoStorage test)
    └─ Requires: T008, T010
  └─ T010 (test/setup.js)
    └─ Requires: T002

Phase 3: User Story 1 (independent)
  ├─ T011 [P] [US1] (registration tests)
    └─ Requires: T010, T012
  ├─ T012 [P] [US1] (registration implementation)
    └─ Requires: T008, T005
  └─ T013 [P] [US1] (registration docs)
    └─ Requires: None

Phase 4: User Story 2 (independent, can run parallel to US1)
  ├─ T014 [P] [US2] (login tests)
    └─ Requires: T010, T015
  ├─ T015 [P] [US2] (login implementation)
    └─ Requires: T008, T005
  └─ T016 [P] [US2] (login docs)
    └─ Requires: None

Phase 5: Cleanup
  ├─ T017 (Migration guide - optional)
  └─ T018 (Backup users.json)

Phase 6: Polish
  ├─ T019 (Update README)
  ├─ T020 [P] (Constitution validation)
  ├─ T021 [P] (Create PR)
  └─ T022 [P] (Code review)
```

### Parallel Execution Suggestions

**Round 1** (Setup Phase - Sequential):
```bash
T001 → T002 → (T003, T004, T005, T006 in parallel) → T007
```

**Round 2** (Foundational - Sequential):
```bash
T010 → (T008, T009 in parallel)
```

**Round 3** (User Stories - Parallel):
```bash
(US1: T011→T012→T013) in parallel with (US2: T014→T015→T016)
```

**Round 4** (Cleanup & Polish - Parallel):
```bash
(T017, T018) in parallel with (T019, T020, T021, T022)
```

### Estimated Task Effort

| Phase | Tasks | Est. Time | Notes |
|-------|-------|-----------|-------|
| Phase 1 (Setup) | T001-T007 | 1-2 hours | Dependency installation + 3 modules (connection, logger, config) |
| Phase 2 (Foundational) | T008-T010 | 2-3 hours | Storage layer + test setup |
| Phase 3 (US1) | T011-T013 | 2-3 hours | Registration tests + implementation + docs |
| Phase 4 (US2) | T014-T016 | 2-3 hours | Login tests + implementation + docs |
| Phase 5 (Cleanup) | T017-T018 | 30 minutes | Migration guide + backup |
| Phase 6 (Polish) | T019-T022 | 1 hour | README + validation + review |
| **Total** | **22 tasks** | **~10 hours** | Can be parallelized to ~6 hours |

---

## Constitution Verification Checklist

**Before merging any PR, verify ALL of the following**:

- [ ] **日本語コメント検証**: 
  - [ ] All function/method comments in utils/mongoConnection.js are Japanese
  - [ ] All function/method comments in utils/mongoStorage.js are Japanese
  - [ ] All function/method comments in utils/logger.js are Japanese
  - [ ] All inline comments in routes/auth.js (MongoDB section) are Japanese

- [ ] **第三者ライブラリ抽象化検証**:
  - [ ] MongoDB driver: No direct `require('mongodb')` in routes/ or other files except utils/mongoConnection.js
  - [ ] Console methods: No direct `console.log/warn/error` except in utils/logger.js
  - [ ] All library usage goes through utils/ wrappers

- [ ] **テスト駆動開発検証**:
  - [ ] test/utils/mongoConnection.test.js exists with ≥80% coverage
  - [ ] test/utils/mongoStorage.test.js exists with ≥80% coverage
  - [ ] test/utils/logger.test.js exists with ≥80% coverage
  - [ ] test/routes/auth.test.js includes registration + login tests with ≥80% coverage
  - [ ] All critical paths covered (success + error scenarios)

- [ ] **API ドキュメント検証**:
  - [ ] doc/register.md exists with endpoint, request/response format, examples
  - [ ] doc/login.md exists with endpoint, request/response format, examples
  - [ ] Both documents are in Japanese

- [ ] **アーカイブドキュメント検証**:
  - [ ] All .md files in specs/001-mongodb-auth/ are in Japanese
  - [ ] All generated documentation follows Japanese formatting

- [ ] **コミュニケーション言語検証**:
  - [ ] All API response messages to users are in Chinese (e.g., "注册成功")
  - [ ] All commit messages are in Chinese (e.g., "feat: 添加MongoDB认证")
  - [ ] All error messages to users are in Chinese

---

## Implementation Notes

### For Test-Driven Development (TDD)

1. **Red**: Write failing test first (describe expected behavior)
2. **Green**: Implement minimal code to pass test
3. **Refactor**: Improve code quality while keeping tests green

**Example**:
```javascript
// test/utils/mongoStorage.test.js (RED)
test('should add new user to MongoDB', async () => {
  const user = { id: 'uuid', username: 'test', passwordHash: 'hash', createdAt: '2026-01-30...' };
  const result = await mongoStorage.addUser(user);
  expect(result.username).toBe('test');
  expect(result._id).toBeDefined();
});

// utils/mongoStorage.js (GREEN - minimal)
async function addUser(user) {
  const db = await getDb();
  const result = await db.collection('users').insertOne(user);
  return { ...user, _id: result.insertedId };
}

// Refactor as needed
```

### For Constitution Compliance

Always check before commit:
```bash
# Verify Japanese comments
grep -r "//\|/*" utils/mongoConnection.js | grep -v '//' | grep -v '/*'

# Verify no direct library imports outside utils
grep -r "require('mongodb')" routes/ test/routes/

# Verify test files exist
ls test/utils/mongo*.test.js test/routes/auth.test.js
```

---

**Tasks Generated**: 2026-01-30  
**Total Tasks**: 22  
**Ready for Implementation**: ✅ Yes  
**Next Step**: `/speckit.implement` or manual task execution starting with Phase 1
