
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
  const [skills, setSkills] = useState([]);
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

  // Sidebar menu
  const menu = [
    { name: "Dashboard", icon: "▦" },
    { name: "Explore Skills", icon: "⌕" },
    { name: "My Skills", icon: "✦" },
    { name: "My Sessions", icon: "◷" },
    { name: "Messages", icon: "✉" },
    { name: "My Profile", icon: "◉" }
  ];

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

  // Load incoming and outgoing requests
  const loadMySessions = useCallback(async () => {
    try {
      const [myResponse, incomingResponse] = await Promise.all([
        API.get("/requests/my-requests"),
        API.get("/requests/incoming")
      ]);

      setMyRequests(myResponse.data.requests || []);
      setIncomingRequests(incomingResponse.data.requests || []);
    } catch (err) {
      console.error(
        "Unable to load sessions:",
        err.response?.data?.message || err.message
      );
    }
  }, []);

  // Load dashboard after login
  useEffect(() => {
    if (!token) return;

    const timeoutId = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [token, loadDashboard]);

  // Load sessions whenever the user opens My Sessions
  useEffect(() => {
    if (!token || activePage !== "My Sessions") return;

    const timeoutId = window.setTimeout(() => {
      void loadMySessions();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [token, activePage, loadMySessions]);

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
  const filteredSkills = skills.filter((skill) => {
    const query = search.toLowerCase();

    return (
      skill.title?.toLowerCase().includes(query) ||
      skill.category?.toLowerCase().includes(query) ||
      skill.description?.toLowerCase().includes(query)
    );
  });

  // Login screen
  if (!token) {
    return (
      <div className="auth-page">
        <form className="auth-card" onSubmit={handleLogin}>
          <div className="brand auth-brand">
            <div className="brand-icon">S</div>
            <span>SkillBridge</span>
          </div>

          <p className="eyebrow">CAMPUS SKILL EXCHANGE</p>
          <h1>Welcome back!</h1>

          <p className="subtitle">
            Log in to learn, teach and grow with your campus community.
          </p>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <label htmlFor="email">Email address</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <button
            className="primary-button full-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login to SkillBridge"}
          </button>

          <p className="auth-footer">
            Share your skills. Discover new opportunities.
          </p>
        </form>
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
          <div className="help-card">
            <span>✦</span>
            <strong>Learn together.</strong>

            <p>
              Share your knowledge and grow with your campus community.
            </p>
          </div>

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

            <button
              className="primary-button"
              onClick={() => setActivePage("Explore Skills")}
            >
              + Explore skills
            </button>
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

              {/* Explore Skills */}
              {(activePage === "Explore Skills" ||
                activePage === "Dashboard") && (
                <>
                  <div className="section-heading">
                    <div>
                      <h2>Discover skills</h2>

                      <p>
                        Find something interesting to learn from your peers.
                      </p>
                    </div>
                  </div>

                  <div className="search-box">
                    <span>⌕</span>

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search Python, design, programming..."
                    />
                  </div>

                  <div className="skills-grid">
                    {filteredSkills
                      .filter((skill) => skill.type === "Teaching")
                      .map((skill) => {
                        const isOwnSkill =
                          String(skill.owner?._id || skill.owner) ===
                          String(profile?._id || profile?.id);

                        return (
                          <div
                            className="skill-card"
                            key={skill._id}
                          >
                            <div className="skill-art purple">
                              {skill.category === "Programming"
                                ? "</>"
                                : "✦"}
                            </div>

                            <div className="skill-info">
                              <span className="category">
                                {skill.category}
                              </span>

                              <h3>{skill.title}</h3>
                              <p>{skill.level}</p>

                              <div className="teacher-row">
                                <div className="avatar small-avatar">
                                  {skill.owner?.name
                                    ?.slice(0, 2)
                                    .toUpperCase() || "ST"}
                                </div>

                                <span>
                                  {skill.owner?.name || "Student"}
                                </span>

                                <strong>
                                  {skill.creditsRequired} CR
                                </strong>
                              </div>

                              <button
                                className="outline-button"
                                disabled={isOwnSkill}
                                onClick={() => {
                                  setRequestNotice("");
                                  setSelectedSkill(skill);
                                }}
                              >
                                {isOwnSkill
                                  ? "Your skill"
                                  : "Request Skill →"}
                              </button>
                            </div>
                          </div>
                        );
                      })}

                    {filteredSkills.filter(
                      (skill) => skill.type === "Teaching"
                    ).length === 0 && (
                      <p className="empty-message">
                        No teaching skills found.
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* My Skills */}
              {activePage === "My Skills" && (
                <div className="panel">
                  <h2>My Skills</h2>

                  {skills.filter(
                    (skill) =>
                      String(skill.owner?._id || skill.owner) ===
                      String(profile?._id || profile?.id)
                  ).length === 0 ? (
                    <p>No skills created yet.</p>
                  ) : (
                    skills
                      .filter(
                        (skill) =>
                          String(skill.owner?._id || skill.owner) ===
                          String(profile?._id || profile?.id)
                      )
                      .map((skill) => (
                        <div
                          className="session-row"
                          key={skill._id}
                        >
                          <div className="session-detail">
                            <strong>{skill.title}</strong>

                            <small>
                              {skill.type} · {skill.category}
                            </small>
                          </div>

                          <strong>
                            {skill.creditsRequired} CR
                          </strong>
                        </div>
                      ))
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
