import { jsPDF } from "jspdf";
import type { Exercise, TestDefinition } from "../../types";
interface TestPdfContent {
  test: TestDefinition;
  subjectName: string;
  questions: Exercise[];
}
export function createTestPdf({
  test,
  subjectName,
  questions,
}: TestPdfContent) {
  const english = test.subjectId === "englisch";
  const pdf = new jsPDF({ format: "a4", unit: "mm" });
  const margin = 18;
  const width = 174;
  const bottom = 273;
  let y = 0;
  pdf.setProperties({
    title: `${subjectName} – ${test.title}`,
    subject: english ? "Practice test" : "Übungstest",
    author: "six seeeven",
  });
  function header() {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(37, 19, 188);
    pdf.text("six seeeven", margin, 16);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(85, 85, 105);
    pdf.text(`${subjectName} · ${english ? "Grade 5" : "5. Klasse"}`, 192, 16, {
      align: "right",
    });
    pdf.setDrawColor(0, 190, 210);
    pdf.setLineWidth(0.6);
    pdf.line(margin, 21, 192, 21);
    y = 33;
  }
  function ensureSpace(height: number) {
    if (y + height > bottom) {
      pdf.addPage();
      header();
    }
  }
  function text(
    value: string,
    size: number,
    bold = false,
    x = margin,
    maxWidth = width,
  ) {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    pdf.setTextColor(35, 35, 55);
    const lines: string[] = pdf.splitTextToSize(value, maxWidth);
    const lineHeight = size * 0.48;
    for (const line of lines) {
      ensureSpace(lineHeight);
      pdf.text(line, x, y);
      y += lineHeight;
    }
  }
  header();
  text(test.title, 21, true);
  y += 5;
  text(
    `${test.durationMinutes} ${english ? "minutes" : "Minuten"} · ${questions.length} ${english ? "questions" : "Fragen"}`,
    12,
  );
  y += 9;
  text(
    english
      ? "Name: __________________________    Date: ______________"
      : "Name: __________________________    Datum: ______________",
    12,
  );
  y += 7;
  text(
    english
      ? "Choose one answer for each question."
      : "Kreuze für jede Frage eine Antwort an.",
    11,
  );
  y += 9;
  for (const [index, question] of questions.entries()) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    const headingLines: string[] = pdf.splitTextToSize(
      `${index + 1}. ${question.question}`,
      width,
    );
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    const optionHeight = question.options.reduce(
      (height, option) =>
        height +
        (pdf.splitTextToSize(option, width - 10) as string[]).length * 5.76 +
        4,
      0,
    );
    const blockHeight = headingLines.length * 6.72 + optionHeight + 24;
    ensureSpace(Math.min(blockHeight, bottom - 33));
    text(`${index + 1}. ${question.question}`, 14, true);
    y += 4;
    for (const option of question.options) {
      ensureSpace(10);
      pdf.setDrawColor(95, 95, 110);
      pdf.setLineWidth(0.3);
      pdf.rect(margin + 1, y - 3.5, 3.5, 3.5);
      text(option, 12, false, margin + 10, width - 10);
      y += 4;
    }
    ensureSpace(15);
    pdf.setDrawColor(210, 210, 220);
    pdf.setLineWidth(0.2);
    pdf.line(margin, y + 3, 192, y + 3);
    pdf.line(margin, y + 11, 192, y + 11);
    y += 23;
  }
  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(110, 110, 125);
    pdf.text(`${english ? "Page" : "Seite"} ${page} / ${pages}`, 192, 287, {
      align: "right",
    });
  }
  return pdf;
}
export function testPdfFilename(test: TestDefinition) {
  return `six-seeeven-${test.id.replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`;
}
