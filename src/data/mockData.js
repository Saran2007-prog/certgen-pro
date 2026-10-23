export const initialEvents = [
  {
    id: "evt-101",
    title: "International Web3 Developers Summit 2026",
    date: "2026-10-15",
    organization: "Global Tech Foundation",
    category: "Participation & Speaker",
    signatory: "Dr. Evelyn Reed (Director of Operations)",
    totalRecords: 1450,
    status: "Completed",
    batchId: "BATCH-8921-X",
    createdAt: "2026-10-15 14:30"
  },
  {
    id: "evt-102",
    title: "AI Hackathon: Generative Frontiers",
    date: "2026-10-20",
    organization: "Nexus Artificial Intelligence Institute",
    category: "Excellence & Winner",
    signatory: "Marcus Sterling (Lead Evaluator)",
    totalRecords: 320,
    status: "Completed",
    batchId: "BATCH-7742-A",
    createdAt: "2026-10-20 09:15"
  },
  {
    id: "evt-103",
    title: "Cloud Infrastructure Masterclass",
    date: "2026-10-21",
    organization: "DevOps Academy",
    category: "Course Completion",
    signatory: "Sophia Jenkins (Head Instructor)",
    totalRecords: 85,
    status: "In Progress",
    batchId: "BATCH-6631-B",
    createdAt: "2026-10-21 16:45"
  },
  {
    id: "evt-104",
    title: "Full-Stack React & Node Bootcamp",
    date: "2026-10-22",
    organization: "HyperCode Labs",
    category: "Certification of Achievement",
    signatory: "Alexander Hayes (Dean of Studies)",
    totalRecords: 180,
    status: "Pending",
    batchId: "BATCH-9012-C",
    createdAt: "2026-10-22 08:00"
  }
];

export const sampleParticipants = [
  {
    id: 1,
    participantName: "Saranstalin S.",
    email: "saranstalin.s@techsummit.org",
    role: "Lead Systems Architect & Speaker",
    issueDate: "2026-10-22",
    grade: "Distinction",
    status: "valid",
    errors: []
  },
  {
    id: 2,
    participantName: "Sarah Connor",
    email: "sconnor@resistance.net",
    role: "Attendee",
    issueDate: "2026-10-22",
    grade: "Merit",
    status: "valid",
    errors: []
  },
  {
    id: 3,
    participantName: "", // missing name error
    email: "unregistered_user@cyberdyne.io",
    role: "Participant",
    issueDate: "2026-10-22",
    grade: "Pass",
    status: "error",
    errors: ["Participant Name is required"]
  },
  {
    id: 4,
    participantName: "Gordon Freeman",
    email: "gordon.freeman-invalid-mail", // invalid email
    role: "Research Scientist",
    issueDate: "2026-10-22",
    grade: "Honors",
    status: "error",
    errors: ["Invalid email address format"]
  },
  {
    id: 5,
    participantName: "Sarah Connor", // duplicate entry
    email: "sconnor@resistance.net",
    role: "Attendee",
    issueDate: "2026-10-22",
    grade: "Merit",
    status: "duplicate",
    errors: ["Duplicate participant record detected (Name + Email)"]
  },
  {
    id: 6,
    participantName: "Miles Morales",
    email: "miles.morales@visionacademy.edu",
    role: "Student Fellow",
    issueDate: "2026-10-22",
    grade: "Outstanding",
    status: "valid",
    errors: []
  },
  {
    id: 7,
    participantName: "Elena Fisher",
    email: "efisher@adventurepress.com",
    role: "Journalist / Speaker",
    issueDate: "2026-10-22",
    grade: "Excellence",
    status: "valid",
    errors: []
  }
];

export const certificateTemplates = [
  {
    id: "classic-gold",
    name: "Classic Royal Gold",
    description: "Ornate traditional certificate styling with golden filigree and serif typography. Best for formal academic diplomas and honors.",
    themeClass: "cert-canvas-classic",
    accentColor: "#8b6b23",
    bgPattern: "radial-gradient(ellipse at center, #ffffff 0%, #faf5e4 100%)",
    font: "'Cinzel', serif"
  },
  {
    id: "modern-tech",
    name: "Cyber & Tech Blueprint",
    description: "Sleek dark mode theme with neon cyan accents and contemporary monospace-geometric cues. Ideal for hackathons, engineering summits, and tech workshops.",
    themeClass: "cert-canvas-modern",
    accentColor: "#38bdf8",
    bgPattern: "linear-gradient(135deg, #090e1a 0%, #1e293b 100%)",
    font: "'Space Grotesk', sans-serif"
  },
  {
    id: "minimal-executive",
    name: "Minimalist Corporate Indigo",
    description: "Ultra-clean layout with royal indigo lines and refined modern typography. Great for professional bootcamps and corporate training.",
    themeClass: "cert-canvas-minimal",
    accentColor: "#4f46e5",
    bgPattern: "#ffffff",
    font: "'Plus Jakarta Sans', sans-serif"
  }
];
