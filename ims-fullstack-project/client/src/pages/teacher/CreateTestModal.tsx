// client/src/components/teacher/CreateTestModal.tsx
import React, { useState } from 'react';
import { FaTimes, FaLaptopCode } from 'react-icons/fa';
import '../admin/CreateRoleModal.scss'; // Reuse styles

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
  classId: string; // Needed for filtering
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TestFormData) => Promise<void>;
  classes: ClassOption[]; // Fixed Type
  subjects: SubjectOption[]; // Fixed Type
}

export const CreateTestModal: React.FC<Props> = ({ isOpen, onClose, onSave, classes, subjects }) => {
  const [formData, setFormData] = useState<TestFormData>({
    title: '', description: '', date: '', duration: 30, classId: '', subjectId: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setFormData({ title: '', description: '', date: '', duration: 30, classId: '', subjectId: '' });
  };

  // Filter subjects based on selected class
  const filteredSubjects = subjects.filter(s => s.classId === formData.classId);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3><FaLaptopCode /> Create Online Test</h3>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
                <label>Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Weekly Quiz 1" />
            </div>
            
            <div className="form-row" style={{display:'flex', gap:'1rem'}}>
                <div className="form-group" style={{flex:1}}>
                    <label>Class</label>
                    <select required value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} style={{padding:'0.75rem', borderRadius:'6px', border:'1px solid var(--form-input-border-color)', background:'var(--bg-color)', color:'var(--font-color)'}}>
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="form-group" style={{flex:1}}>
                    <label>Subject</label>
                    <select required value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})} disabled={!formData.classId} style={{padding:'0.75rem', borderRadius:'6px', border:'1px solid var(--form-input-border-color)', background:'var(--bg-color)', color:'var(--font-color)'}}>
                        <option value="">Select Subject</option>
                        {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="form-row" style={{display:'flex', gap:'1rem'}}>
                <div className="form-group" style={{flex:1}}>
                    <label>Date & Time</label>
                    <input type="datetime-local" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="form-group" style={{width:'100px'}}>
                    <label>Duration (Min)</label>
                    <input type="number" required min="5" value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} />
                </div>
            </div>
            <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} />
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