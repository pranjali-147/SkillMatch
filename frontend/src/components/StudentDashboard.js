import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from "@mui/material";

import {
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
} from "@mui/icons-material";

function StudentDashboard({ username = "", onLogout }) {
  const [jds, setJds] = useState([]);
  const [results, setResults] = useState({});
  const [showCourses, setShowCourses] = useState({});
  const [loading, setLoading] = useState({});

  useEffect(() => {
    fetch("http://localhost:5000/jds", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setJds(data));
  }, []);

  const handleUpload = async (event, jdId) => {
    const formData = new FormData();
    for (let file of event.target.files) {
      formData.append("resumes", file);
    }

    setLoading((prev) => ({ ...prev, [jdId]: true }));

    try {
      const res = await fetch(`http://localhost:5000/analyze/${jdId}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      setResults((prev) => ({
        ...prev,
        [jdId]: data.results,
      }));
    } catch (err) {}

    setLoading((prev) => ({ ...prev, [jdId]: false }));
  };

  const handleSendToHR = async (event, jdId) => {
    const formData = new FormData();

    for (let file of event.target.files) {
      formData.append("resumes", file);
    }

    await fetch(`http://localhost:5000/send-to-hr/${jdId}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    alert("Sent to HR successfully");
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#4caf50";
    if (score >= 50) return "#ff9800";
    return "#f44336";
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#eef2f7" }}>
      {/* HEADER */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1e3c72, #2a5298)",
          color: "white",
          py: 3,
          px: 4,
          boxShadow: 3,
        }}
      >
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h5" fontWeight={600}>
            Student Dashboard
          </Typography>
          <Button
            startIcon={<LogoutIcon />}
            onClick={onLogout}
            sx={{ color: "#fff" }}
          >
            Logout
          </Button>
        </Stack>
      </Box>

      <Container sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Welcome, {username || "Student"} 👋
        </Typography>

        <Stack spacing={3}>
          {jds.map((jd) => (
            <Accordion
              key={jd.id}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: 3,
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>{jd.title}</Typography>
              </AccordionSummary>

              <AccordionDetails>
                <Stack spacing={3}>
                  {/* DESCRIPTION */}
                  <Typography color="text.secondary">
                    {jd.description}
                  </Typography>

                  {/* SKILLS */}
                  <Box>
                    <Typography fontWeight={600} mb={1}>
                      Required Skills
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {jd.required_skills.map((skill, i) => (
                        <Chip key={i} label={skill} color="primary" />
                      ))}
                    </Stack>
                  </Box>

                  {/* BUTTONS */}
                  {loading[jd.id] ? (
                    <Stack direction="row" spacing={2} alignItems="center">
                      <CircularProgress size={22} />
                      <Typography>Analyzing Resume...</Typography>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<SchoolIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        Upload Resume
                        <input
                          hidden
                          type="file"
                          onChange={(e) => handleUpload(e, jd.id)}
                        />
                      </Button>

                      <Button
                        variant="outlined"
                        component="label"
                        sx={{ borderRadius: 2 }}
                      >
                        Send to HR
                        <input
                          hidden
                          type="file"
                          onChange={(e) => handleSendToHR(e, jd.id)}
                        />
                      </Button>
                    </Stack>
                  )}

                  {/* RESULTS */}
                  {results[jd.id] && (
                    <Box>
                      <Typography variant="h6" mb={2}>
                        Evaluation Result
                      </Typography>

                      {/* SCORE CARDS */}
                      <Stack direction="row" spacing={3}>
                        {["final_score", "semantic_score", "skill_score"].map(
                          (key) => (
                            <Paper
                              key={key}
                              sx={{
                                p: 3,
                                flex: 1,
                                textAlign: "center",
                                borderRadius: 3,
                              }}
                            >
                              <Typography color="text.secondary">
                                {key.replace("_", " ")}
                              </Typography>
                              <Typography
                                variant="h5"
                                sx={{
                                  color:
                                    key === "final_score"
                                      ? getScoreColor(results[jd.id][0][key])
                                      : "#1e3c72",
                                  fontWeight: 600,
                                }}
                              >
                                {results[jd.id][0][key]}%
                              </Typography>
                            </Paper>
                          ),
                        )}
                      </Stack>

                      {/* SKILLS */}
                      <Stack direction="row" spacing={2} mt={3}>
                        <Paper sx={{ p: 2, flex: 1 }}>
                          <Typography fontWeight={600}>
                            Matched Skills
                          </Typography>
                          <Stack direction="row" flexWrap="wrap" gap={1}>
                            {results[jd.id][0].matched_skills.map((s, i) => (
                              <Chip key={i} label={s} color="success" />
                            ))}
                          </Stack>
                        </Paper>

                        <Paper sx={{ p: 2, flex: 1 }}>
                          <Typography fontWeight={600}>
                            Missing Skills
                          </Typography>
                          <Stack direction="row" flexWrap="wrap" gap={1}>
                            {results[jd.id][0].missing_skills.map((s, i) => (
                              <Chip key={i} label={s} color="error" />
                            ))}
                          </Stack>
                        </Paper>
                      </Stack>

                      {/* COURSES */}
                      <Button
                        sx={{ mt: 2 }}
                        variant="outlined"
                        onClick={() =>
                          setShowCourses((prev) => ({
                            ...prev,
                            [jd.id]: !prev[jd.id],
                          }))
                        }
                      >
                        {showCourses[jd.id]
                          ? "Hide Courses"
                          : "View Recommended Courses"}
                      </Button>

                      {showCourses[jd.id] && (
                        <Box
                          sx={{
                            mt: 2,
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(180px, 1fr))",
                            gap: 2,
                          }}
                        >
                          {Object.values(
                            results[jd.id][0].course_recommendations || {},
                          ).map((courses, i) => {
                            const course = courses[0];
                            if (!course) return null;

                            return (
                              <Paper
                                key={i}
                                sx={{
                                  overflow: "hidden",
                                  borderRadius: 3,
                                  transition: "0.3s",
                                  "&:hover": {
                                    transform: "scale(1.05)",
                                  },
                                }}
                              >
                                <a
                                  href={course.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ textDecoration: "none" }}
                                >
                                  <img
                                    src={course.thumbnail_url}
                                    alt=""
                                    style={{
                                      width: "100%",
                                      height: 120,
                                      objectFit: "cover",
                                    }}
                                  />
                                  <Typography
                                    sx={{
                                      p: 1,
                                      fontSize: "0.85rem",
                                      color: "#1e3c72",
                                    }}
                                  >
                                    {course.title}
                                  </Typography>
                                </a>
                              </Paper>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

export default StudentDashboard;
