import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialEvents, sampleParticipants, certificateTemplates } from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('certgen_user');
    const token = localStorage.getItem('certgen_token');
    return (saved && token) ? JSON.parse(saved) : null;
  });

  // Events & Batches State
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('certgen_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  // Current Creation Wizard State
  const [wizardState, setWizardState] = useState(() => {
    return {
      step: 1,
      eventDetails: {
        id: null,
        title: "Global Next-Gen AI Symposium 2026",
        date: "2026-11-15",
        organization: "Apex Intelligence Consortium",
        category: "Excellence & Innovation",
        signatory: "Prof. Alistair Sterling (General Chair)"
      },
      fileData: {
        fileName: "participants_export_final.xlsx",
        fileSize: "48.2 KB",
        uploadedAt: "Just now"
      },
      participants: sampleParticipants,
      selectedTemplate: certificateTemplates[0],
      columnMapping: {
        participantName: "participantName",
        email: "email",
        role: "role",
        issueDate: "issueDate",
        grade: "grade"
      },
      generationProgress: 0,
      generationStatus: 'idle', // 'idle' | 'generating' | 'completed' | 'failed'
      generatedBatchId: null,
      generatedCertificates: []
    };
  });

  // Sync events from backend MongoDB on initial mount, falling back to cached state
  useEffect(() => {
    let isMounted = true;
    const fetchBackendEvents = async () => {
      try {
        const { getEvents } = await import('../services/api');
        const res = await getEvents();
        if (isMounted && res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map(e => ({
            id: e._id,
            title: e.title,
            date: e.date ? new Date(e.date).toISOString().split('T')[0] : '2026-10-23',
            organization: e.organization,
            category: e.category || 'Certificate of Excellence',
            signatory: e.signatory || 'Authorized Officer',
            totalRecords: e.totalRecords || 0,
            status: 'Completed',
            batchId: `BATCH-${e._id.slice(-6).toUpperCase()}`,
            createdAt: e.createdAt ? new Date(e.createdAt).toISOString().replace('T', ' ').slice(0, 16) : 'Recently',
          }));
          setEvents(formatted);
          localStorage.setItem('certgen_events', JSON.stringify(formatted));
        }
      } catch (err) {
        // Backend offline or token not yet ready, use cached/initial events
        console.info('[Notice] Using cached event history:', err.message);
      }
    };
    fetchBackendEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('certgen_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('certgen_events', JSON.stringify(events));
  }, [events]);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password.length >= 6) {
          const authUser = {
            email,
            name: email.split('@')[0].toUpperCase(),
            role: 'Lead Administrator',
            token: 'mock-jwt-token-xyz'
          };
          setUser(authUser);
          resolve(authUser);
        } else {
          reject(new Error("Invalid credentials. Password must be at least 6 characters."));
        }
      }, 700);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('certgen_user');
  };

  const updateWizardDetails = (field, value) => {
    setWizardState(prev => ({
      ...prev,
      eventDetails: {
        ...prev.eventDetails,
        [field]: value
      }
    }));
  };

  const setEventId = (id) => {
    setWizardState(prev => ({
      ...prev,
      eventDetails: {
        ...prev.eventDetails,
        id
      }
    }));
  };

  const setStep = (stepNumber) => {
    setWizardState(prev => ({
      ...prev,
      step: stepNumber
    }));
  };

  const setParsedParticipants = (participantsList, fileMeta) => {
    setWizardState(prev => ({
      ...prev,
      participants: participantsList,
      fileData: fileMeta
    }));
  };

  const updateParticipant = (id, updatedFields) => {
    setWizardState(prev => {
      const updatedList = prev.participants.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updatedFields };
          // Re-evaluate validation errors
          const errors = [];
          if (!updated.participantName || !updated.participantName.trim()) {
            errors.push("Participant Name is required");
          }
          if (!updated.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updated.email)) {
            errors.push("Invalid email address format");
          }
          updated.errors = errors;
          updated.status = errors.length > 0 ? 'error' : 'valid';
          return updated;
        }
        return p;
      });
      return { ...prev, participants: updatedList };
    });
  };

  const removeParticipant = (id) => {
    setWizardState(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }));
  };

  const setSelectedTemplate = (template) => {
    setWizardState(prev => ({
      ...prev,
      selectedTemplate: template
    }));
  };

  const updateColumnMapping = (templateField, mappedColumn) => {
    setWizardState(prev => ({
      ...prev,
      columnMapping: {
        ...prev.columnMapping,
        [templateField]: mappedColumn
      }
    }));
  };

  // Simulating Generation Process
  const startBulkGeneration = () => {
    setWizardState(prev => ({
      ...prev,
      generationStatus: 'generating',
      generationProgress: 5,
      step: 5 // Go to Generation & Output Status View
    }));

    const validParticipants = wizardState.participants.filter(p => p.status === 'valid');
    const totalToProcess = validParticipants.length;
    let currentCount = 0;

    const interval = setInterval(() => {
      currentCount += 1;
      const progressPercent = Math.min(100, Math.round((currentCount / totalToProcess) * 100));

      setWizardState(prev => ({
        ...prev,
        generationProgress: progressPercent
      }));

      if (currentCount >= totalToProcess) {
        clearInterval(interval);
        const batchCode = `BATCH-${Math.floor(1000 + Math.random() * 9000)}-${wizardState.selectedTemplate.id.slice(0, 2).toUpperCase()}`;

        // Create individual records
        const results = wizardState.participants.map(p => {
          const isSuccessful = p.status === 'valid';
          return {
            id: p.id,
            name: p.participantName || "Unknown",
            email: p.email,
            role: p.role,
            certificateId: isSuccessful ? `CERT-${Math.floor(100000 + Math.random() * 900000)}` : null,
            status: isSuccessful ? 'success' : 'failed',
            failureReason: !isSuccessful ? (p.errors.join(", ") || "Data validation error") : null,
            downloadUrl: isSuccessful ? `#download-cert-${p.id}` : null
          };
        });

        // Add event to history
        const newEvent = {
          id: `evt-${Date.now()}`,
          title: wizardState.eventDetails.title,
          date: wizardState.eventDetails.date,
          organization: wizardState.eventDetails.organization,
          category: wizardState.eventDetails.category,
          signatory: wizardState.eventDetails.signatory,
          totalRecords: wizardState.participants.length,
          status: 'Completed',
          batchId: batchCode,
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };

        setEvents(prev => [newEvent, ...prev]);

        setWizardState(prev => ({
          ...prev,
          generationStatus: 'completed',
          generationProgress: 100,
          generatedBatchId: batchCode,
          generatedCertificates: results
        }));
      }
    }, 450);
  };

  const resetWizard = () => {
    setWizardState({
      step: 1,
      eventDetails: {
        title: "",
        date: new Date().toISOString().split('T')[0],
        organization: "",
        category: "Participation & Completion",
        signatory: ""
      },
      fileData: null,
      participants: [],
      selectedTemplate: certificateTemplates[0],
      columnMapping: {
        participantName: "",
        email: "",
        role: "",
        issueDate: "",
        grade: ""
      },
      generationProgress: 0,
      generationStatus: 'idle',
      generatedBatchId: null,
      generatedCertificates: []
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        events,
        wizardState,
        setStep,
        updateWizardDetails,
        setEventId,
        setParsedParticipants,
        updateParticipant,
        removeParticipant,
        setSelectedTemplate,
        updateColumnMapping,
        startBulkGeneration,
        resetWizard
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
