import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/login_bg.png";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Container,
  Stack,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Login as LoginIcon,
} from "@mui/icons-material";

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (value) => {
    const errors = [];
    if (value.length < 8) {
      errors.push("at least 8 characters");
    }
    

    if (errors.length === 0) {
      setPasswordError("");
      return true;
    }

    setPasswordError(`Password must contain ${errors.join(", ")}.`);
    return false;
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value) {
      validatePassword(value);
    } else {
      setPasswordError("");
    }
  };

  const isFormValid =
    username.trim() && email.trim() && password.trim() && !passwordError;

  const handleSignup = async () => {
    if (!validatePassword(password)) {
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password, role }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        // Response wasn't JSON (e.g. 500 HTML)
      }
      if (res.ok || res.status === 201) {
        navigate(data.role === "hr" ? "/hr" : "/student");
        return;
      }
      setError(data.message || "Signup failed. Please try again.");
    } catch (err) {
      setError("Network error. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative",

        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(10, 25, 50, 0.75)", // SAME DARK OVERLAY
        },
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(15px)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          {/* TITLE */}
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 700,
              mb: 1,
              letterSpacing: "0.5px",
            }}
          >
            Create Account
          </Typography>

          <Typography
            align="center"
            sx={{
              mb: 4,
              opacity: 0.7,
              fontSize: "0.95rem",
            }}
          >
            Join SkillMatch AI
          </Typography>

          <Stack spacing={3}>
            {/* USERNAME */}
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "#fff" } }}
            />

            {/* EMAIL */}
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "#fff" } }}
            />

            {/* ROLE */}
            <FormControl fullWidth>
              <InputLabel sx={{ color: "#ccc" }}>Role</InputLabel>
              <Select
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
                sx={{ color: "#fff" }}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="hr">HR</MenuItem>
              </Select>
            </FormControl>

            {/* PASSWORD */}
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              error={Boolean(passwordError)}
              helperText={
                passwordError ||
                "Min 8 chars, uppercase, lowercase, number & symbol"
              }
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "#fff" } }}
              FormHelperTextProps={{
                sx: { color: passwordError ? "#ff6b6b" : "#bbb" },
              }}
            />

            {/* ERROR */}
            {error && (
              <Typography sx={{ color: "#ff6b6b", fontSize: "0.9rem" }}>
                {error}
              </Typography>
            )}

            {/* BUTTON */}
            <Button
              fullWidth
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleSignup}
              disabled={!isFormValid || loading}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem",
                borderRadius: 3,
                background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                "&:hover": {
                  transform: "scale(1.03)",
                },
              }}
            >
              Sign Up
            </Button>

            {/* LOGIN BOX */}
            <Box textAlign="center">
              <Typography sx={{ opacity: 0.7, fontSize: "0.9rem" }}>
                Already have an account?
              </Typography>

              <Button
                startIcon={<LoginIcon />}
                onClick={() => navigate("/login")}
                sx={{
                  mt: 1,
                  color: "#90caf9",
                  fontWeight: 600,
                }}
              >
                Login
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default Signup;
