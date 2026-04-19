import { useEffect, useState } from "react";
import bgImage from "../assets/dashboard_bg.png";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  TextField,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Notifications as NotificationsIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";

const HEADER_HEIGHT = 88;
const SIDEBAR_OPEN_WIDTH = 280;
const SIDEBAR_CLOSED_WIDTH = 92;

function StudentDashboard({ username = "", onLogout }) {
  const navigate = useNavigate();
  const [jds, setJds] = useState([]);
  const [results, setResults] = useState({});
  const [showCourses, setShowCourses] = useState({});
  const [loading, setLoading] = useState({});
  const [activeView, setActiveView] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [manualJD, setManualJD] = useState("");
  const [manualResume, setManualResume] = useState(null);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualResult, setManualResult] = useState(null);

  useEffect(() => {
    fetchJDs();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const fetchJDs = () => {
    fetch("http://localhost:5000/jds", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setJds(data));
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/student-notifications", {
        credentials: "include",
      });
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
    } catch (err) {
      console.error(err);
      setNotifications([]);
    }
    setNotificationsLoading(false);
  };

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

  const handleManualResumeCheck = async () => {
    if (!manualJD.trim() || !manualResume) return;

    const formData = new FormData();
    formData.append("description", manualJD);
    formData.append("resume", manualResume);

    setManualLoading(true);

    try {
      const res = await fetch("http://localhost:5000/manual-student-match", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      setManualResult(data.result || data);
    } catch (err) {
      console.error(err);
    }

    setManualLoading(false);
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

  const navItems = [
    { key: "all", label: "View All" },
    { key: "jobs", label: "View Jobs" },
    { key: "internships", label: "View Internships" },
    { key: "notifications", label: "Notifications" },
    { key: "manual", label: "Match Resume" },
  ];

  const renderJobMeta = (jd) => (
    <Stack direction="row" flexWrap="wrap" gap={1}>
      {jd.location && (
        <Chip
          label={`Location: ${jd.location}`}
          sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff" }}
        />
      )}
      {jd.stipend_salary && (
        <Chip
          label={`Stipend/Salary: ${jd.stipend_salary}`}
          sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff" }}
        />
      )}
      {jd.employment_type && (
        <Chip
          label={`Type: ${jd.employment_type}`}
          sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff" }}
        />
      )}
      {jd.experience_level && (
        <Chip
          label={`Experience: ${jd.experience_level}`}
          sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff" }}
        />
      )}
    </Stack>
  );

  const renderEvaluationBlock = (result, keyPrefix = "") => {
    if (!result) return null;

    return (
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
              <b style={{ color: getScoreColor(result.final_score) }}>
                {result.final_score}%
              </b>
            </Typography>

            <Typography>
              Semantic Score:{" "}
              <b style={{ color: "#90caf9" }}>{result.semantic_score}%</b>
            </Typography>

            <Typography>
              Skill Score:{" "}
              <b style={{ color: "#ffb74d" }}>{result.skill_score}%</b>
            </Typography>
          </Stack>
        </Paper>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mt={3}>
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
              {(result.matched_skills || []).map((skill, i) => (
                <Chip
                  key={`${keyPrefix}matched-${i}`}
                  label={skill}
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
              {(result.missing_skills || []).map((skill, i) => (
                <Chip
                  key={`${keyPrefix}missing-${i}`}
                  label={skill}
                  sx={{
                    bgcolor: "rgba(228, 105, 105, 0.84)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                />
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Box>
    );
  };

  const renderCourseBlock = (result, keyId) => (
    <>
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
            [keyId]: !prev[keyId],
          }))
        }
      >
        {showCourses[keyId] ? "Hide Courses" : "View Recommended Courses"}
      </Button>

      {showCourses[keyId] && (
        <Box
          sx={{
            mt: 2,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 2,
            background: "transparent",
          }}
        >
          {Object.values(result.course_recommendations || {}).map(
            (courses, i) => {
              const course = courses[0];
              if (!course) return null;

              return (
                <Paper
                  key={`${keyId}-course-${i}`}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(10px)",
                    transition: "0.3s ease",
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
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
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
            },
          )}
        </Box>
      )}
    </>
  );

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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ width: "100%", pr: 2 }}
        >
          <Box>
            <Typography fontWeight={600}>{jd.title}</Typography>
            {jd.company_name && (
              <Typography sx={{ fontSize: "0.82rem", opacity: 0.75 }}>
                {jd.company_name}
              </Typography>
            )}
          </Box>
        </Stack>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={3}>
          <Typography sx={{ opacity: 0.8 }}>{jd.description}</Typography>

          {renderJobMeta(jd)}

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {(jd.required_skills || []).map((skill, i) => (
              <Chip
                key={i}
                label={skill}
                sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff" }}
              />
            ))}
          </Stack>

          {loading[jd.id] ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={22} />
              <Typography>Analyzing Resume...</Typography>
            </Stack>
          ) : (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
                Apply
                <input
                  hidden
                  type="file"
                  onChange={(e) => handleSendToHR(e, jd.id)}
                />
              </Button>
            </Stack>
          )}

          {results[jd.id]?.[0] && (
            <>
              {renderEvaluationBlock(results[jd.id][0], `jd-${jd.id}-`)}
              {renderCourseBlock(results[jd.id][0], `jd-${jd.id}`)}
            </>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );

  const renderNotifications = () => (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#fff",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
            Notifications
          </Typography>
          <Button
            size="small"
            onClick={fetchNotifications}
            sx={{ color: "#90caf9" }}
          >
            Refresh
          </Button>
        </Stack>

        {notificationsLoading ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={22} />
            <Typography>Loading notifications...</Typography>
          </Stack>
        ) : notifications.length ? (
          notifications.map((item, index) => (
            <Paper
              key={item.id || index}
              sx={{
                p: 2,
                borderRadius: 3,
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
              }}
            >
              <Stack spacing={0.6}>
                <Typography sx={{ fontWeight: 600 }}>
                  {item.title || "Selection Update"}
                </Typography>
                <Typography sx={{ opacity: 0.85 }}>
                  {item.message || "HR has shortlisted you for the next step."}
                </Typography>
                {(item.jd_title || item.company_name) && (
                  <Typography sx={{ fontSize: "0.82rem", color: "#90caf9" }}>
                    {[item.jd_title, item.company_name]
                      .filter(Boolean)
                      .join(" • ")}
                  </Typography>
                )}
              </Stack>
            </Paper>
          ))
        ) : (
          <Typography sx={{ opacity: 0.8 }}>No notifications yet.</Typography>
        )}
      </Stack>
    </Paper>
  );

  const renderManualMatch = () => (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
        }}
      >
        <Stack spacing={2}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
            Match Resume Manually
          </Typography>

          <TextField
            label="Paste Job Description"
            multiline
            rows={6}
            value={manualJD}
            onChange={(e) => setManualJD(e.target.value)}
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
            component="label"
            variant="outlined"
            startIcon={<DescriptionIcon />}
            sx={{
              alignSelf: "flex-start",
              color: "#fff",
              borderColor: "#fff",
              borderRadius: 2,
            }}
          >
            {manualResume ? manualResume.name : "Upload Resume"}
            <input
              hidden
              type="file"
              onChange={(e) => setManualResume(e.target.files?.[0] || null)}
            />
          </Button>

          <Button
            variant="contained"
            onClick={handleManualResumeCheck}
            disabled={!manualJD.trim() || !manualResume || manualLoading}
            sx={{
              alignSelf: "flex-start",
              borderRadius: 2,
              bgcolor: "#1e3c72",
              "&:hover": { bgcolor: "#2a5298" },
            }}
          >
            {manualLoading ? "Checking..." : "Check Match"}
          </Button>
        </Stack>
      </Paper>

      {manualLoading && (
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography sx={{ color: "#fff" }}>
            Analyzing manual match...
          </Typography>
        </Stack>
      )}

      {manualResult && (
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
          }}
        >
          {renderEvaluationBlock(manualResult, "manual-")}
          {renderCourseBlock(manualResult, "manual")}
        </Paper>
      )}
    </Stack>
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
                  Student Menu
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

            {navItems.map((item) => {
              const isNotifications = item.key === "notifications";
              const count =
                activeView === "notifications" ? 0 : notifications.length;

              return (
                <Button
                  key={item.key}
                  onClick={() => setActiveView(item.key)}
                  variant={activeView === item.key ? "contained" : "text"}
                  sx={{
                    justifyContent: isSidebarOpen ? "space-between" : "center",
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
                  {isSidebarOpen ? (
                    <>
                      <span>{item.label}</span>
                      {isNotifications && count > 0 && (
                        <Chip
                          size="small"
                          label={count}
                          sx={{
                            height: 22,
                            bgcolor: "rgba(255,255,255,0.18)",
                            color: "#fff",
                          }}
                        />
                      )}
                    </>
                  ) : isNotifications ? (
                    <NotificationsIcon fontSize="small" />
                  ) : (
                    item.label.charAt(0)
                  )}
                </Button>
              );
            })}
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
            {activeView === "all" && (
              <Stack spacing={3}>
                <Typography sx={{ color: "#90caf9", fontWeight: 700 }}>
                  Internships
                </Typography>
                {internships.map(renderJD)}

                <Typography sx={{ color: "#90caf9", fontWeight: 700, mt: 3 }}>
                  Jobs
                </Typography>
                {jobs.map(renderJD)}
              </Stack>
            )}

            {activeView === "jobs" && (
              <Stack spacing={3}>
                <Typography sx={{ color: "#90caf9", fontWeight: 700 }}>
                  Jobs
                </Typography>
                {jobs.map(renderJD)}
              </Stack>
            )}

            {activeView === "internships" && (
              <Stack spacing={3}>
                <Typography sx={{ color: "#90caf9", fontWeight: 700 }}>
                  Internships
                </Typography>
                {internships.map(renderJD)}
              </Stack>
            )}

            {activeView === "notifications" && renderNotifications()}

            {activeView === "manual" && renderManualMatch()}
          </Box>
        </Box>
      </Box>
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

export default StudentDashboard;
