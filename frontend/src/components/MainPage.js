import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Stack,
  alpha,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        // Background image with overlay
        backgroundImage: `url('https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: alpha("#000", 0.4), // Dark overlay for better contrast
          zIndex: 1,
        },
      }}
    >
      {/* Animated floating elements for visual interest */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: [20, 30, 40][i % 3],
              height: [20, 30, 40][i % 3],
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(
                ["#fff", "#2a5298", "#1e3c72"][i % 3],
                0.3,
              )}, transparent)`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: "float 8s infinite ease-in-out",
              animationDelay: `${i * 1.5}s`,
              "@keyframes float": {
                "0%, 100%": {
                  transform: "translateY(0px) scale(1)",
                },
                "50%": {
                  transform: "translateY(-30px) scale(1.1)",
                },
              },
            }}
          />
        ))}
      </Box>

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 3 }}>
        <Paper
          elevation={24}
          sx={{
            padding: { xs: 4, sm: 6 },
            borderRadius: 4,
            textAlign: "center",
            background: alpha("#fff", 0.95),
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha("#fff", 0.3)}`,
            boxShadow: `0 20px 40px ${alpha("#000", 0.4)}`,
            transform: "translateY(0)",
            transition: "transform 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-5px)",
            },
          }}
        >
          {/* Animated icon */}
          <Box
            sx={{
              position: "relative",
              display: "inline-block",
              mb: 2,
            }}
          >
            <WorkIcon
              sx={{
                fontSize: 70,
                color: "#2a5298",
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%": {
                    transform: "scale(1)",
                  },
                  "50%": {
                    transform: "scale(1.1)",
                  },
                  "100%": {
                    transform: "scale(1)",
                  },
                },
              }}
            />
          </Box>

          {/* Project Name with gradient */}
          <Typography
            variant="h3"
            fontWeight="bold"
            gutterBottom
            sx={{
              background: "linear-gradient(135deg, #1e3c72, #2a5298)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textFillColor: "transparent",
              mb: 1,
              fontSize: { xs: "2rem", sm: "2.5rem" },
            }}
          >
            AI Resume Screening
          </Typography>

          {/* Tagline with icon */}
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            alignItems="center"
            mb={4}
          >
            <AutoGraphIcon sx={{ color: "#2a5298", fontSize: 20 }} />
            <Typography variant="body1" color="text.secondary">
              Smart Resume Evaluation using Semantic & Skill-Based Matching
            </Typography>
          </Stack>

          {/* Decorative divider */}
          <Box
            sx={{
              width: "80px",
              height: "3px",
              background:
                "linear-gradient(90deg, transparent, #2a5298, transparent)",
              margin: "0 auto 32px auto",
            }}
          />

          {/* Buttons with enhanced styling */}
          <Stack spacing={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => navigate("/login")}
              sx={{
                py: 1.5,
                background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                fontSize: "1.1rem",
                fontWeight: "bold",
                borderRadius: 2,
                boxShadow: `0 8px 16px ${alpha("#1e3c72", 0.3)}`,
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #2a5298, #1e3c72)",
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 20px ${alpha("#1e3c72", 0.4)}`,
                },
              }}
            >
              Login
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate("/signup")}
              sx={{
                py: 1.5,
                borderWidth: 2,
                borderColor: "#2a5298",
                color: "#1e3c72",
                fontSize: "1.1rem",
                fontWeight: "bold",
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderWidth: 2,
                  borderColor: "#1e3c72",
                  backgroundColor: alpha("#2a5298", 0.04),
                  transform: "translateY(-2px)",
                  boxShadow: `0 8px 16px ${alpha("#2a5298", 0.2)}`,
                },
              }}
            >
              Sign Up
            </Button>
          </Stack>

          {/* Optional: Add a small footer note */}
          <Typography
            variant="caption"
            display="block"
            sx={{ mt: 3, color: alpha("#000", 0.5) }}
          >
            Secure • Fast • AI-Powered
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default MainPage;
