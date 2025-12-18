// client/src/pages/teacher/OnlineTestManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { FaLaptopCode, FaPlus, FaTrash, FaQuestionCircle, FaClock, FaListOl, FaFilter } from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton'; 
import FeedbackAlert from '../../components/common/FeedbackAlert';
import { DeleteModal } from '../../components/common/DeleteModal';
import { type AlertColor } from '@mui/material/Alert';
import './OnlineTestManager.scss';
import { CreateTestModal } from './CreateTestModal';

interface OnlineTest {
    id: string;
    title: string;
    description: string;
    date: string;
    duration: number;
    className: string;
    subjectName: string;
    classId: string;
    subjectId: string;
    questionCount: number;
    submissionCount: number;
}

interface TestFormData {
    title: string;
    description: string;
    date: string;
    duration: number;
    classId: string;
    subjectId: string;
}

interface ClassOption {
    id: string;
    name: string;
}

interface SubjectOption {
    id: string;
    name: string;
    classId: string; 
}

const OnlineTestManager: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 2. Initialize Hook
  const { prefillClassId, prefillSubjectId } = location.state || {};

  const [tests, setTests] = useState<OnlineTest[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: string, title: string}>({ 
    show: false, id: '', title: '' 
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ 
    show: false, type: 'success', msg: '' 
  });

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/online-exams', { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        if(res.ok) setTests(await res.json());
    } catch(e) { 
        console.error(e); 
        showAlert('error', 'Failed to load tests');
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTests();
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/attendance/meta', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => { 
            if(data) {
                if(Array.isArray(data.classes)) setClasses(data.classes);
                if(Array.isArray(data.subjects)) setSubjects(data.subjects);
            }
        })
        .catch(console.error);
  }, [fetchTests]);

  const handleCreate = async (data: TestFormData) => {
      const token = localStorage.getItem('token');
      try {
          const res = await fetch('http://localhost:5000/api/online-exams', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(data)
          });
          if(res.ok) {
              setIsCreateModalOpen(false);
              fetchTests();
              showAlert('success', 'Test Created Successfully!');
          } else {
              showAlert('error', 'Failed to create test');
          }
      } catch(e) {
          console.error(e);
          showAlert('error', 'Network error');
      }
  };

  const confirmDelete = async () => {
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      try {
          const res = await fetch(`http://localhost:5000/api/online-exams/${deleteModal.id}`, { 
              method: 'DELETE', 
              headers: { 'Authorization': `Bearer ${token}` } 
          });
          
          if (res.ok) {
            fetchTests();
            setDeleteModal({ show: false, id: '', title: '' }); 
            showAlert('success', 'Test Deleted Successfully');
          } else {
            showAlert('error', 'Failed to delete test');
          }
      } catch(e) { 
          console.error(e); 
          showAlert('error', 'Network error');
      } finally {
          setIsDeleting(false);
      }
  };

  // 3. Updated Handler: Redirect to Questions Page
  const openAddQuestions = (id: string) => {
      // Navigate to the separate page route (ensure this route exists in your App.tsx)
      navigate(`/teacher/tests/${id}/questions`);
  };

  const openDeleteModal = (id: string, title: string) => {
      setDeleteModal({ show: true, id, title });
  };

  const filteredTests = tests.filter(t => {
      if (prefillClassId && t.classId !== prefillClassId) return false;
      if (prefillSubjectId && t.subjectId !== prefillSubjectId) return false;
      return true;
  });

  return (
    <div className="online-test-page">
        <FeedbackAlert 
            isOpen={alertInfo.show} 
            type={alertInfo.type} 
            message={alertInfo.msg} 
            onClose={() => setAlertInfo({...alertInfo, show: false})} 
        />
        
        <div className="page-header">
            <h2><FaLaptopCode /> Online Tests</h2>
            
            <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                {prefillSubjectId && (
                    <span style={{fontSize:'0.9rem', color:'var(--primary-color)', background:'var(--bg-secondary-color)', padding:'5px 10px', borderRadius:'12px', display:'flex', alignItems:'center', gap:'5px'}}>
                        <FaFilter /> Filtered View
                    </span>
                )}
                <button className="btn-add-primary" onClick={() => setIsCreateModalOpen(true)}>
                    <FaPlus /> Create Test
                </button>
            </div>
        </div>

        <div className="tests-grid">
            
            {/* --- SKELETON LOADER --- */}
            {loading ? (
                Array.from(new Array(6)).map((_, index) => (
                    <div key={index} className="test-card">
                        <div className="card-header">
                            <Skeleton variant="circular" width={48} height={48} style={{borderRadius: 10}} />
                            <Skeleton variant="rectangular" width={70} height={26} style={{borderRadius: 20}} />
                        </div>
                        <div className="card-body">
                            <Skeleton variant="text" width="80%" height={32} style={{marginBottom: 8}} />
                            <Skeleton variant="text" width="60%" height={20} style={{marginBottom: 12}} />
                            <div className="meta-row" style={{borderTop: '1px dashed var(--border-light-color)', paddingTop: 12}}>
                                <Skeleton variant="text" width="100%" height={20} />
                            </div>
                        </div>
                        <div className="card-footer">
                             <Skeleton variant="rectangular" width={80} height={32} style={{borderRadius: 6}} />
                             <Skeleton variant="rectangular" width={80} height={32} style={{borderRadius: 6}} />
                        </div>
                    </div>
                ))
            ) : (
                filteredTests.length > 0 ? filteredTests.map(test => (
                    <div key={test.id} className="test-card">
                        <div className="card-header">
                            <div className="icon-box"><FaQuestionCircle /></div>
                            <span className="question-badge">{test.questionCount} Qs</span>
                        </div>
                        <div className="card-body">
                            <h3>{test.title}</h3>
                            <span className="class-info">{test.className} - {test.subjectName}</span>
                            <div className="meta-row">
                                <span><FaClock /> {test.duration} mins</span>
                                <span style={{marginLeft:'auto'}}>{new Date(test.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="card-footer">
                             {/* Calls navigation function now */}
                             <button className="btn-add-qs" onClick={() => openAddQuestions(test.id)}>
                                <FaListOl /> Manage Qs
                             </button>
                             <button className="btn-delete" onClick={() => openDeleteModal(test.id, test.title)}>
                                <FaTrash /> Delete
                             </button>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state">No tests found for this context.</div>
                )
            )}
        </div>

        <CreateTestModal
            isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} 
            onSave={handleCreate} classes={classes} subjects={subjects} 
        />

        {/* Removed AddQuestionsStepper Modal */}

        <DeleteModal 
            isOpen={deleteModal.show}
            onClose={() => setDeleteModal({ ...deleteModal, show: false })}
            onConfirm={confirmDelete}
            title="Delete Test"
            message="Are you sure you want to delete the test"
            itemName={deleteModal.title}
            isLoading={isDeleting}
        />
    </div>
  );
};

export default OnlineTestManager;