// client/src/pages/teacher/AttendanceManager.tsx
import React, { useState, useEffect } from 'react';
import { FaCheckSquare, FaSave, FaSearch } from 'react-icons/fa';
import FeedbackAlert from '../../components/common/FeedbackAlert';
import LinearLoader from '../../components/common/LinearLoader';
import { type AlertColor } from '@mui/material/Alert';
import './AttendanceManager.scss';

interface StudentRecord {
  studentId: string;
  name: string;
  rollNo: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

const AttendanceManager: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // Selection State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Data State
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ 
    show: false, type: 'success', msg: '' 
  });

  // 1. Fetch Teacher's Metadata on Mount
  useEffect(() => {
    const fetchMeta = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/attendance/meta', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) {
            const data = await res.json();
            setClasses(data.classes);
            setSubjects(data.subjects);
        }
    };
    fetchMeta();
  }, []);

  // 2. Fetch Student List & Existing Attendance
  const fetchSheet = async () => {
      if(!selectedClass) return;
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const query = `classId=${selectedClass}&subjectId=${selectedSubject}&date=${selectedDate}`;
        
        const res = await fetch(`http://localhost:5000/api/attendance/sheet?${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if(res.ok) {
            setRecords(await res.json());
        }
      } catch(e) {
          console.error(e);
          setAlertInfo({show:true, type:'error', msg:'Failed to load sheet'});
      } finally {
          setIsLoading(false);
      }
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
            setAlertInfo({show:true, type:'success', msg:'Attendance Saved!'});
        } else {
            setAlertInfo({show:true, type:'error', msg:'Save Failed'});
        }
      } catch(e) {
          setAlertInfo({show:true, type:'error', msg:'Network Error'});
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
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
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
          <button className="btn-fetch" onClick={fetchSheet} disabled={!selectedClass}>
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