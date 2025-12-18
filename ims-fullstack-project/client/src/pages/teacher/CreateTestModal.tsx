// client/src/components/teacher/CreateTestModal.tsx
import React, { useState } from 'react';
import { FaTimes, FaLaptopCode, FaCheck } from 'react-icons/fa';
import type { SelectChangeEvent } from '@mui/material';
import CustomSelect from '../../components/common/CustomSelect';
import CustomDateTimePicker from '../../components/common/CustomDateTimePicker';
import './CreateTestModal.scss'; // Dedicated SCSS

// 1. Interfaces
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TestFormData) => Promise<void>;
  classes: ClassOption[]; 
  subjects: SubjectOption[]; 
  isLoading?: boolean; // Added prop for loading state
}

export const CreateTestModal: React.FC<Props> = ({ 
    isOpen, onClose, onSave, classes, subjects, isLoading = false 
}) => {
  const [formData, setFormData] = useState<TestFormData>({
    title: '', description: '', date: '', duration: 30, classId: '', subjectId: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    // Reset Form
    setFormData({ title: '', description: '', date: '', duration: 30, classId: '', subjectId: '' });
  };

  // --- Handlers ---

  // Handle Class Change (Reset subject when class changes)
  const handleClassChange = (e: SelectChangeEvent<string | number>) => {
    setFormData({ 
        ...formData, 
        classId: e.target.value as string, 
        subjectId: '' 
    });
  };

  // Handle Subject Change
  const handleSubjectChange = (e: SelectChangeEvent<string | number>) => {
    setFormData({ ...formData, subjectId: e.target.value as string });
  };

  // Handle Date Change
  const handleDateChange = (date: Date | null) => {
    if (date) {
        setFormData({ ...formData, date: date.toISOString() });
    } else {
        setFormData({ ...formData, date: '' });
    }
  };

  // --- Data Transformation ---

  const classOptions = classes.map(c => ({ value: c.id, label: c.name }));
  
  const filteredSubjects = subjects.filter(s => s.classId === formData.classId);
  
  const subjectOptions = filteredSubjects.map(s => ({ value: s.id, label: s.name }));

  return (
    <div className="test-modal-overlay">
      <div className="test-modal-container">
        
        {/* Header */}
        <div className="modal-header">
          <div className="header-title">
            <div className="icon-box">
              <FaLaptopCode />
            </div>
            <h3>Create Online Test</h3>
          </div>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-subtitle">Set up a new quiz or assessment for your students.</p>
            
            {/* Title Input */}
            <div className="form-group">
                <label>Test Title <span className="required">*</span></label>
                <input 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    placeholder="e.g. Weekly Quiz 1" 
                    autoFocus
                />
            </div>
            
            {/* Class & Subject Row */}
            <div className="form-row" style={{display:'flex', gap:'1rem'}}>
                <div className="form-group" style={{flex:1}}>
                    <CustomSelect
                        label="Class"
                        placeholder="Select Class"
                        value={formData.classId}
                        onChange={handleClassChange}
                        options={classOptions}
                        required={true}
                    />
                </div>
                <div className="form-group" style={{flex:1}}>
                    <CustomSelect
                        label="Subject"
                        placeholder={formData.classId ? "Select Subject" : "Select Class First"}
                        value={formData.subjectId}
                        onChange={handleSubjectChange}
                        options={subjectOptions}
                        disabled={!formData.classId}
                        required={true}
                    />
                </div>
            </div>

            {/* Date & Duration Row */}
            <div className="form-row" style={{display:'flex', gap:'1rem', alignItems: 'flex-start'}}>
                <div className="form-group" style={{flex:1}}>
                    <CustomDateTimePicker
                        label="Date & Time"
                        type="datetime"
                        value={formData.date ? new Date(formData.date) : null}
                        onChange={handleDateChange}
                        required={true}
                    />
                </div>
                <div className="form-group" style={{width:'130px'}}>
                    <label>Duration (Min) <span className="required">*</span></label>
                    <input 
                        type="number" 
                        required 
                        min="5" 
                        value={formData.duration} 
                        onChange={e => setFormData({...formData, duration: Number(e.target.value)})} 
                    />
                </div>
            </div>

            {/* Description */}
            <div className="form-group">
                <label>Description</label>
                <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    rows={2} 
                    placeholder="Instructions for students..."
                />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>Cancel</button>
            <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? 'Creating...' : <><FaCheck /> Create Test</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};