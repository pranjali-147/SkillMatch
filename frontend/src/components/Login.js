import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Container,
  Stack,
  alpha,
} from "@mui/material";
import {
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data.role);
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url('https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: alpha("#000", 0.5),
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Paper
          elevation={3}
          sx={{
            p: 5,
            borderRadius: 2,
            bgcolor: alpha("#fff", 0.95),
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              color: "#1e3c72",
              fontWeight: 700,
              fontSize: "2rem",
              letterSpacing: "-0.5px",
            }}
          >
            Welcome Back
          </Typography>

          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{
              mb: 4,
              fontSize: "1rem",
            }}
          >
            Sign in to continue to your dashboard
          </Typography>

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="medium"
              sx={{
                "& .MuiInputLabel-root": { fontSize: "1rem" },
                "& .MuiInputBase-input": { fontSize: "1rem" },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="medium"
              sx={{
                "& .MuiInputLabel-root": { fontSize: "1rem" },
                "& .MuiInputBase-input": { fontSize: "1rem" },
              }}
            />

            {error && (
              <Typography
                color="error"
                variant="body2"
                sx={{ fontSize: "0.95rem" }}
              >
                {error}
              </Typography>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={handleLogin}
              sx={{
                bgcolor: "#1e3c72",
                "&:hover": { bgcolor: "#2a5298" },
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
              }}
            >
              Sign In
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate("/signup")}
              sx={{
                borderColor: "#1e3c72",
                color: "#1e3c72",
                "&:hover": {
                  borderColor: "#2a5298",
                  bgcolor: "rgba(30, 60, 114, 0.04)",
                },
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
              }}
            >
              Create Account
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
