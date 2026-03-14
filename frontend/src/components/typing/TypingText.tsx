import { useMemo } from "react";
import { CharacterDisplay } from "./CharacterDisplay";
import type { CharacterStatus } from "../../types/session";

type TypingTextProps = {
  targetText: string;
  userInput: string;
};

function getCharacterStatus(
  index: number,
  targetText: string,
  userInput: string,
): CharacterStatus {
  if (index < userInput.length) {
    return targetText[index] === userInput[index] ? "correct" : "incorrect";
  }
  if (index === userInput.length) return "current";
  return "pending";
}

export function TypingText({ targetText, userInput }: TypingTextProps) {
  const characters = useMemo(() => {
    return targetText.split("").map((char, index) => ({
      char,
      status: getCharacterStatus(index, targetText, userInput),
    }));
  }, [targetText, userInput]);

  return (
    <div className="font-mono text-xl leading-relaxed tracking-wide text-text-primary break-words overflow-hidden whitespace-pre-wrap">
      {characters.map(({ char, status }, i) => (
        <CharacterDisplay key={i} char={char} status={status} />
      ))}
    </div>
  );
}
