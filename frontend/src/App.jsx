
import { useCallback, useEffect, useState } from "react";
import API from "./services/api";
import "./App.css";

function App() {
  // Authentication states
  const [token, setToken] = useState(
    localStorage.getItem("skillbridge_token")
  );

 const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const [isRegistering, setIsRegistering] = useState(false);

const [registerForm, setRegisterForm] = useState({
  name: "",
  email: "",
  password: "",
  university: "",
  course: "",
  year: 1
});
  // Navigation states
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");

  // Main application data
  const [profile, setProfile] = useState(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    university: "",
    course: "",
    year: 1,
    bio: ""
  });

  const [profileMessage, setProfileMessage] = useState("");

  const [dashboard, setDashboard] = useState(null);
  // Admin dashboard statistics
const [adminStats, setAdminStats] = useState(null);
const [adminStatsLoading, setAdminStatsLoading] = useState(false);
const [adminStudents, setAdminStudents] = useState([]);
const [adminSkills, setAdminSkills] = useState([]);
const [adminQuests, setAdminQuests] = useState([]);
const [adminRequests, setAdminRequests] = useState([]);
const [creditStudents, setCreditStudents] = useState([]);
const [adminDataLoading, setAdminDataLoading] = useState(false);
const [adminNotice, setAdminNotice] = useState("");
const [adminSearch, setAdminSearch] = useState("");
  const [skills, setSkills] = useState([]);
const [skillSearch, setSkillSearch] = useState("");
const [skillTypeFilter, setSkillTypeFilter] = useState("All");

const [adminSkillForm, setAdminSkillForm] = useState({
  title: "",
  description: "",
  category: "",
  level: "Beginner",
  type: "Teaching",
  creditsRequired: 5
});

const [adminSkillSaving, setAdminSkillSaving] = useState(false);

const filteredSkills = skills.filter((skill) => {
  const search = skillSearch.toLowerCase();

  const matchesSearch =
    skill.title?.toLowerCase().includes(search) ||
    skill.description?.toLowerCase().includes(search) ||
    skill.category?.toLowerCase().includes(search) ||
    skill.owner?.name?.toLowerCase().includes(search);

  const matchesType =
    skillTypeFilter === "All" ||
    skill.type === skillTypeFilter;

  return matchesSearch && matchesType;
});

    // Skill Quests states
  const [quests, setQuests] = useState([]);
  const [questsLoading, setQuestsLoading] = useState(false);
  const [questNotice, setQuestNotice] = useState("");
  const [questForm, setQuestForm] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "Beginner",
    rewardCredits: 10
  });
  // Student directory states
const [students, setStudents] = useState([]);
const [studentsLoading, setStudentsLoading] = useState(false);
const [studentSearch, setStudentSearch] = useState("");
  
  const [dataLoading, setDataLoading] = useState(false);

  // Session states
  const [myRequests, setMyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [requestActionLoading, setRequestActionLoading] = useState(false);

  // Skill request states
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestNotice, setRequestNotice] = useState("");

  // Logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem("skillbridge_token");

    setToken(null);
    setProfile(null);
    setDashboard(null);
    setSkills([]);
    setMyRequests([]);
    setIncomingRequests([]);
    setSelectedSkill(null);
    setRequestNotice("");
    setProfileMessage("");
    setIsEditingProfile(false);
    setActivePage("Dashboard");
    setError("");
  }, []);


  // Student Sidebar Menu
  const studentMenu = [
    { name: "Dashboard", icon: "D" },
    { name: "Explore Skills", icon: "S" },
    { name: "Explore Students", icon: "U" },
    { name: "Skill Quests", icon: "Q" },
    { name: "My Skills", icon: "M" },
    { name: "My Sessions", icon: "T" },
    { name: "Messages", icon: "C" },
    { name: "My Profile", icon: "P" }
  ];

  // Admin Sidebar Menu
 const adminMenu = [
  { name: "Admin Dashboard", icon: "A" },
  { name: "Manage Students", icon: "S" },
  { name: "Manage Skills", icon: "K" },
  { name: "Manage Quests", icon: "Q" },
  { name: "Request Monitoring", icon: "R" },
  { name: "Credit Monitoring", icon: "C" }
];

  // Automatically select menu based on account role
  const menu =
    profile?.role === "admin" ? adminMenu : studentMenu;

  // Login
  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email,
        password
      });

      const receivedToken = response.data.token;

      if (!receivedToken) {
        throw new Error("No authentication token received.");
      }

      localStorage.setItem("skillbridge_token", receivedToken);

      setToken(receivedToken);
      setPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // Open profile editor
  const handleEditProfile = () => {
  setProfileForm({
    name: profile?.name || "",
    university: profile?.university || "",
    course: profile?.course || "",
    year: profile?.year || 1,
    bio: profile?.bio || ""
  });

  setProfileMessage("");
  setIsEditingProfile(true);
};
  // Student Registration
const handleRegister = async (event) => {
  event.preventDefault();

  setError("");
  setLoading(true);

  try {
    const response = await API.post("/auth/register", registerForm);

    const receivedToken = response.data.token;

    if (!receivedToken) {
      throw new Error("Registration successful, but no token received.");
    }

    localStorage.setItem("skillbridge_token", receivedToken);

    setToken(receivedToken);
    setEmail("");
    setPassword("");

    setRegisterForm({
      name: "",
      email: "",
      password: "",
      university: "",
      course: "",
      year: 1
    });

    setIsRegistering(false);
  } catch (err) {
    setError(
      err.response?.data?.message ||
      err.message ||
      "Registration failed."
    );
  } finally {
    setLoading(false);
  }
};
  // Save edited profile
  const handleSaveProfile = async (event) => {
    event.preventDefault();

    setProfileMessage("");

    try {
      const response = await API.put("/users/profile", profileForm);

      setProfile(response.data.user);
      setIsEditingProfile(false);
      setProfileMessage(
        response.data.message || "Profile updated successfully!"
      );
    } catch (err) {
      setProfileMessage(
        err.response?.data?.message ||
        "Unable to update profile."
      );
    }
  };

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    setDataLoading(true);
    setError("");

    try {
      const [
        profileResponse,
        dashboardResponse,
        skillsResponse
      ] = await Promise.all([
        API.get("/users/profile"),
        API.get("/dashboard/stats"),
        API.get("/skills")
      ]);

      setProfile(
        profileResponse.data.user ||
        profileResponse.data.profile ||
        profileResponse.data
      );

      setDashboard(dashboardResponse.data.dashboard);
      setSkills(skillsResponse.data.skills || []);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
        setError("Your session expired. Please log in again.");
      } else {
        setError(
          err.response?.data?.message ||
          "Unable to load dashboard data."
        );
      }
    } finally {
      setDataLoading(false);
    }
   }, [handleLogout]);

  // Load Admin dashboard statistics
  const loadAdminStats = useCallback(async () => {
    setAdminStatsLoading(true);

    try {
      const response = await API.get("/admin/stats");
      setAdminStats(response.data.stats);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load Admin statistics."
      );
    } finally {
      setAdminStatsLoading(false);
    }
  }, []);

  // Load students for Admin Panel
  const loadAdminStudents = useCallback(async () => {
    try {
      const response = await API.get("/admin/students");
      setAdminStudents(response.data.students || []);
    } catch (err) {
      setAdminNotice(err.response?.data?.message || "Unable to load students.");
    }
  }, []);

  // Load skills for Admin Panel
  const loadAdminSkills = useCallback(async () => {
    try {
      const response = await API.get("/admin/skills");
      setAdminSkills(response.data.skills || []);
    } catch (err) {
      setAdminNotice(err.response?.data?.message || "Unable to load skills.");
    }
  }, []);

  // Load quests for Admin Panel
  const loadAdminQuests = useCallback(async () => {
    try {
      const response = await API.get("/admin/quests");
      setAdminQuests(response.data.quests || []);
    } catch (err) {
      setAdminNotice(err.response?.data?.message || "Unable to load quests.");
    }
  }, []);

  // Load requests for Admin Panel
  const loadAdminRequests = useCallback(async () => {
    try {
      const response = await API.get("/admin/requests");
      setAdminRequests(response.data.requests || []);
    } catch (err) {
      setAdminNotice(err.response?.data?.message || "Unable to load requests.");
    }
  }, []);

  // Load Skill Credit monitoring data
  const loadCreditMonitoring = useCallback(async () => {
    try {
      const response = await API.get("/admin/credits");
      setCreditStudents(response.data.students || []);
    } catch (err) {
      setAdminNotice(err.response?.data?.message || "Unable to load credit data.");
    }
  }, []);


  // Block or unblock a student
  const handleToggleStudentBlock = async (student) => {
    try {
      const response = await API.patch(
        `/admin/students/${student._id}/block`,
        { isBlocked: !student.isBlocked }
      );

      setAdminNotice(response.data.message);

      await Promise.all([
        loadAdminStudents(),
        loadAdminStats()
      ]);
    } catch (err) {
      setAdminNotice(
        err.response?.data?.message || "Unable to update student."
      );
    }
  };

  
  // Add a new skill from Admin Panel
  const handleCreateAdminSkill = async (e) => {
    e.preventDefault();

    setAdminSkillSaving(true);
    setAdminNotice("");

    try {
      const response = await API.post("/skills", {
        ...adminSkillForm,
        creditsRequired: Number(adminSkillForm.creditsRequired)
      });

      setAdminNotice(
        response.data.message || "New skill added successfully!"
      );

      setAdminSkillForm({
        title: "",
        description: "",
        category: "",
        level: "Beginner",
        type: "Teaching",
        creditsRequired: 5
      });

      await Promise.all([
        loadAdminSkills(),
        loadDashboard(),
        loadAdminStats()
      ]);
    } catch (err) {
      setAdminNotice(
        err.response?.data?.message || "Unable to add skill."
      );
    } finally {
      setAdminSkillSaving(false);
    }
  };

  // Delete a skill listing
  const handleDeleteAdminSkill = async (skillId) => {
    if (!window.confirm("Are you sure you want to delete this skill listing?")) {
      return;
    }

    try {
      const response = await API.delete(`/admin/skills/${skillId}`);

      setAdminNotice(response.data.message);

      await Promise.all([
        loadAdminSkills(),
        loadAdminStats()
      ]);
    } catch (err) {
      setAdminNotice(
        err.response?.data?.message || "Unable to delete skill."
      );
    }
  };


  // Activate or deactivate a quest
  const handleToggleQuestStatus = async (quest) => {
    try {
      const response = await API.patch(
        `/admin/quests/${quest._id}/status`,
        { isActive: !quest.isActive }
      );

      setAdminNotice(response.data.message);

      await Promise.all([
        loadAdminQuests(),
        loadAdminStats()
      ]);
    } catch (err) {
      setAdminNotice(
        err.response?.data?.message || "Unable to update quest."
      );
    }
  };


  // Load registered students
  const loadStudents = useCallback(async () => {
    setStudentsLoading(true);

    try {
      const response = await API.get("/users/students");

      setStudents(response.data.students || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load students."
      );
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  // Load incoming and outgoing requests
    // Load available Skill Quests
  const loadQuests = useCallback(async () => {
    setQuestsLoading(true);

    try {
      const response = await API.get("/quests");

      setQuests(response.data.quests || []);
    } catch (err) {
      setQuestNotice(
        err.response?.data?.message ||
        "Unable to load Skill Quests."
      );
    } finally {
      setQuestsLoading(false);
    }
  }, []);
  // Load incoming and outgoing requests
const loadMySessions = useCallback(async () => {
  try {
    const [myRequestsResponse, incomingResponse] = await Promise.all([
      API.get("/requests/my-requests"),
      API.get("/requests/incoming")
    ]);

    setMyRequests(
      myRequestsResponse.data.requests || []
    );

    setIncomingRequests(
      incomingResponse.data.requests || []
    );
  } catch (err) {
    setError(
      err.response?.data?.message ||
      "Unable to load session requests."
    );
  }
}, []);

  // Automatically load requests when My Sessions opens
  useEffect(() => {
    if (!token || activePage !== "My Sessions") return;

    void loadMySessions();
  }, [token, activePage, loadMySessions]);


  // Load dashboard after login
  useEffect(() => {
    if (!token) return;

    const timeoutId = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [token, loadDashboard]);

  // Automatically open Admin Dashboard for admin accounts
  useEffect(() => {
    if (!token || profile?.role !== "admin") return;

    setActivePage("Admin Dashboard");
    loadAdminStats();
  }, [token, profile?.role, loadAdminStats]);



  // Load students whenever the user opens Explore Students
useEffect(() => {
  if (!token || activePage !== "Explore Students") return;

  loadStudents();
}, [token, activePage, loadStudents]);
  // Load quests whenever the user opens Skill Quests
  useEffect(() => {
    if (!token || activePage !== "Skill Quests") return;

    loadQuests();
  }, [token, activePage, loadQuests]);
  
  // Load Admin data whenever an Admin page opens
 
  // Load Admin data whenever an Admin page opens
  useEffect(() => {
    if (!token || profile?.role !== "admin") return;

    const timeoutId = window.setTimeout(() => {
      if (activePage === "Manage Students") {
        void loadAdminStudents();
      } else if (activePage === "Manage Skills") {
        void loadAdminSkills();
      } else if (activePage === "Manage Quests") {
        void loadAdminQuests();
      } else if (activePage === "Request Monitoring") {
        void loadAdminRequests();
      } else if (activePage === "Credit Monitoring") {
        void loadCreditMonitoring();
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [
    token,
    profile?.role,
    activePage,
    loadAdminStudents,
    loadAdminSkills,
    loadAdminQuests,
    loadAdminRequests,
    loadCreditMonitoring
  ]);


  // Send a skill request
  const handleRequestSkill = async (event) => {
    event.preventDefault();

    if (!selectedSkill) return;

    setRequestLoading(true);
    setRequestNotice("");

    try {
      const response = await API.post("/requests", {
        skillId: selectedSkill._id,
        message: requestMessage
      });

      setRequestNotice(
        response.data.message ||
        "Skill request sent successfully!"
      );

      setSelectedSkill(null);
      setRequestMessage("");

      await Promise.all([
        loadDashboard(),
        loadMySessions()
      ]);
    } catch (err) {
      setRequestNotice(
        err.response?.data?.message ||
        "Unable to send skill request."
      );
    } finally {
      setRequestLoading(false);
    }
  };

  // Accept or reject an incoming request
  const handleUpdateRequest = async (requestId, status) => {
    setRequestActionLoading(true);
    setError("");

    try {
      await API.patch(`/requests/${requestId}/status`, {
        status
      });

      await Promise.all([
        loadMySessions(),
        loadDashboard()
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update request."
      );
    } finally {
      setRequestActionLoading(false);
    }
  };

  // Cancel an outgoing request
  const handleCancelRequest = async (requestId) => {
    setRequestActionLoading(true);
    setError("");

    try {
      await API.patch(`/requests/${requestId}/cancel`);

      await Promise.all([
        loadMySessions(),
        loadDashboard()
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to cancel request."
      );
    } finally {
      setRequestActionLoading(false);
    }
  };

  // Complete an accepted session
  const handleCompleteSession = async (requestId) => {
    const confirmed = window.confirm(
      "Are you sure this teaching session is completed? Credits will be transferred."
    );

    if (!confirmed) return;

    setRequestActionLoading(true);
    setError("");

    try {
      const response = await API.patch(
        `/requests/${requestId}/complete`
      );

      setRequestNotice(
        response.data.message ||
        "Session completed successfully!"
      );

      await Promise.all([
        loadMySessions(),
        loadDashboard()
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to complete session."
      );
    } finally {
      setRequestActionLoading(false);
    }
  };

  // Search skills
  // Filter students
const filteredStudents = students.filter((student) => {
  const query = studentSearch.toLowerCase();

  return (
    student.name?.toLowerCase().includes(query) ||
    student.university?.toLowerCase().includes(query) ||
    student.course?.toLowerCase().includes(query) ||
    student.skillsToTeach?.some((skill) =>
      String(skill).toLowerCase().includes(query)
    ) ||
    student.skillsToLearn?.some((skill) =>
      String(skill).toLowerCase().includes(query)
    )
  );
});

  // Login screen

  // Create a new Skill Quest
  const handleCreateQuest = async (event) => {
    event.preventDefault();
    setQuestNotice("");

    try {
      const response = await API.post("/quests", {
        ...questForm,
        rewardCredits: Number(questForm.rewardCredits)
      });

      setQuestNotice(response.data.message);
      setQuestForm({
        title: "",
        description: "",
        category: "",
        difficulty: "Beginner",
        rewardCredits: 10
      });

      await loadQuests();
    } catch (err) {
      setQuestNotice(
        err.response?.data?.message || "Unable to create quest."
      );
    }
  };

  // Join a Skill Quest
  const handleJoinQuest = async (questId) => {
    setQuestNotice("");

    try {
      const response = await API.post(`/quests/${questId}/join`);
      setQuestNotice(response.data.message);
      await loadQuests();
    } catch (err) {
      setQuestNotice(
        err.response?.data?.message || "Unable to join quest."
      );
    }
  };

  // Submit completed quest work
  const handleSubmitQuest = async (questId) => {
    const submission = window.prompt(
      "Enter your project description or project link:"
    );

    if (!submission?.trim()) return;

    setQuestNotice("");

    try {
      const response = await API.post(`/quests/${questId}/submit`, {
        submission
      });

      setQuestNotice(response.data.message);
      await loadQuests();
    } catch (err) {
      setQuestNotice(
        err.response?.data?.message || "Unable to submit work."
      );
    }
  };

  // Review a student's quest submission
  const handleReviewQuest = async (questId, studentId, status) => {
    setQuestNotice("");

    try {
      const response = await API.put(
        `/quests/${questId}/review/${studentId}`,
        { status }
      );

      setQuestNotice(response.data.message);

      await Promise.all([
        loadQuests(),
        loadDashboard()
      ]);
    } catch (err) {
      setQuestNotice(
        err.response?.data?.message || "Unable to review submission."
      );
    }
  };

  
  // Login and Registration screen
  
  // Login and Registration screen
  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-shell">

          {/* LEFT BRANDING PANEL */}
          <section className="auth-visual">
            <div className="auth-visual-top">
              <div className="auth-logo">
                <span className="auth-logo-icon">S</span>
                <span>SkillBridge</span>
              </div>
              <span className="auth-campus-tag">CAMPUS COMMUNITY</span>
            </div>

            <div className="auth-hero">
              <span className="auth-small-label">
                YOUR SKILLS. YOUR FUTURE.
              </span>

              <h1>
                Learn together.
                <br />
                <span>Grow together.</span>
              </h1>

              <p>
                A campus where every student has something to teach
                and something new to learn.
              </p>

              <div className="auth-feature-list">
                <div className="auth-feature">
                  <span>✦</span>
                  <div>
                    <strong>Share what you know</strong>
                    <small>Teach skills and earn Skill Credits.</small>
                  </div>
                </div>

                <div className="auth-feature">
                  <span>↗</span>
                  <div>
                    <strong>Discover your potential</strong>
                    <small>Find students who can help you grow.</small>
                  </div>
                </div>

                <div className="auth-feature">
                  <span>🏆</span>
                  <div>
                    <strong>Learn by doing</strong>
                    <small>Complete Skill Quests and earn rewards.</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="auth-visual-bottom">
              <span>BUILT FOR STUDENTS</span>
              <span>LEARN · TEACH · EXCHANGE</span>
            </div>

            <div className="auth-decoration auth-decoration-one"></div>
            <div className="auth-decoration auth-decoration-two"></div>
          </section>

          {/* RIGHT LOGIN / REGISTRATION PANEL */}
          <section className="auth-form-panel">
            <form
              className="auth-card"
              onSubmit={isRegistering ? handleRegister : handleLogin}
            >
              <div className="auth-mobile-brand">
                <div className="brand-icon">S</div>
                <span>SkillBridge</span>
              </div>

              <div className="auth-form-heading">
                <span className="auth-form-tag">
                  {isRegistering ? "GET STARTED" : "WELCOME BACK"}
                </span>

                <h2>
                  {isRegistering
                    ? "Create your account"
                    : "Sign in to SkillBridge"}
                </h2>

                <p>
                  {isRegistering
                    ? "Join your campus community and start sharing skills."
                    : "Your next learning opportunity starts here."}
                </p>
              </div>

              {error && (
                <div className="error-message">{error}</div>
              )}

              {isRegistering && (
                <>
                  <label htmlFor="registerName">Full Name</label>
                  <input
                    id="registerName"
                    type="text"
                    value={registerForm.name}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        name: e.target.value
                      })
                    }
                    placeholder="Enter your full name"
                    required
                  />

                  <label htmlFor="registerUniversity">University</label>
                  <input
                    id="registerUniversity"
                    type="text"
                    value={registerForm.university}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        university: e.target.value
                      })
                    }
                    placeholder="Enter your university"
                  />

                  <label htmlFor="registerCourse">Course</label>
                  <input
                    id="registerCourse"
                    type="text"
                    value={registerForm.course}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        course: e.target.value
                      })
                    }
                    placeholder="e.g. B.Tech CSE"
                  />

                  <label htmlFor="registerYear">Academic Year</label>
                  <select
                    id="registerYear"
                    value={registerForm.year}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        year: Number(e.target.value)
                      })
                    }
                  >
                    {[1, 2, 3, 4, 5, 6].map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <label htmlFor={isRegistering ? "registerEmail" : "email"}>
                Email address
              </label>

              <input
                id={isRegistering ? "registerEmail" : "email"}
                type="email"
                value={isRegistering ? registerForm.email : email}
                onChange={(e) => {
                  if (isRegistering) {
                    setRegisterForm({
                      ...registerForm,
                      email: e.target.value
                    });
                  } else {
                    setEmail(e.target.value);
                  }
                }}
                placeholder="you@example.com"
                required
              />

              <label htmlFor={isRegistering ? "registerPassword" : "password"}>
                Password
              </label>

              <input
                id={isRegistering ? "registerPassword" : "password"}
                type={showPassword ? "text" : "password"}
                value={isRegistering ? registerForm.password : password}
                onChange={(e) => {
                  if (isRegistering) {
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value
                    });
                  } else {
                    setPassword(e.target.value);
                  }
                }}
                placeholder="Enter your password"
                minLength={isRegistering ? 6 : undefined}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide password" : "Show password"}
              </button>

              <button
                type="submit"
                className="primary-button full-button"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isRegistering
                    ? "Create Student Account →"
                    : "Sign In →"}
              </button>

              <div className="auth-switch">
                {isRegistering
                  ? "Already have an account?"
                  : "New to SkillBridge?"}

                <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError("");
                    setShowPassword(false);
                  }}
                >
                  {isRegistering ? "Login here" : "Create an account"}
                </button>
              </div>

              <p className="auth-form-bottom">
                By continuing, you're joining a community built on
                sharing knowledge.
              </p>
            </form>
          </section>
        </div>
      </div>
    );
  }


  const studentName = profile?.name || "Student";

  const initials = studentName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Reusable session card
  const renderSessionCard = (request, type) => {
    const isIncoming = type === "incoming";

    const otherStudent = isIncoming
      ? request.requester?.name
      : request.skillOwner?.name;

    const status = request.status;

    return (
      <div className="session-row session-card" key={request._id}>
        <div className="date-box">✦</div>

        <div className="session-detail">
          <strong>
            {request.skill?.title || "Skill session"}
          </strong>

          <small>
            {isIncoming ? "Requested by: " : "Teacher: "}
            {otherStudent || "Student"}
          </small>

          <small>
            {request.credits} credits · {status}
          </small>

          {request.message && (
            <small>Message: {request.message}</small>
          )}
        </div>

        <div className="session-actions">
          <span className={`session-status ${status}`}>
            {status}
          </span>

          {isIncoming && status === "pending" && (
            <>
              <button
                className="primary-button"
                disabled={requestActionLoading}
                onClick={() =>
                  handleUpdateRequest(request._id, "accepted")
                }
              >
                Accept
              </button>

              <button
                className="outline-button"
                disabled={requestActionLoading}
                onClick={() =>
                  handleUpdateRequest(request._id, "rejected")
                }
              >
                Reject
              </button>
            </>
          )}

          {!isIncoming && status === "pending" && (
            <button
              className="outline-button"
              disabled={requestActionLoading}
              onClick={() => handleCancelRequest(request._id)}
            >
              Cancel
            </button>
          )}

          {isIncoming && status === "accepted" && (
            <button
              className="primary-button"
              disabled={requestActionLoading}
              onClick={() => handleCompleteSession(request._id)}
            >
              Complete Session
            </button>
          )}

          {!isIncoming && status === "accepted" && (
            <small>
              Waiting for teacher to complete the session.
            </small>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <span>SkillBridge</span>
        </div>

        <div className="profile-mini">
          <div className="avatar">{initials}</div>

          <div>
            <strong>{studentName}</strong>
            <small>{profile?.course || "Campus Student"}</small>
          </div>
        </div>

        <p className="menu-label">WORKSPACE</p>

        <nav>
          {menu.map((item) => (
            <button
              key={item.name}
              className={`menu-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="help-card"
            onClick={() =>
              setActivePage(
                profile?.role === "admin" ? "Admin Dashboard" : "Dashboard"
              )
            }
          >
            <span>✦</span>
            <strong>Learn together.</strong>
            <p>
              Share your knowledge and grow with your campus community.
            </p>
          </button>

          <button
            className="menu-item logout-button"
            onClick={handleLogout}
          >
            <span>↪</span> Logout
          </button>

          <small>SkillBridge © 2026</small>
        </div>
      </aside>


      {/* Main content */}
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace / <strong>{activePage}</strong>
          </div>

          <div className="top-actions">
            <span className="credit-pill">
              ✦ {dashboard?.credits ?? 0} Credits
            </span>

            <div className="avatar top-avatar">{initials}</div>
          </div>
        </header>

        <section className="page-content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">
                YOUR CAMPUS LEARNING SPACE
              </p>

              <h1>
                {activePage === "Dashboard"
                  ? `Welcome back, ${studentName}! 👋`
                  : activePage}
              </h1>

              <p className="subtitle">
                Learn something new. Teach what you know. Grow together.
              </p>
            </div>

            {profile?.role !== "admin" && (
  <button
    className="primary-button"
    onClick={() => setActivePage("Explore Skills")}
  >
    + Explore skills
  </button>
)}
</div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {requestNotice && (
            <div className="request-notice">
              <span>{requestNotice}</span>

              <button
                onClick={() => setRequestNotice("")}
                type="button"
              >
                ×
              </button>
            </div>
          )}

          {dataLoading ? (
            <div className="panel">
              Loading your SkillBridge dashboard...
            </div>
          ) : (
            <>
              {/* Dashboard */}

              {/* Admin Dashboard */}
              {activePage === "Admin Dashboard" && profile?.role === "admin" && (
                <div className="admin-dashboard">
                  <div className="quest-hero">
                    <p className="eyebrow">ADMIN CONTROL CENTER</p>
                    <h1>Welcome, Admin!</h1>
                    <p>Manage your SkillBridge campus community.</p>
                  </div>

                  {adminStatsLoading ? (
                    <div className="panel">Loading Admin statistics...</div>
                  ) : adminStats ? (
                  
<div className="stats-grid">
  <div
    className="stat-card"
    onClick={() => setActivePage("Manage Students")}
    style={{ cursor: "pointer" }}
  >
    <p>Total Students</p>
    <h2>{adminStats.totalStudents}</h2>
    <small>Click to manage students</small>
  </div>

  <div className="stat-card">
    <p>Total Admins</p>
    <h2>{adminStats.totalAdmins}</h2>
    <small>Administrator accounts</small>
  </div>

  <div
    className="stat-card"
    onClick={() => setActivePage("Manage Skills")}
    style={{ cursor: "pointer" }}
  >
    <p>Total Skills</p>
    <h2>{adminStats.totalSkills}</h2>
    <small>Click to manage skills</small>
  </div>

  <div
    className="stat-card"
    onClick={() => setActivePage("Manage Quests")}
    style={{ cursor: "pointer" }}
  >
    <p>Total Quests</p>
    <h2>{adminStats.totalQuests}</h2>
    <small>Click to manage quests</small>
  </div>

  <div
    className="stat-card"
    onClick={() => setActivePage("Request Monitoring")}
    style={{ cursor: "pointer" }}
  >
    <p>Total Requests</p>
    <h2>{adminStats.totalSessions}</h2>
    <small>Click to monitor requests</small>
  </div>

  <div
    className="stat-card"
    onClick={() => setActivePage("Credit Monitoring")}
    style={{ cursor: "pointer" }}
  >
    <p>Total Skill Credits</p>
    <h2>{adminStats.totalCredits}</h2>
    <small>Click to monitor credits</small>
  </div>
 </div>
                  ) : (
                    <div className="panel">
                      Admin statistics are unavailable.
                    </div>
                  )}
                </div>
              )}

              

              {/* ADMIN MANAGEMENT: STUDENTS */}
              {activePage === "Manage Students" && profile?.role === "admin" && (
                <div className="panel admin-management">
                  <h2>Manage Students</h2>
                  <p>View and manage registered student accounts.</p>

                  {adminNotice && <div className="request-notice">{adminNotice}</div>}

<form onSubmit={handleCreateAdminSkill} className="admin-skill-form">
  <h3>Add a New Skill to Student Portal</h3>

  <div className="quest-form-grid">
    <label>
      Skill Title
      <input
        type="text"
        value={adminSkillForm.title}
        onChange={(e) =>
          setAdminSkillForm({ ...adminSkillForm, title: e.target.value })
        }
        placeholder="e.g. Python Programming"
        required
      />
    </label>

    <label>
      Category
      <input
        type="text"
        value={adminSkillForm.category}
        onChange={(e) =>
          setAdminSkillForm({ ...adminSkillForm, category: e.target.value })
        }
        placeholder="e.g. Programming"
        required
      />
    </label>

    <label>
      Skill Level
      <select
        value={adminSkillForm.level}
        onChange={(e) =>
          setAdminSkillForm({ ...adminSkillForm, level: e.target.value })
        }
      >
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>
    </label>

    <label>
      Skill Type
      <select
        value={adminSkillForm.type}
        onChange={(e) =>
          setAdminSkillForm({ ...adminSkillForm, type: e.target.value })
        }
      >
        <option value="Teaching">Teaching</option>
        <option value="Learning">Learning</option>
      </select>
    </label>

    <label>
      Credits Required
      <input
        type="number"
        min="1"
        value={adminSkillForm.creditsRequired}
        onChange={(e) =>
          setAdminSkillForm({
            ...adminSkillForm,
            creditsRequired: e.target.value
          })
        }
        required
      />
    </label>
  </div>

  <label>
    Skill Description
    <textarea
      value={adminSkillForm.description}
      onChange={(e) =>
        setAdminSkillForm({
          ...adminSkillForm,
          description: e.target.value
        })
      }
      placeholder="Describe what students will learn..."
      required
    />
  </label>

  <button type="submit" className="primary-button" disabled={adminSkillSaving}>
    {adminSkillSaving ? "Adding Skill..." : "Add Skill to Student Portal"}
  </button>
</form>


                  {adminStudents.length === 0 ? (
                    <p>No students found.</p>
                  ) : (
                    adminStudents.map((student) => (
                      <div className="student-card" key={student._id}>
                        <div>
                          <h3>{student.name}</h3>
                          <p>{student.email}</p>
                          <p>Credits: {student.credits ?? 0}</p>
                          <p>Status: {student.isBlocked ? "Blocked" : "Active"}</p>
                        </div>
                        <button
                          className="primary-button"
                          onClick={() => handleToggleStudentBlock(student)}
                        >
                          {student.isBlocked ? "Unblock Student" : "Block Student"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ADMIN MANAGEMENT: SKILLS */}
              {activePage === "Manage Skills" && profile?.role === "admin" && (
                <div className="panel admin-management">
                  <h2>Manage Skills</h2>
                  <p>Review student teaching and learning listings.</p>

                  {adminNotice && <div className="request-notice">{adminNotice}</div>}

                  {adminSkills.length === 0 ? (
                    <p>No skill listings found.</p>
                  ) : (
                    adminSkills.map((skill) => (
                      <div className="student-card" key={skill._id}>
                        <div>
                          <h3>{skill.title}</h3>
                          <p>Category: {skill.category}</p>
                          <p>Type: {skill.type}</p>
                          <p>Owner: {skill.owner?.name || "Unknown"}</p>
                        </div>
                        <button
                          className="danger-button"
                          onClick={() => handleDeleteAdminSkill(skill._id)}
                        >
                          Delete Listing
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ADMIN MANAGEMENT: QUESTS */}
              {activePage === "Manage Quests" && profile?.role === "admin" && (
                <div className="panel admin-management">
                  <h2>Manage Quests</h2>
                  <p>Control campus challenges and competitions.</p>

                  {adminNotice && <div className="request-notice">{adminNotice}</div>}

                  {adminQuests.length === 0 ? (
                    <p>No quests found.</p>
                  ) : (
                    adminQuests.map((quest) => (
                      <div className="student-card" key={quest._id}>
                        <div>
                          <h3>{quest.title}</h3>
                          <p>Category: {quest.category}</p>
                          <p>Difficulty: {quest.difficulty}</p>
                          <p>Reward: {quest.rewardCredits} credits</p>
                          <p>Created by: {quest.createdBy?.name || "Unknown"}</p>
                          <p>Status: {quest.isActive ? "Active" : "Inactive"}</p>
                        </div>
                        <button
                          className="primary-button"
                          onClick={() => handleToggleQuestStatus(quest)}
                        >
                          {quest.isActive ? "Deactivate Quest" : "Activate Quest"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ADMIN MANAGEMENT: REQUESTS */}
              {activePage === "Request Monitoring" && profile?.role === "admin" && (
                <div className="panel admin-management">
                  <h2>Request Monitoring</h2>
                  <p>Monitor all student skill exchange requests.</p>

                  {adminNotice && <div className="request-notice">{adminNotice}</div>}

                  {adminRequests.length === 0 ? (
                    <p>No requests found.</p>
                  ) : (
                    adminRequests.map((request) => (
                      <div className="student-card" key={request._id}>
                        <div>
                          <h3>{request.skill?.title || "Skill unavailable"}</h3>
                          <p>Student: {request.requester?.name || "Unknown"}</p>
                          <p>Skill Owner: {request.skillOwner?.name || "Unknown"}</p>
                          <p>Status: {request.status}</p>
                          <p>Credits: {request.credits ?? 0}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ADMIN MANAGEMENT: CREDIT MONITORING */}
              {activePage === "Credit Monitoring" && profile?.role === "admin" && (
                <div className="panel admin-management">
                  <h2>Credit Monitoring</h2>
                  <p>Monitor Skill Credits across the student community.</p>

                  {adminNotice && <div className="request-notice">{adminNotice}</div>}

                  <div className="stat-card">
                    <p>Total Student Credits</p>
                    <h2>
                      {creditStudents.reduce(
                        (total, student) => total + (student.credits || 0),
                        0
                      )}
                    </h2>
                  </div>

                  {creditStudents.length === 0 ? (
                    <p>No credit records found.</p>
                  ) : (
                    creditStudents.map((student) => (
                      <div className="student-card" key={student._id}>
                        <div>
                          <h3>{student.name}</h3>
                          <p>{student.email}</p>
                          <p>Balance: {student.credits ?? 0} credits</p>
                          <p>Account: {student.isBlocked ? "Blocked" : "Active"}</p>
                        </div>
                      </div>
                    ))
                  )}
                                </div>
              )}

              {activePage === "Dashboard" && (
                <>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon purple-bg">✦</div>
                      <p>Available credits</p>

                      <h2>
                        {dashboard?.credits ?? 0} <span>CR</span>
                      </h2>

                      <small>Your current skill credit balance</small>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon green-bg">✓</div>
                      <p>Sessions completed</p>

                      <h2>
                        {dashboard?.completedSessions ?? 0}
                      </h2>

                      <small>Successfully completed sessions</small>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon orange-bg">✦</div>
                      <p>Skills you're teaching</p>

                      <h2>
                        {dashboard?.teachingSkills ?? 0}
                      </h2>

                      <small>Skills shared with other students</small>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon blue-bg">◉</div>
                      <p>Skills you're learning</p>

                      <h2>
                        {dashboard?.learningSkills ?? 0}
                      </h2>

                      <small>Skills listed for learning</small>
                    </div>
                  </div>

                  <div className="bottom-grid">
                    <div className="panel">
                      <div className="section-heading compact">
                        <div>
                          <h2>Recent requests</h2>
                          <p>Your latest skill exchange activity</p>
                        </div>
                      </div>

                      {(dashboard?.recentRequests || []).length === 0 ? (
                        <p className="empty-message">
                          No requests yet.
                        </p>
                      ) : (
                        dashboard.recentRequests.map((request) => (
                          <div
                            className="session-row"
                            key={request._id}
                          >
                            <div className="date-box">✦</div>

                            <div className="session-detail">
                              <strong>
                                {request.skill?.title || "Skill request"}
                              </strong>

                              <small>
                                {request.requester?.name || "Student"} ·{" "}
                                {request.credits} credits
                              </small>
                            </div>

                            <span className="session-status">
                              {request.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="panel credit-panel">
                      <div className="section-heading compact">
                        <div>
                          <h2>Skill credits</h2>
                          <p>Your knowledge has value</p>
                        </div>

                        <span className="credit-symbol">✦</span>
                      </div>

                      <h2 className="credit-number">
                        {dashboard?.credits ?? 0}
                        <small> credits</small>
                      </h2>

                      <p className="credit-description">
                        Teach other students to earn credits. Spend them
                        to learn new skills.
                      </p>

                      <button
                        className="primary-button full-button"
                        onClick={() => setActivePage("My Skills")}
                      >
                        Manage my skills →
                      </button>
                    </div>
                  </div>
                </>
              )}

              

              {/* Explore Students */}

{/* EXPLORE SKILLS */}
{activePage === "Explore Skills" && profile?.role !== "admin" && (
  <div className="panel">
    <div className="section-heading">
      <div>
        <h2>Explore Skills</h2>
        <p>Discover skills shared by students and learn something new.</p>
      </div>
    </div>

    <div className="search-box">
      <span>⌕</span>
      <input
        type="text"
        value={skillSearch}
        onChange={(event) => setSkillSearch(event.target.value)}
        placeholder="Search skills, categories or teachers..."
      />
    </div>

    <div className="filter-row">
      <button
        className={skillTypeFilter === "All" ? "primary-button" : "secondary-button"}
        onClick={() => setSkillTypeFilter("All")}
      >
        All Skills
      </button>
      <button
        className={skillTypeFilter === "Teaching" ? "primary-button" : "secondary-button"}
        onClick={() => setSkillTypeFilter("Teaching")}
      >
        Teaching
      </button>
      <button
        className={skillTypeFilter === "Learning" ? "primary-button" : "secondary-button"}
        onClick={() => setSkillTypeFilter("Learning")}
      >
        Learning
      </button>
    </div>

    {filteredSkills.length === 0 ? (
      <p className="empty-message">
        No skills found. Try another search or check back later.
      </p>
    ) : (
      <div className="skills-grid">
        {filteredSkills.map((skill) => (
          <div className="skill-card" key={skill._id}>
            <div className="skill-info">
              <div className="teacher-row">
                <div className="avatar">
                  {skill.owner?.name?.slice(0, 2).toUpperCase() || "SB"}
                </div>
                <div>
                  <h3>{skill.title}</h3>
                  <p>{skill.owner?.name || "SkillBridge Admin"}</p>
                </div>
              </div>

              <p>{skill.description}</p>

              <div className="student-skills">
                <span>{skill.category}</span>
                <span>{skill.level}</span>
                <span>{skill.type}</span>
              </div>

              <strong>{skill.creditsRequired || 5} Credits</strong>

              <button
                className="primary-button"
                onClick={() => setSelectedSkill(skill)}
              >
                Request to Learn
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

              {activePage === "Explore Students" && (
                <div className="panel">
                  <div className="section-heading">
                    <div>
                      <h2>Explore Students</h2>
                      <p>
                        Discover students, their skills and potential
                        learning partners.
                      </p>
                    </div>
                  </div>

                  <div className="search-box">
                    <span>⌕</span>
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(event) =>
                        setStudentSearch(event.target.value)
                      }
                      placeholder="Search by name, university, course or skill..."
                    />
                  </div>

                  {studentsLoading ? (
                    <p className="empty-message">
                      Loading students...
                    </p>
                  ) : filteredStudents.length === 0 ? (
                    <p className="empty-message">
                      No students found. Try another search.
                    </p>
                  ) : (
                    <div className="skills-grid">
                      {filteredStudents.map((student) => (
                        <div className="skill-card" key={student._id}>
                          <div className="skill-info">
                            <div className="teacher-row">
                              <div className="avatar">
                                {student.name
                                  ?.slice(0, 2)
                                  .toUpperCase() || "ST"}
                              </div>
                              <h3>{student.name}</h3>
                            </div>

                            <p>
                              {student.university || "University not added"}
                            </p>

                            <p>
                              {student.course || "Course not added"}
                              {student.year
                                ? ` · Year ${student.year}`
                                : ""}
                            </p>

                            <p>
                              {student.bio || "No introduction added yet."}
                            </p>

                            <div className="student-skills">
                              <strong>Skills to Teach</strong>
                              <p>
                                {Array.isArray(student.skillsToTeach) &&
                                student.skillsToTeach.length > 0
                                  ? student.skillsToTeach.join(", ")
                                  : "Not added"}
                              </p>

                              <strong>Skills to Learn</strong>
                              <p>
                                {Array.isArray(student.skillsToLearn) &&
                                student.skillsToLearn.length > 0
                                  ? student.skillsToLearn.join(", ")
                                  : "Not added"}
                              </p>
                            </div>

                            <div className="student-credit">
                              <strong>
                                {student.credits ?? 0} Skill Credits
                              </strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              
             {activePage === "Skill Quests" && (
  <div className="quest-page">

    {/* Premium Hero */}
    <div className="quest-hero">
      <h2>Skill Quests</h2>
      <p>
        Take on exciting challenges, demonstrate your abilities,
        collaborate with campus learners and earn Skill Credits.
      </p>
    </div>

    {questNotice && (
      <div className="request-notice">
        {questNotice}
      </div>
    )}

    {/* Create Quest */}
    <div className="quest-create-panel">
      <div className="quest-create-heading">
        <h3>Create a New Quest</h3>
        <p>
          Share a real-world challenge and invite students to participate.
        </p>
      </div>

      <form onSubmit={handleCreateQuest}>
        <div className="quest-form-grid">

          <div className="quest-form-field">
            <label>Quest Title</label>
            <input
              type="text"
              value={questForm.title}
              onChange={(e) =>
                setQuestForm({
                  ...questForm,
                  title: e.target.value
                })
              }
              placeholder="Example: Build a Portfolio Website"
              maxLength={100}
              required
            />
          </div>

          <div className="quest-form-field">
            <label>Category</label>
            <input
              type="text"
              value={questForm.category}
              onChange={(e) =>
                setQuestForm({
                  ...questForm,
                  category: e.target.value
                })
              }
              placeholder="Web Development, AI, Design..."
              required
            />
          </div>

          <div className="quest-form-field full-width">
            <label>Description</label>
            <textarea
              value={questForm.description}
              onChange={(e) =>
                setQuestForm({
                  ...questForm,
                  description: e.target.value
                })
              }
              placeholder="Describe what participants need to build..."
              maxLength={1000}
              required
            />
          </div>

          <div className="quest-form-field">
            <label>Difficulty Level</label>
            <select
              value={questForm.difficulty}
              onChange={(e) =>
                setQuestForm({
                  ...questForm,
                  difficulty: e.target.value
                })
              }
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="quest-form-field">
            <label>Reward Credits</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={questForm.rewardCredits}
              onChange={(e) =>
                setQuestForm({
                  ...questForm,
                  rewardCredits: e.target.value
                })
              }
              required
            />
          </div>

        </div>

        <button
          type="submit"
          className="primary-button quest-create-button"
        >
          Create Quest
        </button>
      </form>
    </div>

    {/* Explore Quests */}
    <div className="quest-list-heading">
      <h2>Explore Challenges</h2>
      <p>
        Discover challenges, submit your work and earn rewards.
      </p>
    </div>

    {questsLoading ? (
      <div className="quest-empty">
        Loading exciting challenges...
      </div>
    ) : quests.length === 0 ? (
      <div className="quest-empty">
        No quests available yet. Be the first to create one!
      </div>
    ) : (
      <div className="quest-grid">

        {quests.map((quest) => {
          const isCreator =
            quest.createdBy?._id === profile?._id;

          const participant =
            quest.participants?.find(
              (item) =>
                item.student?._id === profile?._id
            );

          return (
            <div className="quest-card" key={quest._id}>

              <div className="quest-card-top">
                <span className="quest-category">
                  {quest.category}
                </span>

                <span className="quest-difficulty">
                  {quest.difficulty}
                </span>
              </div>

              <h3>{quest.title}</h3>

              <p className="quest-description">
                {quest.description}
              </p>

              <div className="quest-reward">
                Reward: {quest.rewardCredits} Skill Credits
              </div>

              <div className="quest-creator">
                Created by: {quest.createdBy?.name || "Student"}
              </div>

              {isCreator && (
                <div className="quest-status">
                  Your Quest
                </div>
              )}

              {!isCreator && !participant && (
                <div className="quest-actions">
                  <button
                    className="primary-button"
                    onClick={() =>
                      handleJoinQuest(quest._id)
                    }
                  >
                    Join Quest
                  </button>
                </div>
              )}

              {participant?.status === "joined" && (
                <div className="quest-actions">
                  <button
                    className="primary-button"
                    onClick={() =>
                      handleSubmitQuest(quest._id)
                    }
                  >
                    Submit My Work
                  </button>
                </div>
              )}

              {participant?.status === "rejected" && (
                <div className="quest-actions">
                  <button
                    className="primary-button"
                    onClick={() =>
                      handleSubmitQuest(quest._id)
                    }
                  >
                    Resubmit Work
                  </button>
                </div>
              )}

              {participant?.status === "submitted" && (
                <div className="quest-status">
                  Waiting for review
                </div>
              )}

              {participant?.status === "approved" && (
                <div className="quest-status">
                  Quest completed! Credits awarded.
                </div>
              )}

              {/* Creator Reviews Submissions */}
              {isCreator &&
                quest.participants
                  ?.filter(
                    (item) =>
                      item.status === "submitted"
                  )
                  .map((item) => (
                    <div
                      className="quest-submission"
                      key={item._id}
                    >
                      <strong>
                        Submission from{" "}
                        {item.student?.name || "Student"}
                      </strong>

                      <p>{item.submission}</p>

                      <div className="quest-actions">
                        <button
                          className="primary-button"
                          onClick={() =>
                            handleReviewQuest(
                              quest._id,
                              item.student?._id,
                              "approved"
                            )
                          }
                        >
                          Approve & Award Credits
                        </button>

                        <button
                          className="secondary-button"
                          onClick={() =>
                            handleReviewQuest(
                              quest._id,
                              item.student?._id,
                              "rejected"
                            )
                          }
                        >
                          Reject Submission
                        </button>
                      </div>
                    </div>
                  ))}

            </div>
          );
        })}

      </div>
    )}

  </div>
)}


              {/* My Sessions */}
              {activePage === "My Sessions" && (
                <>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <p>Outgoing requests</p>
                      <h2>{myRequests.length}</h2>
                    </div>

                    <div className="stat-card">
                      <p>Incoming requests</p>
                      <h2>{incomingRequests.length}</h2>
                    </div>

                    <div className="stat-card">
                      <p>Pending requests</p>
                      <h2>
                        {
                          [...myRequests, ...incomingRequests]
                            .filter((r) => r.status === "pending").length
                        }
                      </h2>
                    </div>

                    <div className="stat-card">
                      <p>Completed sessions</p>
                      <h2>
                        {dashboard?.completedSessions ?? 0}
                      </h2>
                    </div>
                  </div>

                  <div className="panel">
                    <div className="section-heading">
                      <div>
                        <h2>Incoming requests</h2>
                        <p>
                          Requests from students who want to learn from you.
                        </p>
                      </div>

                      <button
                        className="outline-button"
                        onClick={loadMySessions}
                        disabled={requestActionLoading}
                      >
                        Refresh
                      </button>
                    </div>

                    {incomingRequests.length === 0 ? (
                      <p className="empty-message">
                        You have no incoming requests.
                      </p>
                    ) : (
                      incomingRequests.map((request) =>
                        renderSessionCard(request, "incoming")
                      )
                    )}
                  </div>

                  <div className="panel">
                    <div className="section-heading">
                      <div>
                        <h2>My learning requests</h2>
                        <p>
                          Track the skills you have requested to learn.
                        </p>
                      </div>
                    </div>

                    {myRequests.length === 0 ? (
                      <p className="empty-message">
                        You have not requested any skills yet.
                      </p>
                    ) : (
                      myRequests.map((request) =>
                        renderSessionCard(request, "outgoing")
                      )
                    )}
                  </div>
                </>
              )}

              {/* Messages */}
              {activePage === "Messages" && (
                <div className="panel">
                  <h2>Messages</h2>

                  <p>
                    Real-time student chat will be added in the messaging
                    module.
                  </p>
                </div>
              )}

              {/* My Profile */}
              {activePage === "My Profile" && (
                <div className="panel profile-panel">
                  <div className="section-heading">
                    <div>
                      <h2>My Profile</h2>
                      <p>
                        Manage your personal and academic information.
                      </p>
                    </div>

                    {!isEditingProfile && (
                      <button
                        className="primary-button"
                        onClick={handleEditProfile}
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {profileMessage && (
                    <div className="request-notice">
                      {profileMessage}
                    </div>
                  )}

                  {!isEditingProfile ? (
                    <div className="profile-details">
                      <p>
                        <strong>Name:</strong> {profile?.name}
                      </p>

                      <p>
                        <strong>Email:</strong> {profile?.email}
                      </p>

                      <p>
                        <strong>University:</strong>{" "}
                        {profile?.university || "Not added"}
                      </p>

                      <p>
                        <strong>Course:</strong>{" "}
                        {profile?.course || "Not added"}
                      </p>

                      <p>
                        <strong>Year:</strong> {profile?.year}
                      </p>

                      <p>
                        <strong>Bio:</strong>{" "}
                        {profile?.bio || "No bio added yet."}
                      </p>

                      <p>
                        <strong>Credits:</strong>{" "}
                        {dashboard?.credits ?? 0}
                      </p>
                    </div>
                  ) : (
                    <form
                      className="profile-form"
                      onSubmit={handleSaveProfile}
                    >
                      <label htmlFor="profileName">Full Name</label>

                      <input
                        id="profileName"
                        type="text"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            name: e.target.value
                          })
                        }
                        required
                      />

                      <label htmlFor="profileUniversity">
                        University
                      </label>

                      <input
                        id="profileUniversity"
                        type="text"
                        value={profileForm.university}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            university: e.target.value
                          })
                        }
                      />

                      <label htmlFor="profileCourse">Course</label>

                      <input
                        id="profileCourse"
                        type="text"
                        value={profileForm.course}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            course: e.target.value
                          })
                        }
                      />

                      <label htmlFor="profileYear">
                        Academic Year
                      </label>

                      <select
                        id="profileYear"
                        value={profileForm.year}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            year: Number(e.target.value)
                          })
                        }
                      >
                        {[1, 2, 3, 4, 5, 6].map((year) => (
                          <option key={year} value={year}>
                            Year {year}
                          </option>
                        ))}
                      </select>

                      <label htmlFor="profileBio">About Me</label>

                      <textarea
                        id="profileBio"
                        rows={4}
                        maxLength={500}
                        value={profileForm.bio}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            bio: e.target.value
                          })
                        }
                        placeholder="Tell other students about yourself..."
                      />

                      <div className="profile-form-actions">
                        <button
                          type="submit"
                          className="primary-button"
                        >
                          Save Changes
                        </button>

                        <button
                          type="button"
                          className="outline-button"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileMessage("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </>
          )}

          {/* Request Skill Popup */}
          {selectedSkill && (
            <div className="modal-overlay">
              <form
                className="request-modal"
                onSubmit={handleRequestSkill}
              >
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => {
                    setSelectedSkill(null);
                    setRequestMessage("");
                  }}
                >
                  ×
                </button>

                <p className="eyebrow">
                  SKILL EXCHANGE REQUEST
                </p>

                <h2>{selectedSkill.title}</h2>

                <p>{selectedSkill.description}</p>

                <div className="request-details">
                  <span>
                    Teacher: {selectedSkill.owner?.name || "Student"}
                  </span>

                  <strong>
                    {selectedSkill.creditsRequired} Credits
                  </strong>
                </div>

                <label htmlFor="requestMessage">
                  Your message to the teacher
                </label>

                <textarea
                  id="requestMessage"
                  value={requestMessage}
                  onChange={(event) =>
                    setRequestMessage(event.target.value)
                  }
                  placeholder="Hi! I would like to learn this skill..."
                  maxLength={500}
                  rows={4}
                />

                <button
                  type="submit"
                  className="primary-button full-button"
                  disabled={requestLoading}
                >
                  {requestLoading
                    ? "Sending..."
                    : "Send Skill Request"}
                </button>
              </form>
            </div>
          )}

          <footer>
            Made for students, powered by shared knowledge.{" "}
            <strong>SkillBridge</strong>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
