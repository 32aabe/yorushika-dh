"use client";

import Image from "next/image";
import { useState } from "react";
import { useLanguage, handwrittenClass } from "@/lib/language-context";
import { assetPath } from "@/lib/asset-path";

type Lang = "jp" | "en" | "kr";
type Section = "yorushika" | "project" | "methodology";

type SimpleContent = {
  title: string;
  body: string[];
};

type MethodologySubsection = {
  id: "process" | "limitations" | "digital";
  heading: string;
  body: string[];
};

type MethodologyContent = {
  title: string;
  intro: string[];
  sections: MethodologySubsection[];
};

type ProcessFigure = {
  title: Record<Lang, string>;
  caption: Record<Lang, string>;
  images: {
    src: string;
    alt: string;
  }[];
};

const TABS: Section[] = ["yorushika", "project", "methodology"];

const SIMPLE_COPY: Record<Exclude<Section, "methodology">, Record<Lang, SimpleContent>> = {
  yorushika: {
    jp: {
      title: "ヨルシカについて",
      body: [
        "ヨルシカは、作曲家・ギターのn-bunaとボーカルのsuisによる日本の二人組ロックバンド。2017年6月、ミニアルバム『夏草が邪魔をする』でデビューした。",
        "2019年4月、1stフルアルバム『だから僕は音楽を辞めた』でメジャーデビュー。同年、『エルマ』を発表し、二つのアルバムは対になる物語として構成されている。",
        "文学的な歌詞と季節感のある旋律が特徴で、太宰治や伊福部昭、ジュール・ヴェルヌなど文学作品からの引用も多い。メンバーは公の場で素顔を明らかにしておらず、「作品が作家よりも先にあるべき」という方針を取っている。",
      ],
    },
    en: {
      title: "About Yorushika",
      body: [
        "Yorushika is a Japanese rock duo formed by composer/guitarist n-buna and vocalist suis. They debuted in June 2017 with the mini-album The Summer Grass Is Getting in My Way.",
        "In April 2019 they made their major-label debut with their first full album, Dakara Boku wa Ongaku wo Yameta, also known as So I Quit Music. Later that year they released Elma, a second album conceived as the counterpart to the first.",
        "Their songs are known for literary lyrics and seasonal, narrative-driven melodies, often referencing literature and treating each album as the soundtrack to its own short story. The duo keeps their faces and personal details private by design.",
      ],
    },
    kr: {
      title: "요루시카에 대해",
      body: [
        "요루시카는 작곡가 겸 기타리스트 n-buna와 보컬 suis로 이루어진 일본의 2인조 록 밴드다. 2017년 6월 미니 앨범 《여름풀이 방해를 해》로 데뷔했다.",
        "2019년 4월 첫 정규 앨범 《그래서 나는 음악을 그만두었다》로 메이저 데뷔했으며, 같은 해 그 짝이 되는 이야기로 구상된 두 번째 앨범 《엘마》를 발표했다.",
        "문학적인 가사와 계절감이 뚜렷한 멜로디로 알려져 있으며, 앨범마다 하나의 이야기를 따라가듯 구성되는 점이 특징이다. 두 사람은 의도적으로 얼굴과 개인 정보를 공개하지 않는다.",
      ],
    },
  },
  project: {
    jp: {
      title: "このサイトについて",
      body: [
        "これはファンサイトではありません。デジタル・ヒューマニティーズの手法を用いて、『だから僕は音楽を辞めた』と『エルマ』という対になる二つのアルバムの間にある関係を視覚化する試みです。",
        "歌詞テキストを単語単位で分析し、曲をまたいで現れる言葉と、その曲だけに強く現れる言葉を抽出しました。これにより、二つの物語がどの言葉を共有し、どこで分かれているのかを辿ることができます。",
        "色やモチーフ、感情の動きといった情報は、MVやインタビューなどの公式資料を参照しつつ、筆者の解釈を加えて構成しています。すべての分析は探求のための手がかりであり、唯一の正しい読み方を提示するものではありません。",
      ],
    },
    en: {
      title: "About This Project",
      body: [
        "This is not a fan wiki. It is an attempt to use digital-humanities methods to visualize the relationship between two paired concept albums, Dakara Boku wa Ongaku wo Yameta and Elma.",
        "Lyrics were analyzed at the word level to surface two kinds of recurring language: bridge words that appear across multiple songs, and signature words that are distinctly strong within a single song. Together, they trace where the two stories share language and where they diverge.",
        "Color, motif, and mood information draws on official MVs and interviews where possible, combined with editorial interpretation. None of this analysis claims to be the one correct reading. It is a set of threads meant for exploring, not a final explanation.",
      ],
    },
    kr: {
      title: "이 사이트에 대해",
      body: [
        "이곳은 팬 위키가 아닙니다. 디지털 인문학적 방법을 활용해 짝을 이루는 두 콘셉트 앨범, 《그래서 나는 음악을 그만두었다》와 《엘마》 사이의 관계를 시각화하려는 시도입니다.",
        "가사를 단어 단위로 분석해 여러 곡에 걸쳐 등장하는 다리가 되는 말과, 한 곡 안에서 유난히 강하게 나타나는 그 곡만의 말을 추출했습니다. 이를 통해 두 이야기가 어디서 말을 공유하고 어디서 갈라지는지를 따라갈 수 있습니다.",
        "색상, 모티프, 분위기 정보는 가능한 한 공식 MV와 인터뷰를 참고했으며, 거기에 편집자의 해석을 더했습니다. 이 분석은 유일하게 옳은 해석이 아니라, 탐색을 위한 하나의 실마리일 뿐입니다.",
      ],
    },
  },
};

const METHODOLOGY: Record<Lang, MethodologyContent> = {
  en: {
    title: "Methodology",
    intro: [
      "This project began as an attempt to show the connections between the songs in Yorushika’s two albums, That’s Why I Gave Up on Music and Elma. The songs share a connected storyline, and many tracks correspond with one another. Rather than explaining these relationships only through writing, I wanted to create a website where users could visually explore how songs, words, and motifs are connected.",
    ],
    sections: [
      {
        id: "process",
        heading: "1. Process",
        body: [
          "Overall, the process moved from lyric collection and morphological analysis to word selection, Excel dataset creation, notebook and Canva-based prototyping, song concept file organization, and finally website implementation and revision with Claude.",
          "I referred to the original Japanese lyrics organized on Namuwiki and collected the lyrics from the two albums into separate files. The goal was not simply to count word frequency in each song, but to examine how the two albums are connected through repeated words and images. I used Python-based Google Colab to analyze word frequency, but frequency alone was not my final standard.",
          "Because Japanese does not separate words with spaces in the same way as English or Korean, I used morphological analysis to divide the lyrics into word units. I removed stop words such as particles and auxiliary verbs, then manually reviewed the results and removed additional general words. For example, I excluded expressions like “mama” (まま, “as it is” or “while still being”) and words like “hitotsu” (一つ, “one”) when they did not directly create a central image of the song.",
          "At first, I planned to use the top five words from each song based only on frequency. However, this often emphasized words that represented one song rather than relationships between songs. Since the goal was to reveal connections across the two albums, I divided the final selection into two signature words and three bridge words for each song. Signature words represent the atmosphere of an individual song, while bridge words appear across multiple songs and help connect them. I organized these selections in an Excel file so that songs could be linked to words, and words could lead users to other songs.",
          "After organizing the dataset, I sketched layouts in a notebook and chose “letters” as the main design concept because letters are important in the albums’ storyline. I then created a Canva prototype centered on “Rain with Cappuccino,” a song that clearly evokes rain, a cafe, postcards, and notebooks. Later, I created a song concept spreadsheet with song titles, corresponding songs, colors, main keywords, representative lyric lines, moods, and visual objects. AI helped me create the columns, but I filled in the details myself. Since translating the full lyrics was unrealistic, I chose one representative lyric line for each song so users could see at least one line in English and Korean. I also used Google search to translate song titles, although some English titles may differ from official translations.",
          "At first, I imagined a Palladio-like network where all songs and words would appear together in one large mind map. Even during the Canva prototype stage, I expected the connection page to work this way. However, when Claude produced the first working version, the connection map felt too large and visually confusing. Showing 28 songs and many words at once made it difficult for users to follow one relationship carefully. Near the final stage, I changed the structure so that users move by clicking from a song to a word and then from that word to another song. This was a compromise from my original idea, but it made the relationships easier to explore slowly.",
          "I also added brief song descriptions, representative lyric lines, original song links, and creator comments when available. To avoid relying only on my own interpretation, I used interview comments for some songs and a light story section for new users. The site supports English, Korean, and Japanese, but the data analysis was based entirely on the original Japanese lyrics because translation can change word choice and nuance.",
        ],
      },
      {
        id: "limitations",
        heading: "2. Limitations",
        body: [
          "This project has several limitations. First, because I used the original Japanese lyrics to identify repeated words more accurately, the full lyrics on the site are provided only in Japanese. The connection tab and explanation sections are available in English and Korean, but users who do not know Japanese may still have difficulty understanding all of the lyrics. Preserving the original text therefore reduced accessibility.",
          "Second, I cannot be certain that the morphological analysis was perfect. Japanese lyrics often include literary expressions, repetition, and unusual phrasing, so some words may have been divided incorrectly or omitted. The removal of stop words also involved my own subjectivity. A word such as “hitotsu,” meaning “one,” may seem general in one context but meaningful in another.",
          "There were also limitations in sources and translation. I wanted to use creator comments to avoid making the story section too subjective, but I could not find equal amounts of official commentary for every song. Some information was found with the help of AI and checked against what I already knew, but not every quotation could be fully verified. Similarly, some English and Korean song titles may differ from official or fan translations.",
          "Finally, the interface itself has limitations. The click-based song-word-song structure is easier to follow than a large map, but users cannot see the entire network at once. The final design also did not fully reflect the Canva prototype. I wanted to include details such as rain-soaked paper, water droplets, paper conditions, and main objects for each song, but time and implementation limits prevented me from using all of these ideas.",
        ],
      },
      {
        id: "digital",
        heading: "3. The Digital Difference",
        body: [ "The biggest digital difference of this project is that I was able to see lyrics not as linear texts, but as a network that connects songs to one another. When listening to an album in a traditional way, we usually focus on the track order, the emotion of each individual song, and the overall narrative flow. However, by creating a map that connects songs and words, the lyrics began to appear not as texts contained within individual songs, but as a connective structure that links multiple songs together.", 
                "Songs that I had vaguely felt were similar became more concretely connected through repeated words and images. Users could also begin with one song and move to another by following shared words. Through this process, Yorushika’s albums no longer appeared only as works experienced through a fixed track order, but as a network that could be explored through lyrics. Digital analysis allowed me to revisit a work that I thought I already knew, and it made clearer that Yorushika’s distinctive atmosphere is created not only within individual songs, but through repetition and connection between songs.", 
                "For example, 「藍二乗」(Indigo Squared) and 「憂一乗」(Melancholy to the First Power) can be seen as officially or narratively paired songs, but in the actual data, they shared almost no major words except ‘君/kimi,’ a very basic word meaning ‘you.’ In contrast, the word ‘夜/night’ appeared in 「エルマ」(Elma), 「藍二乗」(Indigo Squared), and 「ノーチラス」(Nautilus), showing that songs can be loosely connected through lyrical images and atmosphere even when they are not directly paired in the official storyline. In this way, digital analysis revealed that narrative connections and word-based connections do not always match, and it made me reconsider relationships between songs that I thought I already understood.",
                "Through this project, I came to understand that the significance of Digital Humanities is not simply in transferring existing materials into a digital environment. Many DH projects collect and reconstruct already existing materials, such as texts, images, records, and music. Therefore, what matters is not how much information is displayed, but what kind of flow users follow within that information and what they are guided to focus on. A digital environment can display a large amount of information at once, but if that information does not guide the user’s attention, the project can become a difficult archive to read.", 
                "In this sense, I think a DH project is both a space for storing information and a structure for designing attention. In my project, I did not want to simply gather lyrics or show every connection at once. Instead, I wanted to create a flow in which users move from a song to a word, and then to another connected song. In other words, through repeated words and images, I designed the project so that users could refocus on the relationships, atmosphere, and narrative flow between Yorushika’s songs. Ultimately, I understand the value of DH not as replacing original materials with digital forms, but as designing a structure that allows users to return to those materials with deeper attention." ],
      },
    ],
  },
  kr: {
    title: "방법론",
    intro: [
      "이 프로젝트는 요루시카의 두 앨범 『그래서 나는 음악을 그만두었다』와 『엘마』 속 곡들의 관계를 보여주기 위해 시작했다. 두 앨범의 곡들은 서로 연결된 스토리를 가지고 있으며, 많은 트랙들이 서로 대응되도록 구성되어 있다. 나는 이러한 관계를 글로만 설명하기보다, 사용자가 직접 곡과 단어, 모티프의 연결을 눈으로 보고 탐색할 수 있는 웹사이트로 만들고 싶었다.",
    ],
    sections: [
      {
        id: "process",
        heading: "1. Process",
        body: [
          "전체 과정은 가사 수집과 형태소 분석, 단어 선별, 엑셀 데이터셋 제작, 노트와 Canva를 활용한 프로토타입 제작, song concept 파일 정리, Claude를 활용한 구현과 수정의 순서로 진행되었다.",
          "먼저 나무위키에 정리된 일본어 원문 가사를 참고해 두 앨범의 가사를 각각 하나의 파일로 정리했다. 이 프로젝트의 목표는 단순히 각 곡에서 어떤 단어가 많이 등장하는지 세는 것이 아니라, 두 앨범이 반복되는 단어와 이미지를 통해 어떻게 연결되는지를 살펴보는 것이었다. 그래서 Google Colab에서 Python을 사용해 단어 빈도를 분석했지만, 빈도수만을 최종 기준으로 삼지는 않았다.",
          "일본어는 영어와 한국어처럼 띄어쓰기로 단어가 분리되어 있지 않기 때문에, 형태소 분석을 통해 가사를 단어 단위로 나누었다. 이후 조사, 조동사처럼 문법적으로 자주 등장하지만 의미 분석에는 큰 영향을 주지 않는 stop words를 제거했다. 그 뒤 결과물을 직접 확인하며 추가로 일반적인 단어들을 제외했다. 예를 들어 “마마(まま, 그대로 / ~한 채로)”나 “히토츠(一つ, 하나)”처럼 자주 등장하지만 곡의 핵심 이미지를 직접 만들어낸다고 보기 어려운 표현들은 상황에 따라 제외했다.",
          "처음에는 빈도수 기준으로 각 곡의 상위 5개 단어를 사용할 예정이었다. 그러나 이 방식은 개별 곡의 특징을 보여주는 데에는 도움이 되었지만, 곡들 사이의 관계를 드러내기에는 부족한 경우가 있었다. 그래서 최종적으로 각 곡마다 signature word 2개와 bridge word 3개를 선정했다. signature word는 한 곡의 분위기를 대표하는 단어로, bridge word는 여러 곡에 반복되어 등장하며 다른 곡과의 연결을 만들어주는 단어로 보았다. 이 단어들을 엑셀에 정리하여 곡에서 단어로, 단어에서 다른 곡으로 이어질 수 있도록 했다.",
          "데이터를 정리한 뒤에는 이를 어떤 방식으로 보여줄지 고민했다. 노트에 여러 레이아웃을 스케치했고, 앨범의 스토리에서 중요한 요소인 ‘편지’를 메인 디자인 콘셉트로 정했다. 이후 Canva를 활용해 「비와 카푸치노」를 중심으로 프로토타입을 만들었다. 이 곡은 비, 카페, 엽서, 노트 같은 이미지를 떠올리기 쉽고, 두 앨범의 서사에서도 중요한 장면을 담고 있기 때문이다.",
          "여러 곡에 같은 구조를 적용하기 위해 song concept 엑셀 파일도 만들었다. 이 파일에는 곡 제목, 대응되는 곡, 이미지 컬러, 메인 키워드, 대표 가사 한 줄, 곡의 분위기, 주요 오브젝트 등이 포함되었다. 파일의 column과 기본 구조는 AI의 도움을 받아 만들었지만, 실제 내용은 내가 직접 채웠다. 가사 전문을 모두 번역하기는 어려웠기 때문에, 각 곡을 잘 보여준다고 생각하는 가사 한 줄을 골라 영어와 한국어로 제공하고자 했다. 곡 제목 번역은 Google 검색을 참고했지만, 모든 곡의 공식 영어 표기를 찾기는 어려워 일부 표기는 공식 번역과 다를 수 있다.",
          "처음에는 Palladio와 같은 형식으로 모든 곡과 단어가 하나의 큰 마인드맵 안에 보이는 구조를 구상했다. Canva 프로토타입을 만들 때까지도 이 방식을 생각하고 있었다. 그러나 Claude를 통해 실제 사이트 형태로 구현해보니, 28개의 곡과 많은 단어가 한 화면에 들어가면서 connection map이 너무 크고 복잡하게 느껴졌다. 여러 번 수정했지만 사용자가 특정 곡과 단어의 관계를 차분히 따라가기 어렵다고 판단했다. 그래서 작업의 거의 마지막 단계에서 구조를 바꾸어, 사용자가 곡에서 단어로, 다시 그 단어와 연결된 다른 곡으로 클릭하며 이동하는 방식으로 수정했다. 이는 원래 구상과는 달라진 타협이었지만, 관계를 더 천천히 탐색할 수 있게 만든 선택이었다.",
          "또한 곡들 사이의 연결뿐 아니라 두 앨범을 관통하는 스토리도 어느 정도 전달하고 싶었다. 그래서 각 곡에는 간단한 설명, 대표 가사, 원곡 링크, 가능한 경우 원작자의 코멘트를 함께 넣었다. 스토리 해석에 나의 주관이 지나치게 들어가는 것을 줄이기 위해 일부 곡에는 인터뷰 내용을 참고했고, story 탭에는 처음 보는 사용자도 세계관을 이해할 수 있도록 가벼운 설명을 넣었다. 사이트는 영어, 한국어, 일본어를 지원하지만, 단어 분석은 번역에 따른 의미 변화와 뉘앙스 차이를 피하기 위해 일본어 원문을 기준으로 진행했다.",
        ],
      },
      {
        id: "limitations",
        heading: "2. Limitations",
        body: [
          "이 프로젝트에는 몇 가지 한계가 있다. 먼저 반복 단어를 정확하게 추려내기 위해 일본어 원문 가사를 사용했기 때문에, 사이트 내 가사 전문은 일본어로만 제공된다. connection 탭과 설명 부분은 영어와 한국어로도 볼 수 있지만, 일본어를 모르는 사용자가 모든 가사를 이해하며 따라가기에는 한계가 있다. 원문성을 지키는 대신 접근성에서는 부족함이 생긴 것이다.",
          "또한 형태소 분석이 완벽했다고 확신할 수 없다. 일본어 가사는 문학적 표현, 반복, 비정형적인 문장 구조를 포함하기 때문에 일부 단어가 의도와 다르게 나뉘었거나 누락되었을 가능성이 있다. stop words를 제거하는 과정에도 나의 주관이 개입되었다. 예를 들어 “히토츠”, 즉 “하나”라는 단어는 어떤 경우에는 일반적인 단어처럼 보이지만, 특정 문맥에서는 중요한 의미를 가질 수도 있다.",
          "자료와 번역에도 한계가 있었다. 스토리 설명이 지나치게 개인적인 해석에 치우치지 않도록 원작자의 코멘트를 참고하고 싶었지만, 모든 곡에 대해 같은 양의 공식 코멘트를 찾을 수는 없었다. 일부 자료는 AI 도구의 도움을 받아 찾고 내가 알고 있던 내용과 비교했지만, 모든 인용을 완전히 검증하지는 못했다. 또한 곡 제목의 영어, 한국어 표기 역시 공식 번역이나 다른 팬 번역과 다를 수 있다.",
          "마지막으로 인터페이스에도 한계가 있다. 클릭을 통해 곡, 단어, 곡으로 이동하는 구조는 거대한 마인드맵보다 따라가기 쉽지만, 사용자가 전체 네트워크를 한눈에 볼 수는 없다. 최종 디자인 역시 Canva 프로토타입을 완전히 반영하지 못했다. 비에 젖은 종이, 물방울, 종이 상태, 곡별 주요 오브젝트 같은 세부 요소를 넣고 싶었지만, 시간과 구현 능력의 한계로 모두 활용하지는 못했다.",
        ],
      },
      {
        id: "digital",
        heading: "3. The Digital Difference",
        body: [ "이 프로젝트의 가장 큰 digital difference는 가사를 하나의 선형적인 텍스트가 아니라, 곡과 곡을 연결하는 네트워크로 다시 볼 수 있었다는 점이다. 전통적인 방식으로 앨범을 들을 때는 보통 트랙 순서, 개별 곡의 감정, 전체적인 서사 흐름에 집중하게 된다. 그러나 곡과 단어를 연결하는 맵을 만들면서, 가사는 더 이상 각 곡 안에만 머무는 텍스트가 아니라 여러 곡을 이어주는 연결 구조로 보이기 시작했다.", 
                "막연히 비슷하다고 느꼈던 곡들은 반복되는 단어와 이미지를 통해 구체적으로 연결되었고, 사용자는 한 곡에서 출발해 공유 단어를 따라 다른 곡으로 이동할 수 있게 되었다. 이 과정에서 요루시카의 앨범은 정해진 트랙 순서로만 경험되는 것이 아니라, 가사를 통해 탐색할 수 있는 관계망처럼 보였다. 디지털 분석은 내가 이미 알고 있다고 생각했던 작품을 다시 보게 만들었고, 요루시카 특유의 분위기가 개별 곡이 아니라 곡들 사이의 반복과 연결 속에서 만들어진다는 점을 더 분명하게 보여주었다.", 
                "예를 들어 「藍二乗(쪽빛 제곱)」과 「憂一乗(우울 한 겹)」은 공식적으로나 서사적으로 서로 대응되는 곡으로 볼 수 있지만, 실제 데이터에서는 두 곡이 공유하는 주요 단어가 거의 없었고 ‘君/키미’처럼 매우 기본적인 단어만 겹쳤다. 반대로 ‘夜/밤’이라는 단어는 「엘마」, 「藍二乗」, 「노틸러스」에 모두 나타나며, 공식적으로 직접 연결된 곡이 아니더라도 가사 속 이미지와 분위기를 통해 느슨하게 이어질 수 있음을 보여주었다. 이처럼 디지털 분석은 곡의 서사적 연결과 단어 기반 연결이 항상 일치하지는 않는다는 점을 드러냈고, 내가 이미 알고 있다고 생각했던 곡들 사이의 관계를 다시 보게 만들었다.",
                "내가 이해한 Digital Humanities의 의의는 단순히 기존 자료를 디지털 환경에 옮겨 놓는 데 있지 않다. 많은 DH 프로젝트는 이미 존재하는 텍스트, 이미지, 기록, 음악 같은 자료를 다시 수집하고 재구성한다. 그렇기 때문에 중요한 것은 자료를 얼마나 많이 보여주는가가 아니라, 사용자가 그 자료 안에서 어떤 흐름을 따라가고, 무엇에 집중하게 되는가이다. 디지털 환경은 많은 정보를 한 화면에 펼쳐 보일 수 있지만, 그 정보가 사용자의 시선을 이끌지 못한다면 프로젝트는 오히려 읽기 어려운 아카이브가 될 수 있다.", 
                "이런 점에서 DH 프로젝트는 정보를 저장하는 공간이면서 동시에 집중을 설계하는 구조라고 생각한다. 나의 프로젝트에서는 가사를 단순히 모아두거나 모든 연결을 한 번에 펼쳐 보이기보다, 곡에서 단어로, 다시 연결된 곡으로 이동하는 흐름을 만들고자 했다. 즉, 반복되는 단어와 이미지의 연결을 통해 사용자가 요루시카의 곡들 사이의 관계, 분위기, 서사적 흐름에 다시 집중하도록 구성했다. 결국 내가 이해한 DH의 가치는 원본 자료를 디지털로 대체하는 것이 아니라, 사용자가 그 자료로 다시 돌아가 더 집중할 수 있는 구조를 설계하는 데 있다." ],
      },
    ],
  },
  jp: {
    title: "制作方法",
    intro: [
      "このプロジェクトは、ヨルシカの二つのアルバム『だから僕は音楽を辞めた』と『エルマ』に収録された楽曲同士のつながりを示すために始めたものである。この二つのアルバムの楽曲は一つの物語を共有しており、多くのトラックが互いに対応するように構成されている。私はその関係を文章だけで説明するのではなく、ユーザーが曲、言葉、モチーフのつながりを視覚的にたどれるウェブサイトとして表現したいと考えた。",
    ],
    sections: [
      {
        id: "process",
        heading: "1. Process",
        body: [
          "全体の作業は、歌詞の収集、形態素解析、単語の選別、Excelデータセットの作成、ノートとCanvaを使ったプロトタイプ制作、song conceptファイルの整理、そしてClaudeを使った実装と修正という順序で進めた。",
          "まず、ナムウィキに整理されている日本語の原文歌詞を参考にし、二つのアルバムの歌詞をそれぞれ一つのファイルにまとめた。このプロジェクトの目的は、各曲でどの単語が多く登場するかを単純に数えることではなく、二つのアルバムがどのような言葉やイメージを通して結びついているのかを調べることだった。そのため、Google ColabでPythonを使って単語頻度を分析したが、頻度だけを最終的な基準にはしなかった。",
          "日本語は英語や韓国語のようにスペースで単語が区切られていないため、形態素解析を用いて歌詞を単語単位に分けた。その後、助詞や助動詞のように文法的には頻繁に現れるが、意味の分析には大きく関わらないストップワードを除外した。さらに出力結果を手作業で確認し、一般的すぎる単語も追加で取り除いた。たとえば、「まま」（そのまま / ～した状態で）のように文の状態を補助する表現や、「一つ」（one）のように頻出するが必ずしも曲の中心的なイメージを作るとは言えない単語は、文脈に応じて除外した。",
          "最初は、各曲の頻度上位5語をそのまま使用する予定だった。しかしこの方法では、個々の曲の特徴は示せても、曲同士の関係を十分に表すことができない場合があった。そこで最終的には、各曲につき二つのsignature wordと三つのbridge wordを選定した。signature wordはその曲の雰囲気を代表する単語、bridge wordは複数の曲に繰り返し現れ、他の曲とのつながりを作る単語として考えた。これらの単語をExcelに整理し、曲から単語へ、単語から別の曲へと移動できる構造を作った。",
          "データを整理した後は、それをどのように見せるかを考えた。ノートに複数のレイアウトをスケッチし、アルバムの物語において重要な要素である「手紙」をメインのデザインコンセプトにした。その後、Canvaを使って「雨とカプチーノ」を中心にプロトタイプを作成した。この曲は、雨、カフェ、ポストカード、ノートといった視覚的イメージを想起しやすく、二つのアルバムの物語においても重要な場面を含んでいるためである。",
          "複数の曲に同じ構造を適用するために、song conceptのExcelファイルも作成した。このファイルには、曲名、対応する曲、イメージカラー、メインキーワード、代表的な歌詞の一行、曲の雰囲気、主要なオブジェクトなどを含めた。ファイルのカラムや基本構造はAIの助けを借りて作ったが、実際の内容は自分で入力した。全歌詞を翻訳するのは難しかったため、各曲をよく表していると思う一行を選び、英語と韓国語でも見られるようにした。曲名の翻訳にはGoogle検索を参考にしたが、すべての曲について公式英語表記を見つけることは難しかったため、一部の表記は公式訳と異なる可能性がある。",
          "最初はPalladioのように、すべての曲と言葉が一つの大きなマインドマップとして表示される構造を考えていた。Canvaでプロトタイプを作っていた段階でも、この形式を想定していた。しかしClaudeを使って実際のサイトとして実装してみると、28曲と多数の単語が一つの画面に入ることで、connection mapが大きすぎて複雑に感じられた。何度か修正したが、ユーザーが一つの曲と単語の関係を落ち着いて追うことは難しいと判断した。そのため、作業のほぼ最後の段階で構造を変更し、ユーザーが曲から単語へ、さらにその単語とつながる別の曲へとクリックして移動する形式にした。これは当初の構想とは異なる妥協だったが、関係性をよりゆっくり探索できる選択になった。",
          "また、曲同士のつながりだけでなく、二つのアルバムを貫く物語もある程度伝えたいと考えた。そのため、各曲には簡単な説明、代表的な歌詞、原曲リンク、可能な場合は作者のコメントを加えた。自分の解釈が強くなりすぎないよう、一部の曲ではインタビュー内容を参考にし、storyタブには初めて見るユーザーでも世界観を理解できるように簡単な説明を入れた。サイトは英語、韓国語、日本語に対応しているが、単語分析は翻訳による意味やニュアンスの変化を避けるため、日本語原文を基準に行った。",
        ],
      },
      {
        id: "limitations",
        heading: "2. Limitations",
        body: [
          "このプロジェクトにはいくつかの限界がある。まず、繰り返し現れる単語を正確に抽出するために日本語原文の歌詞を使用したため、サイト内の歌詞全文は日本語のみで提供されている。connectionタブや説明部分は英語と韓国語でも見ることができるが、日本語がわからないユーザーがすべての歌詞を理解しながらたどることには限界がある。原文性を保つ一方で、アクセシビリティには不足が生じた。",
          "また、形態素解析が完全だったとは言い切れない。日本語の歌詞には文学的な表現、反復、不規則な文構造が含まれるため、一部の単語が意図と異なる形で分割されたり、抜け落ちたりした可能性がある。ストップワードを除去する過程にも私自身の主観が入った。たとえば「一つ」という単語は、ある場合には一般的な単語に見えるが、特定の文脈では重要な意味を持つ可能性もある。",
          "資料と翻訳にも限界があった。物語の説明が個人的な解釈に偏りすぎないよう、作者のコメントを参照したかったが、すべての曲について同じ量の公式コメントを見つけることはできなかった。一部の情報はAIツールの助けを借りて探し、自分が知っていた内容と比較したが、すべての引用を完全に検証することはできなかった。また、曲名の英語・韓国語表記も公式訳や他のファン翻訳と異なる場合がある。",
          "最後に、インターフェースにも限界がある。クリックによって曲、単語、曲へと移動する構造は、大きなマインドマップよりも追いやすいが、ユーザーがネットワーク全体を一目で見ることはできない。最終的なデザインもCanvaのプロトタイプを完全には反映できなかった。雨に濡れた紙、水滴、紙の状態、曲ごとの主要オブジェクトなどの細部を入れたかったが、時間と実装力の限界により、すべてを活用することはできなかった。",
        ],
      },
      {
        id: "digital",
        heading: "3. The Digital Difference",
        body: [ "このプロジェクトにおける最も大きなデジタル・ディファレンスは、歌詞を一つの直線的なテキストとしてではなく、曲と曲をつなぐネットワークとして捉え直すことができた点である。従来の方法でアルバムを聴くとき、私たちは通常、曲順、個々の曲の感情、そして全体的な物語の流れに注目する。しかし、曲と言葉を結びつけるマップを作成することで、歌詞はもはやそれぞれの曲の中に閉じたテキストではなく、複数の曲をつなぐ構造として見えるようになった。", 
                "漠然と似ていると感じていた曲は、反復される言葉やイメージを通して、より具体的に結びつけられた。また、ユーザーは一つの曲から出発し、共有される言葉をたどって別の曲へ移動することができる。この過程で、ヨルシカのアルバムは固定された曲順によってのみ経験されるものではなく、歌詞を通して探索できる関係性のネットワークとして見えるようになった。デジタル分析は、私がすでに知っていると思っていた作品をもう一度見直すきっかけとなり、ヨルシカ特有の雰囲気が個々の曲の中だけでなく、曲と曲のあいだの反復とつながりの中で作られていることをより明確に示してくれた。", 
                "たとえば「藍二乗」と「憂一乗」は、公式的または物語的に対になる曲として見ることができるが、実際のデータでは、共通する主な言葉は「君」のような非常に基本的な語に限られていた。一方で、「夜」という言葉は「エルマ」「藍二乗」「ノーチラス」にも現れており、公式のストーリー上で直接対になっていない曲でも、歌詞のイメージや雰囲気を通してゆるやかにつながることが分かった。このように、デジタル分析は物語上のつながりと単語にもとづくつながりが必ずしも一致しないことを示し、すでに理解していると思っていた曲同士の関係をもう一度見直すきっかけになった。",
                "このプロジェクトを通して、私が理解したデジタル・ヒューマニティーズの意義は、既存の資料を単にデジタル環境へ移すことにあるのではない。多くのDHプロジェクトは、すでに存在するテキスト、画像、記録、音楽のような資料を収集し、再構成するものである。だからこそ重要なのは、どれだけ多くの情報を見せるかではなく、ユーザーがその情報の中でどのような流れをたどり、何に注目するよう導かれるかである。デジタル環境は多くの情報を一つの画面に表示することができるが、その情報がユーザーの視線を導けなければ、プロジェクトはかえって読みにくいアーカイブになってしまう可能性がある。", 
                "この点で、DHプロジェクトは情報を保存する空間であると同時に、集中を設計する構造でもあると考える。私のプロジェクトでは、歌詞を単に集めたり、すべてのつながりを一度に広げて見せたりするのではなく、曲から言葉へ、そして再びつながった別の曲へと移動する流れを作ろうとした。つまり、反復される言葉やイメージのつながりを通して、ユーザーがヨルシカの曲同士の関係、雰囲気、物語の流れに改めて集中できるように構成したのである。最終的に、私が理解したDHの価値は、原資料をデジタルで置き換えることではなく、ユーザーがその資料へ戻り、より深く集中できる構造を設計することにある。" ],
      },
    ],
  },
};

const PROCESS_FIGURES: ProcessFigure[] = [
  {
    title: {
      en: "Word classification dataset",
      kr: "단어 분류 데이터셋",
      jp: "単語分類データセット",
    },
    caption: {
      en: "Selected signature words and bridge words were organized in Excel before being used in the site.",
      kr: "사이트에 사용하기 전, signature word와 bridge word를 엑셀에서 정리했다.",
      jp: "サイトに使用する前に、signature wordとbridge wordをExcelで整理した。",
    },
    images: [
      {
        src: "/images/process/Word%20File.png",
        alt: "Excel sheet showing word frequency and selected word roles",
      },
    ],
  },
  {
    title: {
      en: "Notebook sketches",
      kr: "노트 스케치",
      jp: "ノートでのスケッチ",
    },
    caption: {
      en: "Early sketches were used to think through layout, navigation, and the idea of a letter-like interface.",
      kr: "초기 노트 스케치를 통해 레이아웃, 내비게이션, 편지 같은 인터페이스를 고민했다.",
      jp: "初期のスケッチを通して、レイアウト、ナビゲーション、手紙のようなインターフェースを考えた。",
    },
    images: [
      {
        src: "/images/process/Sketch1.jpg",
        alt: "Notebook sketch of early interface ideas",
      },
      {
        src: "/images/process/Sketch2.jpg",
        alt: "Notebook sketch of mind map and page layout ideas",
      },
    ],
  },
  {
    title: {
      en: "Canva prototype",
      kr: "Canva 프로토타입",
      jp: "Canvaプロトタイプ",
    },
    caption: {
      en: "The first visual prototype used Rain with Cappuccino as a test case for song pages, lyric display, cassette cards, and connection views.",
      kr: "첫 시각적 프로토타입에서는 「비와 카푸치노」를 중심으로 곡 페이지, 가사 표시, 카세트 카드, 연결 화면을 실험했다.",
      jp: "最初の視覚的プロトタイプでは、「雨とカプチーノ」を中心に、曲ページ、歌詞表示、カセットカード、接続画面を試した。",
    },
    images: [
      {
        src: "/images/process/PT1.png",
        alt: "Canva prototype connection page",
      },
      {
        src: "/images/process/PT2.png",
        alt: "Canva prototype song detail layout",
      },
      {
        src: "/images/process/PT3.png",
        alt: "Canva prototype cassette song list",
      },
      {
        src: "/images/process/PT4.png",
        alt: "Canva prototype lyrics layout",
      },
      {
        src: "/images/process/PT5.png",
        alt: "Canva prototype interview or explanation layout",
      },
    ],
  },
  {
    title: {
      en: "Song concept spreadsheet",
      kr: "Song concept 엑셀 파일",
      jp: "Song conceptスプレッドシート",
    },
    caption: {
      en: "The concept file connected each song to colors, keywords, representative lyrics, moods, objects, and corresponding tracks.",
      kr: "concept 파일에는 곡별 색상, 키워드, 대표 가사, 분위기, 오브젝트, 대응 곡을 정리했다.",
      jp: "conceptファイルでは、曲ごとの色、キーワード、代表的な歌詞、雰囲気、オブジェクト、対応曲を整理した。",
    },
    images: [
      {
        src: "/images/process/Song%20Concept.png",
        alt: "Song concept spreadsheet",
      },
    ],
  },
  {
    title: {
      en: "From full network to click-based map",
      kr: "전체 네트워크에서 클릭형 맵으로",
      jp: "全体ネットワークからクリック型マップへ",
    },
    caption: {
      en: "The early Palladio-like map and the first coded map were visually dense, so the final version became a slower song-word-song exploration.",
      kr: "초기의 Palladio식 맵과 첫 구현 결과는 너무 복잡했기 때문에, 최종 버전은 곡, 단어, 곡으로 이어지는 느린 탐색 구조가 되었다.",
      jp: "初期のPalladio風マップと最初の実装は複雑すぎたため、最終版では曲、言葉、曲へと進むゆっくりした探索構造に変更した。",
    },
    images: [
      {
        src: "/images/process/Palladio.png",
        alt: "Palladio-style network map",
      },
      {
        src: "/images/process/First%20Map.png",
        alt: "First coded connection map",
      },
      {
        src: "/images/process/Final%20Map.png",
        alt: "Final click-based connection map",
      },
    ],
  },
];

const SOURCES_CREDITS: Record<
  Lang,
  {
    title: string;
    items: string[];
  }
> = {
  en: {
    title: "Sources and Credits",
    items: [
      "Lyrics were referenced from Namuwiki lyric pages for Yorushika’s two albums.",
      "Music video images, thumbnails, and song links were referenced from Yorushika’s official YouTube channel.",
      "Creator comments were taken from published interviews where available.",
      "The dataset, word classification, visual structure, process images, and interpretations were created by the author using Python, Google Colab, Excel, Canva, Claude, and manual review.",
      "AI tools were used for coding assistance, structure suggestions, and source searching, but all final selections and interpretations were reviewed by the author.",
      "This project is made for educational and analytical purposes and does not claim ownership of Yorushika’s lyrics, music, videos, or official images.",
    ],
  },
  kr: {
    title: "Sources and Credits",
    items: [
      "가사는 요루시카 두 앨범의 나무위키 가사 페이지를 참고했다.",
      "뮤직비디오 이미지, 썸네일, 곡 링크는 요루시카 공식 YouTube 채널을 참고했다.",
      "원작자 코멘트는 확인 가능한 공개 인터뷰를 참고했다.",
      "데이터셋, 단어 분류, 시각화 구조, 작업 과정 이미지, 해석은 Python, Google Colab, Excel, Canva, Claude, 그리고 수작업 검토를 통해 제작자가 직접 구성했다.",
      "AI 도구는 코딩 보조, 구조 제안, 자료 탐색에 사용되었지만, 최종 단어 선정과 해석은 제작자가 검토했다.",
      "이 프로젝트는 교육적, 분석적 목적을 위한 것이며, 요루시카의 가사, 음악, 영상, 공식 이미지에 대한 소유권을 주장하지 않는다.",
    ],
  },
  jp: {
    title: "Sources and Credits",
    items: [
      "歌詞はヨルシカの二つのアルバムに関するナムウィキの歌詞ページを参照した。",
      "ミュージックビデオの画像、サムネイル、楽曲リンクはヨルシカ公式YouTubeチャンネルを参照した。",
      "作者コメントは確認できる公開インタビューを参考にした。",
      "データセット、単語分類、視覚化の構造、制作過程の画像、解釈は、Python、Google Colab、Excel、Canva、Claude、および手作業での確認を通して作成した。",
      "AIツールはコーディング補助、構成提案、資料検索に使用したが、最終的な単語選定と解釈は制作者が確認した。",
      "このプロジェクトは教育的・分析的目的で制作されたものであり、ヨルシカの歌詞、音楽、映像、公式画像の所有権を主張するものではない。",
    ],
  },
};

export default function AboutPage() {
  const { lang } = useLanguage();
  const [section, setSection] = useState<Section>("yorushika");

  return (
    <main className="notebook-paper min-h-[calc(100vh-61px)] px-6 py-12 sm:px-12">
      <div className={`mx-auto ${section === "methodology" ? "max-w-5xl" : "max-w-2xl"}`}>
        <div className="mb-10 flex flex-wrap justify-center gap-x-10 gap-y-4">
          {TABS.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`${handwrittenClass(lang)} text-xl sm:text-2xl ${
                section === s ? "text-ink-main underline" : "text-ink-faint hover:text-ink-soft"
              }`}
            >
              {getTabTitle(s, lang)}
            </button>
          ))}
        </div>

        {section === "yorushika" && (
          <div className="mb-10 flex justify-center">
            <YorushikaMark />
          </div>
        )}

        {section === "methodology" ? (
          <MethodologyView lang={lang} />
        ) : (
          <SimpleView section={section} lang={lang} />
        )}
      </div>
    </main>
  );
}

function getTabTitle(section: Section, lang: Lang) {
  if (section === "methodology") return METHODOLOGY[lang].title;
  return SIMPLE_COPY[section][lang].title;
}

function SimpleView({
  section,
  lang,
}: {
  section: Exclude<Section, "methodology">;
  lang: Lang;
}) {
  const content = SIMPLE_COPY[section][lang];

  return (
    <div className="space-y-5">
      {content.body.map((p, i) => (
        <p key={i} className="text-sm leading-7 text-ink-soft sm:text-base">
          {p}
        </p>
      ))}
    </div>
  );
}

function MethodologyView({ lang }: { lang: Lang }) {
  const content = METHODOLOGY[lang];

  return (
    <article className="space-y-10">
      <div className="mx-auto max-w-3xl space-y-5">
        {content.intro.map((p, i) => (
          <p key={i} className="text-sm leading-7 text-ink-soft sm:text-base">
            {p}
          </p>
        ))}
      </div>

      {content.sections.map((subsection) => (
        <section key={subsection.id} className="space-y-5">
          <div className="mx-auto max-w-3xl">
            <h2 className={`${handwrittenClass(lang)} mb-4 text-2xl text-ink-main sm:text-3xl`}>
              {subsection.heading}
            </h2>

            <div className="space-y-5">
              {subsection.body.map((p, i) => (
                <p key={i} className="text-sm leading-7 text-ink-soft sm:text-base">
                  {p}
                </p>
              ))}
            </div>
          </div>

          {subsection.id === "process" && <ProcessGallery lang={lang} />}
        </section>
      ))}

      <section className="mx-auto max-w-3xl border-t border-[var(--paper-edge-shadow)] pt-6">
        <h2 className={`${handwrittenClass(lang)} mb-3 text-xl text-ink-main sm:text-2xl`}>
          {SOURCES_CREDITS[lang].title}
        </h2>

        <ul className="space-y-2 text-xs leading-5 text-ink-faint sm:text-[0.8rem]">
          {SOURCES_CREDITS[lang].items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-ink-faint/60" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function ProcessGallery({ lang }: { lang: Lang }) {
  const title =
    lang === "jp"
      ? "制作過程の記録"
      : lang === "kr"
        ? "작업 과정 기록"
        : "Behind the Process";

  return (
    <div className="mt-8 rounded-sm border border-[var(--paper-edge-shadow)] bg-paper-cream-light/70 p-4 shadow-[2px_4px_14px_rgba(40,30,15,0.12)] sm:p-6">
      <h3 className={`${handwrittenClass(lang)} mb-5 text-2xl text-ink-main sm:text-3xl`}>
        {title}
      </h3>

      <div className="space-y-6">
        {PROCESS_FIGURES.map((figure, i) => (
          <figure
            key={`${figure.title.en}-${i}`}
            className="rounded-sm border border-[var(--paper-edge-shadow)] bg-paper-cream p-3 shadow-[1px_2px_8px_rgba(40,30,15,0.1)] sm:p-4"
          >
            <div className={getImageGridClass(figure.images.length)}>
              {figure.images.map((image) => (
                <div
                  key={image.src}
                  className={getImageBoxClass(figure.images.length)}
                >
                  <Image
                    src={assetPath(image.src)}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                    className="object-contain p-2"
                  />
                </div>
              ))}
            </div>

            <figcaption className="mt-3 text-xs leading-5 text-ink-faint sm:text-sm">
              <span className="font-medium text-ink-soft">{figure.title[lang]}.</span>{" "}
              {figure.caption[lang]}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function getImageGridClass(count: number) {
  if (count === 1) return "grid grid-cols-1 gap-3";
  if (count === 2) return "grid grid-cols-1 gap-3 sm:grid-cols-2";
  return "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3";
}

function getImageBoxClass(count: number) {
  const height = count === 1 ? "h-56 sm:h-72" : "h-40 sm:h-48";
  return `relative overflow-hidden rounded-sm border border-[var(--paper-line)] bg-paper-cream-light ${height}`;
}

function YorushikaMark() {
  return (
    <span className="handwritten-jp text-5xl tracking-wide text-ink-main">
      ヨルシカ
    </span>
  );
}