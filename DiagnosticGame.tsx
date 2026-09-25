"use client";

import { useEffect, useState } from "react";
import { answerGame, startGame } from "@/lib/api";
import { GameScenario } from "@/lib/types";

type Phase = "loading" | "playing" | "answered" | "finished";

export default function DiagnosticGame() {
  const [scenario, setScenario] = useState<GameScenario | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [rewardCode, setRewardCode] = useState<string | null>(null);
  const [round, setRound] = useState(1);

  useEffect(() => {
    startGame().then((s) => {
      setScenario(s);
      setPhase("playing");
    });
  }, []);

  async function handleAnswer(optionId: string) {
    if (!scenario || phase !== "playing") return;
    setSelected(optionId);
    setPhase("answered");
    const result = await answerGame(scenario.id, optionId, score);
    setScore(result.totalScore);
    setFeedback({ correct: result.correct, explanation: result.explanation });
    if (result.rewardCode) setRewardCode(result.rewardCode);
    if (!result.nextScenario) {
      setTimeout(() => setPhase("finished"), 1200);
    } else {
      setTimeout(() => {
        setScenario(result.nextScenario);
        setSelected(null);
        setFeedback(null);
        setPhase("playing");
        setRound((r) => r + 1);
      }, 2200);
    }
  }

  function restart() {
    setPhase("loading");
    setScore(0);
    setRound(1);
    setRewardCode(null);
    startGame().then((s) => {
      setScenario(s);
      setPhase("playing");
    });
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-xl border border-line bg-panel p-6 md:p-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-medium text-ink">Byte Quest</h1>
          <span className="font-display text-sm text-signal">Score: {score}</span>
        </div>
        <p className="mt-2 text-sm text-dim">
          Three real troubleshooting calls. Pick the smartest first move each
          time — score 20+ and you'll unlock a support discount code.
        </p>

        <div className="mt-8 min-h-[220px]">
          {phase === "loading" && (
            <p className="text-sm text-dim">Loading a scenario…</p>
          )}

          {scenario && phase !== "loading" && phase !== "finished" && (
            <div>
              <p className="text-xs uppercase tracking-wide text-dim">Round {round} of 3</p>
              <p className="mt-3 font-display text-lg text-ink">{scenario.prompt}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {scenario.options.map((opt) => {
                  const isSelected = selected === opt.id;
                  const showState = phase === "answered" && isSelected;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswer(opt.id)}
                      disabled={phase === "answered"}
                      className={`rounded-md border px-4 py-3 text-left text-sm transition ${
                        showState
                          ? feedback?.correct
                            ? "border-signal bg-signal/10 text-signal"
                            : "border-danger bg-danger/10 text-danger"
                          : "border-line bg-panel2 text-ink hover:border-dim"
                      } disabled:cursor-default`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {feedback && (
                <p className="mt-5 text-sm leading-relaxed text-dim">{feedback.explanation}</p>
              )}
            </div>
          )}

          {phase === "finished" && (
            <div className="text-center">
              <p className="font-display text-xl text-ink">Run complete — {score} points</p>
              {rewardCode ? (
                <div className="mt-4 inline-block rounded-md border border-signal bg-signal/10 px-5 py-3">
                  <p className="text-xs text-dim">Your discount code</p>
                  <p className="font-display text-lg text-signal">{rewardCode}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-dim">
                  Score 20+ next time to unlock a discount code.
                </p>
              )}
              <div className="mt-6">
                <button
                  onClick={restart}
                  className="rounded-md border border-line px-4 py-2 text-sm text-ink transition hover:border-signal hover:text-signal"
                >
                  Play again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
