# ソース資料の所在

## 1. Notion（メインの資料庫）
- **URL:** https://www.notion.so/359eb72fac3b8188ba9fc83019eb5386
- **Integration Token:** `.env.local` の `NOTION_TOKEN` に保存（履歴から削除済み）
- **API取得:** `GET https://api.notion.com/v1/blocks/{page_id}/children`
- **内容:**
  - シナリオ基本情報（作者、形式、所要時間、難易度）
  - 真相とトリックの解説（物理トリック・タイムパラドクス構造・叙述トリック）
  - 推理導線とミスリード（Step1〜4、罠A〜C）
  - 各キャラクターの秘密と立ち回り
  - **エンディング分岐表**（酸素修正×箱の処遇、8パターン）
  - GM運用のポイント
- **コード対応:** `src/lib/game/scenarios/unknown.ts` の全内容（intro, characters, endings）

## 2. Google Drive
- **URL:** https://drive.google.com/drive/folders/1tI0PJZSo0yuProV7gnxrkGzOn_4J_3c8
- **公開設定:** リンクを知っている全員が閲覧可能
- **内容:** 更新履歴テキスト（シナリオのバージョン管理情報）
- **備考:** 最新版の正体はNotion側に移行済み

## 3. GitHub プライベートリポジトリ（元資料）
- **URL:** `git@github.com:arupati-no89/claude-config.git`
- **参照ファイル:**
  - `unknown.md` — アンノウンシナリオの初期ドラフト
  - `echoes_of_silence.md` — プロジェクト構想メモ
- **最終用途:** 初期ドラフトの参照元。プロットの詳細はNotionに統合済み

## 4. データフロー図

```
unknown.md (GitHub private repo) ──┐
                                    ├──→ Notion（統合・編集）──→ unknown.ts（実装）
Google Drive (update history) ──────┘
```

## 5. 抽出した要素と実装の対応

| 資料の要素 | コード上の対応 |
|-----------|---------------|
| 副船長の正体（善意Aサルコ） | `characters[0].hiddenTruths` |
| 箱の中の犯人Aサルコ | `characters[1].id: "asalco_box"` |
| 物理トリック（電線＋酸素） | `characters[1].hiddenTruths[1]` + `solution.weapon` |
| タイムパラドクス構造 | `solution.motive` |
| 推理導線Step1〜4 | `evidenceResponses` のキーワード群 |
| エンディング分岐表 | `endings[]` 全8条件 |
| 解決（犯人・凶器・動機） | `solution` オブジェクト |

## 6. API アクセスメモ

```bash
# Notion ページ取得（トークンは .env.local 参照）
curl -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  https://api.notion.com/v1/pages/359eb72f-ac3b-8188-ba9f-c83019eb5386

# Notion ブロック（本文）取得
curl -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  https://api.notion.com/v1/blocks/359eb72f-ac3b-8188-ba9f-c83019eb5386/children?page_size=100
```
