import { useState } from "react";
import { Download } from "lucide-react";
import { exercises, subjects } from "../../content";
import { useLanguage } from "../../i18n/useLanguage";
import type { TestDefinition } from "../../types";
export function DownloadTestPdf({ test }: { test: TestDefinition }) {
  const { t, subjectName } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function download() {
    setBusy(true);
    setError(false);
    try {
      const { createTestPdf, testPdfFilename } = await import("./testPdf");
      const subject = subjects.find(
        (subject) => subject.id === test.subjectId,
      )!;
      const questions = test.exerciseIds.map((id) =>
        exercises.find((exercise) => exercise.id === id)!,
      );
      const pdf = createTestPdf({
        test,
        subjectName: subjectName(subject.id, subject.name),
        questions,
      });
      await pdf.save(testPdfFilename(test), { returnPromise: true });
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="test-pdf-download">
      <button
        type="button"
        className="download-test"
        disabled={busy}
        aria-busy={busy}
        onClick={() => void download()}
      >
        <Download size={18} />
        {busy
          ? t("PDF wird erstellt …", "Creating PDF …")
          : t("Test als PDF herunterladen", "Download test as PDF")}
      </button>
      {error && (
        <p role="alert">
          {t(
            "Die PDF konnte nicht erstellt werden. Bitte versuche es erneut.",
            "The PDF could not be created. Please try again.",
          )}
        </p>
      )}
    </div>
  );
}
