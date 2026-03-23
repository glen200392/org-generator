// Voice input using Web Speech API
// Supports: "部門名 姓名 職稱" format for quick node creation

/** Result of voice input parsing */
export interface VoiceNodeInput {
  dept: string;
  name: string;
  title: string;
}

/** Voice recognition state */
export interface VoiceState {
  isListening: boolean;
  transcript: string;
  error: string | null;
}

// Check browser support
const SpeechRecognition =
  typeof window !== "undefined"
    ? (window as unknown as Record<string, unknown>).SpeechRecognition ??
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    : null;

export const isVoiceSupported = !!SpeechRecognition;

/**
 * Parse a voice transcript into node fields.
 * Expected format: "部門名 姓名 職稱" (space-separated, 3 parts)
 * Also handles: "部門名，姓名，職稱" (comma-separated)
 */
export function parseVoiceTranscript(transcript: string): VoiceNodeInput | null {
  const cleaned = transcript.trim();
  if (!cleaned) return null;

  // Try comma-separated first (more explicit)
  let parts = cleaned.split(/[，,]/).map((s) => s.trim()).filter(Boolean);

  // Fall back to space-separated
  if (parts.length < 3) {
    parts = cleaned.split(/\s+/).filter(Boolean);
  }

  if (parts.length >= 3) {
    return {
      dept: parts[0],
      name: parts[1],
      title: parts.slice(2).join(" "),
    };
  }

  // If only 2 parts, treat as dept + name (title defaults)
  if (parts.length === 2) {
    return { dept: parts[0], name: parts[1], title: "" };
  }

  // Single word → dept only
  if (parts.length === 1) {
    return { dept: parts[0], name: "", title: "" };
  }

  return null;
}

/**
 * Create a speech recognition session.
 * Returns start/stop functions and a cleanup function.
 */
export function createVoiceSession(
  lang: "tw" | "en",
  callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (error: string) => void;
    onEnd: () => void;
  },
): {
  start: () => void;
  stop: () => void;
  cleanup: () => void;
} {
  if (!SpeechRecognition) {
    return {
      start: () => callbacks.onError("Speech recognition not supported"),
      stop: () => {},
      cleanup: () => {},
    };
  }

  const recognition = new (SpeechRecognition as new () => SpeechRecognition)();
  recognition.lang = lang === "tw" ? "zh-TW" : "en-US";
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript;
    callbacks.onResult(transcript, result.isFinal);
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    callbacks.onError(event.error);
  };

  recognition.onend = () => {
    callbacks.onEnd();
  };

  return {
    start: () => {
      try {
        recognition.start();
      } catch {
        callbacks.onError("Already listening");
      }
    },
    stop: () => recognition.stop(),
    cleanup: () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try { recognition.abort(); } catch { /* ignore */ }
    },
  };
}

// Type declarations for Web Speech API (not in all TS libs)
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
