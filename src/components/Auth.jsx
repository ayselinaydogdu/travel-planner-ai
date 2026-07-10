import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Auth({ onSuccess }) {
  const { signIn, signUp } = useAuth();
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
      <h2>{isSignUp ? "Kayıt Ol" : "Giriş Yap"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Yükleniyor..." : isSignUp ? "Kayıt Ol" : "Giriş Yap"}
        </button>
      </form>

      <p>
        {isSignUp ? "Zaten hesabın var mı?" : "Hesabın yok mu?"}{" "}
        <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? "Giriş Yap" : "Kayıt Ol"}
        </button>
      </p>
    </div>
  );
}