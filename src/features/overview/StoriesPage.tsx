import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Languages, Mic2 } from "lucide-react";
import stories from "../../content/englisch/stories.json";
import { useLanguage } from "../../i18n/useLanguage";
import { formatDate } from "../../utils/dates";

function celebrate() {
  if ("AudioContext" in window) {
    const context = new AudioContext();
    const sampleCount = Math.floor(context.sampleRate * 0.12);
    const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < sampleCount; index++) {
      samples[index] = (Math.random() * 2 - 1) * (1 - index / sampleCount);
    }
    [0, 0.22, 0.44, 0.66].forEach((delay) => {
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = buffer;
      gain.gain.value = 0.35;
      source.connect(gain).connect(context.destination);
      source.start(context.currentTime + delay);
    });
    window.setTimeout(() => void context.close(), 1300);
  }
}

export function StoriesPage() {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isTranslated, setIsTranslated] = useState(false);
  const story = stories.find((item) => item.id === selectedId);
  const isEnding = story ? pageIndex === story.pages.length : false;
  useEffect(
    () => () => window.speechSynthesis?.cancel(),
    [selectedId, pageIndex, isTranslated],
  );
  const readPage = () => {
    if (!story || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      isTranslated ? story.germanPages[pageIndex] : story.pages[pageIndex],
    );
    utterance.lang = isTranslated ? "de-DE" : "en-US";
    const voices = window.speechSynthesis.getVoices();
    const language = isTranslated ? "de" : "en";
    const voice =
      voices.find(
        (item) => item.lang.toLowerCase() === utterance.lang.toLowerCase(),
      ) ??
      voices.find((item) => item.lang.toLowerCase().startsWith(`${language}-`));
    if (voice) utterance.voice = voice;
    utterance.rate = 0.75;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section
      className="subject-section"
      aria-label={t("Geschichten", "Stories")}
    >
      {story ? (
        <>
          <button
            type="button"
            className="vocabulary-back"
            onClick={() => setSelectedId(null)}
          >
            <span aria-hidden="true">←</span>{" "}
            {t("Alle Geschichten", "All stories")}
          </button>
          <article className="story-reader">
            <p className="story-meta">
              {t("Grammatik", "Grammar")}: {story.grammar}
            </p>
            <div
              className={`story-book-page${isEnding ? " story-book-ending" : ""}`}
            >
              {isEnding ? (
                <>
                  <span className="story-ending-sparkles" aria-hidden="true">
                    ✦ ✧ ✦
                  </span>
                  <h2>Ende</h2>
                  <div className="story-ending-mark" aria-label="Six Seeven">
                    <span>6</span>
                    <span>7</span>
                  </div>
                  <p>Six Seeven!</p>
                  <span className="story-ending-clap" aria-hidden="true">
                    👏 👏 👏
                  </span>
                  <button
                    type="button"
                    className="story-read-button"
                    onClick={celebrate}
                  >
                    {t("Noch einmal feiern", "Celebrate again")}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="story-translate-button"
                    onClick={() => setIsTranslated((value) => !value)}
                    aria-pressed={isTranslated}
                    aria-label={
                      isTranslated ? "Show English" : "Auf Deutsch anzeigen"
                    }
                    title={isTranslated ? "English" : "Deutsch"}
                  >
                    <Languages size={20} aria-hidden="true" />
                  </button>
                  <span className="story-book-ornament" aria-hidden="true">
                    ✦
                  </span>
                  <h2>{isTranslated ? story.germanTitle : story.title}</h2>
                  <p className="story-page-text">
                    {isTranslated
                      ? story.germanPages[pageIndex]
                      : story.pages[pageIndex]
                          .split(/(\bcan\b|\bcan't\b)/gi)
                          .map((part, index) =>
                            /^(can|can't)$/i.test(part) ? (
                              <u key={index}>{part}</u>
                            ) : (
                              part
                            ),
                          )}
                  </p>
                  <button
                    type="button"
                    className="story-read-button"
                    onClick={readPage}
                    aria-label={t("Seite vorlesen", "Read page aloud")}
                  >
                    <Mic2 size={20} aria-hidden="true" />{" "}
                    {t("Vorlesen", "Read aloud")}
                  </button>
                  <span className="story-page-number">
                    {pageIndex + 1} / {story.pages.length}
                  </span>
                </>
              )}
            </div>
            <div className="story-page-actions">
              <button
                type="button"
                onClick={() => {
                  setPageIndex((index) => index - 1);
                  setIsTranslated(false);
                }}
                disabled={pageIndex === 0}
              >
                <ArrowLeft size={18} aria-hidden="true" />{" "}
                {t("Zurück", "Previous")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPageIndex((index) => index + 1);
                  setIsTranslated(false);
                  if (pageIndex === story.pages.length - 1) celebrate();
                }}
                disabled={isEnding}
              >
                {pageIndex === story.pages.length - 1
                  ? t("Ende", "Finish")
                  : t("Weiter", "Next")}{" "}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </article>
        </>
      ) : (
        <>
          <h2>{t("Geschichten", "Stories")}</h2>
          <div className="lesson-list">
            {stories.map((item) => (
              <button
                type="button"
                className="lesson-row story-card"
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id);
                  setPageIndex(0);
                  setIsTranslated(false);
                }}
              >
                <span>
                  <strong>{item.title}</strong>
                  <small>
                    <time dateTime={item.date}>{formatDate(item.date)}</time> ·{" "}
                    {t("Grammatik", "Grammar")}: {item.grammar}
                  </small>
                </span>
                <ArrowRight size={20} aria-hidden="true" />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
