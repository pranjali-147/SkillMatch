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
    if (!/[A-Z]/.test(value)) {
      errors.push("one uppercase letter");
    }
    if (!/[a-z]/.test(value)) {
      errors.push("one lowercase letter");
    }
    if (!/[0-9]/.test(value)) {
      errors.push("one number");
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
      errors.push("one special character");
    }

    if (errors.length === 0) {
      setPasswordError("");
      return true;
    }

    setPasswordError(
      `Password must contain ${errors.join(", ")}.`
    );
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
    username.trim() &&
    email.trim() &&
    password.trim() &&
    !passwordError;

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
        navigate("/login");
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
            Create Your Account
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
            Sign up to get started with SkillMatch
          </Typography>

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="medium"
              sx={{
                "& .MuiInputLabel-root": { fontSize: "1rem" },
                "& .MuiInputBase-input": { fontSize: "1rem" },
              }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="medium"
              sx={{
                "& .MuiInputLabel-root": { fontSize: "1rem" },
                "& .MuiInputBase-input": { fontSize: "1rem" },
              }}
            />

            <FormControl fullWidth size="medium" sx={{ "& .MuiInputLabel-root": { fontSize: "1rem" } }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="hr">HR</MenuItem>
              </Select>
            </FormControl>

            {error && (
              <Typography color="error" variant="body2" sx={{ fontSize: "0.95rem" }}>
                {error}
              </Typography>
            )}

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              size="medium"
              error={Boolean(passwordError)}
              helperText={
                passwordError ||
                "Use at least 8 characters, with uppercase, lowercase, number and symbol."
              }
              sx={{
                "& .MuiInputLabel-root": { fontSize: "1rem" },
                "& .MuiInputBase-input": { fontSize: "1rem" },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<PersonAddIcon />}
              onClick={handleSignup}
              disabled={!isFormValid || loading}
              sx={{
                bgcolor: "#1e3c72",
                "&:hover": { bgcolor: "#2a5298" },
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
              }}
            >
              Sign Up
            </Button>

            {/* Box below password for existing users to login */}
            <Paper
              variant="outlined"
              sx={{
                mt: 1,
                p: 2,
                textAlign: "center",
                borderRadius: 1.5,
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                Already have an account?
              </Typography>
              <Button
                variant="text"
                size="small"
                startIcon={<LoginIcon />}
                onClick={() => navigate("/login")}
                sx={{ fontWeight: 600, color: "#1e3c72" }}
              >
                Login
              </Button>
            </Paper>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default Signup;

