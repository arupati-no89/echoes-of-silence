# 命名規則・統一基準

## 1. ファイル・ディレクトリ構成

| 種別 | 規則 | 例 |
|------|------|-----|
| ディレクトリ名 | 複数形ケバブケース | `scenarios/`, `agents/`, `components/` |
| コンポーネントファイル | PascalCase.tsx | `GameUI.tsx`, `DecisionPrompt.tsx` |
| ユーティリティ/データ | ケバブケース | `npc_agents.ts`, `gm_agent.ts` |
| シナリオデータ | シナリオID.ts（ケバブケース） | `unknown.ts`, `vampire`は `scenario.ts`（既存） |
| APIルート | ケバブケース | `/api/chat`, `/api/speak`, `/api/transcribe` |

## 2. TypeScript 型・インターフェース

| 対象 | 規則 | 例 |
|------|------|-----|
| インターフェース名 | PascalCase（単数形名詞） | `Scenario`, `Character`, `GameState` |
| 型エイリアス | PascalCase | `GamePhase`, `PlayerChoices` |
| プロパティ名 | camelCase | `speechStyle`, `voiceType`, `unlockedEvidence` |
| 共用体型リテラル | スネークケース | `"knowingly_open"`, `"not_open"` |

## 3. シナリオデータ（Scenario）

### 3.1 トップレベル

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `title` | `string` | ✅ | 日本語タイトル。サブタイトルは「 — 」で区切る |
| `intro` | `string` | ✅ | プレイヤーに最初に表示されるナレーション |
| `characters` | `Character[]` | ✅ | 尋問可能なNPCの配列 |
| `solution` | `object` | ✅ | 真実（犯人・凶器・動機） |
| `endings` | `ScenarioEnding[]` | ❌ | 条件分岐エンディング |

### 3.2 Character

| フィールド | 型 | 規則 |
|-----------|-----|------|
| `id` | `string` | スネークケース。シナリオ内で一意（例: `first_officer`, `asalco_box`） |
| `name` | `string` | 日本語表示名（例: `副船長`, `箱の中のAサルコ`） |
| `publicProfile` | `string` | 日本語。NPCの表向きの設定 |
| `hiddenTruths` | `HiddenTruth[]` | 信頼度で解放される秘密（level 1〜） |
| `evidenceResponses` | `EvidenceResponse[]` | キーワードトリガー反応 |
| `speechStyle` | `string` | 日本語。口調の指示 |
| `voiceType` | `string` | OpenAI TTS用 (`alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`) |

### 3.3 HiddenTruth

| フィールド | 型 | 規則 |
|-----------|-----|------|
| `level` | `number` | 1始まり。解放に必要な信頼度の切り上げ値 |
| `content` | `string` | 日本語。その秘密の内容（NPCプロンプトに注入） |

### 3.4 EvidenceResponse

| フィールド | 型 | 規則 |
|-----------|-----|------|
| `keyword` | `string` | 日本語。プレイヤー発言に含まれると反応するキーワード |
| `reaction` | `string` | 日本語。NPCのセリフ（「」付き推奨） |

### 3.5 solution

| フィールド | 型 | 規則 |
|-----------|-----|------|
| `culprit` | `string` | 犯人キャラクターの `id` 値を指定 |
| `weapon` | `string` | 日本語。凶器・手口の説明 |
| `motive` | `string` | 日本語。動機の説明 |

### 3.6 ScenarioEnding

| フィールド | 型 | 規則 |
|-----------|-----|------|
| `id` | `string` | `END1`, `END2-A` 形式。連番＋枝番 |
| `title` | `string` | 日本語。「—」で区切る（例: `ベストエンド — 全員生還`） |
| `description` | `string` | 日本語。改行含む長文可 |
| `condition` | `(choices, correct) => boolean` | `PlayerChoices` と `accusationResult.correct` で判定 |

## 4. GameState

| フィールド | 型 | 規則 |
|-----------|-----|------|
| `phase` | `GamePhase` | `"intro" | "investigation" | "accusation" | "resolution"` |
| `unlockedEvidence` | `string[]` | 証拠キーワード文字列の配列 |
| `trustLevels` | `Record<string, number>` | key = character `id`, value = 0〜3（0.5刻み） |
| `dialogHistory` | `DialogEntry[]` | 会話ログ時系列配列 |
| `choices` | `PlayerChoices` | プレイヤーの決断記録 |
| `accusationResult` | `{ correct, feedback }` | 摘発フェーズ終了時にセット |

## 5. PlayerChoices（決断キーと値）

| キー | 値の型 | 値の候補 |
|------|--------|----------|
| `oxygenFixed` | `boolean \| null` | `true`（修正）, `false`（未修正）, `null`（未決定） |
| `boxDecision` | `string \| null` | `"knowingly_open"`, `"unknowingly_open"`, `"not_open"`, `"sacrifice"`, `null` |

boxDecision 値の意味:
- `knowingly_open`: Aサルコの存在を認識した上で開封
- `unknowingly_open`: 無警戒で開封
- `not_open`: 開封しない
- `sacrifice`: 副船長が焼死体になる

## 6. DialogEntry

| フィールド | 値の規則 |
|-----------|----------|
| `role` | `"player"`（プレイヤー発言）, `"gm"`（GMナレーション）, `"npc"`（キャラクター発言） |
| `speaker` | 表示名。GM固定は `"GM"`、NPCは `character.name`、プレイヤーは `"プレイヤー"` |
| `content` | 発言内容（plain text） |
| `timestamp` | `Date.now()` |

## 7. API パラメータ

| API | リクエストパラメータ | 規則 |
|-----|---------------------|------|
| `/api/chat` | `message`, `characterId`, `gameState`, `mode`, `scenarioId` | 全てcamelCase。`mode` は `"normal"` または `"accusation"` |
| `/api/speak` | `text`, `voice` | `voice` は OpenAI TTS voice ID |
| `/api/transcribe` | `audio` (FormData) | Whisper API にそのまま転送 |

## 8. シナリオID（scenarioId）

| ID | ファイル | タイトル |
|----|---------|----------|
| `vampire` | `src/lib/game/scenario.ts` | 緑色の手と密室の罪 |
| `unknown` | `src/lib/game/scenarios/unknown.ts` | アンノウン — ワームホールのパラドックス |

新規追加時は `src/lib/game/scenarios/index.ts` の `scenarios` レコードにキー追加。

## 9. エンディングID命名規則

- `END{数字}`: 基本エンド（END1, END3, END6, END7）
- `END{数字}-{枝番アルファベット}`: 同一条件軸の分岐（END2-A, END2-B, END4-A, END4-B）
- 未使用: END5系（元Notion表記の予備枠）
