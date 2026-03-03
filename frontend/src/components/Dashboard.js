import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Container,
  Stack,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import {
  Work as WorkIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

function Dashboard({ onLogout }) {
  const [jds, setJds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [results, setResults] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    required_skills: "",
  });

  const fetchJDs = () => {
    fetch("http://127.0.0.1:5000/jds")
      .then((res) => res.json())
      .then((data) => setJds(data));
  };

  useEffect(() => {
    fetchJDs();
  }, []);

  const handleSubmit = async () => {
    const url = editingId
      ? `http://127.0.0.1:5000/jds/${editingId}`
      : "http://127.0.0.1:5000/jds";

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.title,
        description: formData.description,
        required_skills: formData.required_skills
          .split(",")
          .map((s) => s.trim()),
      }),
    });

    setShowForm(false);
    setEditingId(null);
    setFormData({ title: "", description: "", required_skills: "" });
    fetchJDs();
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this job description?")
    ) {
      await fetch(`http://127.0.0.1:5000/jds/${id}`, { method: "DELETE" });
      fetchJDs();
    }
  };

  const handleEdit = (jd) => {
    setEditingId(jd.id);
    setFormData({
      title: jd.title,
      description: jd.description,
      required_skills: jd.required_skills.join(", "),
    });
    setShowForm(true);
  };

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

    // Sort results by final_score in descending order
    const sortedResults = data.results.sort(
      (a, b) => b.final_score - a.final_score,
    );

    setResults((prev) => ({
      ...prev,
      [jdId]: sortedResults,
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#2e7d32";
    if (score >= 60) return "#ed6c02";
    return "#d32f2f";
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
              <WorkIcon sx={{ fontSize: 32 }} />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  fontSize: "1.8rem",
                  letterSpacing: "-0.5px",
                }}
              >
                HR Dashboard
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
        {/* Add JD Button */}
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(!showForm)}
            sx={{
              bgcolor: "#1e3c72",
              "&:hover": { bgcolor: "#2a5298" },
              fontSize: "1rem",
              fontWeight: 600,
              py: 1,
              px: 3,
            }}
          >
            {showForm ? "Cancel" : "Add New JD"}
          </Button>
        </Stack>

        {/* Add/Edit Form */}
        {showForm && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                color: "#1e3c72",
                fontSize: "1.4rem",
                fontWeight: 600,
                mb: 2,
              }}
            >
              {editingId ? "Edit Job Description" : "New Job Description"}
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Job Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                size="small"
                sx={{
                  "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                  "& .MuiInputBase-input": { fontSize: "0.95rem" },
                }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                size="small"
                sx={{
                  "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                  "& .MuiInputBase-input": { fontSize: "0.95rem" },
                }}
              />
              <TextField
                fullWidth
                label="Required Skills (comma separated)"
                value={formData.required_skills}
                onChange={(e) =>
                  setFormData({ ...formData, required_skills: e.target.value })
                }
                size="small"
                helperText="Example: Python, JavaScript, React"
                sx={{
                  "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                  "& .MuiInputBase-input": { fontSize: "0.95rem" },
                  "& .MuiFormHelperText-root": { fontSize: "0.85rem" },
                }}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  sx={{
                    bgcolor: "#1e3c72",
                    "&:hover": { bgcolor: "#2a5298" },
                    fontSize: "0.95rem",
                    fontWeight: 600,
                  }}
                >
                  {editingId ? "Update" : "Create"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      title: "",
                      description: "",
                      required_skills: "",
                    });
                  }}
                  sx={{ fontSize: "0.95rem", fontWeight: 500 }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )}

        {/* Job Descriptions List */}
        {jds.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <WorkIcon sx={{ fontSize: 70, color: "#9e9e9e", mb: 2 }} />
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ fontSize: "1.6rem", fontWeight: 500, mb: 1 }}
            >
              No Job Descriptions Found
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: "1.1rem" }}
            >
              Click the "Add New JD" button to create one
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
                          label={`${jd.required_skills.length} skills`}
                          size="small"
                          sx={{
                            bgcolor: "#e3f2fd",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                          }}
                        />
                        {results[jd.id] && (
                          <Chip
                            label={`${results[jd.id].length} resumes`}
                            size="small"
                            sx={{
                              bgcolor: "#e8f5e8",
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

                    {/* Actions */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<UploadIcon />}
                        sx={{
                          bgcolor: "#1e3c72",
                          "&:hover": { bgcolor: "#2a5298" },
                          fontSize: "0.95rem",
                          fontWeight: 600,
                        }}
                      >
                        Upload Resumes
                        <input
                          type="file"
                          hidden
                          multiple
                          onChange={(e) => handleUpload(e, jd.id)}
                        />
                      </Button>

                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(jd)}
                          title="Edit"
                          sx={{ color: "#1e3c72" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(jd.id)}
                          title="Delete"
                          sx={{ color: "#d32f2f" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    {/* Results - Sorted by score */}
                    {results[jd.id] && results[jd.id].length > 0 && (
                      <Box>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            color: "#1e3c72",
                            mt: 2,
                            fontSize: "1.3rem",
                            fontWeight: 600,
                          }}
                        >
                          Results (Sorted by Score)
                        </Typography>
                        <Stack spacing={2}>
                          {results[jd.id].map((result, index) => (
                            <Paper
                              key={index}
                              variant="outlined"
                              sx={{
                                p: 2.5,
                                borderLeft: 5,
                                borderLeftColor: getScoreColor(
                                  result.final_score,
                                ),
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                              >
                                <Chip
                                  label={`#${index + 1}`}
                                  size="small"
                                  sx={{
                                    minWidth: 50,
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    bgcolor: "#f0f0f0",
                                  }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: "1.05rem",
                                      mb: 0.5,
                                    }}
                                  >
                                    {result.filename}
                                  </Typography>
                                  <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: getScoreColor(
                                          result.final_score,
                                        ),
                                        fontWeight: 700,
                                        fontSize: "1rem",
                                      }}
                                    >
                                      Score: {result.final_score}%
                                    </Typography>
                                    <Chip
                                      label={result.status}
                                      size="small"
                                      sx={{
                                        bgcolor:
                                          result.status === "Shortlisted"
                                            ? "#e8f5e8"
                                            : "#fff3e0",
                                        color:
                                          result.status === "Shortlisted"
                                            ? "#2e7d32"
                                            : "#ed6c02",
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                      }}
                                    />
                                  </Stack>
                                </Box>
                              </Stack>
                            </Paper>
                          ))}
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

export default Dashboard;
