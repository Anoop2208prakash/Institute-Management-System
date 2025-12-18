// client/src/components/admin/CreateExamModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaClipboardList, FaCheck } from 'react-icons/fa';
import type { SelectChangeEvent } from '@mui/material';
import CustomSelect from '../../../components/common/CustomSelect';
import CustomDateTimePicker from '../../../components/common/CustomDateTimePicker';
import './CreateExamModal.scss'; // Dedicated SCSS

export interface ExamFormData {
  name: string;
  date: string;
  classId: string;
  subjectId: string;
  semesterId: string;
}

interface ClassOpt { id: string; name: string; section: string; }
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

  // Fetch Data (With Auth Header)
  useEffect(() => {
    if (isOpen) {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        Promise.all([
            fetch('http://localhost:5000/api/classes', { headers }).then(r => r.json()),
            fetch('http://localhost:5000/api/subjects', { headers }).then(r => r.json()),
            fetch('http://localhost:5000/api/semesters', { headers }).then(r => r.json())
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
  }, [formData.classId, formData.semesterId, allSubjects, allSemesters]); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setFormData({ name: '', date: '', classId: '', subjectId: '', semesterId: '' });
  };

  // --- Handlers ---
  const handleSelectChange = (field: keyof ExamFormData) => (e: SelectChangeEvent<string | number>) => {
    setFormData({ ...formData, [field]: e.target.value as string });
  };

  const handleClassChange = (e: SelectChangeEvent<string | number>) => {
    setFormData({ 
        ...formData, 
        classId: e.target.value as string, 
        subjectId: '', 
        semesterId: '' 
    });
  };

  const handleSemesterChange = (e: SelectChangeEvent<string | number>) => {
    setFormData({ 
        ...formData, 
        semesterId: e.target.value as string, 
        subjectId: '' // Clear subject on semester change
    });
  };

  const handleDateChange = (date: Date | null) => {
      if (date) {
          setFormData({ ...formData, date: date.toISOString() });
      } else {
          setFormData({ ...formData, date: '' });
      }
  };

  // --- Option Transforms ---
  const classOptions = classes.map(c => ({ 
      value: c.id, 
      label: `${c.name} ${c.section ? `- ${c.section}` : ''}` 
  }));

  const semesterOptions = filteredSemesters.map(s => ({ 
      value: s.id, 
      label: `${s.name} (${s.status})` 
  }));

  const subjectOptions = filteredSubjects.map(s => ({ 
      value: s.id, 
      label: `${s.name} (${s.code})` 
  }));

  if (!isOpen) return null;

  return (
    <div className="exam-modal-overlay">
      <div className="exam-modal-container">
        
        {/* Header */}
        <div className="modal-header">
          <div className="header-title">
            <div className="icon-box">
              <FaClipboardList />
            </div>
            <h3>Schedule Exam</h3>
          </div>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-subtitle">Create a new examination schedule for a specific class and subject.</p>
            
            {/* 1. Class Selection */}
            <div className="form-group">
                <CustomSelect
                    label="Class / Program"
                    placeholder="Select Class first..."
                    value={formData.classId}
                    onChange={handleClassChange}
                    options={classOptions}
                    required={true}
                />
            </div>

            {/* 2. Exam Name */}
            <div className="form-group">
                <label>Exam Name <span className="required">*</span></label>
                <input 
                    placeholder="e.g. Final Mathematics" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                    autoFocus
                />
            </div>
            
            {/* 3. Date & Time */}
            <div className="form-group">
                <CustomDateTimePicker
                    label="Exam Date & Time"
                    type="datetime"
                    value={formData.date ? new Date(formData.date) : null}
                    onChange={handleDateChange}
                    required={true}
                />
            </div>

            {/* 4. Semester & Subject (Side by Side) */}
            <div className="form-row" style={{display:'flex', gap:'1rem'}}>
                <div className="form-group" style={{flex:1}}>
                    <CustomSelect
                        label="Semester"
                        placeholder="Select..."
                        value={formData.semesterId}
                        onChange={handleSemesterChange}
                        options={semesterOptions}
                        disabled={!formData.classId}
                        required={true}
                    />
                </div>
                <div className="form-group" style={{flex:1}}>
                    <CustomSelect
                        label="Subject"
                        placeholder={filteredSubjects.length === 0 && formData.semesterId ? "No Subjects" : "Select..."}
                        value={formData.subjectId}
                        onChange={handleSelectChange('subjectId')}
                        options={subjectOptions}
                        disabled={!formData.classId}
                        required={true}
                    />
                </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? 'Scheduling...' : <><FaCheck /> Schedule Exam</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};