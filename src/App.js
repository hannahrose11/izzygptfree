import * as React from "react";
import { useState } from "react";

export default function App() {
  const isPaid = localStorage.getItem("izzyPaidUser") === "true";
  let promptCount = parseInt(localStorage.getItem("izzyPromptCount") || "0");

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finalPrompt, setFinalPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const questions = [
    { id: "task", question: "Alright, what’s the annoying thing you want help with today?" },
    { id: "audience", question: "Who is this for? Who’s going to see or read this when it’s done?" },
    { id: "tone", question: "Should it sound casual? Professional? Funny? Direct? Tell me the vibe you’re going for." },
    { id: "include", question: "What details, facts, or ideas absolutely need to be in there? (Even if they’re messy — I’ll sort it out.)" },
    { id: "avoid", question: "Anything you don’t want it to say or sound like? (Words, phrases, awkward vibes, anything to avoid.)" },
    { id: "format", question: "Are we making a list? An email? A short caption? A table? Something else?" },
    { id: "context", question: "Where are you using this — like on social media, in a message, printed, or just for your own brain?" },
  ];

  const handleNext = async () => {
    const inputEl = document.querySelector("textarea");
    const currentAnswer = inputEl ? inputEl.value : "";
    const updatedAnswers = {
      ...answers,
      [questions[step].id]: currentAnswer,
    };

    if (!isPaid && promptCount >= 2) {
      setShowPaywall(true);
      return;
    }

    if (step === questions.length - 1) {
      setLoading(true);
      try {
        const response = await fetch("https://eo61pxe93i0terz.m.pipedream.net", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedAnswers),
        });

        const data = await response.json();
        const prompt = data.finalPrompt || "Something went wrong. Try again!";
        setFinalPrompt(prompt);

        if (!isPaid) {
          promptCount++;
          localStorage.setItem("izzyPromptCount", promptCount.toString());
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setFinalPrompt("Something went wrong. Try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setAnswers(updatedAnswers);
      setStep(step + 1);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(finalPrompt);
  };

  const current = questions[step];

  return (
    <div
      style={{
        fontFamily: "Manrope, sans-serif",
        minHeight: "100vh",
        padding: "60px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 600, width: "100%" }}>
        {!finalPrompt ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 18, marginBottom: 12 }}>{current.question}</p>
            <textarea
              rows={4}
              style={{
                width: "100%",
                maxWidth: 500,
                margin: "0 auto",
                display: "block",
                padding: 12,
                fontSize: 16,
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
              defaultValue={answers[current.id] || ""}
            />
            <button
              onClick={handleNext}
              style={{
                marginTop: 16,
                background: "#FD608D",
                color: "white",
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {step === questions.length - 1 ? (loading ? "Generating..." : "Get My Prompt") : "Next"}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>Here’s your GPT-optimized prompt:</h2>
            <pre
              style={{
                background: "#f6f6f6",
                padding: 16,
                borderRadius: 8,
                whiteSpace: "pre-wrap",
                textAlign: "left",
              }}
            >
              {finalPrompt}
            </pre>
            <div style={{ marginTop: 16 }}>
              <button
                onClick={copyPrompt}
                style={{
                  marginRight: 8,
                  background: "#00C2A8",
                  color: "white",
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Copy Prompt
              </button>
            </div>
          </div>
        )}

        {showPaywall && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.8)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "3rem",
                borderRadius: "16px",
                maxWidth: "500px",
                width: "90%",
                textAlign: "center",
              }}
            >
              <h2 style={{ fontSize: "32px", marginBottom: "1rem" }}>🚀 Unlock Unlimited Prompts</h2>
              <p style={{ fontSize: "18px", color: "#666", marginBottom: "2rem" }}>
                You’ve used your 2 free prompts. Upgrade now to continue automating your workflow with Izzy.
              </p>
              <a
                href="https://buy.stripe.com/dRm5kD61H189a6K1gnfEk00"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "18px 40px",
                  fontSize: "18px",
                  fontWeight: 600,
                  backgroundColor: "#FD608D",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textDecoration: "none",
                  margin: "0.5rem",
                }}
              >
                Get Unlimited Access →
              </a>
              <button
                onClick={() => setShowPaywall(false)}
                style={{
                  backgroundColor: "#f0f0f0",
                  color: "#333",
                  fontSize: "16px",
                  padding: "16px 32px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
