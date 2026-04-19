import { useEffect, useState } from "react";
import bgImage from "../assets/dashboard_bg.png";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  ExpandMore as ExpandMoreIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const SCORE_RANGES = [
  { key: "90plus", label: "90+", min: 90, max: 100 },
  { key: "75to89", label: "75 - 89", min: 75, max: 89.99 },
  { key: "60to74", label: "60 - 74", min: 60, max: 74.99 },
  { key: "below60", label: "Below 60", min: 0, max: 59.99 },
];

const INITIAL_FORM_DATA = {
  company_name: "",
  title: "",
  description: "",
  location: "",
  stipend_salary: "",
  employment_type: "",
  experience_level: "",
  required_skills: "",
};

const HEADER_HEIGHT = 88;
const SIDEBAR_OPEN_WIDTH = 280;
const SIDEBAR_CLOSED_WIDTH = 92;

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [jds, setJds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeView, setActiveView] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [results, setResults] = useState({});
  const [hrResumes, setHrResumes] = useState({});
  const [selectedResumes, setSelectedResumes] = useState({});
  const [selectedScoreRanges, setSelectedScoreRanges] = useState({});
  const [notificationStatus, setNotificationStatus] = useState({});
  const [storedSelectedCandidates, setStoredSelectedCandidates] = useState([]);

  const [resumeViewerOpen, setResumeViewerOpen] = useState(false);
  const [resumeViewerUrl, setResumeViewerUrl] = useState("");
  const [resumeViewerName, setResumeViewerName] = useState("");

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  useEffect(() => {
    fetchJDs();
    fetchSelectedCandidates();
  }, []);

  const fetchJDs = () => {
    fetch("http://localhost:5000/jds", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setJds(data));
  };

  const fetchSelectedCandidates = () => {
    fetch("http://localhost:5000/selected-candidates", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) =>
        setStoredSelectedCandidates(Array.isArray(data) ? data : []),
      )
      .catch(() => setStoredSelectedCandidates([]));
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

    return data;
  };

  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM_DATA);
    setShowForm((prev) => !prev);
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
        company_name: formData.company_name,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        stipend_salary: formData.stipend_salary,
        employment_type: formData.employment_type,
        experience_level: formData.experience_level,
        required_skills: formData.required_skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });

    setShowForm(false);
    setEditingId(null);
    setFormData(INITIAL_FORM_DATA);
    fetchJDs();
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/jds/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchJDs();
    fetchSelectedCandidates();
  };

  const handleEdit = (jd) => {
    setEditingId(jd.id);
    setFormData({
      company_name: jd.company_name || "",
      title: jd.title,
      description: jd.description,
      location: jd.location || "",
      stipend_salary: jd.stipend_salary || "",
      employment_type: jd.employment_type || "",
      experience_level: jd.experience_level || "",
      required_skills: (jd.required_skills || []).join(", "),
    });
    setShowForm(true);
  };

  const handleUpload = async (e, jdId) => {
    const uploadData = new FormData();

    for (let file of e.target.files) {
      uploadData.append("resumes", file);
    }

    const res = await fetch(`http://localhost:5000/analyze/${jdId}`, {
      method: "POST",
      body: uploadData,
      credentials: "include",
    });

    const data = await res.json();
    const sortedResults = (data.results || []).sort(
      (a, b) => b.final_score - a.final_score,
    );

    setResults((prev) => ({
      ...prev,
      [jdId]: sortedResults,
    }));

    if (!hrResumes[jdId]) {
      await fetchHRResumes(jdId);
    }
  };

  const handleViewResume = (fileId, filename = "Resume") => {
    setResumeViewerUrl(`http://localhost:5000/view-resume/${fileId}`);
    setResumeViewerName(filename);
    setResumeViewerOpen(true);
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
    const selected = selectedResumes[jdId] || [];
    if (!selected.length) return;

    const res = await fetch(`http://localhost:5000/evaluate-selected/${jdId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        resumes: selected,
      }),
    });

    const data = await res.json();

    setResults((prev) => ({
      ...prev,
      [jdId]: (data.results || []).sort(
        (a, b) => b.final_score - a.final_score,
      ),
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

  const getResumeIdFromResult = (
    jdId,
    result,
    resumesList = hrResumes[jdId] || [],
  ) => {
    if (result.file_id) return result.file_id;
    const matchedResume = resumesList.find(
      (resume) => resume.filename === result.filename,
    );
    return matchedResume?.file_id;
  };

  const handleSelectAll = async (jdId) => {
    let resumesList = hrResumes[jdId] || [];

    if (!resumesList.length) {
      resumesList = await fetchHRResumes(jdId);
    }

    const allIds = resumesList.map((r) => r.file_id);

    setSelectedResumes((prev) => {
      const current = prev[jdId] || [];
      if (current.length === allIds.length) {
        return { ...prev, [jdId]: [] };
      }
      return { ...prev, [jdId]: allIds };
    });
  };

  const isScoreInSelectedRanges = (score, activeRanges) => {
    if (!activeRanges.length) return true;

    return SCORE_RANGES.some(
      (range) =>
        activeRanges.includes(range.key) &&
        score >= range.min &&
        score <= range.max,
    );
  };

  const getFilteredResults = (jdId) => {
    const jdResults = results[jdId] || [];
    const activeRanges = selectedScoreRanges[jdId] || [];

    return jdResults.filter((candidate) =>
      isScoreInSelectedRanges(candidate.final_score, activeRanges),
    );
  };

  const handleScoreRangeToggle = async (jdId, rangeKey) => {
    let resumesList = hrResumes[jdId] || [];

    if (!resumesList.length) {
      resumesList = await fetchHRResumes(jdId);
    }

    const currentRanges = selectedScoreRanges[jdId] || [];
    const updatedRanges = currentRanges.includes(rangeKey)
      ? currentRanges.filter((item) => item !== rangeKey)
      : [...currentRanges, rangeKey];

    setSelectedScoreRanges((prev) => ({
      ...prev,
      [jdId]: updatedRanges,
    }));

    const matchedIds = (results[jdId] || [])
      .filter((candidate) =>
        isScoreInSelectedRanges(candidate.final_score, updatedRanges),
      )
      .map((candidate) => getResumeIdFromResult(jdId, candidate, resumesList))
      .filter(Boolean);

    setSelectedResumes((prev) => ({
      ...prev,
      [jdId]: [...new Set(matchedIds)],
    }));
  };

  const clearScoreRanges = (jdId) => {
    setSelectedScoreRanges((prev) => ({
      ...prev,
      [jdId]: [],
    }));

    setSelectedResumes((prev) => ({
      ...prev,
      [jdId]: [],
    }));
  };

  const getSelectedCandidatesForJD = (jdId) => {
    const selectedIds = selectedResumes[jdId] || [];
    const resumesList = hrResumes[jdId] || [];
    const jdResults = results[jdId] || [];

    return selectedIds
      .map((fileId) => {
        const resume = resumesList.find((item) => item.file_id === fileId);
        const result =
          jdResults.find((item) => item.file_id === fileId) ||
          jdResults.find(
            (item) => resume?.filename && item.filename === resume.filename,
          );

        return {
          file_id: fileId,
          filename: result?.filename || resume?.filename || "Resume",
          email:
            result?.email ||
            result?.candidate_email ||
            resume?.email ||
            resume?.candidate_email ||
            resume?.uploaded_by ||
            "",
          uploaded_by: result?.uploaded_by || resume?.uploaded_by || "",
          final_score: result?.final_score,
        };
      })
      .filter(
        (candidate, index, arr) =>
          arr.findIndex((item) => item.file_id === candidate.file_id) === index,
      );
  };

  const handleNotifySelected = async (jdId) => {
    const candidates = getSelectedCandidatesForJD(jdId);
    if (!candidates.length) {
      setNotificationStatus((prev) => ({
        ...prev,
        [jdId]: "No selected candidates found.",
      }));
      return;
    }

    setNotificationStatus((prev) => ({
      ...prev,
      [jdId]: "Storing selected candidates...",
    }));

    try {
      const res = await fetch(`http://localhost:5000/notify-selected/${jdId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          resumes: selectedResumes[jdId] || [],
          candidates,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to store selected candidates.");
      }

      setNotificationStatus((prev) => ({
        ...prev,
        [jdId]:
          data.message ||
          "Selected candidates stored and notified successfully.",
      }));

      fetchSelectedCandidates();
    } catch (error) {
      setNotificationStatus((prev) => ({
        ...prev,
        [jdId]: error.message || "Failed to store selected candidates.",
      }));
    }
  };

  const navItems = [
    { key: "all", label: "View All" },
    { key: "jobs", label: "View Jobs" },
    { key: "internships", label: "View Internships" },
    { key: "selected", label: "Selected Candidates" },
  ];

  const renderJobMeta = (jd) => (
    <Stack direction="row" flexWrap="wrap" gap={1}>
      {jd.location && (
        <Chip
          label={`Location: ${jd.location}`}
          sx={{ bgcolor: "#ffffff22", color: "#fff" }}
        />
      )}
      {jd.stipend_salary && (
        <Chip
          label={`Stipend/Salary: ${jd.stipend_salary}`}
          sx={{ bgcolor: "#ffffff22", color: "#fff" }}
        />
      )}
      {jd.employment_type && (
        <Chip
          label={`Type: ${jd.employment_type}`}
          sx={{ bgcolor: "#ffffff22", color: "#fff" }}
        />
      )}
      {jd.experience_level && (
        <Chip
          label={`Experience: ${jd.experience_level}`}
          sx={{ bgcolor: "#ffffff22", color: "#fff" }}
        />
      )}
    </Stack>
  );

  const renderJDAccordion = (jd) => {
    const filteredResults = getFilteredResults(jd.id);

    return (
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
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: "100%", pr: 2 }}
          >
            <Stack spacing={0.5}>
              <Typography fontWeight={600}>{jd.title}</Typography>
              {jd.company_name && (
                <Typography sx={{ fontSize: "0.8rem", opacity: 0.75 }}>
                  {jd.company_name}
                </Typography>
              )}
            </Stack>

            <Chip
              label={`${(selectedResumes[jd.id] || []).length} selected`}
              sx={{
                bgcolor: "rgba(144,202,249,0.15)",
                color: "#90caf9",
                fontWeight: 600,
              }}
            />
          </Stack>
        </AccordionSummary>

        <AccordionDetails>
          <Stack spacing={2}>
            <Typography>{jd.description}</Typography>

            {renderJobMeta(jd)}

            <Stack direction="row" flexWrap="wrap" gap={1}>
              {(jd.required_skills || []).map((s, i) => (
                <Chip
                  key={i}
                  label={s}
                  sx={{ bgcolor: "#ffffff22", color: "#fff" }}
                />
              ))}
            </Stack>

            <Stack direction="row" spacing={2} flexWrap="wrap">
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

            <Stack direction="row" spacing={2} flexWrap="wrap">
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
                <Button
                  onClick={() => handleSelectAll(jd.id)}
                  sx={{
                    alignSelf: "flex-end",
                    color: "#90caf9",
                    fontSize: "0.8rem",
                    textTransform: "none",
                    "&:hover": { bgcolor: "rgba(144,202,249,0.1)" },
                  }}
                >
                  {(selectedResumes[jd.id] || []).length ===
                  (hrResumes[jd.id] || []).length
                    ? "Deselect All"
                    : "Select All"}
                </Button>

                {hrResumes[jd.id].map((r, i) => (
                  <Paper
                    key={i}
                    sx={{ p: 2, background: "#ffffff11", color: "#fff" }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Checkbox
                          checked={(selectedResumes[jd.id] || []).includes(
                            r.file_id,
                          )}
                          onChange={() => handleCheckbox(jd.id, r.file_id)}
                          sx={{
                            color: "#90caf9",
                            "&.Mui-checked": { color: "#90caf9" },
                          }}
                        />
                        <Stack spacing={0.3}>
                          <Typography>{r.filename}</Typography>
                          {(r.email || r.candidate_email) && (
                            <Typography
                              sx={{ fontSize: "0.8rem", opacity: 0.7 }}
                            >
                              {r.email || r.candidate_email}
                            </Typography>
                          )}
                        </Stack>
                      </Stack>

                      <Button
                        onClick={() => handleViewResume(r.file_id, r.filename)}
                      >
                        View
                      </Button>
                    </Stack>
                  </Paper>
                ))}

                <Button
                  variant="contained"
                  onClick={() => handleEvaluateSelected(jd.id)}
                  disabled={!(selectedResumes[jd.id] || []).length}
                  sx={{
                    mt: 2,
                    alignSelf: "center",
                    borderRadius: "25px",
                    px: 4,
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                  }}
                >
                  Evaluate Selected
                </Button>
              </Stack>
            )}

            {results[jd.id] && (
              <Stack spacing={2} mt={1}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#fff",
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography sx={{ fontWeight: 600, color: "#90caf9" }}>
                      Select Score Range
                    </Typography>

                    <Stack direction="row" gap={1} flexWrap="wrap">
                      {SCORE_RANGES.map((range) => {
                        const isActive = (
                          selectedScoreRanges[jd.id] || []
                        ).includes(range.key);

                        return (
                          <Button
                            key={range.key}
                            size="small"
                            variant={isActive ? "contained" : "outlined"}
                            onClick={() =>
                              handleScoreRangeToggle(jd.id, range.key)
                            }
                            sx={{
                              borderRadius: "20px",
                              color: isActive ? "#fff" : "#90caf9",
                              borderColor: "rgba(144,202,249,0.45)",
                              background: isActive
                                ? "linear-gradient(135deg, #1e3c72, #2a5298)"
                                : "transparent",
                            }}
                          >
                            {range.label}
                          </Button>
                        );
                      })}

                      <Button
                        size="small"
                        onClick={() => clearScoreRanges(jd.id)}
                        sx={{
                          borderRadius: "20px",
                          color: "#ffb74d",
                          textTransform: "none",
                        }}
                      >
                        Clear
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>

                {filteredResults.map((r, i) => (
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
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Stack spacing={0.4}>
                      <Typography fontWeight={600}>
                        {i + 1}. {r.filename}
                      </Typography>
                      <Typography sx={{ fontSize: "0.85rem", opacity: 0.8 }}>
                        Uploaded by: {r.uploaded_by}
                      </Typography>
                      {(r.email || r.candidate_email) && (
                        <Typography sx={{ fontSize: "0.85rem", opacity: 0.75 }}>
                          {r.email || r.candidate_email}
                        </Typography>
                      )}
                    </Stack>

                    <Typography color={getScoreColor(r.final_score)}>
                      {r.final_score}%
                    </Typography>
                  </Paper>
                ))}

                {!filteredResults.length && (
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background: "rgba(255,255,255,0.06)",
                      color: "#fff",
                      textAlign: "center",
                    }}
                  >
                    <Typography>
                      No resumes found for selected score ranges.
                    </Typography>
                  </Paper>
                )}
              </Stack>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderSelectedCandidates = () => {
    if (!storedSelectedCandidates.length) {
      return (
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontWeight: 600, mb: 1 }}>
            No selected candidates yet
          </Typography>
          <Typography sx={{ opacity: 0.75 }}>
            Selected candidates stored in MongoDB will appear here.
          </Typography>
        </Paper>
      );
    }

    const grouped = storedSelectedCandidates.reduce((acc, candidate) => {
      const jdId = candidate.jd_id;
      if (!acc[jdId]) acc[jdId] = [];
      acc[jdId].push(candidate);
      return acc;
    }, {});

    return Object.entries(grouped).map(([jdId, candidates]) => {
      const jdTitle = candidates[0]?.jd_title || "Job";
      const companyName = candidates[0]?.company_name || "";

      return (
        <Accordion
          key={jdId}
          defaultExpanded
          sx={{
            mb: 3,
            borderRadius: 4,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(14px)",
            color: "#fff",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ width: "100%", pr: 2 }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
                  {jdTitle}
                </Typography>
                {companyName && (
                  <Typography sx={{ fontSize: "0.85rem", opacity: 0.75 }}>
                    {companyName}
                  </Typography>
                )}
              </Box>

              <Chip
                label={`${candidates.length} candidates`}
                sx={{
                  bgcolor: "rgba(144,202,249,0.15)",
                  color: "#90caf9",
                  fontWeight: 600,
                }}
              />
            </Stack>
          </AccordionSummary>

          <AccordionDetails>
            <Stack spacing={2}>
              {candidates.map((candidate, index) => (
                <Paper
                  key={candidate.file_id || index}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.06)",
                    color: "#fff",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    gap={1.5}
                  >
                    <Stack spacing={0.5}>
                      <Typography sx={{ fontWeight: 600 }}>
                        {candidate.filename}
                      </Typography>
                      {candidate.student_email && (
                        <Typography sx={{ fontSize: "0.85rem", opacity: 0.8 }}>
                          {candidate.student_email}
                        </Typography>
                      )}
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      {typeof candidate.final_score === "number" && (
                        <Chip
                          label={`${candidate.final_score}%`}
                          sx={{
                            bgcolor: `${getScoreColor(candidate.final_score)}22`,
                            color: getScoreColor(candidate.final_score),
                            fontWeight: 700,
                          }}
                        />
                      )}
                      {candidate.file_id && (
                        <Button
                          onClick={() =>
                            handleViewResume(
                              candidate.file_id,
                              candidate.filename,
                            )
                          }
                        >
                          View Resume
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      );
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        pb: "80px",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(10,25,50,0.85), rgba(10,25,50,0.75))",
        },
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
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
                cursor: "pointer", // 👈 add this
              }}
              onClick={() => navigate("/main")} // 👈 navigate to HomePage
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

          <Button
            startIcon={<LogoutIcon />}
            onClick={() => {
              onLogout(); // your existing logout logic
              navigate("/"); // 🔥 go to homepage
            }}
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

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "stretch",
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Paper
          sx={{
            width: {
              xs: "100%",
              md: isSidebarOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH,
            },
            minHeight: {
              xs: "auto",
              md: `calc(100vh - ${HEADER_HEIGHT}px)`,
            },
            position: { xs: "relative", md: "sticky" },
            top: { md: HEADER_HEIGHT },
            left: 0,
            borderRadius: 0,
            backdropFilter: "blur(18px)",
            background: "rgba(7,18,38,0.9)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            transition: "width 0.3s ease",
            overflow: "hidden",
          }}
        >
          <Stack
            spacing={1.5}
            sx={{
              p: 2,
              height: "100%",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              {isSidebarOpen && (
                <Typography
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  Dashboard Menu
                </Typography>
              )}

              <Button
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                sx={{
                  minWidth: 0,
                  color: "#fff",
                  borderRadius: "12px",
                  p: 1,
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                {isSidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
              </Button>
            </Stack>

            <Button
              startIcon={isSidebarOpen ? <AddIcon /> : null}
              onClick={handleOpenAddForm}
              variant="contained"
              sx={{
                justifyContent: isSidebarOpen ? "flex-start" : "center",
                minWidth: 0,
                borderRadius: "16px",
                px: isSidebarOpen ? 2 : 1,
                py: 1.2,
                background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                "&:hover": {
                  background: "linear-gradient(135deg, #2a5298, #1e3c72)",
                },
              }}
            >
              {isSidebarOpen
                ? showForm
                  ? "Close Job Form"
                  : "Add Job Description"
                : "+"}
            </Button>

            {navItems.map((item) => (
              <Button
                key={item.key}
                onClick={() => setActiveView(item.key)}
                variant={activeView === item.key ? "contained" : "text"}
                sx={{
                  justifyContent: isSidebarOpen ? "flex-start" : "center",
                  borderRadius: "16px",
                  px: isSidebarOpen ? 2 : 1,
                  py: 1.2,
                  minWidth: 0,
                  color: "#fff",
                  background:
                    activeView === item.key
                      ? "linear-gradient(135deg, #1e3c72, #2a5298)"
                      : "transparent",
                  border:
                    activeView === item.key
                      ? "none"
                      : "1px solid rgba(255,255,255,0.14)",
                  "&:hover": {
                    background:
                      activeView === item.key
                        ? "linear-gradient(135deg, #2a5298, #1e3c72)"
                        : "rgba(255,255,255,0.08)",
                  },
                }}
              >
                {isSidebarOpen ? item.label : item.label.charAt(0)}
              </Button>
            ))}
          </Stack>
        </Paper>

        <Box
          sx={{
            flex: 1,
            px: { xs: 2, md: 4 },
            py: 4,
          }}
        >
          <Box sx={{ maxWidth: 1200 }}>
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
                  <TextField
                    label="Company Name"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
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

                  <TextField
                    label="Location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
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

                  <TextField
                    label="Stipend / Salary"
                    value={formData.stipend_salary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stipend_salary: e.target.value,
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

                  <TextField
                    label="Employment Type"
                    value={formData.employment_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employment_type: e.target.value,
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

                  <TextField
                    label="Experience Level"
                    value={formData.experience_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experience_level: e.target.value,
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

            {activeView === "all" && (
              <>
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
                {internships.map(renderJDAccordion)}

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
                {jobs.map(renderJDAccordion)}
              </>
            )}

            {activeView === "jobs" && (
              <>
                <Typography
                  sx={{
                    color: "#90caf9",
                    fontWeight: 700,
                    mb: 2,
                    mt: 2,
                    fontSize: "1.1rem",
                  }}
                >
                  Jobs
                </Typography>
                {jobs.map(renderJDAccordion)}
              </>
            )}

            {activeView === "internships" && (
              <>
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
                {internships.map(renderJDAccordion)}
              </>
            )}

            {activeView === "selected" && (
              <>
                <Typography
                  sx={{
                    color: "#90caf9",
                    fontWeight: 700,
                    mb: 2,
                    mt: 2,
                    fontSize: "1.1rem",
                  }}
                >
                  Selected Candidates
                </Typography>
                {renderSelectedCandidates()}
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Dialog
        open={resumeViewerOpen}
        onClose={() => setResumeViewerOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {resumeViewerName}
          <IconButton onClick={() => setResumeViewerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, height: "80vh" }}>
          <iframe
            src={resumeViewerUrl}
            title="Resume Viewer"
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        </DialogContent>
      </Dialog>
      <Box
        component="footer"
        sx={{
          position: "fixed",
          bottom: 0, // 🔥 REQUIRED
          left: 0, // 🔥 REQUIRED
          width: "97%", // 🔥 REQUIRED
          zIndex: 1000, // 🔥 increase so it's above everything

          px: { xs: 2, md: 4 },
          py: 2.5,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(7,18,38,0.85)", // slightly darker for visibility
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
            © SkillMatch AI. Student career workspace for resume analysis,
            applications, and opportunity tracking.
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.55)" }}>
            Built to help students grow professionally
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export default Dashboard;
