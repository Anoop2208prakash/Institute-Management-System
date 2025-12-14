// client/src/pages/admin/academic/SubjectManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaBook, FaPlus, FaTrash, FaSearch, FaLayerGroup, 
  FaArrowLeft, FaFolderOpen, FaCalendarAlt, FaChalkboardTeacher, FaBarcode 
} from 'react-icons/fa';
import Skeleton from '@mui/material/Skeleton';
import FeedbackAlert from '../../../components/common/FeedbackAlert';
import { DeleteModal } from '../../../components/common/DeleteModal';
import { type AlertColor } from '@mui/material/Alert';
import './SubjectManager.scss'; // Reuse similar styles
import { CreateSubjectModal, type SubjectFormData } from './CreateSubjectModal';

// --- Interfaces ---
interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string;
  semesterId?: string;
  teacher?: { fullName: string };
}

interface ClassOption {
  id: string;
  name: string;
  description?: string;
}

interface SemesterOption {
  id: string;
  name: string;
  classId: string;
  status: string;
}

const SubjectManager: React.FC = () => {
  // --- Data State ---
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);

  // --- View State (Navigation) ---
  const [selectedClass, setSelectedClass] = useState<ClassOption | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<SemesterOption | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Modal State ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: string, name: string}>({ show: false, id: '', name: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ 
    show: false, type: 'success', msg: '' 
  });

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  // --- 1. Fetch All Data ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [subjRes, classRes, semRes] = await Promise.all([
          fetch('http://localhost:5000/api/subjects', { headers }),
          fetch('http://localhost:5000/api/classes', { headers }),
          fetch('http://localhost:5000/api/semesters', { headers })
      ]);

      if (subjRes.ok && classRes.ok && semRes.ok) {
          setSubjects(await subjRes.json());
          setClasses(await classRes.json());
          setSemesters(await semRes.json());
      }
    } catch (e) {
      console.error(e);
      showAlert('error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  // --- 2. Actions ---
  const handleCreate = async (data: SubjectFormData) => {
    setIsCreating(true);
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:5000/api/subjects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if(res.ok) {
            void fetchData();
            setIsCreateModalOpen(false);
            showAlert('success', 'Subject created successfully');
        } else {
            showAlert('error', 'Failed to create subject');
        }
    } catch(e) { 
        console.error(e); 
        showAlert('error', 'Network error'); 
    } finally { 
        setIsCreating(false); 
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:5000/api/subjects/${deleteModal.id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) {
            void fetchData();
            setDeleteModal({ show: false, id: '', name: '' });
            showAlert('success', 'Subject deleted');
        } else {
            showAlert('error', 'Failed to delete subject');
        }
    } catch(e) { 
        console.error(e); 
        showAlert('error', 'Network error'); 
    } finally { 
        setIsDeleting(false); 
    }
  };

  // --- 3. Filtering Logic (The Core) ---
  
  // A. Programs (Root View)
  const filteredClasses = classes.filter(c => 
     c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // B. Semesters (Inside Program View)
  const currentSemesters = selectedClass 
    ? semesters.filter(s => s.classId === selectedClass.id && s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  // C. Subjects (Inside Semester View)
  const currentSubjects = selectedSemester
    ? subjects.filter(sub => sub.semesterId === selectedSemester.id && sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  // --- 4. Render Helpers ---
  
  // Handles the "Back" button logic
  const handleBack = () => {
      setSearchTerm(''); // Clear search on navigation
      if (selectedSemester) {
          setSelectedSemester(null); // Go back to Semesters
      } else {
          setSelectedClass(null); // Go back to Programs
      }
  };

  const getBreadcrumbTitle = () => {
      if (selectedSemester) return selectedSemester.name;
      if (selectedClass) return selectedClass.name;
      return "Manage Subjects";
  };

  const getBreadcrumbSubtitle = () => {
      if (selectedSemester) return `Viewing subjects in ${selectedSemester.name}`;
      if (selectedClass) return "Select a semester to view subjects";
      return "Select a program to start";
  };

  return (
    <div className="subject-page">
      <FeedbackAlert isOpen={alertInfo.show} type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({...alertInfo, show: false})} />

      {/* --- HEADER --- */}
      <div className="page-header">
        <div className="header-content">
            {selectedClass ? (
                 <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                    <button className="back-btn-round" onClick={handleBack}>
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h2>{getBreadcrumbTitle()}</h2>
                        <p>{getBreadcrumbSubtitle()}</p>
                    </div>
                 </div>
            ) : (
                <div>
                    <h2><FaBook /> Manage Subjects</h2>
                    <p>Organize curriculum by Program and Semester.</p>
                </div>
            )}
        </div>
        
        <div className="header-actions">
            <div className="search-box">
                <FaSearch />
                <input 
                    placeholder="Search..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="btn-add-primary" onClick={() => setIsCreateModalOpen(true)}>
                <FaPlus /> Add Subject
            </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="content-area">
        {isLoading ? (
             <div className="grid-view">
                {Array.from(new Array(4)).map((_, i) => <Skeleton key={i} variant="rectangular" height={140} style={{borderRadius: 16}} />)}
             </div>
        ) : (
            <>
                {/* VIEW 1: PROGRAMS (ROOT) */}
                {!selectedClass && (
                    <div className="grid-view">
                        {filteredClasses.length > 0 ? filteredClasses.map(cls => {
                            const semCount = semesters.filter(s => s.classId === cls.id).length;
                            return (
                                <div key={cls.id} className="nav-box" onClick={() => { setSelectedClass(cls); setSearchTerm(''); }}>
                                    <div className="box-icon"><FaLayerGroup /></div>
                                    <div className="box-info">
                                        <h3>{cls.name}</h3>
                                        <p>{semCount} Semester{semCount !== 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="box-arrow"><FaFolderOpen /></div>
                                </div>
                            );
                        }) : <div className="empty-state">No programs found.</div>}
                    </div>
                )}

                {/* VIEW 2: SEMESTERS (INSIDE PROGRAM) */}
                {selectedClass && !selectedSemester && (
                    <div className="grid-view">
                        {currentSemesters.length > 0 ? currentSemesters.map(sem => {
                            const subCount = subjects.filter(s => s.semesterId === sem.id).length;
                            return (
                                <div key={sem.id} className="nav-box" onClick={() => { setSelectedSemester(sem); setSearchTerm(''); }}>
                                    <div className="box-icon"><FaCalendarAlt /></div>
                                    <div className="box-info">
                                        <h3>{sem.name}</h3>
                                        <p>{subCount} Subject{subCount !== 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="box-arrow"><FaFolderOpen /></div>
                                </div>
                            );
                        }) : (
                            <div className="empty-state">
                                <p>No semesters found in {selectedClass.name}.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* VIEW 3: SUBJECTS (INSIDE SEMESTER) */}
                {selectedClass && selectedSemester && (
                    <div className="list-view">
                        {currentSubjects.length > 0 ? currentSubjects.map(sub => (
                             <div key={sub.id} className="list-row">
                                <div className="row-left">
                                    <div className="icon-box"><FaBook /></div>
                                    <div className="info">
                                        <h3>{sub.name}</h3>
                                        <div className="details">
                                            <span><FaBarcode /> {sub.code}</span>
                                            {sub.teacher && <span><FaChalkboardTeacher /> {sub.teacher.fullName}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="row-right">
                                    <button className="delete-btn" onClick={() => setDeleteModal({show: true, id: sub.id, name: sub.name})}>
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                             </div>
                        )) : (
                            <div className="empty-state">
                                <p>No subjects found in {selectedSemester.name}.</p>
                                <button className="link-btn" onClick={() => setIsCreateModalOpen(true)}>Add Subject?</button>
                            </div>
                        )}
                    </div>
                )}
            </>
        )}
      </div>

      <CreateSubjectModal
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSave={handleCreate} 
        isLoading={isCreating} 
      />

      <DeleteModal 
        isOpen={deleteModal.show} 
        onClose={() => setDeleteModal({...deleteModal, show: false})}
        onConfirm={handleDelete}
        title="Delete Subject"
        message="Are you sure you want to delete"
        itemName={deleteModal.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SubjectManager;