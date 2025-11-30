// client/src/components/admin/CreateExamModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaClipboardList } from 'react-icons/fa';
import './CreateRoleModal.scss'; // Reusing styles

// Interfaces for Dropdown Data
interface ClassOpt { id: string; name: string; section: string; }
interface SubjectOpt { id: string; name: string; code: string; }
interface SemesterOpt { id: string; name: string; status: string; }

// Form Data Interface
export interface ExamFormData {
  name: string;
  date: string;
  classId: string;
  subjectId: string;
  semesterId: string;
}

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
  const [subjects, setSubjects] = useState<SubjectOpt[]>([]);
  const [semesters, setSemesters] = useState<SemesterOpt[]>([]);

  // Fetch Dependencies
  useEffect(() => {
    if (isOpen) {
        Promise.all([
            fetch('http://localhost:5000/api/classes').then(r => r.json()),
            fetch('http://localhost:5000/api/subjects').then(r => r.json()),
            fetch('http://localhost:5000/api/semesters').then(r => r.json())
        ]).then(([clsData, subData, semData]) => {
            if(Array.isArray(clsData)) setClasses(clsData);
            if(Array.isArray(subData)) setSubjects(subData);
            if(Array.isArray(semData)) setSemesters(semData);
        }).catch(console.error);
    }
  }, [isOpen]);

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
                <label>Exam Name <span className="required">*</span></label>
                <input 
                    placeholder="e.g. Final Mathematics" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required autoFocus 
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
                        onChange={e => setFormData({...formData, semesterId: e.target.value})}
                        required
                    >
                        <option value="">Select Semester...</option>
                        {semesters.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
                    </select>
                </div>
                <div className="form-group" style={{flex:1}}>
                    <label>Class</label>
                    <select 
                        style={{padding:'0.75rem', borderRadius:'6px', border:'1px solid var(--form-input-border-color)', background:'var(--bg-color)', color:'var(--font-color)'}}
                        value={formData.classId}
                        onChange={e => setFormData({...formData, classId: e.target.value})}
                        required
                    >
                        <option value="">Select Class...</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label>Subject</label>
                <select 
                    style={{padding:'0.75rem', borderRadius:'6px', border:'1px solid var(--form-input-border-color)', background:'var(--bg-color)', color:'var(--font-color)'}}
                    value={formData.subjectId}
                    onChange={e => setFormData({...formData, subjectId: e.target.value})}
                    required
                >
                    <option value="">Select Subject...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
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