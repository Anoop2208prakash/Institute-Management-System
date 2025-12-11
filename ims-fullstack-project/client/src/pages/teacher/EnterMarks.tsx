// client/src/pages/teacher/EnterMarks.tsx
import React, { useState, useEffect } from 'react';
import { FaPenNib, FaSave } from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton'; // <--- Import Skeleton
import FeedbackAlert from '../../components/common/FeedbackAlert';
import { type AlertColor } from '@mui/material/Alert';
import './EnterMarks.scss';

interface ExamOption {
    id: string;
    name: string;
    className: string;
    subjectName: string;
    date: string;
}

interface StudentMark {
    studentId: string;
    name: string;
    admissionNo: string;
    marksObtained: number | string;
    totalMarks: number;
}

const EnterMarks: React.FC = () => {
    const [exams, setExams] = useState<ExamOption[]>([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [students, setStudents] = useState<StudentMark[]>([]);
    const [loading, setLoading] = useState(false);
    
    const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ show: false, type: 'success', msg: '' });

    const showAlert = (type: AlertColor, msg: string) => {
        setAlertInfo({ show: true, type, msg });
        setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
    };

    // 1. Fetch Exams
    useEffect(() => {
        const fetchExams = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch('http://localhost:5000/api/marks/exams', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if(res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) setExams(data);
                }
            } catch(e) { console.error(e); } 
        };
        fetchExams();
    }, []);

    // 2. Fetch Sheet when Exam selected
    useEffect(() => {
        if(!selectedExam) return;
        const fetchSheet = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`http://localhost:5000/api/marks/sheet/${selectedExam}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if(res.ok) {
                    const data = await res.json();
                    if (data && Array.isArray(data.students)) {
                        setStudents(data.students);
                    }
                }
            } catch(e) { 
                console.error(e); 
                showAlert('error', 'Failed to load student list'); 
            } finally { setLoading(false); }
        };
        fetchSheet();
    }, [selectedExam]);

    // 3. Handle Input Change
    const handleMarkChange = (id: string, val: string) => {
        setStudents(prev => prev.map(s => s.studentId === id ? { ...s, marksObtained: val } : s));
    };

    // 4. Save
    const handleSave = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/marks', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    examId: selectedExam, 
                    marks: students.map(s => ({
                        studentId: s.studentId,
                        marksObtained: s.marksObtained === '' ? 0 : Number(s.marksObtained),
                        totalMarks: s.totalMarks
                    }))
                })
            });
            if(res.ok) showAlert('success', 'Marks Saved Successfully');
            else showAlert('error', 'Failed to save marks');
        } catch(e) { 
            console.error(e); 
            showAlert('error', 'Network error'); 
        }
    };

    return (
        <div className="marks-page">
            <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show:false})} />
            
            <div className="page-header">
                <h2><FaPenNib /> Enter Marks</h2>
            </div>

            <div className="selection-card">
                <div className="form-group">
                    <label>Select Exam</label>
                    <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
                        <option value="">-- Choose Exam --</option>
                        {exams.map(ex => (
                            <option key={ex.id} value={ex.id}>
                                {ex.name} ({ex.subjectName} - {ex.className})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedExam && (
                <div className="marks-table">
                    <div className="table-header">
                        <span>Student Name</span>
                        <span>ID No</span>
                        <span>Marks Obtained</span>
                        <span>Total Marks</span>
                    </div>
                    
                    {/* --- SKELETON LOADER --- */}
                    {loading ? (
                         Array.from(new Array(5)).map((_, index) => (
                             <div key={index} className="table-row">
                                 <Skeleton variant="text" width="60%" height={24} />
                                 <Skeleton variant="text" width="40%" height={20} />
                                 <div style={{display:'flex', alignItems:'center', gap:'10px', width:'100%'}}>
                                     <Skeleton variant="rectangular" width={80} height={36} style={{borderRadius: 6}} />
                                     <Skeleton variant="text" width={40} height={20} />
                                 </div>
                                 {/* Desktop only spacer */}
                                 <span className="desktop-only"></span> 
                             </div>
                         ))
                    ) : (
                        students.map(s => (
                            <div key={s.studentId} className="table-row">
                                <span className="name">{s.name}</span>
                                <span className="roll">{s.admissionNo}</span>
                                
                                {/* Wrapper for Input + Total to keep them together on mobile */}
                                <div style={{display:'flex', alignItems:'center', gap:'10px', width:'100%'}}>
                                    <input 
                                        type="number" 
                                        value={s.marksObtained} 
                                        onChange={e => handleMarkChange(s.studentId, e.target.value)}
                                        min="0" max={s.totalMarks}
                                        placeholder="0"
                                    />
                                    <span style={{color:'var(--text-muted-color)', fontWeight:500}}>/ {s.totalMarks}</span>
                                </div>
                                <span className="desktop-only"></span> 
                            </div>
                        ))
                    )}
                    
                    <div className="table-footer">
                        <button onClick={handleSave}><FaSave style={{marginRight:'8px'}}/> Save Marks</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnterMarks;