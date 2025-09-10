// frontend/Register.js
import React, { useState } from "react";
import axios from "axios";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation
    if (!email || !password) {
      setError("All fields are required!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5001/register", {
        email,
        password,
      });
      setSuccess(res.data.msg);
      setError("");
    } catch (err) {
      setError(err.response?.data?.msg || "Error registering user");
      setSuccess("");
    }
  };

  // 🔹 Styles
  const container = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(to right, #43e97b, #38f9d7)",
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
    background: "#43e97b",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  const errorStyle = { color: "red", marginBottom: "10px", fontSize: "14px" };
  const successStyle = { color: "green", marginBottom: "10px", fontSize: "14px" };

  return (
    <div style={container}>
      <form style={card} onSubmit={handleSubmit}>
        <h2>Register</h2>
        {error && <p style={errorStyle}>{error}</p>}
        {success && <p style={successStyle}>{success}</p>}
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
          Register
        </button>
        <p style={{ marginTop: "15px" }}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}

export default Register;
