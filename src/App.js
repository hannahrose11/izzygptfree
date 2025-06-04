import * as React from "react";
import { useState } from "react";

export default function App() {
  const isPaid = localStorage.getItem("izzyPaidUser") === "true";
  let promptCount = parseInt(localStorage.getItem("izzyPromptCount") || "0");

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [error, setError] = useState("");

  const questions = [
    { id: "task", question: "Alright, what's the annoying thing you want help with today?" },
    { id: "audience", question: "Who is this for? Who's going to see or read this when it's done?" },
    { id: "tone", question: "Should it sound casual? Professional? Funny? Direct? Tell me the vibe you're going for." },
    { id: "include", question: "What details, facts, or ideas absolutely need to be in there? (Even if they're messy — I'll sort it out.)" },
    { id: "avoid", question: "Anything you don't want it to say or sound like? (Words, phrases, awkward vibes, anything to avoid.)" },
    { id: "format", question: "Are we making a list? An email? A short caption? A table? Something else?" },
    { id: "context", question: "Where are you using this — like on social media, in a message, printed, or just for your own brain?" },
  ];

  const handleNext = async () => {
    try {
      setError("");
      
      // Save current answer
      const updatedAnswers = {
        ...answers,
        [questions[step].id]: currentInput,
      };
      setAnswers(updatedAnswers);

      // Check paywall before final step
      if (!isPaid && promptCount >= 2 && step === questions.length - 1) {
        setShowPaywall(true);
        return;
      }

      if (step === questions.length - 1) {
        // Last question - generate prompt
        setLoading(true);
        
        console.log("Sending data to API:", updatedAnswers);
        
        const response = await fetch("https://eo61pxe93i0terz.m.pipedream.net", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(updatedAnswers),
        });
        
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
          console.log("Parsed response:", data);
        } catch (e) {
          console.error("Failed to parse response:", e);
          // If it's not JSON, just use the text as is
          setFinalPrompt(responseText);
          
          if (!isPaid) {
            promptCount++;
            localStorage.setItem("izzyPromptCount", promptCount.toString());
          }
          return;
        }
        
        if (data.finalPrompt) {
          setFinalPrompt(data.finalPrompt);
        } else if (data.body && data.body.finalPrompt) {
          // Sometimes the response is nested
          setFinalPrompt(data.body.finalPrompt);
        } else {
          // If we get the template back, show it anyway
          setFinalPrompt(responseText);
        }

        if (!isPaid) {
          promptCount++;
          localStorage.setItem("izzyPromptCount", promptCount.toString());
        }
      } else {
        // Move to next question
        setStep(step + 1);
        setCurrentInput(answers[questions[step + 1]?.id] || "");
      }
    } catch (err) {
      console.error("Error details:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    } finally {
      if (step === questions.length - 1) {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      // Save current answer before going back
      const updatedAnswers = {
        ...answers,
        [questions[step].id]: currentInput,
      };
      setAnswers(updatedAnswers);
      
      setStep(step - 1);
      setCurrentInput(updatedAnswers[questions[step - 1].id] || "");
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(finalPrompt)
      .then(() => alert("Prompt copied to clipboard!"))
      .catch(() => alert("Failed to copy prompt"));
  };

  const startOver = () => {
    setStep(0);
    setAnswers({});
    setCurrentInput("");
    setFinalPrompt("");
    setError("");
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
        {error && (
          <div style={{ 
            background: "#fee", 
            color: "#c00", 
            padding: 12, 
            marginBottom: 20,
            borderRadius: 8,
            fontSize: 14,
            textAlign: "center"
          }}>
            {error}
          </div>
        )}
        
        {!finalPrompt ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
                Question {step + 1} of {questions.length}
              </div>
              <div style={{ 
                width: "100%", 
                height: 8, 
                background: "#e0e0e0", 
                borderRadius: 4,
                overflow: "hidden"
              }}>
                <div style={{ 
                  width: `${((step + 1) / questions.length) * 100}%`, 
                  height: "100%", 
                  background: "#FD608D",
                  transition: "width 0.3s ease"
                }} />
              </div>
            </div>
            
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
                resize: "vertical",
              }}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your answer here..."
            />
            
            <div style={{ marginTop: 16 }}>
              {step > 0 && (
                <button
                  onClick={handleBack}
                  style={{
                    marginRight: 8,
                    background: "#f0f0f0",
                    color: "#333",
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "none",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!currentInput.trim() || loading}
                style={{
                  background: currentInput.trim() ? "#FD608D" : "#ccc",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  fontWeight: "bold",
                  cursor: currentInput.trim() && !loading ? "pointer" : "not-allowed",
                }}
              >
                {step === questions.length - 1 ? (loading ? "Generating..." : "Get My Prompt") : "Next"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>Here's your GPT-optimized prompt:</h2>
            <pre
              style={{
                background: "#f6f6f6",
                padding: 16,
                borderRadius: 8,
                whiteSpace: "pre-wrap",
                textAlign: "left",
                maxHeight: 400,
                overflow: "auto",
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
              <button
                onClick={startOver}
                style={{
                  background: "#f0f0f0",
                  color: "#333",
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Start Over
              </button>
            </div>
            
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Open in:</p>
              <a
                href={`https://chat.openai.com/?model=gpt-4&prompt=${encodeURIComponent(finalPrompt)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  marginRight: 8,
                  color: "#FD608D",
                  textDecoration: "none",
                  fontWeight: "bold"
                }}
              >
                ChatGPT
              </a>
              <span style={{ margin: "0 4px", color: "#ccc" }}>•</span>
              <a 
                href="https://claude.ai" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  marginRight: 8,
                  color: "#FD608D",
                  textDecoration: "none",
                  fontWeight: "bold"
                }}
              >
                Claude
              </a>
              <span style={{ margin: "0 4px", color: "#ccc" }}>•</span>
              <a 
                href="https://gemini.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: "#FD608D",
                  textDecoration: "none",
                  fontWeight: "bold"
                }}
              >
                Gemini
              </a>
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
                You've used your 2 free prompts. Upgrade now to continue automating your workflow with Izzy.
              </p>
              <a
                href="https://buy.stripe.com/8x2cN54XDg331Ae6AHfEk0c"
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
                  display: "block",
                  margin: "0.5rem auto",
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
