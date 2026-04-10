# Tasks: Date Time Route

**Input**: Design documents from `/specs/001-date-time-route/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/date-openapi.yaml, quickstart.md

**Tests**: Constitution によりテストは必須。各実装タスクに対応するテストタスクを含む。

**Organization**: ユーザーストーリー単位で実装・検証可能な構成。

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: `/date` 機能開発の初期準備を行う。

- [X] T001 Create date route test file scaffold in test/routes/date.test.js
- [X] T002 [P] Create date utility test file scaffold in test/utils/dateTimeService.test.js
- [X] T003 [P] Create date endpoint documentation draft in doc/date.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: すべてのストーリー実装前に必要な共通基盤を確立する。

**⚠️ CRITICAL**: このフェーズ完了前にユーザーストーリー実装を開始しない。

- [X] T004 Define supported timezone constants and labels in utils/dateTimeConfig.js
- [X] T005 Implement snapshot-based timezone conversion service in utils/dateTimeService.js
- [X] T006 [P] Add shared date response fixture for tests in test/routes/fixtures/dateResponse.fixture.js
- [X] T007 Wire date utility imports for app usage in index.js
- [X] T008 Align response contract fields with implementation baseline in specs/001-date-time-route/contracts/date-openapi.yaml

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - View current time across major time zones (Priority: P1) 🎯 MVP

**Goal**: `/date` 呼び出しで主要タイムゾーンの現在時刻を一括返却する。

**Independent Test**: `GET /date` を実行し、200 + JSON + 全サポート時区の返却を確認する。

### Tests for User Story 1

- [X] T009 [P] [US1] Add failing integration test for GET /date success response in test/routes/date.test.js
- [X] T010 [P] [US1] Add failing unit test for single-snapshot consistency in test/utils/dateTimeService.test.js

### Implementation for User Story 1

- [X] T011 [US1] Implement success payload builder for timezone entries in utils/dateTimeService.js
- [X] T012 [US1] Implement GET /date success route handler in index.js
- [X] T013 [US1] Update timezone list coverage assertions in test/routes/date.test.js

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Reliably consume the response in client applications (Priority: P2)

**Goal**: 応答構造を安定化し、クライアントが継続的に安全にパースできるようにする。

**Independent Test**: 複数回 `GET /date` を実行し、応答フィールド・型・構造の一貫性を確認する。

### Tests for User Story 2

- [X] T014 [P] [US2] Add failing integration test for stable response schema across repeated calls in test/routes/date.test.js
- [X] T015 [P] [US2] Add failing contract conformance test for /date payload in test/routes/date.test.js

### Implementation for User Story 2

- [X] T016 [US2] Standardize success response shape and field naming in utils/dateTimeService.js
- [X] T017 [US2] Ensure unauthenticated access behavior and JSON content type in index.js
- [X] T018 [US2] Sync API contract examples with stable payload structure in specs/001-date-time-route/contracts/date-openapi.yaml

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Receive clear error feedback when time data is unavailable (Priority: P3)

**Goal**: 時刻生成失敗時に、内部情報を漏らさない明確な JSON エラーを返す。

**Independent Test**: 失敗注入時に `GET /date` が 500 + `success=false` + 可読メッセージを返すことを確認する。

### Tests for User Story 3

- [X] T019 [P] [US3] Add failing integration test for /date failure response in test/routes/date.test.js
- [X] T020 [P] [US3] Add failing unit test for internal error sanitization in test/utils/dateTimeService.test.js

### Implementation for User Story 3

- [X] T021 [US3] Implement safe error mapping and error code handling in index.js
- [X] T022 [US3] Implement non-leaking failure formatter in utils/dateTimeService.js

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 複数ストーリーにまたがる仕上げを行う。

- [X] T023 [P] Finalize API usage and response examples in doc/date.md
- [X] T024 [P] Update implementation and validation steps in specs/001-date-time-route/quickstart.md
- [X] T025 Run full regression test command notes and expected results in specs/001-date-time-route/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 依存なし。
- **Phase 2 (Foundational)**: Phase 1 完了後に開始。全ストーリーをブロックする。
- **Phase 3-5 (User Stories)**: Phase 2 完了後に開始可能。
- **Phase 6 (Polish)**: すべての対象ストーリー完了後に実施。

### User Story Dependencies

- **US1 (P1)**: Foundational 完了後に着手可能（他ストーリー依存なし）。
- **US2 (P2)**: Foundational 完了後に着手可能。US1 の成果を利用するが独立検証可能。
- **US3 (P3)**: Foundational 完了後に着手可能。失敗系に集中し独立検証可能。

### Within Each User Story

- テストタスクを先行し、失敗を確認してから実装。
- ユーティリティ実装 → ルート実装 → テスト再実行の順で進行。
- 各ストーリー完了時に独立受け入れ検証を実施。

## Parallel Execution Examples

### User Story 1

- Run in parallel: T009 and T010
- Run in parallel: T011 (service) and T013 (assertion tuning) after baseline route is added

### User Story 2

- Run in parallel: T014 and T015
- Run in parallel: T016 and T018

### User Story 3

- Run in parallel: T019 and T020
- Run in parallel: T021 and T022 (after failure contract is fixed)

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1) only.
3. Validate `/date` success path as MVP.

### Incremental Delivery

1. Deliver US1 (core timezone time response).
2. Deliver US2 (stable client-consumable schema).
3. Deliver US3 (robust error handling).
4. Finalize docs and quickstart.

### Team Parallel Strategy

1. One developer handles utility/service tasks (`utils/`).
2. One developer handles route and integration tests (`index.js`, `test/routes/`).
3. One developer handles docs/contracts (`doc/`, `specs/.../contracts/`).

## Notes

- `[P]` tasks indicate no direct dependency and can run in parallel.
- `[US1]`, `[US2]`, `[US3]` labels ensure traceability to user stories.
- All tasks include concrete file paths to be immediately executable.
