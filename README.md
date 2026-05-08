# Echoes of Silence — 沈黙の真実

声とAIで紡ぐ、没入型推理ミステリーゲーム。

あなたは**審判者**として、30分の制限時間の中でNPCへの尋問・証拠収集・最終的な告発を行い、密室殺人事件の真相を解き明かします。

## 機能

- **音声対話** — マイクに向かって話しかけるだけでキャラクターと会話。Whisper による音声認識 + TTS による音声合成に対応
- **テキスト対話** — タイピングによる会話も可能
- **AI NPC** — 各キャラクターは個別の性格・口調・秘密を持ち、信頼度に応じて情報を開示
- **ゲームマスター** — 自由な質問に対応するナレーション/ヒント役
- **告発システム** — 犯人・凶器・動機を宣言し、AI が判定

## セットアップ

### 必要条件

- Node.js 18+
- OpenAI API キー

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd echoes-of-silence

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.local.example .env.local
# .env.local に OPENAI_API_KEY を記入
```

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 にアクセス。

## 使い方

1. ゲーム開始後、**キャラクター選択**で話しかけたい相手（GM / エレナ / ヴィクター）を選択
2. **録音ボタン**を押して話すか、テキスト入力で質問
3. 会話ログでAIの応答を確認
4. 十分な情報が集まったら**告発**フェーズに移行
5. 犯人・凶器・動機を宣言して真相を解き明かせ

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm start` | 本番サーバー起動 |
| `npm run lint` | ESLint 実行 |

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router), React 18
- **言語**: TypeScript (strict)
- **スタイリング**: Tailwind CSS
- **AI**: OpenAI GPT-4o-mini / Whisper-1 / TTS-1
- **その他**: Vercel AI SDK, LangChain (一部依存)

## ディレクトリ構成

```
src/
├── app/         Next.js App Router（ページ・API ルート）
├── components/  React UI（game/, voice/）
├── server/      サーバ専用 OpenAI 呼び出し（ai/, agents/）
└── game/        ドメイン層（types, state, scenarios/）
```

詳細は [docs/architecture.md](docs/architecture.md) を参照。

## シナリオ

現在収録されているサンプルシナリオ:
- **「緑色の手と密室の罪」** — [docs/scenarios/vampire.md](docs/scenarios/vampire.md)
- **「アンノウン — ワームホールのパラドックス」**

## ライセンス

Private — 無断転載・再配布を禁じます。
