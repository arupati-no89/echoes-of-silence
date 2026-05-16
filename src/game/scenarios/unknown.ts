import { Scenario, PlayerChoices } from "../types";

function match(chosen: PlayerChoices, oxygen: boolean | "late" | null, box: string | null): boolean {
  const oxMatch = oxygen === null ? true
    : oxygen === "late" ? chosen.oxygenFixed === false
    : chosen.oxygenFixed === oxygen;
  const boxMatch = box === null ? true : chosen.boxDecision === box;
  return oxMatch && boxMatch;
}

export const unknownScenario: Scenario = {
  title: "アンノウン — ワームホールのパラドックス",
  intro: `——宇宙暦2187年、調査船オデッセイ。

ワームホール実験のため、辺境のA地点（無人惑星圏）に到着。
転送装置から1つの金属箱が送られてきた——B地点（3時間後の未来）から、自分たち自身の手で。
中身は船長の焼死体だった。

それから3時間。船長はメインルームで仲間と作戦会議をしていたが、
エアロックを点検しに行った際、突如として大爆発が発生。
回収された遺体は、あの箱の中のものと寸分違わぬ姿で焼け焦げていた。

——タイムパラドックスが成立した。
未来の死体が過去に送られ、過去の人物がその通りに死ぬ。
殺意も犯人も、まだ誰にも見えていない。

貴方は宇宙評議会から派遣された「調査官」。
副船長と、箱の中から見つかった謎の生命体——双方から話を聞き、真相を解き明かせ。`,
  briefing: {
    setting:
      "宇宙暦2187年、調査船オデッセイがワームホール実験のためA地点に到着。未来から自船の遺体が送られてきた。",
    victim:
      "船長 — オデッセイの艦長。実験指揮中、エアロック付近で大爆発に巻き込まれ焼死。死体は箱の中身と同一姿。",
    crimeScene:
      "エアロック内部での爆発。酸素濃度管理システムが操作されており、高圧電線（赤色絶縁体）が露出。宇宙服が2着紛失。",
    yourRole:
      "貴方は宇宙評議会から派遣された「調査官」。タイムパラドックスを解き、船と乗組員の運命を決定する。",
    objectives: [
      "「箱の中の焼死体」と「実際の焼死」が一致した因果を解明する",
      "副船長と箱の中の生命体（Aサルコ）から証言を集める",
      "酸素濃度管理システムと、箱の扱いについて決断する",
      "犯人・凶器・動機の3点を揃えて告発する",
    ],
  },
  characters: [
    {
      id: "first_officer",
      name: "副船長",
      publicProfile:
        "副船長。船長とは10年以上の付き合いで信頼は厚い。口数は少ないが有能な実務型。",
      relationToVictim:
        "船長の長年の盟友。事件当時はメインルームで作戦会議に参加していた。船内事情に最も詳しい人物。",
      suggestedQuestions: [
        "事件当時はどこにいましたか？",
        "エアロック周辺で何か気付いたことは？",
        "船長とAサルコの関係について教えてください",
      ],
      hiddenTruths: [
        {
          level: 1,
          content: "私の正体はAサルコ——相手の記憶を読む能力を持つ宇宙生命体だ。本物の副船長はA地点到着前に入れ替わった。だが私は船長を信用している",
        },
        {
          level: 2,
          content: "別のAサルコ（凶悪個体）がA地点で忍び込み、箱の中に隠れている。そいつが船長を殺した。私は正体を隠しながら、真犯人を追わなければならない",
        },
      ],
      evidenceResponses: [
        { keyword: "正体", reaction: "「…なぜそれを。いや、今はそれより箱の中の話をしよう。」" },
        { keyword: "箱", reaction: "「あの箱が届いた時、私たちはメインルームにいた。まさか中に船長の死体が…」" },
        { keyword: "エアロック", reaction: "「エアロックの立て付けが悪くてな。扉が壁に擦った跡が残っている。赤い絶縁体の線が露出していた」" },
        { keyword: "酸素", reaction: "「システムルームの酸素濃度管理システムが操作されていた。ライトが青くなっていた——酸素過多の証拠だ」" },
        { keyword: "宇宙服", reaction: "「保管庫から宇宙服が2着盗まれている。真空対策用に誰かが準備したんだ」" },
      ],
      speechStyle:
        "冷静で落ち着いた口調だが、時折人間の感情を模倣しているのがわかる違和感がある。語尾は「〜だ」「〜た」。",
      voiceType: "onyx",
    },
    {
      id: "asalco_box",
      name: "箱の中のAサルコ",
      publicProfile:
        "箱と共に転送されてきた未知の生命体。人間の姿に変身・模倣する能力を持ち、接触した相手の記憶を読む「リンク」能力を持つ。凶暴で狡猾。",
      relationToVictim:
        "船長との直接面識はないとされる謎の存在。箱を通じて船内に侵入したことは確実。",
      suggestedQuestions: [
        "なぜこの船に来たのですか？",
        "船長の焼死体について何を知っていますか？",
        "あなたの『リンク』能力とは何ですか？",
      ],
      hiddenTruths: [
        {
          level: 1,
          content: "A地点で船に忍び込み、船員たちが『船長の焼死体』の話で盛り上がっているのを聞いた。その会話を聞いて、箱の中の光景を『現実』にしようと決意した",
        },
        {
          level: 2,
          content: "手口：エアロック壁の高圧電線（赤色絶縁体）を破壊 → 酸素濃度を最大に設定 → 船長がエアロックの扉を開けると壁に接触し火花 → 高酸素環境で大爆発・焼死。その後、死体を箱に入れワームホールで送り返すつもりだった",
        },
      ],
      evidenceResponses: [
        { keyword: "焼死体", reaction: "「ああ、あれか。私がやった。」（あっさり認める）" },
        { keyword: "会議", reaction: "「会議の話？知らないな。私は箱の中に隠れていたからね。」（会議前の知識しかない）" },
        { keyword: "酸素", reaction: "「酸素濃度を最大にすれば、小さな火花でも大爆発する。簡単な話だ。」" },
        { keyword: "リンク", reaction: "「船長の記憶は読んだ。父親が宇宙性精神病で死んだこと、ボスに感謝していること…面白い人生だ。」" },
        { keyword: "タイムパラドックス", reaction: "「私が船長を殺したからこそ、箱の中の死体が存在する。殺さなければパラドックスが起きて全てが消える。」" },
      ],
      speechStyle:
        "知的で挑戦的。自分の犯行を誇示するような言い回し。語尾は「〜だ」「〜ね」。",
      voiceType: "echo",
    },
  ],
  solution: {
    culprit: "asalco_box",
    weapon: "酸素濃度操作＋エアロック壁の高圧電線破壊による焼殺",
    motive: "未来から送られてきた箱の中の光景（船長の焼死体）を現実のものとして確定させるため。タイムパラドックスを成立させる必要があった",
  },
  endings: [
    {
      id: "END1",
      title: "ベストエンド — 全員生還",
      description: `酸素濃度管理システムを修正し、箱の中にAサルコが潜んでいることを理解した上で開封した。

船長と副船長は協力して犯人Aサルコを焼死体に仕立て上げ、箱に入れてB地点へ投入する。
タイムパラドックスは回避され、3時間後——船長は生きている。
ワームホール実験は成功し、2人は英雄として地球に帰還する。`,
      condition: (c, correct) =>
        correct && c.oxygenFixed === true && c.boxDecision === "knowingly_open",
    },
    {
      id: "END2-A",
      title: "緊張の対峙 — 本物と偽物",
      description: `酸素は修正したが、箱の中のAサルコに気づかずに開けてしまった。
犯人Aサルコが船内に逃走し、船長に成り代わる。

副船長（善意のAサルコ）だけが真実を知る——目の前にいる2人の「船長」。
リンク能力で本物を見極めろ。緊張の絶頂。`,
      condition: (c, correct) =>
        correct && c.oxygenFixed === true && c.boxDecision === "unknowingly_open",
    },
    {
      id: "END2-B",
      title: "追跡 — 焼死体の逃走",
      description: `酸素は修正したが、箱を無警戒に開けたため犯人Aサルコが焼死体に化けて逃走した。

船長と副船長はタイムパラドックス回避のため、宇宙船の外へと追跡を開始する。
選択が彼らに迫られる——誰を焼死体にするのか。`,
      condition: (c, correct) =>
        correct && c.oxygenFixed === true && c.boxDecision === null,
    },
    {
      id: "END3",
      title: "消失 — タイムパラドックス",
      description: `酸素は修正したが、箱を開けることを拒否した。

タイムパラドックスが発生する——「箱の中の焼死体」が存在しないことで因果律が崩壊する。
宇宙船オデッセイと乗組員全員が、時空の狭間へと消え去った。
何もかもが、最初から存在しなかったかのように。`,
      condition: (c, correct) =>
        correct && c.oxygenFixed === true && c.boxDecision === "not_open",
    },
    {
      id: "END4-A",
      title: "惨劇 — 酸素の中の火",
      description: `酸素濃度が異常なまま、Aサルコの存在を知って箱を開けた。
高酸素環境で火炎放射器が使用され——船内は一瞬で地獄と化す。

大爆発。全てが焼け尽きた。
宇宙に漂う残骸だけが、ここで何かが起こったことを示していた。`,
      condition: (c, correct) =>
        c.oxygenFixed === false && c.boxDecision === "knowingly_open",
    },
    {
      id: "END4-B",
      title: "修正の代償",
      description: `酸素修正が遅れた。Aサルコを認識して箱を開けたが、時すでに遅し。
修正のタイミング次第で、被害は最小限に留まるか、あるいは——。

何かを変えることはできたかもしれない。しかし、選んだ結果が全てだ。`,
      condition: (c, correct) =>
        c.oxygenFixed === false && c.boxDecision === "knowingly_open" && !correct,
    },
    {
      id: "END6",
      title: "最悪の結末 — パラドックスと炎",
      description: `酸素濃度を修正せず、箱も開けなかった。
酸素過多の環境で何かの火花が散る——大火災。
そして箱の中の死体が存在しないことでタイムパラドックスも発生する。

宇宙船は燃え落ち、時空の裂け目に飲み込まれた。
二重の災厄。残されたものは何もない。`,
      condition: (c, correct) =>
        c.oxygenFixed === false && c.boxDecision === "not_open",
    },
    {
      id: "END7",
      title: "犠牲 — 副船長の選択",
      description: `酸素を修正し、副船長（善意のAサルコ）が自ら焼死体となることを選んだ。

「私の命で——全てを救えるなら」
彼／彼女は箱の中に入り、自らの命運をタイムパラドックスに捧げた。
船長は生き残った。しかし、その胸には永遠に消えない喪失感が刻まれる。
副船長の本当の名前を、誰も知らない。`,
      condition: (c, correct) =>
        correct && c.oxygenFixed === true && c.boxDecision === "sacrifice",
    },
  ],
  requiredDecisions: ["oxygenFixed", "boxDecision"],
};
