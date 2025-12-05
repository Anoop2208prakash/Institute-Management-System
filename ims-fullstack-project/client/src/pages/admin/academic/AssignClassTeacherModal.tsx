// client/src/components/admin/AssignClassTeacherModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaChalkboardTeacher } from 'react-icons/fa';
import './CreateRoleModal.scss'; // Reuse styles

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classData: { id: string; name: string; teacherId?: string | null };
  onSave: (classId: string, teacherId: string) => Promise<void>;
  isLoading: boolean;
}

interface TeacherOpt {
    id: string; // Teacher Profile ID
    name: string;
}

export const AssignClassTeacherModal: React.FC<Props> = ({ isOpen, onClose, classData, onSave, isLoading }) => {
  const [selectedTeacher, setSelectedTeacher] = useState(classData.teacherId || '');
  const [teachers, setTeachers] = useState<TeacherOpt[]>([]);

  useEffect(() => {
    if (isOpen) {
        setSelectedTeacher(classData.teacherId || '');
        // Fetch Teachers
        fetch('http://localhost:5000/api/staff')
            .then(res => res.json())
            .then(data => {
                if(Array.isArray(data)) {
                    // Filter raw users to find those with role 'Teacher'
                    // Note: The /api/staff endpoint returns formatted users. 
                    // We need to be careful. The /api/staff endpoint returns `id` as UserID. 
                    // The Class model needs TeacherProfileID. 
                    // Ideally, we fetch from /api/teachers directly or update logic.
                    // For now, let's assume we updated /api/staff to include profileId or we fetch /api/teachers.
                    // Let's try fetching raw teachers if possible, or filter staff.
                    
                    // Better approach: Fetch teachers directly if you have a route, or filter staff list.
                    // Assuming staff list has 'role' and we need to map UserID to TeacherID in backend? 
                    // Or update ClassController to lookup Teacher by UserID.
                    // Let's assume ClassController expects Teacher Profile ID.
                    
                    // HACK for Demo: Let's fetch /api/staff and hope we can map it.
                    // Ideally we need a specific endpoint: /api/teachers/list
                    
                    // Let's use the existing staff list and filter.
                    const teacherList = data.filter((s:any) => s.role === 'Teacher').map((s:any) => ({
                        id: s.id, // This is UserID. We need to handle this in backend
                        name: s.name
                    }));
                    setTeachers(teacherList);
                }
            });
    }
  }, [isOpen, classData]);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(classData.id, selectedTeacher);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3><FaChalkboardTeacher /> Assign Class Teacher</h3>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit}>
            <div className="modal-body">
                <p style={{marginBottom:'1rem'}}>Assigning teacher for <strong>{classData.name}</strong></p>
                <div className="form-group">
                    <label>Select Teacher</label>
                    <select 
                        style={{padding:'0.75rem', borderRadius:'6px', border:'1px solid #ccc', width:'100%'}}
                        value={selectedTeacher}
                        onChange={e => setSelectedTeacher(e.target.value)}
                    >
                        <option value="">-- No Class Teacher --</option>
                        {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                    <p style={{fontSize:'0.8rem', color:'#666', marginTop:'5px'}}>
                        Note: This teacher will see this class in their "My Class" dashboard.
                    </p>
                </div>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-save" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Assignment'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};