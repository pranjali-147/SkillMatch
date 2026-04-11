import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Container,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Checkbox,
} from "@mui/material";

import {
  Work as WorkIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

function Dashboard({ onLogout }) {
  const [jds, setJds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [results, setResults] = useState({});
  const [hrResumes, setHrResumes] = useState({});
  const [selectedResumes, setSelectedResumes] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    required_skills: "",
  });

  useEffect(() => {
    fetchJDs();
  }, []);

  const fetchJDs = () => {
    fetch("http://localhost:5000/jds", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setJds(data));
  };

  const handleSubmit = async () => {
    const url = editingId
      ? `http://localhost:5000/jds/${editingId}`
      : "http://localhost:5000/jds";

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: formData.title,
        description: formData.description,
        required_skills: formData.required_skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });

    setShowForm(false);
    setEditingId(null);
    setFormData({ title: "", description: "", required_skills: "" });

    fetchJDs();
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/jds/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchJDs();
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

  const handleUpload = async (e, jdId) => {
    const formData = new FormData();

    for (let file of e.target.files) {
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
      [jdId]: data.results.sort((a, b) => b.final_score - a.final_score),
    }));
  };

  const handleViewResume = (fileId) => {
    window.open(`http://localhost:5000/view-resume/${fileId}`, "_blank");
  };

  const fetchHRResumes = async (jdId) => {
    const res = await fetch(`http://localhost:5000/hr-resumes/${jdId}`, {
      credentials: "include",
    });

    const data = await res.json();

    setHrResumes((prev) => ({
      ...prev,
      [jdId]: data,
    }));
  };

  const handleCheckbox = (jdId, fileId) => {
    setSelectedResumes((prev) => {
      const current = prev[jdId] || [];

      return {
        ...prev,
        [jdId]: current.includes(fileId)
          ? current.filter((r) => r !== fileId)
          : [...current, fileId],
      };
    });
  };

  const handleEvaluateSelected = async (jdId) => {
    const res = await fetch(`http://localhost:5000/evaluate-selected/${jdId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        resumes: selectedResumes[jdId],
      }),
    });

    const data = await res.json();

    setResults((prev) => ({
      ...prev,
      [jdId]: data.results.sort((a, b) => b.final_score - a.final_score),
    }));
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
          <Typography variant="h5">HR Dashboard</Typography>
          <Button onClick={onLogout} color="inherit">
            Logout
          </Button>
        </Stack>
      </Paper>

      <Container sx={{ py: 4 }}>
        {/* ADD JD */}
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          sx={{ mb: 3 }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Add Job Description"}
        </Button>

        {showForm && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Stack spacing={2}>
              <TextField
                label="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />

              <TextField
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <TextField
                label="Skills (comma separated)"
                multiline
                rows={3}
                value={formData.required_skills}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    required_skills: e.target.value,
                  })
                }
              />

              <Button variant="contained" onClick={handleSubmit}>
                {editingId ? "Update JD" : "Create JD"}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* JDs */}
        {jds.map((jd) => (
          <Accordion key={jd.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={2} alignItems="center">
                <WorkIcon />
                <Typography sx={{ fontWeight: 600 }}>{jd.title}</Typography>
              </Stack>
            </AccordionSummary>

            <AccordionDetails>
              <Stack spacing={3}>
                {/* DESCRIPTION */}
                <Typography>{jd.description}</Typography>

                {/* SKILLS */}
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {jd.required_skills.map((s, i) => (
                    <Chip key={i} label={s} />
                  ))}
                </Stack>

                {/* ACTIONS */}
                <Stack direction="row" spacing={2}>
                  <Button
                    startIcon={<EditIcon />}
                    variant="outlined"
                    onClick={() => handleEdit(jd)}
                  >
                    Edit
                  </Button>

                  <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    variant="outlined"
                    onClick={() => handleDelete(jd.id)}
                  >
                    Delete
                  </Button>
                </Stack>

                <Divider />

                {/* UPLOAD */}
                <Stack direction="row" spacing={2}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<UploadIcon />}
                  >
                    Upload Resumes
                    <input
                      hidden
                      type="file"
                      multiple
                      onChange={(e) => handleUpload(e, jd.id)}
                    />
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => fetchHRResumes(jd.id)}
                  >
                    View Uploaded Resumes
                  </Button>
                </Stack>

                {/* RESUME LIST */}
                {hrResumes[jd.id] && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Uploaded Resumes
                    </Typography>

                    <Stack spacing={1}>
                      {hrResumes[jd.id].map((r, i) => (
                        <Paper key={i} sx={{ p: 2 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              <Checkbox
                                checked={(
                                  selectedResumes[jd.id] || []
                                ).includes(r.file_id)}
                                onChange={() =>
                                  handleCheckbox(jd.id, r.file_id)
                                }
                              />
                              <Box>
                                <Typography>{r.filename}</Typography>
                                <Typography variant="caption">
                                  {r.uploaded_by}
                                </Typography>
                              </Box>
                            </Stack>

                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewResume(r.file_id)}
                            >
                              View
                            </Button>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>

                    <Button
                      variant="contained"
                      sx={{ mt: 2 }}
                      onClick={() => handleEvaluateSelected(jd.id)}
                    >
                      Evaluate Selected
                    </Button>
                  </Box>
                )}

                {/* RESULTS */}
                {results[jd.id] && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Results
                    </Typography>

                    <Stack spacing={1}>
                      {results[jd.id].map((r, i) => (
                        <Paper
                          key={i}
                          sx={{
                            p: 2,
                            borderLeft: `6px solid ${getScoreColor(
                              r.final_score,
                            )}`,
                          }}
                        >
                          <Typography sx={{ fontWeight: 600 }}>
                            {r.filename}
                          </Typography>

                          <Typography variant="caption">
                            {r.uploaded_by}
                          </Typography>

                          <Typography sx={{ mt: 1 }}>
                            Score:{" "}
                            <span
                              style={{
                                color: getScoreColor(r.final_score),
                                fontWeight: "bold",
                              }}
                            >
                              {r.final_score}%
                            </span>
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}

export default Dashboard;
