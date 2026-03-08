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
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Work as WorkIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";

function StudentDashboard({ username = "", onLogout }) {
  const [jds, setJds] = useState([]);
  const [results, setResults] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetch("http://localhost:5000/jds", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setJds(data));
  }, []);
  const handleSendToHR = async (event, jdId) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let file of files) {
      formData.append("resumes", file);
    }

    try {
      const res = await fetch(`http://localhost:5000/send-to-hr/${jdId}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        setSnackbar({
          open: true,
          message: "Resumes sent successfully. HR will review your application.",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: data.error || data.message || "Could not send resumes. Please try again.",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Something went wrong. Please check your connection and try again.",
        severity: "error",
      });
    }
    event.target.value = "";
  };
  const handleUpload = async (event, jdId) => {
    const files = event.target.files;
    const formData = new FormData();

    for (let file of files) {
      formData.append("resumes", file);
    }

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
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#2e7d32";
    if (score >= 50) return "#ed6c02";
    return "#d32f2f";
  };

  const getRecommendationColor = (score) => {
    if (score >= 75) return "#2e7d32";
    if (score >= 50) return "#ed6c02";
    return "#d32f2f";
  };

  const getRecommendationText = (score) => {
    if (score >= 75) return "Highly Suitable";
    if (score >= 50) return "Moderately Suitable";
    return "Needs Improvement";
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "#1e3c72",
          color: "white",
          py: 2.5,
          px: 4,
          borderRadius: 0,
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <SchoolIcon sx={{ fontSize: 32 }} />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  fontSize: "1.8rem",
                  letterSpacing: "-0.5px",
                }}
              >
                Student Self Evaluation
              </Typography>
            </Stack>

            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={onLogout}
              sx={{
                color: "white",
                borderColor: "white",
                fontSize: "1rem",
                fontWeight: 500,
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Logout
            </Button>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Message */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            bgcolor: "white",
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: "#1e3c72",
              fontSize: "1.5rem",
              fontWeight: 600,
              mb: 1,
            }}
          >
            Welcome, {username || "Student"}!
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: "1.1rem" }}
          >
            Upload your resume to see how well you match with available job
            descriptions
          </Typography>
        </Paper>

        {/* Job Descriptions List */}
        {jds.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <WorkIcon sx={{ fontSize: 70, color: "#9e9e9e", mb: 2 }} />
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ fontSize: "1.6rem", fontWeight: 500, mb: 1 }}
            >
              No Job Descriptions Available
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: "1.1rem" }}
            >
              Please check back later
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {jds.map((jd) => (
              <Accordion key={jd.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <WorkIcon sx={{ color: "#1e3c72", fontSize: 28 }} />
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          fontSize: "1.2rem",
                          mb: 0.5,
                        }}
                      >
                        {jd.title}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={`${jd.required_skills.length} skills required`}
                          size="small"
                          sx={{
                            bgcolor: "#e3f2fd",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                          }}
                        />
                        {results[jd.id] && (
                          <Chip
                            label="Evaluated"
                            size="small"
                            sx={{
                              bgcolor: "#e8f5e8",
                              color: "#2e7d32",
                              fontSize: "0.8rem",
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </AccordionSummary>

                <AccordionDetails>
                  <Stack spacing={3}>
                    {/* Description */}
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                        sx={{ fontSize: "1rem", lineHeight: 1.6 }}
                      >
                        {jd.description}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          color: "#1e3c72",
                        }}
                      >
                        Required Skills:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {jd.required_skills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            sx={{
                              bgcolor: "#f5f5f5",
                              fontSize: "0.85rem",
                              fontWeight: 500,
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Divider />

                    {/* Upload Button */}
                    <Box>
                      <Stack direction="row" spacing={2}>
                        {/* Self Evaluate */}
                        <Button
                          variant="contained"
                          component="label"
                          startIcon={<SchoolIcon />}
                          sx={{
                            bgcolor: "#1e3c72",
                            "&:hover": { bgcolor: "#2a5298" },
                            fontSize: "0.9rem",
                            fontWeight: 600,
                          }}
                        >
                          Self Evaluate
                          <input
                            type="file"
                            hidden
                            onChange={(e) => handleUpload(e, jd.id)}
                          />
                        </Button>

                        {/* Send to HR */}
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<WorkIcon />}
                          sx={{
                            borderColor: "#1e3c72",
                            color: "#1e3c72",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            "&:hover": {
                              borderColor: "#2a5298",
                              bgcolor: "#f0f4ff",
                            },
                          }}
                        >
                          Send to HR
                          <input
                            type="file"
                            hidden
                            onChange={(e) => handleSendToHR(e, jd.id)}
                          />
                        </Button>
                      </Stack>
                    </Box>

                    {/* Evaluation Results */}
                    {results[jd.id] && results[jd.id][0] && (
                      <Box>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            color: "#1e3c72",
                            fontSize: "1.3rem",
                            fontWeight: 600,
                            mb: 2,
                          }}
                        >
                          Evaluation Results
                        </Typography>

                        {/* Score Cards */}
                        <Stack spacing={2}>
                          {/* Final Score Card */}
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2.5,
                              borderLeft: 5,
                              borderLeftColor: getScoreColor(
                                results[jd.id][0]?.final_score,
                              ),
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    color: "text.secondary",
                                    mb: 0.5,
                                  }}
                                >
                                  Final Score
                                </Typography>
                                <Typography
                                  variant="h4"
                                  sx={{
                                    color: getScoreColor(
                                      results[jd.id][0]?.final_score,
                                    ),
                                    fontWeight: 700,
                                    fontSize: "2rem",
                                  }}
                                >
                                  {results[jd.id][0]?.final_score}%
                                </Typography>
                              </Box>
                              <Chip
                                label={getRecommendationText(
                                  results[jd.id][0]?.final_score,
                                )}
                                sx={{
                                  bgcolor: `${getRecommendationColor(results[jd.id][0]?.final_score)}15`,
                                  color: getRecommendationColor(
                                    results[jd.id][0]?.final_score,
                                  ),
                                  fontSize: "0.9rem",
                                  fontWeight: 600,
                                  p: 1,
                                }}
                              />
                            </Stack>
                          </Paper>

                          {/* Component Scores */}
                          <Stack direction="row" spacing={2}>
                            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  fontSize: "0.9rem",
                                  color: "text.secondary",
                                  mb: 1,
                                }}
                              >
                                Semantic Score
                              </Typography>
                              <Typography
                                variant="h5"
                                sx={{
                                  color: "#1e3c72",
                                  fontWeight: 600,
                                  fontSize: "1.5rem",
                                }}
                              >
                                {results[jd.id][0]?.semantic_score}%
                              </Typography>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  fontSize: "0.9rem",
                                  color: "text.secondary",
                                  mb: 1,
                                }}
                              >
                                Skill Match Score
                              </Typography>
                              <Typography
                                variant="h5"
                                sx={{
                                  color: "#1e3c72",
                                  fontWeight: 600,
                                  fontSize: "1.5rem",
                                }}
                              >
                                {results[jd.id][0]?.skill_score}%
                              </Typography>
                            </Paper>
                          </Stack>

                          {/* Skills Analysis */}
                          <Paper variant="outlined" sx={{ p: 2.5 }}>
                            <Typography
                              variant="subtitle1"
                              gutterBottom
                              sx={{
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                color: "#1e3c72",
                                mb: 2,
                              }}
                            >
                              Skills Analysis
                            </Typography>

                            {/* Matched Skills */}
                            <Box sx={{ mb: 2.5 }}>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ mb: 1 }}
                              >
                                <CheckCircleIcon
                                  sx={{ color: "#2e7d32", fontSize: 20 }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  Matched Skills
                                </Typography>
                              </Stack>
                              <Box sx={{ pl: 3.5 }}>
                                {results[jd.id][0]?.matched_skills?.length >
                                0 ? (
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    flexWrap="wrap"
                                  >
                                    {results[jd.id][0]?.matched_skills.map(
                                      (skill, index) => (
                                        <Chip
                                          key={index}
                                          label={skill}
                                          size="small"
                                          sx={{
                                            bgcolor: "#e8f5e8",
                                            color: "#2e7d32",
                                            fontSize: "0.85rem",
                                            fontWeight: 500,
                                          }}
                                        />
                                      ),
                                    )}
                                  </Stack>
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: "0.95rem" }}
                                  >
                                    No skills matched
                                  </Typography>
                                )}
                              </Box>
                            </Box>

                            {/* Missing Skills */}
                            <Box>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ mb: 1 }}
                              >
                                <ErrorIcon
                                  sx={{ color: "#d32f2f", fontSize: 20 }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  Missing Skills
                                </Typography>
                              </Stack>
                          <Box sx={{ pl: 3.5 }}>
                            {results[jd.id][0]?.missing_skills?.length > 0 ? (
                              <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                              >
                                {results[jd.id][0]?.missing_skills.map(
                                  (skill, index) => (
                                    <Chip
                                      key={index}
                                      label={skill}
                                      size="small"
                                      sx={{
                                        bgcolor: "#ffebee",
                                        color: "#d32f2f",
                                        fontSize: "0.85rem",
                                        fontWeight: 500,
                                      }}
                                    />
                                  ),
                                )}
                              </Stack>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: "0.95rem" }}
                              >
                                No missing skills - Great match!
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* Recommended YouTube Courses for Missing Skills */}
                        {results[jd.id][0]?.course_recommendations &&
                          Object.keys(
                            results[jd.id][0].course_recommendations || {},
                          ).length > 0 && (
                            <Box sx={{ mt: 3 }}>
                              <Typography
                                variant="subtitle1"
                                gutterBottom
                                sx={{
                                  fontSize: "1.05rem",
                                  fontWeight: 600,
                                  color: "#1e3c72",
                                }}
                              >
                                Top YouTube Courses for Missing Skills
                              </Typography>

                              <Stack spacing={3}>
                                {Object.entries(
                                  results[jd.id][0].course_recommendations,
                                ).map(([skill, courses]) => (
                                  <Box key={skill}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 600,
                                        mb: 1,
                                        fontSize: "0.95rem",
                                      }}
                                    >
                                      {skill}
                                    </Typography>

                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 2,
                                      }}
                                    >
                                      {courses.map((course, idx) => (
                                        <Box
                                          key={idx}
                                          sx={{
                                            width: 260,
                                            bgcolor: "#fafafa",
                                            borderRadius: 1,
                                            boxShadow: 1,
                                            overflow: "hidden",
                                          }}
                                        >
                                          <a
                                            href={course.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ textDecoration: "none" }}
                                          >
                                            {course.thumbnail_url && (
                                              <Box
                                                component="img"
                                                src={course.thumbnail_url}
                                                alt={course.title}
                                                sx={{
                                                  width: "100%",
                                                  height: 145,
                                                  objectFit: "cover",
                                                }}
                                              />
                                            )}
                                            <Box sx={{ p: 1.5 }}>
                                              <Typography
                                                variant="body2"
                                                sx={{
                                                  fontWeight: 600,
                                                  fontSize: "0.9rem",
                                                  color: "#1e3c72",
                                                }}
                                              >
                                                {course.title}
                                              </Typography>
                                              <Typography
                                                variant="caption"
                                                sx={{ color: "text.secondary" }}
                                              >
                                                {course.view_count != null &&
                                                  `${
                                                    course.view_count.toLocaleString
                                                      ? course.view_count.toLocaleString()
                                                      : course.view_count
                                                  } views`}
                                              </Typography>
                                            </Box>
                                          </a>
                                        </Box>
                                      ))}
                                    </Box>
                                  </Box>
                                ))}
                              </Stack>
                            </Box>
                          )}
                      </Paper>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    )}
  </Container>

  <Snackbar
    open={snackbar.open}
    autoHideDuration={5000}
    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
  >
    <Alert
      onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      severity={snackbar.severity}
      variant="filled"
      sx={{
        width: "100%",
        "& .MuiAlert-message": { fontSize: "1rem" },
      }}
    >
      {snackbar.message}
    </Alert>
  </Snackbar>
</Box>
);
}

export default StudentDashboard;
