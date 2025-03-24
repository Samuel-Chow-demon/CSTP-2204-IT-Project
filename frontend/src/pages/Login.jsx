import React, { useState } from "react";
import { Box, Button, Input, Typography, Card } from "@mui/joy";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase";

const Login = () => {
  const [email, setEmail] = useState(""); // Use 'email' instead of 'username'
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent default form submission
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.level1"
    >
      <Card sx={{ width: 300, p: 3, borderRadius: "md", boxShadow: "lg" }}>
        <Typography level="h4" textAlign="center" sx={{ mb: 2 }}>
          Login
        </Typography>
        <form onSubmit={handleLogin}> {/* Use handleLogin here */}
          {error && <Typography color="danger" textAlign="center">{error}</Typography>}
          <Input
            type="email" // Change to email input type for validation
            placeholder="Email"
            value={email} // Use 'email' instead of 'username'
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" fullWidth variant="solid" color="primary">
            Login
          </Button>
        </form>
      </Card>
    </Box>
  );
};

export default Login;
