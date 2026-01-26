// client/src/pages/teacher/AttendanceManager.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import { FaCheckSquare, FaSave, FaSearch, FaCheckCircle, FaTimesCircle, FaUserCircle } from 'react-icons/fa';
import FeedbackAlert from '../../components/common/FeedbackAlert';
import { type AlertColor } from '@mui/material/Alert';
import './AttendanceManager.scss';

// Define Interfaces
interface ClassOption { id: string; name: string; }
interface SubjectOption { id: string; name: string; classId: string; }

interface StudentRecord {
  studentId: string;
  name: string;
  rollNo: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  avatar?: string; 
}

const AttendanceManager: React.FC = () => {
  const location = useLocation();
  const { prefillClassId, prefillSubjectId } = location.state || {};

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedClass, setSelectedClass] = useState(prefillClassId || '');
  const [selectedSubject, setSelectedSubject] = useState(prefillSubjectId || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');
  const [searchStudent, setSearchStudent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ 
    show: false, type: 'success', msg: '' 
  });

  const showAlert = (type: AlertColor, msg: string) => {
      setAlertInfo({ show: true, type, msg });
      setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

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

  useEffect(() => {
    const init = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/attendance/meta', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) {
                const data = await res.json();
                if (data.classes && Array.isArray(data.classes)) setClasses(data.classes);
                if (data.subjects && Array.isArray(data.subjects)) setSubjects(data.subjects);
            }
        } catch(e) { console.error("Meta fetch error", e); }

        if (prefillClassId) {
            loadSheetData(prefillClassId, prefillSubjectId, new Date().toISOString().split('T')[0]);
        }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleFetchClick = () => {
      loadSheetData(selectedClass, selectedSubject, selectedDate);
  };

  const mark = (studentId: string, status: StudentRecord['status']) => {
      setRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
  };

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

  const filteredSubjects = subjects.filter(s => s.classId === selectedClass);
  const displayedRecords = records.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchStudent.toLowerCase());
      const matchesFilter = filterStatus === 'ALL' || r.status === filterStatus;
      return matchesSearch && matchesFilter;
  });

  return (
    <div className="attendance-page">
      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show:false})} />
      
      <div className="page-header">
        <h2><FaCheckSquare /> Attendance Manager</h2>
      </div>

      <div className="selection-card">
          <div className="form-group">
              <label>Select Class</label>
              <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSubject(''); }}>
                  <option value="">-- Choose Class --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
          </div>
          <div className="form-group">
              <label>Select Subject</label>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                  <option value="">-- General / Homeroom --</option>
                  {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
          </div>
          <div className="form-group">
              <label>Date</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>
          <button className="btn-fetch" onClick={handleFetchClick} disabled={!selectedClass}>
              Load Sheet
          </button>
      </div>

      {records.length > 0 && (
          <div className="controls-bar">
              <div className="filters">
                  <span>Filter:</span>
                  <button className={filterStatus === 'ALL' ? 'active' : ''} onClick={() => setFilterStatus('ALL')}>All</button>
                  <button className={filterStatus === 'PRESENT' ? 'active' : ''} onClick={() => setFilterStatus('PRESENT')}>Present</button>
                  <button className={filterStatus === 'ABSENT' ? 'active' : ''} onClick={() => setFilterStatus('ABSENT')}>Absent</button>
              </div>
              <div className="search-box">
                  <FaSearch />
                  <input 
                    placeholder="Search student..." 
                    value={searchStudent} 
                    onChange={e => setSearchStudent(e.target.value)}
                  />
              </div>
          </div>
      )}

      {records.length > 0 ? (
          <>
            <div className="table-container">
                <div className="table-header">
                    <span>Student Details</span>
                    <span>Status</span>
                    <span>Action</span>
                </div>
                
                {isLoading ? <div style={{padding:'2rem', textAlign:'center'}}>Loading...</div> : (
                    <div className="table-body">
                        {displayedRecords.map(student => (
                            <div key={student.studentId} className="student-row">
                                <div className="student-info">
                                    {/* FIXED: avatar logic for Cloudinary absolute URLs */}
                                    {student.avatar ? (
                                        <img 
                                            src={student.avatar} 
                                            alt={student.name} 
                                            className="avatar"
                                            onError={(e) => {
                                                // Fallback if Cloudinary link is broken
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${student.name}&background=random`;
                                            }}
                                        />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            <FaUserCircle />
                                        </div>
                                    )}
                                    <div className="details">
                                        <span className="name">{student.name}</span>
                                        <span className="sid">SID: {student.rollNo}</span>
                                    </div>
                                </div>
                                
                                <div className="status-cell">
                                    {student.status === 'PRESENT' ? (
                                        <span className="status-pill present"><FaCheckCircle /> Present</span>
                                    ) : (
                                        <span className="status-pill absent"><FaTimesCircle /> Absent</span>
                                    )}
                                </div>

                                <div className="action-cell">
                                    {student.status === 'PRESENT' ? (
                                        <button className="btn-mark-absent" onClick={() => mark(student.studentId, 'ABSENT')}>
                                            Mark Absent
                                        </button>
                                    ) : (
                                        <button className="btn-mark-present" onClick={() => mark(student.studentId, 'PRESENT')}>
                                            Mark Present
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="save-bar">
                <button className="btn-save" onClick={handleSave}>
                    <FaSave /> Save Attendance
                </button>
            </div>
          </>
      ) : (
          !isLoading && selectedClass && <div style={{textAlign:'center', padding:'3rem', color:'gray'}}>No students found.</div>
      )}
    </div>
  );
};

export default AttendanceManager;