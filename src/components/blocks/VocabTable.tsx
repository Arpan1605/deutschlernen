import { getLang } from "../../lib/i18n";
import type { Word } from "../../lib/srs";
import { SpeakButton } from "../ui/SpeakButton";

/** Word list with audio for the word and its example sentence. */
export function VocabTable({ words, dayLabel }: { words: (Word & { day?: number })[]; dayLabel?: (w: Word & { day?: number }) => string }) {
  return (
    <div className="tablewrap" style={{ maxHeight: 460, overflow: "auto" }}>
      <table className="vtable">
        <tbody>
          {words.map((w, i) => (
            <tr key={i}>
              <td>
                <SpeakButton text={w.de} />
              </td>
              <td>
                <div className="w">
                  {w.de}
                  {w.pl ? ` (${w.pl})` : ""}
                </div>
                <div className="ex">{dayLabel ? dayLabel(w) : w.pos || ""}</div>
              </td>
              <td>
                <div>{w.en}</div>
                <div className="ex">
                  <SpeakButton text={w.ex} /> {w.ex}
                  {getLang() === "en" && w.ex_en ? " — " + w.ex_en : ""}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
