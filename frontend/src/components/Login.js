import { useState } from "react";
import bgImage from "../assets/login_bg.png";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Container,
  Stack,
} from "@mui/material";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      onLogin(data.role, data.username);
      navigate(data.role === "hr" ? "/hr" : "/student");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",

        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
        },
      }}
    >
      <Container sx={{ position: "relative", zIndex: 1 }}>
        <Container maxWidth="xs">
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h5" align="center" mb={2}>
              Login
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button variant="contained" onClick={handleLogin}>
                Sign In
              </Button>

              <Button onClick={() => navigate("/signup")}>
                Create Account
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Container>
    </Box>
  );
}

export default Login;
