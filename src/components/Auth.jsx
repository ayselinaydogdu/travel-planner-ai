import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function Auth({ onSuccess }) {
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>{isSignUp ? t.auth.signUpTitle : t.auth.signInTitle}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder={t.auth.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t.auth.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? t.auth.loading : isSignUp ? t.auth.signUpTitle : t.auth.signInTitle}
        </button>
      </form>

      <p>
        {isSignUp ? t.auth.hasAccount : t.auth.noAccount}{" "}
        <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? t.auth.signInTitle : t.auth.signUpTitle}
        </button>
      </p>
    </div>
  );
}