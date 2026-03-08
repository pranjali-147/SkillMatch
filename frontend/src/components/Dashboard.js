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

  const fetchJDs = () => {
    fetch("http://localhost:5000/jds", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setJds(data));
  };

  useEffect(() => {
    fetchJDs();
  }, []);

  const handleSubmit = async () => {
    const url = editingId
      ? `http://localhost:5000/jds/${editingId}`
      : "http://localhost:5000/jds";

    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: formData.title,
        description: formData.description,
        required_skills: (formData.required_skills || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.message || "Failed to save job description");
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ title: "", description: "", required_skills: "" });

    fetchJDs();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this JD?")) {
      await fetch(`http://localhost:5000/jds/${id}`, { method: "DELETE", credentials: "include" });
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

    const res = await fetch(`http://localhost:5000/analyze/${jdId}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await res.json();

    const sortedResults = data.results.sort(
      (a, b) => b.final_score - a.final_score,
    );

    setResults((prev) => ({
      ...prev,
      [jdId]: sortedResults,
    }));
  };

  const fetchHRResumes = async (jdId) => {
    const res = await fetch(`http://localhost:5000/hr-resumes/${jdId}`, { credentials: "include" });

    const data = await res.json();

    setHrResumes((prev) => ({
      ...prev,
      [jdId]: data,
    }));
  };

  const handleCheckbox = (jdId, filename) => {
    setSelectedResumes((prev) => {
      const current = prev[jdId] || [];

      if (current.includes(filename)) {
        return {
          ...prev,
          [jdId]: current.filter((r) => r !== filename),
        };
      } else {
        return {
          ...prev,
          [jdId]: [...current, filename],
        };
      }
    });
  };

  const handleEvaluateSelected = async (jdId) => {
    const resumes = selectedResumes[jdId] || [];

    if (resumes.length === 0) {
      alert("Please select resumes");
      return;
    }

    const res = await fetch(`http://localhost:5000/evaluate-selected/${jdId}`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        resumes,
      }),
    });

    const data = await res.json();

    const sorted = data.results.sort((a, b) => b.final_score - a.final_score);

    setResults((prev) => ({
      ...prev,
      [jdId]: sorted,
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#2e7d32";
    if (score >= 60) return "#ed6c02";
    return "#d32f2f";
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* HEADER */}

      <Paper sx={{ bgcolor: "#1e3c72", color: "white", py: 2, px: 4 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h5">HR Dashboard</Typography>

          <Button
            startIcon={<LogoutIcon />}
            variant="outlined"
            onClick={onLogout}
            sx={{ color: "white", borderColor: "white" }}
          >
            Logout
          </Button>
        </Stack>
      </Paper>

      <Container sx={{ py: 4 }}>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          sx={{ mb: 3 }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Add JD"}
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
                label="Skills"
                value={formData.required_skills}
                onChange={(e) =>
                  setFormData({ ...formData, required_skills: e.target.value })
                }
              />

              <Button variant="contained" onClick={handleSubmit}>
                {editingId ? "Update" : "Create"}
              </Button>
            </Stack>
          </Paper>
        )}

        {jds.map((jd) => (
          <Accordion key={jd.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{jd.title}</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Typography>{jd.description}</Typography>

              <Stack direction="row" spacing={1} sx={{ my: 1 }}>
                {jd.required_skills.map((s, i) => (
                  <Chip key={i} label={s} />
                ))}
              </Stack>

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
                sx={{ ml: 2 }}
                onClick={() => fetchHRResumes(jd.id)}
              >
                View Uploaded Resumes
              </Button>

              {hrResumes[jd.id] && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6">Uploaded Resumes</Typography>

                  {hrResumes[jd.id].map((resume, index) => (
                    <Paper key={index} sx={{ p: 2, mt: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Checkbox
                          checked={(selectedResumes[jd.id] || []).includes(
                            resume.filename,
                          )}
                          onChange={() =>
                            handleCheckbox(jd.id, resume.filename)
                          }
                        />

                        <Box>
                          <Typography>{resume.filename}</Typography>

                          <Typography variant="caption">
                            Uploaded by: {resume.uploaded_by}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}

                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => handleEvaluateSelected(jd.id)}
                  >
                    Evaluate Selected
                  </Button>
                </Box>
              )}

              {results[jd.id] && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6">
                    Results (Sorted by Score)
                  </Typography>

                  {results[jd.id].map((r, i) => (
                    <Paper
                      key={i}
                      sx={{
                        p: 2,
                        mt: 1,
                        borderLeft: `6px solid ${getScoreColor(r.final_score)}`,
                      }}
                    >
                      <Typography>{r.filename}</Typography>

                      <Typography variant="caption">
                        Uploaded by: {r.uploaded_by}
                      </Typography>

                      <Typography>Score: {r.final_score}%</Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}

export default Dashboard;
