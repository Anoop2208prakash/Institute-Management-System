// client/src/components/teacher/TeacherSubjectActionModal.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaCheckSquare, FaPenNib, FaArrowRight } from 'react-icons/fa';
import '../admin/CreateRoleModal.scss'; // Reuse generic modal styles

interface SubjectData {
    subjectId: string;
    subjectName: string;
    classId: string;
    className: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectData | null;
}

export const TeacherSubjectActionModal: React.FC<Props> = ({ isOpen, onClose, subject }) => {
  const navigate = useNavigate();

  if (!isOpen || !subject) return null;

  const handleNavigate = (path: string) => {
    // Navigate with state to potentially pre-fill the destination page
    navigate(path, { 
        state: { 
            prefillClassId: subject.classId, 
            prefillSubjectId: subject.subjectId 
        } 
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{maxWidth: '500px'}}>
        <div className="modal-header">
          <h3>{subject.subjectName} <span style={{fontSize:'0.8em', color:'var(--text-muted-color)', fontWeight:'normal'}}>({subject.className})</span></h3>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="modal-body" style={{padding: '2rem 1.5rem'}}>
            <div style={{display: 'grid', gap: '1.5rem'}}>
                
                {/* Button 1: Attendance */}
                <div 
                    onClick={() => handleNavigate('/attendance')}
                    style={{
                        background: 'var(--card-bg-default)',
                        border: '1px solid var(--border-light-color)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        transition: 'all 0.2s',
                        boxShadow: 'var(--box-shadow-1)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#1a7f37'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-light-color)'}
                >
                    <div style={{
                        width: '50px', height: '50px', borderRadius: '10px',
                        background: 'rgba(26, 127, 55, 0.1)', color: '#1a7f37',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                    }}>
                        <FaCheckSquare />
                    </div>
                    <div style={{flex: 1}}>
                        <h4 style={{margin: '0 0 5px 0', fontSize: '1.1rem', color: 'var(--heading-color)'}}>Attendance</h4>
                        <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-muted-color)'}}>Mark present/absent for this class.</p>
                    </div>
                    <FaArrowRight style={{color: 'var(--text-muted-color)'}} />
                </div>

                {/* Button 2: Test / Marks */}
                <div 
                    onClick={() => handleNavigate('/enter-marks')}
                    style={{
                        background: 'var(--card-bg-default)',
                        border: '1px solid var(--border-light-color)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        transition: 'all 0.2s',
                        boxShadow: 'var(--box-shadow-1)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#d29922'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-light-color)'}
                >
                    <div style={{
                        width: '50px', height: '50px', borderRadius: '10px',
                        background: 'rgba(210, 153, 34, 0.1)', color: '#d29922',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                    }}>
                        <FaPenNib />
                    </div>
                    <div style={{flex: 1}}>
                        <h4 style={{margin: '0 0 5px 0', fontSize: '1.1rem', color: 'var(--heading-color)'}}>Test / Marks</h4>
                        <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-muted-color)'}}>Enter marks for exams.</p>
                    </div>
                    <FaArrowRight style={{color: 'var(--text-muted-color)'}} />
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};