// client/src/pages/admin/AdmissionList.tsx
import React, { useEffect, useState } from 'react';
import { FaUserGraduate, FaSearch, FaPhone, FaEnvelope, FaIdBadge } from 'react-icons/fa';
import '../StaffList.scss'; // Reusing the grid styles for consistency

// 1. Define the Student Interface (Matches Backend Response)
interface Student {
  id: string;
  admissionNo: string;
  name: string;
  email: string;
  class: string;
  phone: string | null;
  avatar: string | null;
  gender: string;
}

const AdmissionList: React.FC = () => {
  // 2. Use the Type in useState
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/students');
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (error) {
        console.error("Failed to fetch students", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // 3. Filter Logic
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="staff-page">
        {/* Header */}
        <div className="page-header">
            <div className="header-title">
                <h2><FaUserGraduate /> Student Admissions</h2>
                <p>Total Admitted: {students.length}</p>
            </div>
            
            {/* Search Box */}
            <div className="toolbar">
                <div className="search-box">
                    <FaSearch />
                    <input 
                        type="text" 
                        placeholder="Search by Name or ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </div>

        {/* Grid */}
        <div className="staff-grid">
            {loading ? (
                <p>Loading students...</p>
            ) : filteredStudents.length > 0 ? (
                filteredStudents.map(s => (
                    <div key={s.id} className="staff-card">
                        <div className="card-header">
                            <img 
                                src={s.avatar ? `http://localhost:5000${s.avatar}` : `https://ui-avatars.com/api/?name=${s.name}&background=random`} 
                                className="avatar" 
                                alt={s.name} 
                            />
                            <span className="role-tag" style={{backgroundColor: '#6f42c1'}}>
                                {s.class}
                            </span>
                        </div>
                        
                        <div className="card-body">
                            <h3>{s.name}</h3>
                            <div className="info-row">
                                <FaIdBadge /> <span>ID: {s.admissionNo}</span>
                            </div>
                            <div className="info-row">
                                <FaEnvelope /> <span>{s.email}</span>
                            </div>
                            <div className="info-row">
                                <FaPhone /> <span>{s.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p>No students found.</p>
            )}
        </div>
    </div>
  );
};

export default AdmissionList;