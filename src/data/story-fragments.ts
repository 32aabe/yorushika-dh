import type { Lang } from "@/types/song";

export type FragmentType = "prologue" | "scene" | "letter" | "cassette" | "ending";

export interface StoryVariableDelta {
  acceptance?: number;
  distance?: number;
  attachment?: number;
}

export interface StoryChoice {
  label: Record<Lang, string>;
  to: string;
  effect?: StoryVariableDelta;
}

export interface StoryFragment {
  id: string;
  type: FragmentType;
  /** Suggested song(s) to surface as small song cards under this passage. */
  songIds?: string[];
  text: Record<Lang, string>;
  signature?: Record<Lang, string>;
  choices: StoryChoice[];
  /** True for one of the four terminal fragments. */
  isEnding?: boolean;
}

export const startFragmentId = "prologue";

/**
 * An interpretive story path inspired by the Amy/Elma narrative implied
 * across Yorushika's two concept albums -- not an official plot summary,
 * and not a literal transcription of any single song or interview. Built
 * around three tracked variables (acceptance / distance / attachment)
 * that accumulate from the choices made in Letters 2, 4, and 5, and
 * decide which of four endings the "Arrival" branch resolves to.
 */
export const fragments: Record<string, StoryFragment> = {
  // ------------------------------------------------------------------ //
  prologue: {
    id: "prologue",
    type: "prologue",
    text: {
      jp:
        "古い道具屋。\n\n奥の引き出しに、写真と手紙、カセットテープ、そして古い乗車券が一枚。\n\n手紙はすべて「エルマへ」と宛てられている。返信は、一通も見当たらない。\n\nカセットのラベルには、こう書かれている──\n\n「8/31」\n\n気づけば、その乗車券を手に取っていた。",
      en:
        "An old curiosity shop.\n\nIn the back of a drawer: photographs, letters, a cassette tape, and a single old train ticket.\n\nEvery letter is addressed to Elma. Not one reply can be found.\n\nThe cassette is labeled —\n\n\"8/31\"\n\nWithout quite deciding to, you pick up the ticket.",
      kr:
        "오래된 잡화점.\n\n서랍 안쪽에 사진과 편지, 카세트테이프, 그리고 낡은 승차권 한 장이 있다.\n\n편지는 모두 「엘마에게」라고 적혀 있다. 답장은 단 한 통도 보이지 않는다.\n\n카세트 라벨에는 이렇게 쓰여 있다──\n\n「8/31」\n\n어느새, 그 승차권을 손에 들고 있었다.",
    },
    choices: [
      {
        label: { jp: "乗車券を手に取る →", en: "Take the ticket →", kr: "승차권을 손에 들다 →" },
        to: "station",
      },
    ],
  },

  // ------------------------------------------------------------------ //
  station: {
    id: "station",
    type: "scene",
    text: {
      jp:
        "小さな田舎の駅。\n\n夏の熱気が、ホームの石畳から立ち上がってくる。\n\n電車に乗り込む。座席は半分も埋まっていない。\n\nカセットプレイヤーと、一通の封筒が鞄に入っている。",
      en:
        "A small rural station.\n\nSummer heat rises off the platform stones.\n\nYou board the train. The seats are less than half full.\n\nA cassette player and a single envelope sit in your bag.",
      kr:
        "작은 시골 역.\n\n여름의 열기가 플랫폼 돌바닥에서 피어오른다.\n\n기차에 오른다. 좌석은 반도 차 있지 않다.\n\n가방 속에는 카세트 플레이어와 편지 한 통이 들어 있다.",
    },
    choices: [
      { label: { jp: "カセットを再生する →", en: "Play the cassette →", kr: "카세트를 재생하다 →" }, to: "cassette-0831" },
      { label: { jp: "手紙を開く →", en: "Open a letter →", kr: "편지를 열다 →" }, to: "letter-1" },
    ],
  },

  // ------------------------------------------------------------------ //
  "cassette-0831": {
    id: "cassette-0831",
    type: "cassette",
    songIds: ["0831"],
    text: {
      jp:
        "ノイズ。\n\nそのあとに、静かなインストゥルメンタルの旋律。\n\n歌詞はない。最後まで、何かが言われずに終わる。\n\n曲名は──「8/31」。",
      en:
        "Static.\n\nThen a quiet instrumental melody.\n\nThere are no vocals. Something ends without ever being said.\n\nThe track is titled — \"8/31.\"",
      kr:
        "잡음.\n\n그 뒤로, 조용한 인스트루멘탈 멜로디.\n\n가사는 없다. 끝까지, 무언가가 말해지지 않은 채로 끝난다.\n\n곡의 제목은──「8/31」.",
    },
    choices: [
      { label: { jp: "手紙を開く →", en: "Open a letter →", kr: "편지를 열다 →" }, to: "letter-1" },
    ],
  },

  // ------------------------------------------------------------------ //
  "letter-1": {
    id: "letter-1",
    type: "letter",
    songIds: ["ame-to-cappuccino"],
    text: {
      jp:
        "エイミーが、エルマに書いている。\n\n雨。カフェ。最初に会った日のこと。\n\nエルマは、テーブルに置かれていた一枚の楽譜を拾い上げた。",
      en:
        "Amy is writing to Elma.\n\nRain. A café. The day they first met.\n\nElma had picked up a loose sheet of music left on the table.",
      kr:
        "에이미가 엘마에게 쓰고 있다.\n\n비. 카페. 처음 만난 날의 일.\n\n엘마는 테이블에 놓여 있던 악보 한 장을 주워 들었다.",
    },
    signature: {
      jp: "「どうか君が溢れないように」",
      en: "\"Please don't let yourself overflow.\"",
      kr: "「부디 네가 흘러넘치지 않도록」",
    },
    choices: [{ label: { jp: "続きへ →", en: "Continue →", kr: "계속 →" }, to: "letter-2" }],
  },

  // ------------------------------------------------------------------ //
  "letter-2": {
    id: "letter-2",
    type: "letter",
    songIds: ["shikaki-to-coffee", "dakara-boku-wa-ongaku-wo-yameta"],
    text: {
      jp: "次の数通は、雨よりも音楽について多く語っていた。\n\nエイミーはずっと、ピアニストになることを夢見ていたらしい。いくつかのページにはコンクールのことが書かれていて、別のページには知らない町での小さな演奏会のことが書かれていた。\n\n彼は時々、詩も書いていた。ほとんどは未完成のままだった。\n\nやがて手紙は、ピアノの練習について触れ始める。正式なレッスンではない。カフェが閉まったあと、二人で過ごす夜の時間だった。\n\nエイミーがエルマに、鍵盤の上に指を置く場所を教える。耳で旋律を追う方法を教える。静かな部分で、少しだけ速度を落とすことを教える。\n\nけれど不思議なことに、その記述はすぐに変わっていく。\n\n読み進めるほど、エイミーは彼女に教えることについて書かなくなっていった。\n\n代わりに、彼女の音を聴くことについて書くようになっていった。",
      en: "The next few letters spoke more about music than rain.\n\nAmy had apparently dreamed of becoming a pianist for a long time. Some pages mentioned competitions. Others described small performances in unfamiliar towns.\n\nHe also wrote poetry from time to time. Most of it seemed unfinished.\n\nAt some point, the letters begin mentioning piano lessons. Not formal ones. Just evenings spent together after the café closed.\n\nAmy teaching Elma how to place her fingers on the keys. How to follow melodies by ear. How to slow down during quieter sections.\n\nThe strange part was how quickly the descriptions changed after that.\n\nThe further you read, the less Amy wrote about teaching her.\n\nAnd the more he wrote about listening instead.",
      kr: "다음 몇 통의 편지는 비보다 음악에 대해 더 많이 말하고 있었다.\n\n에이미는 오래전부터 피아니스트가 되는 것을 꿈꿔왔던 것 같다. 어떤 페이지에는 콩쿠르 이야기가 적혀 있었고, 다른 페이지에는 낯선 마을에서 있었던 작은 연주회 이야기가 적혀 있었다.\n\n그는 가끔 시도 썼다. 대부분은 미완성인 채로 남아 있었다.\n\n어느 순간부터 편지에는 피아노 레슨 이야기가 나오기 시작한다. 정식 수업은 아니었다. 카페가 문을 닫은 뒤, 둘이 함께 보내던 저녁 시간이었다.\n\n에이미가 엘마에게 건반 위에 손가락을 놓는 법을 가르친다. 귀로 멜로디를 따라가는 법을 가르친다. 조용한 부분에서 조금 천천히 연주하는 법을 가르친다.\n\n그런데 이상하게도, 그 묘사는 곧 달라지기 시작한다.\n\n읽어갈수록 에이미는 그녀를 가르치는 일에 대해 덜 쓰게 되었다.\n\n대신, 그녀의 소리를 듣는 일에 대해 더 많이 쓰게 되었다.",
    },
    choices: [
      {
        label: { jp: "──彼女の成長を、誇らしく見ていたのかもしれない", en: "— Maybe Amy was proud watching her grow", kr: "── 그녀의 성장을 자랑스럽게 보고 있었는지도 모른다" },
        to: "letter-3",
        effect: { acceptance: 1 },
      },
      {
        label: { jp: "──自分が置いていかれていく気がしていたのかもしれない", en: "— Maybe Amy felt himself falling behind", kr: "── 자신이 뒤처지고 있다고 느꼈는지도 모른다" },
        to: "letter-3",
        effect: { distance: 1 },
      },
    ],
  },

  // ------------------------------------------------------------------ //
  "letter-3": {
    id: "letter-3",
    type: "letter",
    songIds: ["ame-to-cappuccino", "shikaki-to-coffee"],
    text: {
      jp: "そのあとの手紙は、少しずつまとまりを失っていった。\n\n日付が抜けることが増え、ところどころページも欠けている。\n\nそれでも、何度も繰り返し現れるものがあった。\n\n雨に濡れたカフェ。手書きの書き込みでいっぱいの楽譜。レシートの裏に書かれた詩。\n\n時には、二人が閉店後のカフェに夕方まで残っていたことが書かれていた。\n\nエイミーがピアノで未完成の旋律を弾き、エルマがそれに合う言葉を探す。\n\n別の手紙では、雨が上がったあとの夏の散歩道が描かれている。\n\nオレンジ色の光を映す誰もいない通り。まだ濡れたままの舗道の匂い。\n\n読み進めるほど、一つのことがはっきりしていく。\n\nエイミーが音楽について何を感じていたとしても、エルマが隣にいるとき、彼は本当に幸せそうだった。",
      en: "The letters gradually became less organized after that.\n\nDates disappeared more often. Several pages were missing entirely.\n\nStill, certain things appeared again and again.\n\nRain-soaked cafés. Sheet music covered in handwritten notes. Poems written across the backs of receipts.\n\nSometimes Amy wrote about the two of them staying inside the café until evening, long after everyone else had left.\n\nHe would play unfinished melodies on the piano while Elma searched for words to match them.\n\nOther times, the letters described summer walks after the rain had stopped.\n\nEmpty streets reflecting orange light. The smell of wet pavement lingering in the air.\n\nThe more you read, the clearer one thing becomes.\n\nWhatever Amy may have felt about music, he genuinely seemed happiest when Elma was beside him.",
      kr: "그 뒤의 편지들은 조금씩 흐트러지기 시작했다.\n\n날짜가 빠지는 일이 늘었고, 중간중간 사라진 페이지도 있었다.\n\n그래도 몇 가지는 계속해서 반복되었다.\n\n비에 젖은 카페. 손글씨 메모로 가득한 악보. 영수증 뒷면에 적힌 시.\n\n어떤 편지에는 두 사람이 모두가 떠난 뒤에도 카페 안에 남아 저녁까지 시간을 보냈다는 이야기가 적혀 있었다.\n\n에이미는 피아노로 미완성의 멜로디를 연주하고, 엘마는 그 멜로디에 어울리는 말을 찾았다.\n\n다른 편지에는 비가 그친 뒤의 여름 산책길이 적혀 있었다.\n\n주황빛을 비추는 텅 빈 거리. 아직 젖어 있는 포장도로의 냄새.\n\n읽어갈수록 한 가지가 분명해진다.\n\n에이미가 음악에 대해 무엇을 느끼고 있었든, 엘마가 곁에 있을 때 그는 정말로 행복해 보였다.",
    },
    choices: [{ label: { jp: "続きへ →", en: "Continue →", kr: "계속 →" }, to: "letter-4" }],
  },

  // ------------------------------------------------------------------ //
  "letter-4": {
    id: "letter-4",
    type: "letter",
    songIds: ["elma", "nautilus", "parade"],
    text: {
      jp: "後半の手紙は、どこか静かだった。\n\nある時期から、エイミーは演奏会についてあまり書かなくなった。\n\n代わりに、ページはもっと小さなもので埋まっていく。\n\n列車の窓を打つ雨。何週間も完成しない曲。濡れた夏の道を歩く足音。\n\nそれでも、エルマはずっと手紙の中にいた。\n\n彼女が何気なく口ずさんだ旋律。彼女が笑った詩。夏が戻ったらもう一度行こうと約束したカフェ。\n\nその名前が、何を意味していたのかはわからない。\n\n彼をこの場所につなぎとめていたのかもしれないし、もうどこか遠くへ向かわせていたのかもしれない。\n\n疲れについて書いているときでさえ、音楽と向き合うことが苦しくなっているときでさえ、エルマの名前だけは、ページの上に残り続けていた。",
      en: "The later letters felt quieter somehow.\n\nAmy wrote less about performances after a certain point.\n\nInstead, the pages became filled with smaller things.\n\nRain against train windows. Songs left unfinished for weeks. The sound of footsteps through wet summer streets.\n\nElma still appeared constantly throughout the letters.\n\nA melody she hummed absentmindedly. A poem she laughed at. A café the two promised to revisit once summer returned.\n\nYou cannot tell exactly what her name meant there.\n\nMaybe it was something keeping him grounded. Maybe it was already pulling him somewhere far away.\n\nEven when Amy wrote about exhaustion, or music becoming harder to face, Elma's name kept remaining on the page.",
      kr: "후반의 편지들은 어딘가 더 조용했다.\n\n어느 시점부터 에이미는 연주회에 대해 거의 쓰지 않게 되었다.\n\n대신 페이지는 더 작은 것들로 채워졌다.\n\n기차 창문을 두드리는 비. 몇 주째 완성되지 못한 곡. 젖은 여름 거리를 걷는 발소리.\n\n그래도 엘마는 편지 속에 계속해서 등장했다.\n\n그녀가 무심코 흥얼거리던 멜로디. 그녀가 웃었던 시. 여름이 다시 오면 함께 가자고 약속했던 카페.\n\n그 이름이 그곳에서 정확히 무엇을 의미했는지는 알 수 없다.\n\n그를 이곳에 붙잡아두는 것이었을 수도 있고, 이미 어딘가 먼 곳으로 향하게 만드는 것이었을 수도 있다.\n\n에이미가 피로에 대해 쓸 때에도, 음악을 마주하는 일이 점점 어려워지고 있다고 쓸 때에도, 엘마의 이름만은 계속해서 페이지 위에 남아 있었다.",
    },
    choices: [
      {
        label: { jp: "──エルマがいたから、地に足をつけていられたのかもしれない", en: "— Maybe Elma kept Amy grounded", kr: "── 엘마가 있었기에 두 발을 딛고 있을 수 있었는지도 모른다" },
        to: "letter-5",
        effect: { attachment: 1 },
      },
      {
        label: { jp: "──もう、少しずつ遠ざかり始めていたのかもしれない", en: "— Maybe Amy had already begun drifting away", kr: "── 이미 조금씩 멀어지기 시작했는지도 모른다" },
        to: "letter-5",
        effect: { distance: 1 },
      },
    ],
  },

  // ------------------------------------------------------------------ //
  "letter-5": {
    id: "letter-5",
    type: "letter",
    songIds: ["elma", "nautilus", "kokoro-ni-ana-ga-aita"],
    text: {
      jp: "さらに後の手紙は、違う種類の紙に書かれていた。\n\nノートから破り取られたようなページもあれば、端に水の染みが残っているものもある。\n\n時間が経つにつれて、筆跡も少しずつ不安定になっていった。\n\n雨に濡れた道や知らない駅の描写のあいだに、ようやく事実が現れる。\n\nエイミーは、自分にはもうあまり時間が残されていないと告げられていた。\n\nその一文は、妙に何気なく書かれていた。\n\nまるで、彼がもう長いあいだ一人で考え続けてきたことのように。\n\n彼はエルマに、何も言わずに去ったことを謝っていた。\n\n何度も。\n\nそれでも手紙は続いていく。\n\n遠い港の波の音。朝早く通り過ぎたパン屋。雨が降る前の空の色。夕暮れの無人駅。\n\nページのあいだには、何枚かの写真も挟まれていた。\n\nぼやけた海岸線。静かな通り。曇った川面に映る淡い夕方の光。\n\nどの写真にも、人は写っていなかった。\n\nそれでも読み進めるほど、エイミーがそれぞれの場所を一人で歩いている姿が、かえって鮮明に浮かんでくる。",
      en: "The later letters were written on different kinds of paper.\n\nSome pages looked as though they had been torn from notebooks. Others carried faint water stains across the edges.\n\nThe handwriting also became less steady over time.\n\nSomewhere between descriptions of rainy streets and unfamiliar stations, the truth finally appears.\n\nAmy had been told he did not have much time left.\n\nThe sentence itself is written strangely casually.\n\nAs though he had already spent too long thinking about it alone.\n\nHe apologized to Elma for leaving without saying anything.\n\nMore than once.\n\nThe letters continue long after that.\n\nNot dramatic ones. Mostly small things.\n\nThe sound of waves near distant harbors. A bakery he passed early in the morning. The color of the sky before rain. Empty stations at dusk.\n\nSeveral photographs had been tucked between the pages as well.\n\nBlurred coastlines. Quiet streets. Cloud-covered rivers reflecting pale evening light.\n\nNone of the pictures contained people.\n\nEven so, the more you read, the more vividly you begin imagining Amy walking through each of those places alone.",
      kr: "후반의 편지들은 서로 다른 종류의 종이에 쓰여 있었다.\n\n노트에서 찢어낸 것 같은 페이지도 있었고, 가장자리에 희미한 물 얼룩이 남은 종이도 있었다.\n\n시간이 지날수록 글씨도 조금씩 불안정해졌다.\n\n비에 젖은 거리와 낯선 역에 대한 묘사 사이에서, 마침내 사실이 드러난다.\n\n에이미는 자신에게 시간이 얼마 남지 않았다는 말을 들었다.\n\n그 문장은 이상할 정도로 담담하게 적혀 있었다.\n\n마치 그가 이미 너무 오랫동안 혼자 생각해온 일이라는 듯이.\n\n그는 아무 말 없이 떠난 것에 대해 엘마에게 사과했다.\n\n몇 번이나.\n\n그 뒤로도 편지는 계속된다.\n\n극적인 내용은 아니었다. 대부분은 작은 것들이었다.\n\n먼 항구 근처의 파도 소리. 이른 아침 지나쳤던 빵집. 비가 내리기 전 하늘의 색. 해 질 무렵의 빈 역.\n\n페이지 사이에는 사진도 몇 장 끼워져 있었다.\n\n흐릿한 해안선. 조용한 거리. 구름 낀 강물에 비치는 옅은 저녁빛.\n\n어떤 사진에도 사람은 찍혀 있지 않았다.\n\n그런데도 읽어갈수록, 에이미가 그 장소들을 혼자 걸어가는 모습이 오히려 더 선명하게 떠오르기 시작한다.",

    },
    choices: [
      {
        label: { jp: "──自分が見た世界を、エルマに残したかったのかもしれない", en: "— Maybe Amy wanted Elma to remember the world he saw", kr: "── 자신이 본 세상을 엘마에게 남기고 싶었는지도 모른다" },
        to: "arrival",
        effect: { acceptance: 1 },
      },
      {
        label: { jp: "──エルマを手放せなかったから、書き続けたのかもしれない", en: "— Maybe Amy kept writing because he couldn't let Elma go", kr: "── 엘마를 놓을 수 없어서 계속 써 내려갔는지도 모른다" },
        to: "arrival",
        effect: { attachment: 1 },
      },
    ],
  },

  // ------------------------------------------------------------------ //
  arrival: {
    id: "arrival",
    type: "scene",
    text: {
      jp: "駅が見えるずっと前から、電車はゆっくりと速度を落とし始めた。\n\n窓の外の景色は、ほとんど見知らぬものになっている。\n\n小さな家。電柱。淡い夏の光に洗われた誰もいない道。\n\nカセットはまだ、静かな未完成の旋律を流し続けている。\n\n膝の上に散らばった手紙を見る。\n\n黄ばんだ紙のあいだから滑り落ちそうな写真。ぼやけた海岸線。遠い空。\n\nいつの間にか、あなたは読むのをやめていた。\n\nやがて駅が見えてくる。\n\n果てしない夕空の下に、一つだけ立つ小さなホーム。\n\n扉が静かに開く。\n\n暖かい風が車内に入り込む。\n\nホームにはほとんど誰もいない。\n\n蝉の声と、頭上の電線が低く鳴る音だけが、夏の熱の中に残っている。\n\nあなたはようやく、空を見上げる。",
      en: "The train begins slowing long before the station appears.\n\nOutside the window, the scenery has become almost completely unfamiliar.\n\nSmall houses. Telephone poles. Empty roads washed in pale summer light.\n\nThe cassette beside you continues playing its quiet, unfinished melody.\n\nYou look down at the scattered letters resting across your lap.\n\nPhotographs slipping between yellowed pages. Blurred coastlines. Foreign skies.\n\nAt some point, without noticing, you had stopped reading.\n\nThe station finally comes into view.\n\nA small platform standing alone beneath the endless evening sky.\n\nThe train doors slide open with a quiet mechanical sound.\n\nWarm wind drifts softly through the carriage.\n\nThe platform is almost empty.\n\nOnly the sound of cicadas and overhead wires humming softly in the heat remain.\n\nYou finally look up toward the sky.",
      kr: "역이 보이기도 전부터 기차는 천천히 속도를 줄이기 시작했다.\n\n창밖의 풍경은 거의 완전히 낯선 것이 되어 있었다.\n\n작은 집들. 전봇대. 옅은 여름빛에 씻긴 텅 빈 도로.\n\n곁의 카세트는 아직도 조용한 미완성의 멜로디를 흘려보내고 있다.\n\n무릎 위에 흩어진 편지들을 내려다본다.\n\n누렇게 변한 종이 사이로 미끄러질 듯한 사진들. 흐릿한 해안선. 먼 하늘.\n\n어느 순간부터, 자신도 모르게 읽기를 멈추고 있었다.\n\n마침내 역이 시야에 들어온다.\n\n끝없는 저녁 하늘 아래 홀로 서 있는 작은 플랫폼.\n\n기차 문이 조용한 기계음과 함께 열린다.\n\n따뜻한 바람이 객차 안으로 흘러든다.\n\n플랫폼에는 아무도 없다.\n\n매미 소리와 머리 위 전선이 낮게 웅웅거리는 소리만이 여름의 열기 속에 남아 있다.\n\n마침내 하늘을 올려다본다.",
    },
    choices: [
      { label: { jp: "雨が降り始める →", en: "Rain begins falling →", kr: "비가 내리기 시작한다 →" }, to: "__route_rain" },
      { label: { jp: "夕方の空は晴れている →", en: "The evening sky remains clear →", kr: "저녁 하늘은 맑게 개어 있다 →" }, to: "__route_clear" },
    ],
  },

  // ------------------------------------------------------------------ //
  // Terminal fragments. __route_rain / __route_clear are not real
  // fragment ids -- StoryExplorer intercepts them and resolves to one
  // of the four endings below based on the accumulated variables (see
  // resolveEnding in StoryExplorer.tsx for the exact comparison logic).
  "ending-rain": {
    id: "ending-rain",
    type: "ending",
    isEnding: true,
    songIds: ["ame-to-cappuccino"],
    text: {
      jp:
        "雨に濡れた街並み。\n\n遠くに、見覚えのあるカフェの灯り。\n\nたぶん、ここから始まったのだろう。\n\nそして、たぶん、ここでまた誰かが、同じ雨を見ている。",
      en:
        "Rain-soaked streets.\n\nIn the distance, a café light you almost recognize.\n\nPerhaps this is where it began.\n\nAnd perhaps, somewhere, someone else is watching the same rain fall.",
      kr:
        "비에 젖은 거리.\n\n저 멀리, 익숙한 듯한 카페의 불빛.\n\n아마, 여기서부터 시작되었을 것이다.\n\n그리고 아마, 어딘가에서 또 누군가가 같은 비를 보고 있을 것이다.",
    },
    choices: [],
  },

  "ending-parade": {
    id: "ending-parade",
    type: "ending",
    isEnding: true,
    songIds: ["parade"],
    text: {
      jp:
        "傘の下に、人々が次々と消えていく。\n\nエイミーとエルマも、見えないどこかで、まだ続いているのだろう。\n\nパレードは止まらない。\n\n誰かがいなくなっても、続いていく。",
      en:
        "People vanish beneath their umbrellas, one after another.\n\nAmy and Elma, too, must still be going on somewhere out of sight.\n\nThe parade doesn't stop.\n\nIt continues, even after someone is gone.",
      kr:
        "우산 아래로 사람들이 하나둘 사라져간다.\n\n에이미와 엘마도, 보이지 않는 어딘가에서 여전히 이어지고 있을 것이다.\n\n퍼레이드는 멈추지 않는다.\n\n누군가가 사라져도, 계속되어 간다.",
    },
    choices: [],
  },

  "ending-dakara": {
    id: "ending-dakara",
    type: "ending",
    isEnding: true,
    songIds: ["dakara-boku-wa-ongaku-wo-yameta"],
    text: {
      jp:
        "カセットが、カチリと音を立てて止まる。\n\n静寂。\n\nホームには、誰もいない。\n\nだから、彼は音楽を辞めた。",
      en:
        "The cassette clicks to a stop.\n\nSilence.\n\nThe platform is empty.\n\nThat's why he gave up on music.",
      kr:
        "카세트가 딸깍, 소리를 내며 멈춘다.\n\n정적.\n\n플랫폼에는 아무도 없다.\n\n그래서 그는 음악을 그만두었다.",
    },
    choices: [],
  },

  "ending-hole": {
    id: "ending-hole",
    type: "ending",
    isEnding: true,
    songIds: ["kokoro-ni-ana-ga-aita"],
    text: {
      jp:
        "明るい日差し。\n\nエルマが一人、本を読んでいる。\n\n何も足されず、何も塞がれない。\n\nいくつかの不在は、消えることがない。",
      en:
        "Bright sunlight.\n\nElma, reading alone.\n\nNothing is added; nothing is filled back in.\n\nSome absences never disappear.",
      kr:
        "밝은 햇살.\n\n엘마가 홀로 책을 읽고 있다.\n\n아무것도 더해지지 않고, 아무것도 메워지지 않는다.\n\n어떤 부재는 결코 사라지지 않는다.",
    },
    choices: [],
  },
};
