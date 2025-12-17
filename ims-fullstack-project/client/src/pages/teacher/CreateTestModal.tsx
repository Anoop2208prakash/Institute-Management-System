// client/src/components/teacher/CreateTestModal.tsx
import React, { useState } from 'react';
import { FaTimes, FaLaptopCode } from 'react-icons/fa';
import '../admin/CreateRoleModal.scss'; 
import type { SelectChangeEvent } from '@mui/material';
import CustomSelect from '../../components/common/CustomSelect';
import CustomDateTimePicker from '../../components/common/CustomDateTimePicker';

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
}

export const CreateTestModal: React.FC<Props> = ({ isOpen, onClose, onSave, classes, subjects }) => {
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

  // --- Data Transformation for Custom Inputs ---

  // 1. Map Classes to Options
  const classOptions = classes.map(c => ({ 
      value: c.id, 
      label: c.name 
  }));

  // 2. Filter Subjects based on selected Class
  const filteredSubjects = subjects.filter(s => s.classId === formData.classId);
  
  // 3. Map Filtered Subjects to Options
  const subjectOptions = filteredSubjects.map(s => ({
      value: s.id,
      label: s.name
  }));

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3><FaLaptopCode /> Create Online Test</h3>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* Title Input */}
            <div className="form-group">
                <label>Title <span className="required">*</span></label>
                <input 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    placeholder="e.g. Weekly Quiz 1" 
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
                <div className="form-group" style={{width:'120px'}}>
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
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};