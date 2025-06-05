import * as React from \"react\";
import { useState, useEffect } from \"react\";

export default function App() {
  const questions = [
    { id: \"task\", question: \"Alright, what's the annoying thing you want help with today?\" },
    { id: \"audience\", question: \"Who's going to use this when it's done?\" },
    { id: \"tone\", question: \"Should it sound casual? Professional? Funny? Direct? Tell me the vibe you're going for.\" },
    { id: \"include\", question: \"What details, facts, or ideas absolutely need to be in there?\" },
    { id: \"avoid\", question: \"Anything you don't want it to say or sound like?\" },
    { id: \"format\", question: \"Are we making a list? An email? A short caption? A table? Something else?\" },
    { id: \"context\", question: \"Where are you using this — like on social media, in a message, printed, or just for your own brain?\" },
  ];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState(\"\");
  const [finalPrompt, setFinalPrompt] = useState(\"\");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(\"\");
  const [promptCount, setPromptCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('izzyPromptCount');
    if (saved) {
      setPromptCount(parseInt(saved));
    }
  }, []);

  const handleNext = async () => {
    try {
      setError(\"\");

      const updatedAnswers = {
        ...answers,
        [questions[step].id]: currentInput,
      };

      setAnswers(updatedAnswers);

      if (step === questions.length - 1) {
        if (promptCount >= 2) {
          setShowPaywall(true);
          return;
        }

        setLoading(true);

        const dataToSend = {
          task: updatedAnswers.task || \"\",
          audience: updatedAnswers.audience || \"\",
          tone: updatedAnswers.tone || \"\",
          include: updatedAnswers.include || \"\",
          avoid: updatedAnswers.avoid || \"\",
          format: updatedAnswers.format || \"\",
          context: updatedAnswers.context || \"\"
        };

        const response = await fetch(\"https://eo61pxe93i0terz.m.pipedream.net\", {
          method: \"POST\",
          headers: {
            \"Content-Type\": \"application/json\",
            \"Accept\": \"application/json\",
          },
          body: JSON.stringify(dataToSend),
        });

        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
          setFinalPrompt(data.finalPrompt || data.body?.finalPrompt || responseText);
        } catch (e) {
          setFinalPrompt(responseText);
        }

        const newCount = promptCount + 1;
        setPromptCount(newCount);
        sessionStorage.setItem('izzyPromptCount', newCount.toString());

      } else {
        setStep(step + 1);
        setCurrentInput(answers[questions[step + 1]?.id] || \"\");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setCurrentInput(answers[questions[step - 1].id] || \"\");
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(finalPrompt)
      .then(() => alert(\"Prompt copied to clipboard!\"))
      .catch(() => alert(\"Failed to copy prompt\"));
  };

  const startOver = () => {
    setStep(0);
    setAnswers({});
    setCurrentInput(\"\");
    setFinalPrompt(\"\");
    setError(\"\");
  };

  const current = questions[step];

  return (
    <div style={{
      fontFamily: \"Inter, sans-serif\",
      minHeight: \"100vh\",
      display: \"flex\",
      alignItems: \"center\",
      justifyContent: \"center\",
      padding: 24,
      position: \"relative\"
    }}>
      {/* existing unchanged JSX content here */}

      {showPaywall && (
        <div style={{
          position: \"fixed\",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: \"rgba(0, 0, 0, 0.8)\",
          display: \"flex\",
          alignItems: \"center\",
          justifyContent: \"center\",
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: \"#fff\",
            padding: \"3rem\",
            borderRadius: 16,
            maxWidth: 500,
            width: \"90%\",
            textAlign: \"center\",
            position: \"relative\"
          }}>
            <h2 style={{ fontSize: 32, marginBottom: 16 }}>🚀 Unlock Unlimited Prompts</h2>
            <p style={{ fontSize: 18, color: \"#666\", marginBottom: 32 }}>
              You've used your 2 free prompts. Upgrade now to continue automating your workflow with Izzy.
            </p>
            <a
              href=\"https://buy.stripe.com/8wX2cN54XDg331Ae6AfEk0c\"
              target=\"_blank\"
              rel=\"noopener noreferrer\"
              style={{
                display: \"inline-block\",
                padding: \"18px 40px\",
                fontSize: 18,
                background: \"#FF4D80\",
                color: \"white\",
                borderRadius: 8,
                textDecoration: \"none\",
                fontWeight: \"bold\",
                marginBottom: 16
              }}
            >
              Get Unlimited Access
            </a>
            <button
              onClick={() => setShowPaywall(false)}
              style={{
                display: \"block\",
                margin: \"0 auto\",
                background: \"none\",
                border: \"none\",
                color: \"#666\",
                cursor: \"pointer\",
                fontSize: 14,
                textDecoration: \"underline\"
              }}
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
