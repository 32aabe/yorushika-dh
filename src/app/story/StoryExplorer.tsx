"use client";

import { useState } from "react";
import { fragments, startFragmentId, type StoryVariableDelta } from "@/data/story-fragments";
import { useLanguage, handwrittenClass, t } from "@/lib/language-context";
import StorySongCard from "@/components/StorySongCard";

const TYPE_LABEL: Record<string, Record<"jp" | "en" | "kr", string>> = {
  prologue: { jp: "プロローグ", en: "prologue", kr: "프롤로그" },
  scene: { jp: "情景", en: "scene", kr: "장면" },
  letter: { jp: "手紙", en: "letter", kr: "편지" },
  cassette: { jp: "カセット", en: "cassette", kr: "카세트" },
  ending: { jp: "結末", en: "ending", kr: "결말" },
};

interface Variables {
  acceptance: number;
  distance: number;
  attachment: number;
}

const ZERO_VARS: Variables = { acceptance: 0, distance: 0, attachment: 0 };

function applyDelta(vars: Variables, delta?: StoryVariableDelta): Variables {
  if (!delta) return vars;
  return {
    acceptance: vars.acceptance + (delta.acceptance ?? 0),
    distance: vars.distance + (delta.distance ?? 0),
    attachment: vars.attachment + (delta.attachment ?? 0),
  };
}

/** Resolves the two routing placeholders ("__route_rain" / "__route_clear")
 * from the Arrival scene into one of the four real endings, per the
 * comparison table in the brief:
 *   rain route:  attachment >= acceptance -> rain,  else -> parade
 *   clear route: distance   >= acceptance -> dakara, else -> hole
 */
function resolveEnding(route: "__route_rain" | "__route_clear", vars: Variables): string {
  if (route === "__route_rain") {
    return vars.attachment >= vars.acceptance ? "ending-rain" : "ending-parade";
  }
  return vars.distance >= vars.acceptance ? "ending-dakara" : "ending-hole";
}

export default function StoryExplorer() {
  const { lang } = useLanguage();
  const [history, setHistory] = useState<string[]>([startFragmentId]);
  const [varHistory, setVarHistory] = useState<Variables[]>([ZERO_VARS]);
  const [fadeKey, setFadeKey] = useState(0);

  const currentId = history[history.length - 1];
  const vars = varHistory[varHistory.length - 1];
  const fragment = fragments[currentId];

  function goTo(targetId: string, effect?: StoryVariableDelta) {
    const nextVars = applyDelta(vars, effect);
    const resolved =
      targetId === "__route_rain" || targetId === "__route_clear" ? resolveEnding(targetId, nextVars) : targetId;
    setHistory((h) => [...h, resolved]);
    setVarHistory((v) => [...v, nextVars]);
    setFadeKey((k) => k + 1);
  }

  function goBack() {
    if (history.length <= 1) return;
    setHistory((h) => h.slice(0, -1));
    setVarHistory((v) => v.slice(0, -1));
    setFadeKey((k) => k + 1);
  }

  function restart() {
    setHistory([startFragmentId]);
    setVarHistory([ZERO_VARS]);
    setFadeKey((k) => k + 1);
  }

  const isEnding = !!fragment.isEnding;

  return (
    <main className="notebook-paper-aged flex min-h-[calc(100vh-61px)] flex-col items-center px-6 py-12">
      <p className="mb-8 max-w-md text-center text-xs italic leading-5 text-ink-faint">{t("storyDisclaimer", lang)}</p>

      <div
        key={fadeKey}
        className="w-full max-w-xl rounded-sm border border-[var(--paper-edge-shadow)] bg-paper-cream-light p-8 shadow-[2px_4px_16px_rgba(40,30,15,0.2)] transition-opacity duration-500"
        style={{ animation: "fadeInFragment 0.5s ease" }}
      >
        <p className="mb-4 text-xs uppercase tracking-widest text-ink-faint">{TYPE_LABEL[fragment.type][lang]}</p>

        <p className="whitespace-pre-line text-base leading-8 text-ink-soft sm:text-lg">{fragment.text[lang]}</p>

        {fragment.signature && <p className="mt-5 text-xl italic text-ink-main">{fragment.signature[lang]}</p>}

        <div className="mt-8 flex flex-col items-start gap-3 border-t border-[var(--paper-line)] pt-6">
          {fragment.choices.map((choice, i) => (
            <button
              key={`${fragment.id}-choice-${i}-${choice.to}`}
              onClick={() => goTo(choice.to, choice.effect)}
              className={`ink-underline ${handwrittenClass(lang)} text-left text-lg text-ink-main`}
            >
              {choice.label[lang]}
            </button>
          ))}

          {isEnding && (
            <>
              <p className={`${handwrittenClass(lang)} text-ink-faint`}>
                {lang === "jp" ? "……ここで、記録は途切れている。" : lang === "kr" ? "……여기서, 기록은 끊겨 있다." : "…the record breaks off here."}
              </p>
              <button onClick={restart} className={`ink-underline ${handwrittenClass(lang)} text-lg text-ink-soft`}>
                {lang === "jp" ? "もう一度、最初から →" : lang === "kr" ? "다시, 처음부터 →" : "Begin again, from the start →"}
              </button>
            </>
          )}
        </div>

        {/* Related Songs always come last -- after the narrative text,
            after the signature line, and after the choices/ending block.
            This is deliberately the final thing in the passage, never
            interleaved with the story itself. */}
        {isEnding && fragment.songIds && fragment.songIds.length > 0 && (
          <div className="mt-8 border-t border-dashed border-[var(--paper-line)] pt-5">
            <p className={`${handwrittenClass(lang)} mb-3 text-sm text-ink-faint`}>{t("relatedSongsAtEnd", lang)}</p>
            <div className="flex flex-wrap gap-2">
              {fragment.songIds.map((id) => (
                <StorySongCard key={`${fragment.id}-song-${id}`} songId={id} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-xs text-ink-faint">
          <button onClick={goBack} disabled={history.length <= 1} className="ink-underline disabled:opacity-30">
            ← {lang === "jp" ? "前へ" : lang === "kr" ? "이전으로" : "back"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInFragment {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
