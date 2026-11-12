import { useState } from "react";
import { runtime } from "../../lib/runtime";
import { savePdf } from "../../lib/pdf/save";
import type { Builder } from "../../lib/pdf/sections";

/** ⤓ button that builds a worksheet PDF and offers it to the viewer. Hidden where downloads aren't possible. */
export function PdfButton({ label, make }: { label: string; make: () => [Builder, string] }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ msg: string; err?: boolean }>({ msg: "" });
  if (runtime.downloadsReady && !runtime.downloads) return null;
  const go = async () => {
    setBusy(true);
    const [b, name] = make();
    setStatus(await savePdf(b, name));
    setBusy(false);
  };
  return (
    <span className="pdfrow">
      <button type="button" className="btn pdfbtn" disabled={busy} onClick={go}>
        ⤓ {label}
      </button>
      <span className={"status-line" + (status.err ? " err" : "")}>{status.msg}</span>
    </span>
  );
}
