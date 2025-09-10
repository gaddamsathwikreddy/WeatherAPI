// frontend/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // ✅ Initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      setError("All fields are required!");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:5001/login", {
        email,
        password,
      });

      // Save token in localStorage
      localStorage.setItem("token", res.data.token);
      navigate('/dashboard')
      setError("");
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid email or password");
    }
  };

  // Styles
  const container = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(to right, #4facfe, #00f2fe)",
    fontFamily: "Arial, sans-serif",
  };

  const card = {
    width: "350px",
    padding: "30px",
    background: "#fff",
    borderRadius: "15px",
    boxShadow: "0px 8px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
  };

  const input = {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "14px",
  };

  const button = {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    border: "none",
    borderRadius: "8px",
    background: "#4facfe",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  const errorStyle = {
    color: "red",
    marginBottom: "10px",
    fontSize: "14px",
  };

  return (
    <div style={container}>
      <form style={card} onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p style={errorStyle}>{error}</p>}
        <input
          style={input}
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={input}
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button style={button} type="submit">
          Login
        </button>
        <p style={{ marginTop: "15px" }}>
          Don’t have an account? <a href="/register">Register</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
