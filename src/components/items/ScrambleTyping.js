"use client"; 
import { useGeneralContext } from '../../ContextProvider';
import React, { useState, useEffect, useRef } from "react";

const SCRAMBLE_CHARS =
  "_⌽⌾⍋⍎⍕⍝⍡⍢⍨⍫⍬⍭⍱⍲?هڇڈڦڱ۞۩ݓﮖԽՀՊՋդխտփ֍֏᭢অআঌখঝতদনয়ৡৰৰㄅㄆㄓㄞㆣᨊᨎᨏᐂᐄᐇᐉᐐᐒᐲᎦᎨᏜᏫϪⲀⲆⲊⲬⲯⲴⲸⲾⳔⳖⳚⳜ⳩ⳭЖѦ҂ҜӾሽቃቜቲቹቻቾኀኈኍኤእዥጬጷፈ፠፨፹ⰀⰇⰔⰖⰗⰛⰡⰳⰿⱉⱔまやりをゟᠥᚡᚯᚳᚸᚼᛀᛄᛤ᛭ᛯᮻ᳀᳂༁༄༆༒ⵅ";

function pickRandomScramble() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

function Glitch10TypingEffect({
  text,
  scrambleSpeed,
  delay,
  onComplete,
  className = ""
}) {
  const TYPING_INTERVAL = 75; // <-- ADJUST THIS FOR YOUR CONSTANT TYPING SPEED
  const effectAreaLength = 12; // 6 normal + 6 scramble

  const [typedCount, setTypedCount] = useState(0);
  const [scrambleChars, setScrambleChars] = useState([]);
  const [finished, setFinished] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const FINISH_DELAY = 1000; // Wait 1 second after fully typed
  const FADE_DURATION = 1500; // Fade-out duration in ms

  // Constant typing effect
  useEffect(() => {
    let cancelled = false;
    let currentIndex = 0;

    // Start after the specified delay
    const startTimer = setTimeout(() => {
      // Type each character at a constant interval
      const intervalId = setInterval(() => {
        if (cancelled) return;

        currentIndex++;
        setTypedCount(currentIndex);

        // Once we've typed everything, stop
        if (currentIndex >= text.length) {
          clearInterval(intervalId);

          // Wait FINISH_DELAY ms before triggering fade out
          setTimeout(() => {
            if (!cancelled) {
              setFinished(true);
              setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                  if (onComplete) onComplete();
                }, FADE_DURATION);
              }, FINISH_DELAY);
            }
          }, 0);
        }
      }, TYPING_INTERVAL);
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
    };
  }, [text, delay, onComplete]);

  // Identify stable vs effect area
  const stableCount =
    typedCount > effectAreaLength ? typedCount - effectAreaLength : 0;
  const stableText = text.slice(0, stableCount);
  const effectText = text.slice(stableCount, typedCount);

  const normalCount = Math.min(effectText.length, 6);
  const normalEffect = effectText.slice(0, normalCount);
  const scrambleCount = effectText.length > 6 ? effectText.length - 6 : 0;

  // Update scramble chars for all typed letters in the scramble zone (unless finished)
  useEffect(() => {
    if (finished || scrambleCount <= 0) {
      setScrambleChars([]);
      return;
    }
    const scrambleInterval = setInterval(() => {
      setScrambleChars(
        Array.from({ length: scrambleCount }, () => pickRandomScramble())
      );
    }, scrambleSpeed);
    return () => clearInterval(scrambleInterval);
  }, [scrambleCount, scrambleSpeed, finished]);

  // If finished typing, show full text with optional fade out
  if (finished) {
    return (
      <div className={`text-left ${className} ${fadeOut ? "fade-out" : ""}`}>
        <span className="text-white">{text}</span>
      </div>
    );
  }

  // Otherwise show typed text with partial scramble/fade
  return (
    <div className={`text-left ${className}`}>
      <span className="text-white">{stableText}</span>
      {normalEffect.split("").map((char, index) => (
        <span key={`normal-${index}`} className={`effect-normal${index + 1}`}>
          {char}
        </span>
      ))}
      {scrambleChars.map((char, index) => (
        <span key={`scramble-${index}`} className={`effect-scramble${index + 1}`}>
          {char}
        </span>
      ))}
    </div>
  );
}

function ScrambleHomepage({ messages }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleComplete = () => {
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 500);
  };

  return (
    <div className="h-30 bg-transparent p-8 flex flex-col items-start">
      <div className="overflow-hidden whitespace-pre-line">
        <Glitch10TypingEffect
          key={currentIndex}
          text={messages[currentIndex]}
          scrambleSpeed={147}
          delay={0}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}




function ScrambleChatStreaming({
  text,
  scrambleSpeed,
  delay,
  onComplete,
  className = ""
}) {
  const effectAreaLength = 12; // 6 normal + 6 scramble = 12 total effect characters
  const [typedCount, setTypedCount] = useState(0);
  const [scrambleChars, setScrambleChars] = useState([]);
  const { scrollChatToBottom, isAtBottom } = useGeneralContext();

  // 1) Keep a ref of the latest isAtBottom so our setTimeouts always
  //    have the correct up-to-date value without re-running the effect.
  const isAtBottomRef = useRef(isAtBottom);
  useEffect(() => {
    isAtBottomRef.current = isAtBottom;
  }, [isAtBottom]);

  useEffect(() => {
    let cancelled = false;
    let currentIndex = 0;
    const startTime = Date.now();

    function typeBatch() {
      if (cancelled) return;
      if (currentIndex >= text.length) {
        onComplete?.();
        return;
      }
      // For the first 5 seconds, type at a constant 60ms per character.
      if (Date.now() - startTime < 4000) {
        currentIndex++;
        setTypedCount(currentIndex);
        
        if (isAtBottomRef.current) scrollChatToBottom();

        setTimeout(typeBatch, 37);
      } else {
        // After 5 seconds, choose a random batch size between 20 and 50.
        let batchSize = Math.floor(Math.random() * (30 - 10 + 1)) + 0;
        batchSize = Math.min(batchSize, text.length - currentIndex);
        // Choose a random per-character delay between 10 and 100 ms.
        const perCharDelay = Math.floor(Math.random() * (30 - 11 + 1)) + 0;
        let i = 0;
        function typeNextChar() {
          if (cancelled) return;
          currentIndex++;
          setTypedCount(currentIndex);
          // Scroll if at bottom (ref check)
          if (isAtBottomRef.current) scrollChatToBottom();

          i++;
          if (i < batchSize && currentIndex < text.length) {
            setTimeout(typeNextChar, perCharDelay);
          } else {
            // Immediately start the next batch (no extra pause)
            setTimeout(typeBatch, 0);
          }
        }
        typeNextChar();
      }
    }

    // Start typing after the initial delay
    const initialTimeout = setTimeout(typeBatch, delay);

    return () => {
      cancelled = true;
      clearTimeout(initialTimeout);
    };
  }, [text, delay]);

  // Stable text: all characters before the effect area.
  const stableCount =
    typedCount > effectAreaLength ? typedCount - effectAreaLength : 0;
  const stableText = text.slice(0, stableCount);
  // Effect text: the last 12 typed characters.
  const effectText = text.slice(stableCount, typedCount);
  // First 6 characters are "normal effect", remaining (up to 6) are scramble.
  const normalCount = Math.min(effectText.length, 6);
  const normalEffect = effectText.slice(0, normalCount);
  const scrambleCount = effectText.length > 6 ? effectText.length - 6 : 0;

  // Update scramble characters on an interval.
  useEffect(() => {
    if (scrambleCount <= 0) {
      setScrambleChars([]);
      return;
    }
    const scrambleInterval = setInterval(() => {
      setScrambleChars(
        Array.from({ length: scrambleCount }, () => pickRandomScramble())
      );
    }, scrambleSpeed);
    return () => clearInterval(scrambleInterval);
  }, [scrambleCount, scrambleSpeed]);

  return (
    <div className={`text-left ${className}`}>
      {/* Stable white text */}
      <span className="text-white">{stableText}</span>
      {/* Normal effect characters (positions 1-6) */}
      {normalEffect.split("").map((char, index) => (
        <span key={`normal-${index}`} className={`effect-normal${index + 1}`}>
          {char}
        </span>
      ))}
      {/* Scramble effect characters (positions 7-12) */}
      {scrambleChars.map((char, index) => (
        <span key={`scramble-${index}`} className={`effect-scramble${index + 1}`}>
          {char}
        </span>
      ))}
    </div>
  );
}

function ScrambleChatProcessing() {
  // Holds the array of scrambling characters.
  // Each character object: { id, birth, char, lastUpdate, flicker (optional) }
  const [scrambleChars, setScrambleChars] = useState([]);

  // Keep track of the last flickered character index to avoid repeating it.
  const lastFlickeredCharIndexRef = useRef(null);

  /**
   * 1. High-frequency scramble/flicker updates (~30ms for flicker, various intervals for the newest 6 chars).
   */
  useEffect(() => {
    const scrambleIntervalId = setInterval(() => {
      setScrambleChars((prevChars) => {
        const now = Date.now();
        const total = prevChars.length;

        return prevChars.map((ch, index) => {
          // Flickering characters update at ~30ms
          if (ch.flicker) {
            if (now - ch.lastUpdate >= 30) {
              return { ...ch, char: pickRandomScramble(), lastUpdate: now };
            }
            return ch;
          }

          // Only the newest 6 characters scramble at different speeds
          // The newest 12 characters have layered styles, but only indices [6..11] scramble
          if (index >= total - 12) {
            const groupIndex = index - (total - 12);
            if (groupIndex >= 6 && groupIndex < 12) {
              const SCRAMBLE_SPEEDS = [250, 200, 160, 130, 100, 90];
              const lastUpdate = ch.lastUpdate || ch.birth;
              if (now - lastUpdate >= SCRAMBLE_SPEEDS[groupIndex - 6]) {
                return {
                  ...ch,
                  char: pickRandomScramble(),
                  lastUpdate: now,
                };
              }
            }
          }
          return ch;
        });
      });
    }, 50);

    return () => clearInterval(scrambleIntervalId);
  }, []);

  /**
   * 2. Growth effect: add one new scramble character every 2.5-2.6 seconds.
   */
  useEffect(() => {
    let isCancelled = false;

    function scheduleNewChar() {
      if (isCancelled) return;
      const now = Date.now();
      const newScrambleChar = {
        id: now,
        birth: now,
        char: pickRandomScramble(),
        lastUpdate: now,
      };
      setScrambleChars((prev) => [...prev, newScrambleChar]);

      // Random delay for next addition
      const delay = 2500 + Math.random() * 100;
      setTimeout(scheduleNewChar, delay);
    }

    scheduleNewChar();
    return () => {
      isCancelled = true;
    };
  }, []);

  /**
   * 3. Random flicker effect: pick a character (excluding newest 6), flicker for ~500ms.
   */
  useEffect(() => {
    let isCancelled = false;

    function initiateRandomFlicker() {
      if (isCancelled) return;

      setScrambleChars((prevChars) => {
        const total = prevChars.length;
        if (total <= 6) return prevChars; // Nothing to flicker if too few chars

        // Make a copy so we can modify and return
        const updatedChars = [...prevChars];

        // Only flicker among indices [0..(total-7)] so we exclude the newest 6
        const flickerEligibleCount = total - 6;
        let randIndex = 0;

        if (flickerEligibleCount > 1) {
          do {
            randIndex = Math.floor(Math.random() * flickerEligibleCount);
          } while (randIndex === lastFlickeredCharIndexRef.current);
        }

        lastFlickeredCharIndexRef.current = randIndex;

        updatedChars[randIndex] = {
          ...updatedChars[randIndex],
          flicker: true,
          lastUpdate: Date.now(),
        };

        // Stop flickering after ~500ms
        setTimeout(() => {
          setScrambleChars((current) =>
            current.map((ch) =>
              ch.id === updatedChars[randIndex].id
                ? { ...ch, flicker: false }
                : ch
            )
          );
        }, 500);

        return updatedChars;
      });

      // Schedule the next flicker between 1s and 4s
      const nextFlickerDelay = 1000 + Math.random() * 4000;
      setTimeout(initiateRandomFlicker, nextFlickerDelay);
    }

    initiateRandomFlicker();
    return () => {
      isCancelled = true;
    };
  }, []);

  /**
   * Renders the scramble characters with different styles based on their age (index).
   */
  return (
    <div
      style={{
        fontFamily: "monospace",
        fontSize: "24px",
        whiteSpace: "pre-wrap",
      }}
    >
      {scrambleChars.map((ch, index) => {
        const total = scrambleChars.length;
        let className = "";

        // If not in the newest 12, it's "fixed" in color (oldest).
        if (index < total - 12) {
          className = "effect-fixed0";
        } else {
          // Among the last 12: break into two groups [0..5] fixed, [6..11] scrambling
          const groupIndex = index - (total - 12);
          if (groupIndex < 6) {
            className = `effect-fixed${groupIndex + 1}`;
          } else {
            // groupIndex in [6..11] => "scramble" style
            const scrambleIndex = groupIndex - 5; // shift from 6..11 to 1..6
            className = `effect-scramble${scrambleIndex}`;
          }
        }

        return (
          <span
            key={ch.id}
            className={className}
            style={{
              transition: "0.3s",
              ...(ch.flicker ? { color: "rgba(255,255,255,1)" } : {}),
            }}
          >
            {ch.char}
          </span>
        );
      })}
    </div>
  );
}


export { ScrambleChatStreaming, ScrambleHomepage, ScrambleChatProcessing  };