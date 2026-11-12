export function StatusLine({ msg, err }: { msg?: string; err?: boolean }) {
  return (
    <span className={"status-line" + (err ? " err" : "")} role={err ? "alert" : undefined}>
      {msg}
    </span>
  );
}
