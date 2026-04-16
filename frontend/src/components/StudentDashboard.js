import { useEffect, useState } from "react";
import bgImage from "../assets/dashboard_bg.png";
import PersonIcon from "@mui/icons-material/Person";
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
    } catch (err) {
      console.error(err);
    }

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

  const renderJD = (jd) => (
    <Accordion
      key={jd.id}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        backdropFilter: "blur(12px)",
        background: "rgba(255,255,255,0.08)",
        color: "#fff",
        boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}>
        <Typography fontWeight={600}>{jd.title}</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={3}>
          <Typography sx={{ opacity: 0.8 }}>{jd.description}</Typography>

          {/* SKILLS */}
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {jd.required_skills.map((skill, i) => (
              <Chip
                key={i}
                label={skill}
                sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff" }}
              />
            ))}
          </Stack>

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
                sx={{
                  borderRadius: 2,
                  bgcolor: "#1e3c72",
                  "&:hover": { bgcolor: "#2a5298" },
                }}
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
                sx={{
                  borderRadius: 2,
                  color: "#fff",
                  borderColor: "#fff",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
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

          {/* ✅ RESULTS (VERY IMPORTANT — DON'T MISS THIS) */}
          {results[jd.id] && (
            <Box>
              <Typography variant="h6" mb={2}>
                Evaluation Result
              </Typography>

              {/* SCORE BOX */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  color: "#fff",
                }}
              >
                <Stack spacing={1}>
                  <Typography>
                    Final Score:{" "}
                    <b
                      style={{
                        color: getScoreColor(results[jd.id][0].final_score),
                      }}
                    >
                      {results[jd.id][0].final_score}%
                    </b>
                  </Typography>

                  <Typography>
                    Semantic Score:{" "}
                    <b style={{ color: "#90caf9" }}>
                      {results[jd.id][0].semantic_score}%
                    </b>
                  </Typography>

                  <Typography>
                    Skill Score:{" "}
                    <b style={{ color: "#ffb74d" }}>
                      {results[jd.id][0].skill_score}%
                    </b>
                  </Typography>
                </Stack>
              </Paper>

              {/* SKILL GAP */}
              <Stack direction="row" spacing={2} mt={3}>
                <Paper
                  sx={{
                    p: 2,
                    flex: 1,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Typography fontWeight={600} color="#4caf50" mb={1}>
                    Matched Skills
                  </Typography>

                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {results[jd.id][0].matched_skills.map((s, i) => (
                      <Chip
                        key={i}
                        label={s}
                        sx={{
                          bgcolor: "rgba(255,255,255,0.15)",
                          color: "#fff",
                          border: "1px solid rgba(255,255,255,0.3)",
                        }}
                      />
                    ))}
                  </Stack>
                </Paper>

                <Paper
                  sx={{
                    p: 2,
                    flex: 1,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Typography fontWeight={600} color="#ffab91" mb={1}>
                    Missing Skills
                  </Typography>

                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {results[jd.id][0].missing_skills.map((s, i) => (
                      <Chip
                        key={i}
                        label={s}
                        sx={{
                          bgcolor: "rgba(255,255,255,0.08) !important",
                          color: "#ffffff !important",
                          border: "1px solid rgba(255,255,255,0.35)",
                          fontWeight: 600,

                          "& .MuiChip-label": {
                            color: "#fff !important",
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Paper>
              </Stack>

              {/* COURSES BUTTON */}
              <Button
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  color: "#fff",
                  borderColor: "#fff",
                }}
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

              {/* COURSES */}
              {showCourses[jd.id] && (
                <Box
                  sx={{
                    mt: 2,
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 2,
                    background: "transparent",
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
                          borderRadius: 3,
                          overflow: "hidden",
                          background: "rgba(255,255,255,0.08)",
                          backdropFilter: "blur(10px)",
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
                              color: "#fff",
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
  );
  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",

        backgroundPosition: "center",
        backgroundAttachment: "fixed",

        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(10, 25, 50, 0.75)",
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(12px)",
          background: "rgba(10, 25, 50, 0.6)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          py: 2.5,
          px: 4,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ position: "relative" }}
        >
          {/* LEFT - USER */}
          <Stack direction="row" alignItems="center" spacing={1.2}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <PersonIcon sx={{ color: "#fff", fontSize: 25 }} />
            </Box>

            <Typography
              sx={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#fff",
                letterSpacing: 0.3,
              }}
            >
              {username || "Student"}
            </Typography>
          </Stack>

          {/* CENTER - BRAND */}
          <Typography
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontWeight: 700,
              fontSize: "1.4rem",
              letterSpacing: 1.5,
              color: "#fff",
              fontFamily: "'Poppins', sans-serif",
              background: "linear-gradient(90deg, #ffffff, #90caf9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SkillMatch AI
          </Typography>

          {/* RIGHT - LOGOUT */}
          <Button
            startIcon={<LogoutIcon />}
            onClick={onLogout}
            sx={{
              color: "#fff",
              borderRadius: "25px",
              px: 2.5,
              py: 0.6,
              fontSize: "0.85rem",
              border: "1px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.12)",
                borderColor: "#fff",
                transform: "translateY(-1px)",
              },
            }}
          >
            Logout
          </Button>
        </Stack>
      </Box>

      <Container sx={{ py: 4, position: "relative", zIndex: 1 }}>
        <Stack spacing={3}>
          {/* INTERNSHIPS */}
          <Typography sx={{ color: "#90caf9", fontWeight: 700 }}>
            Internships
          </Typography>

          {jds
            .filter((jd) => jd.title.toLowerCase().includes("intern"))
            .map((jd) => (
              <Accordion
                key={jd.id}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  backdropFilter: "blur(12px)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                >
                  <Typography fontWeight={600}>{jd.title}</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Stack spacing={3}>
                    <Typography sx={{ opacity: 0.8 }}>
                      {jd.description}
                    </Typography>

                    {/* SKILLS */}
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {jd.required_skills.map((skill, i) => (
                        <Chip
                          key={i}
                          label={skill}
                          sx={{
                            bgcolor: "rgba(255,255,255,0.15)",
                            color: "#fff",
                          }}
                        />
                      ))}
                    </Stack>

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
                          sx={{
                            borderRadius: 2,
                            bgcolor: "#1e3c72",
                            "&:hover": { bgcolor: "#2a5298" },
                          }}
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
                          sx={{
                            borderRadius: 2,
                            color: "#fff",
                            borderColor: "#fff",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                          }}
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

                    {/* RESULTS (FULL — NOTHING REMOVED) */}
                    {results[jd.id] && (
                      <Box>
                        <Typography variant="h6" mb={2}>
                          Evaluation Result
                        </Typography>

                        <Paper
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: "rgba(255,255,255,0.08)",
                            backdropFilter: "blur(10px)",
                            color: "#fff",
                          }}
                        >
                          <Stack spacing={1}>
                            <Typography>
                              Final Score:{" "}
                              <b
                                style={{
                                  color: getScoreColor(
                                    results[jd.id][0].final_score,
                                  ),
                                }}
                              >
                                {results[jd.id][0].final_score}%
                              </b>
                            </Typography>

                            <Typography>
                              Semantic Score:{" "}
                              <b style={{ color: "#90caf9" }}>
                                {results[jd.id][0].semantic_score}%
                              </b>
                            </Typography>

                            <Typography>
                              Skill Score:{" "}
                              <b style={{ color: "#ffb74d" }}>
                                {results[jd.id][0].skill_score}%
                              </b>
                            </Typography>
                          </Stack>
                        </Paper>

                        {/* SKILL GAP */}
                        <Stack direction="row" spacing={2} mt={3}>
                          <Paper
                            sx={{
                              p: 2,
                              flex: 1,
                              borderRadius: 3,
                              background: "rgba(255,255,255,0.08)",
                            }}
                          >
                            <Typography fontWeight={600} color="#4caf50" mb={1}>
                              Matched Skills
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                              {results[jd.id][0].matched_skills.map((s, i) => (
                                <Chip
                                  key={i}
                                  label={s}
                                  sx={{
                                    bgcolor: "rgba(255,255,255,0.08)",
                                    color: "#fff",
                                    border: "1px solid rgba(255,255,255,0.25)",
                                    opacity: 0.9,
                                  }}
                                />
                              ))}
                            </Stack>
                          </Paper>

                          <Paper
                            sx={{
                              p: 2,
                              flex: 1,
                              borderRadius: 3,
                              background: "rgba(255,255,255,0.08)",
                            }}
                          >
                            <Typography fontWeight={600} color="#ffab91" mb={1}>
                              Missing Skills
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                              {results[jd.id][0].missing_skills.map((s, i) => (
                                <Chip
                                  key={i}
                                  label={s}
                                  sx={{
                                    bgcolor: "rgba(228, 105, 105, 0.84)",
                                    color: "#ffffff",
                                    border: "1px solid rgba(255,255,255,0.25)",
                                    opacity: 0.9,
                                  }}
                                />
                              ))}
                            </Stack>
                          </Paper>
                        </Stack>

                        {/* COURSES */}
                        <Button
                          sx={{
                            mt: 2,
                            borderRadius: 2,
                            color: "#fff",
                            borderColor: "#fff",
                          }}
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
                              "&:hover": {
                                transform: "none",
                              },
                              background: "rgba(255,255,255,0.08)",
                            }}
                          >
                            {Object.values(
                              results[jd.id][0].course_recommendations || {},
                            ).map((courses, i) => {
                              const course = courses[0];
                              if (!course) return null;

                              return (
                                <Paper key={i} sx={{ borderRadius: 3 }}>
                                  <a
                                    href={course.url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <img
                                      src={course.thumbnail_url}
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
                                        color: "rgb(0, 0, 0)",
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

          {/* JOBS (EXACT SAME UI — NO CUTS) */}
          <Typography sx={{ color: "#90caf9", fontWeight: 700, mt: 3 }}>
            Jobs
          </Typography>

          {jds
            .filter((jd) => !jd.title.toLowerCase().includes("intern"))
            .map((jd) => (
              <Accordion
                key={jd.id}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  backdropFilter: "blur(12px)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                >
                  <Typography fontWeight={600}>{jd.title}</Typography>
                </AccordionSummary>

                {/* 👉 SAME FULL CONTENT */}
                <AccordionDetails>
                  <Stack spacing={3}>
                    <Typography sx={{ opacity: 0.8 }}>
                      {jd.description}
                    </Typography>

                    {/* SKILLS */}
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {jd.required_skills.map((skill, i) => (
                        <Chip
                          key={i}
                          label={skill}
                          sx={{
                            bgcolor: "rgba(255,255,255,0.15)",
                            color: "#fff",
                          }}
                        />
                      ))}
                    </Stack>

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
                          sx={{
                            borderRadius: 2,
                            bgcolor: "#1e3c72",
                            "&:hover": { bgcolor: "#2a5298" },
                          }}
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
                          sx={{
                            borderRadius: 2,
                            color: "#fff",
                            borderColor: "#fff",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                          }}
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

                    {/* RESULTS (FULL — NOTHING REMOVED) */}
                    {results[jd.id] && (
                      <Box>
                        <Typography variant="h6" mb={2}>
                          Evaluation Result
                        </Typography>

                        <Paper
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: "rgba(255,255,255,0.08)",
                            backdropFilter: "blur(10px)",
                            color: "#fff",
                          }}
                        >
                          <Stack spacing={1}>
                            <Typography>
                              Final Score:{" "}
                              <b
                                style={{
                                  color: getScoreColor(
                                    results[jd.id][0].final_score,
                                  ),
                                }}
                              >
                                {results[jd.id][0].final_score}%
                              </b>
                            </Typography>

                            <Typography>
                              Semantic Score:{" "}
                              <b style={{ color: "#90caf9" }}>
                                {results[jd.id][0].semantic_score}%
                              </b>
                            </Typography>

                            <Typography>
                              Skill Score:{" "}
                              <b style={{ color: "#ffb74d" }}>
                                {results[jd.id][0].skill_score}%
                              </b>
                            </Typography>
                          </Stack>
                        </Paper>

                        {/* SKILL GAP */}
                        <Stack direction="row" spacing={2} mt={3}>
                          <Paper
                            sx={{
                              p: 2,
                              flex: 1,
                              borderRadius: 3,
                              background: "rgba(255,255,255,0.08)",
                            }}
                          >
                            <Typography fontWeight={600} color="#4caf50" mb={1}>
                              Matched Skills
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                              {results[jd.id][0].matched_skills.map((s, i) => (
                                <Chip key={i} label={s} />
                              ))}
                            </Stack>
                          </Paper>

                          <Paper
                            sx={{
                              p: 2,
                              flex: 1,
                              borderRadius: 3,
                              background: "rgba(255,255,255,0.08)",
                            }}
                          >
                            <Typography fontWeight={600} color="#ffab91" mb={1}>
                              Missing Skills
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                              {results[jd.id][0].missing_skills.map((s, i) => (
                                <Chip key={i} label={s} />
                              ))}
                            </Stack>
                          </Paper>
                        </Stack>

                        {/* COURSES */}
                        <Button
                          sx={{
                            mt: 2,
                            borderRadius: 2,
                            color: "#fff",
                            borderColor: "#fff",
                          }}
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
                              background: "rgba(255,255,255,0.08)",
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
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    background: "rgba(255,255,255,0.08)",
                                    backdropFilter: "blur(10px)",
                                    transition: "0.3s ease",
                                    cursor: "pointer",
                                    "&:hover": {
                                      transform: "translateY(-6px)",
                                      boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                                    },
                                  }}
                                >
                                  <a
                                    href={course.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      textDecoration: "none",
                                      color: "inherit",
                                    }}
                                  >
                                    <Box>
                                      <img
                                        src={course.thumbnail_url}
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
                                          color: "rgba(255,255,255,0.85)",
                                        }}
                                      >
                                        {course.title}
                                      </Typography>
                                    </Box>
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
