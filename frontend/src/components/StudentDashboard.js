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

  // FETCH JDs
  useEffect(() => {
    fetch("http://localhost:5000/jds", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setJds(data));
  }, []);

  // UPLOAD + ANALYZE
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
    } catch (err) {
      console.error(err);
    }

    setLoading((prev) => ({ ...prev, [jdId]: false }));
  };

  // SEND TO HR
  const handleSendToHR = async (event, jdId) => {
    const formData = new FormData();

    for (let file of event.target.files) {
      formData.append("resumes", file);
    }

    try {
      const res = await fetch(`http://localhost:5000/send-to-hr/${jdId}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      alert(data.message || "Sent to HR successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to send to HR");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#2e7d32";
    if (score >= 50) return "#ed6c02";
    return "#d32f2f";
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      {/* HEADER */}
      <Paper sx={{ bgcolor: "#1e3c72", color: "white", py: 2, px: 4 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h5">Student Dashboard</Typography>
          <Button onClick={onLogout} color="inherit">
            Logout
          </Button>
        </Stack>
      </Paper>

      <Container sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Welcome, {username || "Student"}
        </Typography>

        <Stack spacing={2}>
          {jds.map((jd) => (
            <Accordion key={jd.id}>
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
                    <Typography sx={{ fontWeight: 600, mb: 1 }}>
                      Required Skills
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {jd.required_skills.map((skill, i) => (
                        <Chip key={i} label={skill} />
                      ))}
                    </Stack>
                  </Box>

                  {/* BUTTONS */}
                  <Box>
                    {loading[jd.id] ? (
                      <Stack direction="row" spacing={2}>
                        <CircularProgress size={24} />
                        <Typography>Evaluating resume...</Typography>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="contained"
                          component="label"
                          startIcon={<SchoolIcon />}
                        >
                          Upload Resume
                          <input
                            hidden
                            type="file"
                            onChange={(e) => handleUpload(e, jd.id)}
                          />
                        </Button>

                        <Button variant="outlined" component="label">
                          Send to HR
                          <input
                            hidden
                            type="file"
                            onChange={(e) => handleSendToHR(e, jd.id)}
                          />
                        </Button>
                      </Stack>
                    )}
                  </Box>

                  {/* RESULTS */}
                  {results[jd.id] && (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Evaluation Result
                      </Typography>

                      {/* SCORES */}
                      <Paper sx={{ p: 3 }}>
                        <Stack direction="row" spacing={5}>
                          <Box>
                            <Typography color="text.secondary">
                              Final Score
                            </Typography>
                            <Typography
                              variant="h5"
                              sx={{
                                color: getScoreColor(
                                  results[jd.id][0].final_score,
                                ),
                                fontWeight: 600,
                              }}
                            >
                              {results[jd.id][0].final_score}%
                            </Typography>
                          </Box>

                          <Box>
                            <Typography color="text.secondary">
                              Semantic Score
                            </Typography>
                            <Typography variant="h6">
                              {results[jd.id][0].semantic_score}%
                            </Typography>
                          </Box>

                          <Box>
                            <Typography color="text.secondary">
                              Skill Score
                            </Typography>
                            <Typography variant="h6">
                              {results[jd.id][0].skill_score}%
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>

                      {/* SKILLS */}
                      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Paper sx={{ p: 2, flex: 1 }}>
                          <Typography sx={{ fontWeight: 600 }}>
                            Matched Skills
                          </Typography>

                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {results[jd.id][0].matched_skills.length > 0 ? (
                              results[jd.id][0].matched_skills.map((s, i) => (
                                <Chip key={i} label={s} color="success" />
                              ))
                            ) : (
                              <Typography variant="body2">
                                No matched skills
                              </Typography>
                            )}
                          </Stack>
                        </Paper>

                        <Paper sx={{ p: 2, flex: 1 }}>
                          <Typography sx={{ fontWeight: 600 }}>
                            Missing Skills
                          </Typography>

                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {results[jd.id][0].missing_skills.map((s, i) => (
                              <Chip key={i} label={s} color="error" />
                            ))}
                          </Stack>
                        </Paper>
                      </Stack>

                      {/* COURSES BUTTON */}
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

                      {/* COURSES GRID */}
                      {showCourses[jd.id] && (
                        <Box
                          sx={{
                            mt: 2,
                            display: "grid",
                            gridTemplateColumns: "repeat(5, 1fr)",
                            gap: 2,
                          }}
                        >
                          {Object.entries(
                            results[jd.id][0].course_recommendations || {},
                          ).map(([skill, courses]) => {
                            const course = courses[0];

                            if (!course) return null;

                            return (
                              <Paper
                                key={skill}
                                sx={{
                                  p: 1,
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
                                      fontSize: "0.85rem",
                                      mt: 1,
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
