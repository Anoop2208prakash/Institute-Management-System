// client/src/pages/teacher/AttendanceManager.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import { FaCheckSquare, FaSave, FaSearch } from 'react-icons/fa';
import FeedbackAlert from '../../components/common/FeedbackAlert';
import LinearLoader from '../../components/common/LinearLoader';
import { type AlertColor } from '@mui/material/Alert';
import './AttendanceManager.scss';

// 1. Define Interfaces
interface ClassOption {
  id: string;
  name: string;
}

interface SubjectOption {
  id: string;
  name: string;
  classId: string;
}

interface StudentRecord {
  studentId: string;
  name: string;
  rollNo: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

const AttendanceManager: React.FC = () => {
  const location = useLocation();
  const { prefillClassId, prefillSubjectId } = location.state || {};

  // 2. Use Typed State (No more 'any[]')
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  
  // Selection State
  const [selectedClass, setSelectedClass] = useState(prefillClassId || '');
  const [selectedSubject, setSelectedSubject] = useState(prefillSubjectId || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Data State
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ 
    show: false, type: 'success', msg: '' 
  });

  const showAlert = (type: AlertColor, msg: string) => {
      setAlertInfo({ show: true, type, msg });
      setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  // Helper to fetch sheet
  const loadSheetData = async (classId: string, subjectId: string, date: string) => {
      if(!classId) return;
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const query = `classId=${classId}&subjectId=${subjectId || ''}&date=${date}`;
        
        const res = await fetch(`http://localhost:5000/api/attendance/sheet?${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if(res.ok) {
            const data = await res.json();
            setRecords(data);
        }
      } catch(e) {
          console.error(e);
          showAlert('error', 'Failed to load sheet');
      } finally {
          setIsLoading(false);
      }
  };

  // 1. Fetch Metadata & Auto-Load Sheet
  useEffect(() => {
    const init = async () => {
        const token = localStorage.getItem('token');
        
        // A. Fetch Classes & Subjects
        try {
            const res = await fetch('http://localhost:5000/api/attendance/meta', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) {
                const data = await res.json();
                // 3. Ensure data matches interface
                if (data.classes && Array.isArray(data.classes)) setClasses(data.classes);
                if (data.subjects && Array.isArray(data.subjects)) setSubjects(data.subjects);
            }
        } catch(e) { console.error("Meta fetch error", e); }

        // B. Auto-Fetch Sheet if prefilled
        if (prefillClassId) {
            loadSheetData(prefillClassId, prefillSubjectId, selectedDate);
        }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Wrapper for Button Click
  const handleFetchClick = () => {
      loadSheetData(selectedClass, selectedSubject, selectedDate);
  };

  // 3. Mark Status Locally
  const mark = (studentId: string, status: StudentRecord['status']) => {
      setRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
  };

  // 4. Save to Database
  const handleSave = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/attendance', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                classId: selectedClass,
                subjectId: selectedSubject || null,
                date: selectedDate,
                records: records.map(r => ({ studentId: r.studentId, status: r.status }))
            })
        });

        if(res.ok) {
            showAlert('success', 'Attendance Saved!');
        } else {
            showAlert('error', 'Save Failed');
        }
      } catch(e) {
          showAlert('error', 'Network Error');
      }
  };

  // Filter subjects based on selected class
  const filteredSubjects = subjects.filter(s => s.classId === selectedClass);

  return (
    <div className="attendance-page">
      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show:false})} />
      
      <div className="page-header">
        <h2><FaCheckSquare /> Attendance Manager</h2>
      </div>

      {/* Filters */}
      <div className="filters-card">
          <div className="form-group">
              <label>Select Class</label>
              <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSubject(''); }}>
                  <option value="">-- Choose Class --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
          </div>
          <div className="form-group">
              <label>Select Subject (Optional)</label>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                  <option value="">-- Homeroom / General --</option>
                  {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
          </div>
          <div className="form-group">
              <label>Date</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>
          <button className="btn-fetch" onClick={handleFetchClick} disabled={!selectedClass}>
              <FaSearch /> Load Sheet
          </button>
      </div>

      {/* Sheet */}
      {records.length > 0 && (
          <div className="sheet-container">
              <div className="sheet-header">
                  <h3>Student List ({records.length})</h3>
                  <button className="btn-save" onClick={handleSave}><FaSave /> Save Attendance</button>
              </div>
              
              {isLoading ? <div style={{padding:'2rem'}}><LinearLoader /></div> : (
                  <div className="sheet-body">
                      {records.map(student => (
                          <div key={student.studentId} className="student-row">
                              <div className="info">
                                  <span className="name">{student.name}</span>
                                  <span className="roll">ID: {student.rollNo}</span>
                              </div>
                              <div className="actions">
                                  <button 
                                    className={`present ${student.status === 'PRESENT' ? 'active' : ''}`}
                                    onClick={() => mark(student.studentId, 'PRESENT')}
                                  >P</button>
                                  <button 
                                    className={`absent ${student.status === 'ABSENT' ? 'active' : ''}`}
                                    onClick={() => mark(student.studentId, 'ABSENT')}
                                  >A</button>
                                  <button 
                                    className={`late ${student.status === 'LATE' ? 'active' : ''}`}
                                    onClick={() => mark(student.studentId, 'LATE')}
                                  >L</button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default AttendanceManager;