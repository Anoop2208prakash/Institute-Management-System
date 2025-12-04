// client/src/components/admin/CreateExamModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaClipboardList } from 'react-icons/fa';
import './CreateRoleModal.scss'; 

export interface ExamFormData {
  name: string;
  date: string;
  classId: string;
  subjectId: string;
  semesterId: string;
}

interface ClassOpt { id: string; name: string; section: string; }
// Updated Interface with semesterId
interface SubjectOpt { id: string; name: string; code: string; classId: string; semesterId?: string; }
interface SemesterOpt { id: string; name: string; status: string; classId: string; }

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExamFormData) => Promise<void>;
  isLoading: boolean;
}

export const CreateExamModal: React.FC<CreateExamModalProps> = ({
  isOpen, onClose, onSave, isLoading
}) => {
  const [formData, setFormData] = useState<ExamFormData>({ 
    name: '', date: '', classId: '', subjectId: '', semesterId: '' 
  });

  const [classes, setClasses] = useState<ClassOpt[]>([]);
  const [allSubjects, setAllSubjects] = useState<SubjectOpt[]>([]);
  const [allSemesters, setAllSemesters] = useState<SemesterOpt[]>([]);

  const [filteredSubjects, setFilteredSubjects] = useState<SubjectOpt[]>([]);
  const [filteredSemesters, setFilteredSemesters] = useState<SemesterOpt[]>([]);

  // Fetch Data
  useEffect(() => {
    if (isOpen) {
        Promise.all([
            fetch('http://localhost:5000/api/classes').then(r => r.json()),
            fetch('http://localhost:5000/api/subjects').then(r => r.json()),
            fetch('http://localhost:5000/api/semesters').then(r => r.json())
        ]).then(([cls, sub, sem]) => {
            if(Array.isArray(cls)) setClasses(cls as ClassOpt[]);
            if(Array.isArray(sub)) setAllSubjects(sub as SubjectOpt[]);
            if(Array.isArray(sem)) setAllSemesters(sem as SemesterOpt[]);
        }).catch(console.error);
    }
  }, [isOpen]);

  // Filter Logic
  useEffect(() => {
      if (formData.classId) {
          // 1. Filter Semesters by Class
          const validSemesters = allSemesters.filter(s => s.classId === formData.classId);
          setFilteredSemesters(validSemesters);

          // 2. Filter Subjects
          let validSubjects = allSubjects.filter(s => s.classId === formData.classId);
          
          // 3. If Semester is selected, filter subjects belonging to that semester
          if (formData.semesterId) {
              validSubjects = validSubjects.filter(s => s.semesterId === formData.semesterId);
          }
          
          setFilteredSubjects(validSubjects);
      } else {
          setFilteredSubjects([]);
          setFilteredSemesters([]);
      }
  }, [formData.classId, formData.semesterId, allSubjects, allSemesters]); // Dependent on semesterId too

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setFormData({ name: '', date: '', classId: '', subjectId: '', semesterId: '' });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3><FaClipboardList /> Schedule Exam</h3>
          <button className="close-btn" onClick={onClose} disabled={isLoading}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            <div className="form-group">
                <label>Class / Program <span className="required">*</span></label>
                <select 
                    style={{padding:'0.75rem', borderRadius:'6px', border:'1px solid var(--form-input-border-color)', background:'var(--bg-color)', color:'var(--font-color)'}}
                    value={formData.classId}
                    onChange={e => setFormData({...formData, classId: e.target.value, subjectId: '', semesterId: ''})}
                    required
                    autoFocus
                >
                    <option value="">Select Class first...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section ? `- ${c.section}` : ''}</option>)}
                </select>
            </div>

            <div className="form-group">
                <label>Exam Name <span className="required">*</span></label>
                <input 
                    placeholder="e.g. Final Mathematics" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                />
            </div>
            
            <div className="form-group">
                <label>Date <span className="required">*</span></label>
                <input 
                    type="datetime-local"
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                    required 
                />
            </div>

            <div className="form-row" style={{display:'flex', gap:'1rem'}}>
                <div className="form-group" style={{flex:1}}>
                    <label>Semester</label>
                    <select 
                        style={{padding:'0.75rem', borderRadius:'6px', border:'1px solid var(--form-input-border-color)', background:'var(--bg-color)', color:'var(--font-color)'}}
                        value={formData.semesterId}
                        onChange={e => setFormData({...formData, semesterId: e.target.value, subjectId: ''})} // Clear subject on semester change
                        required
                        disabled={!formData.classId}
                    >
                        <option value="">Select...</option>
                        {filteredSemesters.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                        ))}
                    </select>
                </div>
                <div className="form-group" style={{flex:1}}>
                    <label>Subject</label>
                    <select 
                        style={{padding:'0.75rem', borderRadius:'6px', border:'1px solid var(--form-input-border-color)', background:'var(--bg-color)', color:'var(--font-color)'}}
                        value={formData.subjectId}
                        onChange={e => setFormData({...formData, subjectId: e.target.value})}
                        required
                        disabled={!formData.classId}
                    >
                        <option value="">Select...</option>
                        {filteredSubjects.length === 0 && formData.semesterId && <option disabled>No subjects in this semester</option>}
                        {filteredSubjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                        ))}
                    </select>
                </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={isLoading}>{isLoading ? 'Scheduling...' : 'Schedule Exam'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};