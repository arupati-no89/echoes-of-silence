import { Scenario } from "./types";

export const vampireScenario: Scenario = {
  title: "緑色の手と密室の罪",
  intro: `夜中の「緑の間」。毒の矢が持ち込まれた伯爵の部屋に散らばっている。
貴方は評議会から派遣された「審判者」。30分後までに犯人を特定しなければならない。`,
  characters: [
    {
      id: "elena",
      name: "エレナ",
      publicProfile:
        "落ち着いた物腰の貴族女性。伯爵家の遠縁にあたる。",
      hiddenTruths: [
        {
          level: 1,
          content: "妹を市街鬼化から守るため、必死になっている",
        },
        {
          level: 2,
          content: "毒の矢を使い、伯爵を殺害した",
        },
      ],
      evidenceResponses: [
        { keyword: "毒", reaction: "「それは私...いや、何でもありませんわ！」（激しい動揺）" },
        { keyword: "妹", reaction: "「妹は関係ありません、彼女はただの人間です」" },
        { keyword: "手袋", reaction: "「手袋ならどの貴族も持っていますわ」" },
      ],
      speechStyle:
        "丁寧な言葉遣いだが、追及されると感情的になる。語尾は「〜ですわ」「〜ますわ」。",
      voiceType: "alloy",
    },
    {
      id: "victor",
      name: "ヴィクター",
      publicProfile:
        "若くて粗野な雰囲気の男性。伯爵の遠縁の甥。",
      hiddenTruths: [
        {
          level: 1,
          content: "友人を助けるための遺産を必要としている",
        },
        {
          level: 2,
          content:
            "毒の手袋を遺体の側に置き、自分がやったと思わせる工作をした",
        },
      ],
      evidenceResponses: [
        { keyword: "友人", reaction: "「あの男のために今こうなのだから、殺しの動機になると？」" },
        { keyword: "毒の手袋", reaction: "「...っ！あれはただの護身用だ！」" },
      ],
      speechStyle: "やや荒い言い回し。タメ口で語尾は「〜だ」「〜た」。",
      voiceType: "echo",
    },
  ],
  solution: {
    culprit: "elena",
    weapon: "ヴィクターが忌み捨てた毒の矢",
    motive: "妹を市街鬼化から守るため",
  },
};
