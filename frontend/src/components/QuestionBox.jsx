import { useState } from "react";

/**
 * QuestionBox Component
 * =====================
 * Input form for user questions with loading state support
 * 
 * Phase 2: Enhanced error handling & graceful degradation
 * 
 * Props:
 * - setData: Function to update parent state with API response
 * - setLoading: Function to control loading state
 * - setError: Function to handle errors
 * - placeholder: Custom placeholder text (optional)
 * - buttonText: Custom button text (optional)
 */

const API_BASE_URL = "http://127.0.0.1:8000";

export default function QuestionBox({ setData, setLoading, setError, placeholder, buttonText }) {
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setError("Please enter a question to learn about.");
      return;
    }

    if (trimmedQuestion.length < 3) {
      setError("Please enter a more specific question.");
      return;
    }

    // Start loading
    setIsSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const res = await fetch(`${API_BASE_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmedQuestion }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      
      // Validate response has required fields
      if (!data.script || !data.topic) {
        throw new Error("Invalid response from server");
      }

      setData(data);
      setQuestion(""); // Clear input after successful submission
      
    } catch (err) {
      console.error("API Error:", err);
      
      // Handle different error types
      if (err.name === 'AbortError') {
        setError("Request timed out. Please try again.");
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError(
          "Unable to connect to the server. Please ensure the backend is running on port 8000."
        );
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="question-form">
      <div className="input-wrapper">
        <input
          type="text"
          name="q"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={placeholder || "Ask anything about investments... (e.g., What is SIP?)"}
          className="question-input"
          maxLength={500}
          disabled={isSubmitting}
          aria-label="Investment question"
        />
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          <span className="btn-text">
            {isSubmitting ? "Learning..." : (buttonText || "Learn")}
          </span>
        </button>
      </div>
    </form>
  );
}
