import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import type { CopyKey } from "../i18n";

interface GuidedTourProps {
  open: boolean;
  onClose: () => void;
}

const steps: Array<{ title: CopyKey; body: CopyKey; target: string }> = [
  { title: "tourOneTitle", body: "tourOneBody", target: "#top" },
  { title: "tourTwoTitle", body: "tourTwoBody", target: "#timeline" },
  { title: "tourThreeTitle", body: "tourThreeBody", target: "#timeline" },
  { title: "tourFourTitle", body: "tourFourBody", target: "#traditions" },
  { title: "tourFiveTitle", body: "tourFiveBody", target: "#top" },
];

export function GuidedTour({ open, onClose }: GuidedTourProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setStep(0);
      dialog.showModal();
      document.body.classList.add("dialog-open");
    }
    if (!open && dialog.open) dialog.close();
    return () => document.body.classList.remove("dialog-open");
  }, [open]);

  function close() {
    dialogRef.current?.close();
  }

  function finish() {
    try {
      window.localStorage.setItem("timeline-tour-complete", "true");
    } catch {
      // Completion persistence is optional.
    }
    close();
    window.requestAnimationFrame(() => document.querySelector(steps[step].target)?.scrollIntoView({ behavior: "smooth" }));
  }

  return (
    <dialog ref={dialogRef} className="tour-dialog" onClose={onClose} onCancel={onClose} aria-labelledby="tour-title">
      <article>
        <header>
          <div>
            <p>{t("tourStep")} {step + 1} / {steps.length}</p>
            <h2 id="tour-title">{t("tourTitle")}</h2>
          </div>
          <button type="button" onClick={close} aria-label={t("tourClose")}><span aria-hidden="true">×</span></button>
        </header>
        <div className="tour-dialog__progress" aria-hidden="true">
          {steps.map((_, index) => <span className={index <= step ? "is-active" : ""} key={index} />)}
        </div>
        <div className="tour-dialog__body">
          <p className="tour-dialog__intro">{t("tourIntro")}</p>
          <strong>{t(steps[step].title)}</strong>
          <p>{t(steps[step].body)}</p>
        </div>
        <footer>
          <button type="button" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>{t("tourBack")}</button>
          {step < steps.length - 1
            ? <button type="button" onClick={() => setStep((current) => current + 1)}>{t("tourNext")}</button>
            : <button type="button" onClick={finish}>{t("tourFinish")}</button>}
        </footer>
      </article>
    </dialog>
  );
}
