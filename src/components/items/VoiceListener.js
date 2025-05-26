import React, { useEffect } from "react";
import { useGeneralContext } from "../../ContextProvider";

const VoiceListener = () => {
  const { setUserInput, userInput } = useGeneralContext(); // Update userInput in context

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    // Handle speech results
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setUserInput(transcript); // Update context with transcribed text
    };

    // Handle recognition errors
    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
    };

    // Start speech recognition automatically
    const requestMicrophoneAndStart = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone access granted.");
        recognition.start();
      } catch (error) {
        console.error("Microphone access denied:", error);
      }
    };

    requestMicrophoneAndStart();

    return () => {
      recognition.stop(); // Cleanup on unmount
    };
  }, [setUserInput]);

  return null; // No UI required for this component
};

export default VoiceListener;
