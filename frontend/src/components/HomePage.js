import bgImage from "../assets/dashboard_bg.png";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import SchoolIcon from "@mui/icons-material/School";
import InsightsIcon from "@mui/icons-material/Insights";

function HomePage({ onHrLogin, onStudentLogin }) {
  const navigate = useNavigate();
  const features = [
    {
      icon: <WorkOutlineIcon sx={{ fontSize: 34, color: "#90caf9" }} />,
      title: "Smart Hiring Workflow",
      text: "Create job descriptions, manage applicants, shortlist candidates, and organize selection stages in one place.",
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 34, color: "#90caf9" }} />,
      title: "Student Career Support",
      text: "Students can evaluate resumes, explore opportunities, receive selection notifications, and improve skill gaps.",
    },
    {
      icon: <InsightsIcon sx={{ fontSize: 34, color: "#90caf9" }} />,
      title: "AI-Powered Matching",
      text: "Compare resumes with job descriptions using semantic and skill-based scoring for better candidate screening.",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        color: "#fff",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(8,18,38,0.92), rgba(8,18,38,0.82))",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            px: { xs: 2, md: 5 },
            py: 2.5,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(14px)",
            background: "rgba(7,18,38,0.45)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
            >
              <PersonIcon sx={{ color: "#fff" }} />
            </Box>

            <Typography
              sx={{
                fontSize: "1.3rem",
                fontWeight: 700,
                letterSpacing: 1,
                background: "linear-gradient(90deg, #fff, #90caf9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              SkillMatch AI
            </Typography>
          </Stack>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
          <Stack spacing={6}>
            <Stack spacing={2.5} sx={{ maxWidth: 760 }}>
              <Typography
                sx={{
                  fontSize: { xs: "2.2rem", md: "3.6rem" },
                  fontWeight: 800,
                  lineHeight: 1.1,
                }}
              >
                Smarter Resume Screening for Modern Hiring
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: "1rem", md: "1.15rem" },
                  color: "rgba(255,255,255,0.8)",
                  lineHeight: 1.8,
                }}
              >
                SkillMatch AI helps HR teams identify strong candidates faster
                and enables students to understand how well their resumes align
                with opportunities. Manage roles, evaluate resumes, shortlist
                talent, and track hiring progress through a polished unified
                platform.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} pt={1}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/login")}
                  sx={{
                    borderRadius: "28px",
                    px: 4,
                    py: 1.2,
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                  }}
                >
                  Continue as HR
                </Button>

                <Button
                  onClick={() => navigate("/login")}
                  variant="outlined"

                  sx={{
                    borderRadius: "28px",
                    px: 4,
                    py: 1.2,
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.35)",
                  }}
                >
                  Continue as Student
                </Button>
              </Stack>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(3, 1fr)",
                },
                gap: 3,
              }}
            >
              {features.map((feature) => (
                <Paper
                  key={feature.title}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(14px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#fff",
                  }}
                >
                  <Stack spacing={2}>
                    <Box>{feature.icon}</Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                      {feature.title}
                    </Typography>
                    <Typography
                      sx={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}
                    >
                      {feature.text}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Box>
          </Stack>
        </Container>

        <Box
          component="footer"
          sx={{
            mt: 6,
            px: { xs: 2, md: 5 },
            py: 2.5,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(7,18,38,0.55)",
            backdropFilter: "blur(14px)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Typography sx={{ color: "rgba(255,255,255,0.75)" }}>
              © 2026 SkillMatch AI. Professional recruitment and resume
              intelligence platform.
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.55)" }}>
              Built for HR teams and students
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default HomePage;
