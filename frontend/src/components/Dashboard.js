import { useEffect, useState } from "react";
import bgImage from "../assets/dashboard_bg.png";
import PersonIcon from "@mui/icons-material/Person";
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
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  ExpandMore as ExpandMoreIcon,
  Logout as LogoutIcon,
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
    if (score >= 75) return "#4caf50";
    if (score >= 50) return "#ff9800";
    return "#f44336";
  };

  const internships = jds.filter((jd) =>
    jd.title.toLowerCase().includes("intern"),
  );

  const jobs = jds.filter((jd) => !jd.title.toLowerCase().includes("intern"));
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
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(10,25,50,0.85), rgba(10,25,50,0.75))",
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
          {/* LEFT - HR + ICON */}
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
              <PersonIcon sx={{ color: "#fff", fontSize: 22 }} />
            </Box>

            <Typography
              sx={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#fff",
                letterSpacing: 0.3,
              }}
            >
              HR
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
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          sx={{
            mb: 3,
            borderRadius: "30px",
            background: "linear-gradient(135deg, #1e3c72, #2a5298)",
          }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Add Job Description"}
        </Button>

        {/* FORM */}
        {showForm && (
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 4,
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            }}
          >
            <Stack spacing={2}>
              {/* TITLE */}
              <TextField
                label="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                fullWidth
                InputLabelProps={{ style: { color: "#bbb" } }}
                InputProps={{ style: { color: "#fff" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.2)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#90caf9",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#42a5f5",
                    },
                  },
                }}
              />

              {/* DESCRIPTION */}
              <TextField
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                fullWidth
                InputLabelProps={{ style: { color: "#bbb" } }}
                InputProps={{ style: { color: "#fff" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.2)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#90caf9",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#42a5f5",
                    },
                  },
                }}
              />

              {/* SKILLS */}
              <TextField
                label="Skills (comma separated)"
                multiline
                rows={2}
                value={formData.required_skills}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    required_skills: e.target.value,
                  })
                }
                fullWidth
                InputLabelProps={{ style: { color: "#bbb" } }}
                InputProps={{ style: { color: "#fff" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.2)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#90caf9",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#42a5f5",
                    },
                  },
                }}
              />

              {/* BUTTON */}
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2a5298, #1e3c72)",
                  },
                }}
              >
                {editingId ? "Update JD" : "Create JD"}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* JDs */}
        {/* INTERNSHIPS */}
        <Typography
          sx={{
            color: "#90caf9",
            fontWeight: 700,
            mb: 2,
            mt: 2,
            fontSize: "1.1rem",
          }}
        >
          Internships
        </Typography>

        {jds
          .filter((jd) => jd.title.toLowerCase().includes("intern"))
          .map((jd) => (
            <Accordion
              key={jd.id}
              sx={{
                mb: 2,
                borderRadius: 4,
                backdropFilter: "blur(14px)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
              >
                <Typography fontWeight={600}>{jd.title}</Typography>
              </AccordionSummary>

              <AccordionDetails>
                {/* ✅ SAME CONTENT (unchanged) */}
                <Stack spacing={2}>
                  <Typography>{jd.description}</Typography>

                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {jd.required_skills.map((s, i) => (
                      <Chip
                        key={i}
                        label={s}
                        sx={{ bgcolor: "#ffffff22", color: "#fff" }}
                      />
                    ))}
                  </Stack>

                  <Stack direction="row" spacing={2}>
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(jd)}
                      sx={{
                        color: "#90caf9",
                        border: "1px solid rgba(144,202,249,0.4)",
                        borderRadius: 2,
                        px: 2,
                        "&:hover": { bgcolor: "rgba(144,202,249,0.1)" },
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(jd.id)}
                      sx={{
                        color: "#ff6b6b",
                        border: "1px solid rgba(255,107,107,0.4)",
                        borderRadius: 2,
                        px: 2,
                        "&:hover": { bgcolor: "rgba(255,107,107,0.1)" },
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>

                  <Divider sx={{ borderColor: "rgba(255,255,255,0.15)" }} />

                  <Stack direction="row" spacing={2}>
                    <Button
                      component="label"
                      startIcon={<UploadIcon />}
                      sx={{
                        borderRadius: 2,
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.3)",
                        "&:hover": { bgcolor: "rgba(239, 232, 232, 0.1)" },
                      }}
                    >
                      Upload
                      <input
                        hidden
                        type="file"
                        multiple
                        onChange={(e) => handleUpload(e, jd.id)}
                      />
                    </Button>

                    <Button
                      onClick={() => fetchHRResumes(jd.id)}
                      sx={{
                        color: "#90caf9",
                        "&:hover": { bgcolor: "rgba(144,202,249,0.1)" },
                      }}
                    >
                      View Resumes
                    </Button>
                  </Stack>

                  {/* RESUMES + RESULTS SAME AS YOUR CODE */}
                  {/* KEEP EXACTLY SAME BELOW */}
                  {hrResumes[jd.id] && (
                    <Stack spacing={1}>
                      {hrResumes[jd.id].map((r, i) => (
                        <Paper
                          key={i}
                          sx={{ p: 2, background: "#ffffff11", color: "#fff" }}
                        >
                          <Stack direction="row" justifyContent="space-between">
                            <Stack direction="row" spacing={2}>
                              <Checkbox
                                checked={(
                                  selectedResumes[jd.id] || []
                                ).includes(r.file_id)}
                                onChange={() =>
                                  handleCheckbox(jd.id, r.file_id)
                                }
                              />
                              <Typography>{r.filename}</Typography>
                            </Stack>

                            <Button onClick={() => handleViewResume(r.file_id)}>
                              View
                            </Button>
                          </Stack>
                        </Paper>
                      ))}

                      <Button
                        variant="contained"
                        onClick={() => handleEvaluateSelected(jd.id)}
                        sx={{
                          mt: 2,
                          alignSelf: "center",
                          borderRadius: "25px",
                          px: 4,
                          fontWeight: 600,
                          background:
                            "linear-gradient(135deg, #1e3c72, #2a5298)",
                        }}
                      >
                        Evaluate Selected
                      </Button>
                    </Stack>
                  )}

                  {results[jd.id] && (
                    <Stack spacing={2} mt={1}>
                      {results[jd.id].map((r, i) => (
                        <Paper
                          key={i}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            background: "rgba(255,255,255,0.08)",
                            backdropFilter: "blur(12px)",
                            borderLeft: `6px solid ${getScoreColor(r.final_score)}`,
                            color: "#fff",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Stack>
                            <Typography fontWeight={600}>
                              {i + 1}. {r.filename}
                            </Typography>
                            <Typography
                              sx={{ fontSize: "0.85rem", opacity: 0.8 }}
                            >
                              Uploaded by: {r.uploaded_by}
                            </Typography>
                          </Stack>

                          <Typography color={getScoreColor(r.final_score)}>
                            {r.final_score}%
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}

        {/* JOBS */}
        <Typography
          sx={{
            color: "#90caf9",
            fontWeight: 700,
            mb: 2,
            mt: 4,
            fontSize: "1.1rem",
          }}
        >
          Jobs
        </Typography>

        {jds
          .filter((jd) => !jd.title.toLowerCase().includes("intern"))
          .map((jd) => (
            <Accordion
              key={jd.id}
              sx={{
                mb: 2,
                borderRadius: 4,
                backdropFilter: "blur(14px)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
              >
                <Typography fontWeight={600}>{jd.title}</Typography>
              </AccordionSummary>

              <AccordionDetails>
                <Stack spacing={2}>
                  <Typography>{jd.description}</Typography>

                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {jd.required_skills.map((s, i) => (
                      <Chip
                        key={i}
                        label={s}
                        sx={{ bgcolor: "#ffffff22", color: "#fff" }}
                      />
                    ))}
                  </Stack>

                  <Stack direction="row" spacing={2}>
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(jd)}
                      sx={{
                        color: "#90caf9",
                        border: "1px solid rgba(144,202,249,0.4)",
                        borderRadius: 2,
                        px: 2,
                        "&:hover": { bgcolor: "rgba(144,202,249,0.1)" },
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(jd.id)}
                      sx={{
                        color: "#ff6b6b",
                        border: "1px solid rgba(255,107,107,0.4)",
                        borderRadius: 2,
                        px: 2,
                        "&:hover": { bgcolor: "rgba(255,107,107,0.1)" },
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>

                  <Divider sx={{ borderColor: "rgba(255,255,255,0.15)" }} />

                  <Stack direction="row" spacing={2}>
                    <Button
                      component="label"
                      startIcon={<UploadIcon />}
                      sx={{
                        borderRadius: 2,
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.3)",
                        "&:hover": { bgcolor: "rgba(239, 232, 232, 0.1)" },
                      }}
                    >
                      Upload
                      <input
                        hidden
                        type="file"
                        multiple
                        onChange={(e) => handleUpload(e, jd.id)}
                      />
                    </Button>

                    <Button
                      onClick={() => fetchHRResumes(jd.id)}
                      sx={{
                        color: "#90caf9",
                        "&:hover": { bgcolor: "rgba(144,202,249,0.1)" },
                      }}
                    >
                      View Resumes
                    </Button>
                  </Stack>

                  {hrResumes[jd.id] && (
                    <Stack spacing={1}>
                      {hrResumes[jd.id].map((r, i) => (
                        <Paper
                          key={i}
                          sx={{ p: 2, background: "#ffffff11", color: "#fff" }}
                        >
                          <Stack direction="row" justifyContent="space-between">
                            <Stack direction="row" spacing={2}>
                              <Checkbox
                                checked={(
                                  selectedResumes[jd.id] || []
                                ).includes(r.file_id)}
                                onChange={() =>
                                  handleCheckbox(jd.id, r.file_id)
                                }
                              />
                              <Typography>{r.filename}</Typography>
                            </Stack>

                            <Button onClick={() => handleViewResume(r.file_id)}>
                              View
                            </Button>
                          </Stack>
                        </Paper>
                      ))}

                      <Button
                        variant="contained"
                        onClick={() => handleEvaluateSelected(jd.id)}
                        sx={{
                          mt: 2,
                          alignSelf: "center",
                          borderRadius: "25px",
                          px: 4,
                          fontWeight: 600,
                          background:
                            "linear-gradient(135deg, #1e3c72, #2a5298)",
                        }}
                      >
                        Evaluate Selected
                      </Button>
                    </Stack>
                  )}

                  {results[jd.id] && (
                    <Stack spacing={2} mt={1}>
                      {results[jd.id].map((r, i) => (
                        <Paper
                          key={i}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            background: "rgba(255,255,255,0.08)",
                            backdropFilter: "blur(12px)",
                            borderLeft: `6px solid ${getScoreColor(r.final_score)}`,
                            color: "#fff",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Stack>
                            <Typography fontWeight={600}>
                              {i + 1}. {r.filename}
                            </Typography>
                            <Typography
                              sx={{ fontSize: "0.85rem", opacity: 0.8 }}
                            >
                              Uploaded by: {r.uploaded_by}
                            </Typography>
                          </Stack>

                          <Typography color={getScoreColor(r.final_score)}>
                            {r.final_score}%
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
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
