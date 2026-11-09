import { useEffect, useRef } from "react";
import type { ComponentProps } from "react";
import { TestPage } from "./TestPage";
type Props = ComponentProps<typeof TestPage>;
export function FocusedTest(props: Props) {
  const container = useRef<HTMLDivElement>(null);
  const sessionId = props.session?.id;
  useEffect(() => {
    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warnBeforeLeaving);
    container.current?.focus();
    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeaving);
    };
  }, [sessionId]);
  return (
    <div className="focused-test" ref={container} tabIndex={-1}>
      <main>
        <TestPage {...props} />
      </main>
    </div>
  );
}
