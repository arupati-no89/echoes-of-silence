# アーキテクチャ概要

Echoes of Silence のソースコードは以下の3層に分離されている。

```
src/
├── app/         Next.js App Router（ルーティング・API ハンドラ・ページ）
├── components/  React UI 部品（feature ディレクトリで分類）
├── server/      サーバ専用コード（OpenAI 呼び出し・AI エージェント）
└── game/        ドメイン層（型定義・状態初期化・シナリオデータ）
```

## レイヤごとの責務

### `src/app/`
Next.js App Router 標準構成。ページ・レイアウト・API ルートを置く薄い層。
- `app/page.tsx` — `<GameUI />` をマウントするエントリ
- `app/api/{chat,speak,transcribe}/route.ts` — `server/` のロジックを HTTP に橋渡しするだけ

### `src/components/`
クライアントコンポーネントを feature 単位でグルーピング。

| サブディレクトリ | 含むもの |
|----------------|---------|
| `components/game/` | ゲーム進行・UI（GameUI, ConversationLog, CharacterSelect, DecisionPrompt, AccusationPanel, ResolutionScreen） |
| `components/voice/` | 音声入出力（RecordButton） |

### `src/server/`
サーバ環境（API ルートのみ）から呼ばれる。`OPENAI_API_KEY` を使うコードはここに集約。

| サブディレクトリ | 内容 |
|----------------|------|
| `server/ai/client.ts` | 共通 OpenAI クライアント（シングルトン） |
| `server/ai/asr.ts` | Whisper による音声認識 |
| `server/ai/tts.ts` | OpenAI TTS による音声合成 |
| `server/agents/gm.ts` | GM プロンプト・告発判定 |
| `server/agents/npc.ts` | NPC キャラクタープロンプト |

クライアントから直接 import してはいけない。必ず `app/api/*/route.ts` 経由でアクセスする。

### `src/game/`
フレームワーク非依存の純粋ドメイン。クライアント・サーバどちらからも import 可能。

| ファイル | 内容 |
|---------|------|
| `game/types.ts` | `Scenario`, `Character`, `GameState` などの型定義 |
| `game/state.ts` | `createInitialState(scenarioId)` — 初期 GameState 生成 |
| `game/scenarios/index.ts` | シナリオレジストリ（`scenarios`, `scenarioList`） |
| `game/scenarios/vampire.ts` | 「緑色の手と密室の罪」 |
| `game/scenarios/unknown.ts` | 「アンノウン — ワームホールのパラドックス」 |

## データフロー

```
[ブラウザ]
  ↓ fetch
[app/api/chat/route.ts]
  ↓ import
[server/agents/gm.ts]      [server/agents/npc.ts]
  ↓                          ↓
[server/ai/client.ts] ──→ OpenAI API
```

## 新シナリオの追加手順

1. `src/game/scenarios/{id}.ts` を作成し、`Scenario` 型でエクスポート
2. `src/game/scenarios/index.ts` の `scenarios` レコードに追加
3. 必要なら `docs/scenarios/{id}.md` でゲームデザインを記述
4. `docs/naming_conventions.md` の「シナリオID」表に追記

## パスエイリアス

`tsconfig.json` で `@/*` → `./src/*` を定義。`@/server/...`, `@/game/...`, `@/components/...` の3系統で参照する。
