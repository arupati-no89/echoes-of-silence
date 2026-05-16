import { test, expect, Page } from '@playwright/test';

type ChatBody = {
  message: string;
  characterId: string | null;
  gameState: {
    phase: 'intro' | 'investigation' | 'accusation' | 'resolution';
    dialogHistory: { role: string; speaker: string; content: string; timestamp: number }[];
    trustLevels: Record<string, number>;
    unlockedEvidence: string[];
    choices: { oxygenFixed: boolean | null; boxDecision: string | null };
    accusationResult?: { correct: boolean; feedback: string };
  };
  mode?: 'normal' | 'accusation';
  scenarioId?: string;
};

async function installMocks(page: Page) {
  await page.route('**/api/chat', async (route) => {
    const body: ChatBody = JSON.parse(route.request().postData() || '{}');
    const state = body.gameState;

    state.dialogHistory.push({
      role: 'player',
      speaker: 'プレイヤー',
      content: body.message,
      timestamp: Date.now(),
    });

    let response = '';
    if (body.mode === 'accusation') {
      response = '見事だ、審判者。エレナが伯爵を毒の矢で殺害した。妹を市街鬼化から守るためだったのだ。';
      state.accusationResult = { correct: true, feedback: response };
      state.phase = 'resolution';
      state.dialogHistory.push({ role: 'gm', speaker: 'GM', content: response, timestamp: Date.now() });
    } else if (body.characterId === 'elena') {
      response = '【モック・エレナ】それは私...いや、何でもありませんわ。毒について何をご存知なのですか？';
      state.trustLevels[body.characterId] = Math.min((state.trustLevels[body.characterId] ?? 0) + 0.5, 3);
      state.dialogHistory.push({ role: 'npc', speaker: 'エレナ', content: response, timestamp: Date.now() });
    } else if (body.characterId === 'victor') {
      response = '【モック・ヴィクター】俺はやってない、それだけだ。';
      state.trustLevels[body.characterId] = Math.min((state.trustLevels[body.characterId] ?? 0) + 0.5, 3);
      state.dialogHistory.push({ role: 'npc', speaker: 'ヴィクター', content: response, timestamp: Date.now() });
    } else {
      response = '【モックGM】調査を始めよう。エレナとヴィクターに話を聞くといい。';
      if (state.phase === 'intro') state.phase = 'investigation';
      state.dialogHistory.push({ role: 'gm', speaker: 'GM', content: response, timestamp: Date.now() });
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ response, gameState: state }),
    });
  });

  // TTS は不要なのでスキップ (GameUI は res.ok=false 時に再生をスキップする)
  await page.route('**/api/speak', async (route) => {
    await route.fulfill({ status: 503, body: '' });
  });

  await page.route('**/api/transcribe', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ text: '' }),
    });
  });
}

test.describe('vampire scenario — 自動プレイスルー (mocked AI)', () => {
  test.beforeEach(async ({ page }) => {
    await installMocks(page);
  });

  test('scenario select → investigation → accusation → resolution', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Echoes of Silence' })).toBeVisible();
    await page.getByRole('button', { name: /緑色の手と密室の罪/ }).click();

    // ブリーフィング画面
    await expect(page.getByText('事件ブリーフィング')).toBeVisible();
    await expect(page.getByText('調査の目標')).toBeVisible();
    await page.getByRole('button', { name: '調査を開始する' }).click();

    await expect(page.getByText('● 調査フェーズ')).toBeVisible();

    await page.getByRole('button', { name: /エレナ/ }).first().click();
    // キャラクター情報カードが出る
    await expect(page.getByText('に話しかけています').first()).toBeVisible();
    const input = page.getByPlaceholder(/気になる単語を含めて質問/);
    await input.fill('毒の矢について教えてください');
    await page.getByRole('button', { name: '送信' }).click();

    await expect(page.getByText('【モック・エレナ】')).toBeVisible();

    await page.getByRole('button', { name: /ヴィクター/ }).click();
    await input.fill('伯爵との関係を聞かせて');
    await page.getByRole('button', { name: '送信' }).click();
    await expect(page.getByText('【モック・ヴィクター】')).toBeVisible();

    // vampireシナリオは決断ポイント不要、摘発に直接進める
    await expect(page.getByRole('button', { name: '箱の処遇を決める' })).toHaveCount(0);
    await page.getByRole('button', { name: '摘発に進む' }).click();
    await expect(page.getByText('● 摘発フェーズ')).toBeVisible();
    await expect(page.getByText(/⚖ 摘発フェーズ ⚖/)).toBeVisible();

    await page.locator('select').selectOption({ label: 'エレナ' });
    await page.getByPlaceholder('例：毒の矢').fill('毒の矢');
    await page.getByPlaceholder('例：誰かを守るため').fill('妹を市街鬼化から守るため');
    await page.getByRole('button', { name: '真相を告発する' }).click();

    await expect(page.getByRole('heading', { name: '真相解明' })).toBeVisible();
    await expect(page.getByText(/妹を市街鬼化から守るため/)).toBeVisible();
    await expect(page.getByRole('button', { name: '最初からやり直す' })).toBeVisible();
  });
});
