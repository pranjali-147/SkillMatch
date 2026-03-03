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
} from "@mui/material";
import {
  Work as WorkIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";

function StudentDashboard({ onLogout }) {
  const [jds, setJds] = useState([]);
  const [results, setResults] = useState({});

  useEffect(() => {
    fetch("http://127.0.0.1:5000/jds", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setJds(data));
  }, []);

  const handleUpload = async (event, jdId) => {
    const files = event.target.files;
    const formData = new FormData();

    for (let file of files) {
      formData.append("resumes", file);
    }

    const res = await fetch(`http://127.0.0.1:5000/analyze/${jdId}`, {
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
            Welcome, Student!
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
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<SchoolIcon />}
                        sx={{
                          bgcolor: "#1e3c72",
                          "&:hover": { bgcolor: "#2a5298" },
                          fontSize: "0.95rem",
                          fontWeight: 600,
                        }}
                      >
                        Upload Your Resume
                        <input
                          type="file"
                          hidden
                          onChange={(e) => handleUpload(e, jd.id)}
                        />
                      </Button>
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
                                {results[jd.id][0]?.missing_skills?.length >
                                0 ? (
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
    </Box>
  );
}

export default StudentDashboard;
