import type { Exercise, SubjectId } from "../../types";
const make = (subject: SubjectId, rows: [string, string[], number, string][]): Exercise[] => rows.map(([question, options, answerIndex, explanation], index) => ({ id: `arcade-${subject}-${index}`, lessonId: `${subject}-arcade`, question, options, answerIndex, explanation }));
export const extraQuestions: Partial<Record<SubjectId, Exercise[]>> = {
  deutsch: make("deutsch", [
    ["Welches Wort ist ein Nomen?", ["laufen", "Haus", "schnell", "blau"], 1, "Haus ist ein Nomen. Nomen schreibt man groß."],
    ["Welches Wort ist ein Verb?", ["Tisch", "schön", "springen", "Blume"], 2, "Springen beschreibt eine Tätigkeit."],
    ["Welcher Artikel passt zu Baum?", ["der", "die", "das", "den"], 0, "Es heißt der Baum."],
    ["Welches Wort ist ein Adjektiv?", ["Kind", "rennen", "freundlich", "Buch"], 2, "Freundlich beschreibt eine Eigenschaft."],
    ["Welches Wort ist richtig geschrieben?", ["die schule", "Die Schule", "die Schule", "Die schule"], 2, "Nomen wie Schule schreibt man groß."],
    ["Welches Wort ist die Mehrzahl von Kind?", ["Kinde", "Kinds", "Kinder", "Kinden"], 2, "Die Mehrzahl von Kind ist Kinder."],
    ["Welches Verb passt: Wir ___ im Park.", ["spielt", "spielen", "spielst", "spiele"], 1, "Zu wir gehört spielen."],
    ["Welche Wortgruppe enthält nur Nomen?", ["Baum, Freude, Tisch", "laufen, Haus, blau", "schnell, nett, Kind", "springen, gehen, Buch"], 0, "Baum, Freude und Tisch sind Nomen."],
    ["Welcher Satz hat die richtige Großschreibung?", ["Der hund spielt.", "der Hund spielt.", "Der Hund spielt.", "Der Hund Spielt."], 2, "Satzanfang und Nomen schreibt man groß."],
    ["In welchem Satz steht das Verb an zweiter Stelle?", ["Heute spielt Mia draußen.", "Heute Mia spielt draußen.", "Spielt heute Mia draußen.", "Heute draußen Mia spielt."], 0, "Im Aussagesatz steht das gebeugte Verb an zweiter Stelle."],
  ]),
  mathematik: make("mathematik", [
    ["Was ist 7 + 5?", ["11", "12", "13", "14"], 1, "7 + 5 = 12."],
    ["Was ist 38 + 12?", ["40", "50", "60", "48"], 1, "38 + 12 = 50."],
    ["Wie viele Zehner sind 70?", ["5", "6", "7", "8"], 2, "70 besteht aus sieben Zehnern."],
    ["Was ist 64 − 20?", ["44", "46", "54", "84"], 0, "Ziehe zwei Zehner ab: 64 − 20 = 44."],
    ["Welchen Wert hat die 3 in 347?", ["3", "30", "300", "3000"], 2, "Die 3 steht an der Hunderterstelle."],
    ["Was ist 6 × 7?", ["36", "40", "42", "48"], 2, "6 × 7 = 42."],
    ["Welche Zahl ist 4 Hunderter + 8 Zehner + 2 Einer?", ["428", "482", "824", "4802"], 1, "400 + 80 + 2 = 482."],
    ["Was ist 125 + 75?", ["175", "190", "200", "210"], 2, "125 + 75 ergänzt sich zu 200."],
    ["Was ist 3 452 + 100?", ["3 552", "4 452", "3 462", "3 452"], 0, "Ein Hunderter mehr ergibt 3 552."],
    ["Welche Zahl ist um 250 größer als 1 375?", ["1 525", "1 575", "1 625", "1 725"], 2, "1 375 + 250 = 1 625."],
  ]),
};

const nounWords = ["Baum", "Fenster", "Freundschaft", "Schule", "Garten", "Sonne", "Abenteuer", "Gespräch", "Entdeckung"];
const nounArticles = ["der", "das", "die", "die", "der", "die", "das", "das", "die"];
const verbWords = ["laufen", "denken", "springen", "lesen", "singen", "schreiben", "erklären", "vergleichen", "entdecken"];
export const generatedArcadeQuestions: Partial<Record<SubjectId, Exercise[]>> = {
  deutsch: nounWords.map((word, index) => ({ id: `arcade-deutsch-noun-${index}`, lessonId: "deutsch-1", question: `Im Satz „${nounArticles[index]} ${word} ist hier.“: Welches Wort ist ein Nomen?`, options: [verbWords[index], "schnell", word, "leise"], answerIndex: 2, explanation: `${word} ist ein Nomen und wird großgeschrieben.` })).concat(verbWords.map((word, index) => ({ id: `arcade-deutsch-verb-${index}`, lessonId: "deutsch-2", question: `Im Satz „Wir ${word} heute.“: Welches Wort ist ein Verb?`, options: ["Tisch", word, nounWords[index], "blau"], answerIndex: 1, explanation: `${word} ist ein Verb.` }))),
  mathematik: [12, 23, 35, 47, 58, 69, 74, 86, 97, 108, 125, 146, 278, 346, 457, 589, 675, 842].map((value, index) => { const add = index < 12 ? (index + 2) * 7 : 95 + index * 13; const answer = value + add; return { id: `arcade-math-add-${index}`, lessonId: "mathematik-2", question: `Was ist ${value} + ${add}?`, options: [String(answer - 10), String(answer + 1), String(answer), String(answer + 10)], answerIndex: 2, explanation: `${value} + ${add} = ${answer}.` }; }),
};
