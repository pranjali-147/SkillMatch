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
          inset: 0,
          backgroundColor: "rgba(10, 25, 50, 0.75)",
        },
      }}
    >
      <Container sx={{ position: "relative", zIndex: 1 }}>
        <Container maxWidth="xs">
          <Paper
            sx={{
              p: 4,
              borderRadius: 4,
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
            }}
          >
            {/* HEADER */}
            <Typography
              variant="h5"
              align="center"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: "linear-gradient(90deg, #ffffff, #90caf9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              SkillMatch AI
            </Typography>

            <Typography
              align="center"
              sx={{ mb: 3, opacity: 0.7, fontSize: "0.9rem" }}
            >
              Welcome back — login to continue
            </Typography>

            {/* FORM */}
            <Stack spacing={2}>
              <TextField
                label="Email"
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                fullWidth
                InputProps={{
                  style: { color: "#fff" },
                }}
                InputLabelProps={{
                  style: { color: "rgba(255,255,255,0.7)" },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#90caf9",
                    },
                  },
                }}
              />

              <TextField
                label="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                InputProps={{
                  style: { color: "#fff" },
                }}
                InputLabelProps={{
                  style: { color: "rgba(255,255,255,0.7)" },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#90caf9",
                    },
                  },
                }}
              />

              {/* LOGIN BUTTON */}
              <Button
                variant="contained"
                onClick={handleLogin}
                sx={{
                  mt: 1,
                  py: 1.2,
                  borderRadius: 2,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 8px 20px rgba(30,60,114,0.4)",
                  },
                }}
              >
                Sign In
              </Button>

              {/* SIGNUP */}
              <Button
                onClick={() => navigate("/signup")}
                sx={{
                  color: "#fff",
                  opacity: 0.8,
                  textTransform: "none",
                  "&:hover": {
                    opacity: 1,
                    background: "rgba(255,255,255,0.08)",
                  },
                }}
              >
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
