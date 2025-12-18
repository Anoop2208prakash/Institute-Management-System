// client/src/components/common/InquiryModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import { type AlertColor } from '@mui/material/Alert';
import CustomSelect from './CustomSelect'; 
import type { SelectChangeEvent } from '@mui/material';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  showAlert: (type: AlertColor, msg: string) => void;
}

interface ClassData {
  id: string;
  name: string;
}

const InquiryModal: React.FC<InquiryModalProps> = ({ isOpen, onClose, showAlert }) => {
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    phone: '', 
    course: '', 
    message: '' 
  });
  
  const [courseOptions, setCourseOptions] = useState<{value: string, label: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Courses
  useEffect(() => {
    if (isOpen) {
      const fetchCourses = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/classes'); 
          if (res.ok) {
            const data: ClassData[] = await res.json();
            const options = data.map(c => ({
              value: c.name, 
              label: c.name 
            }));
            setCourseOptions(options);
          }
        } catch (error) {
          console.error("Failed to load courses", error);
        }
      };
      fetchCourses();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCourseChange = (e: SelectChangeEvent<string | number>) => {
    setFormData({ ...formData, course: e.target.value as string });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // 1. CRITICAL: Prevent Default Page Reload
    e.preventDefault();
    e.stopPropagation(); 

    setIsSubmitting(true);
    
    try {
        const res = await fetch('http://localhost:5000/api/inquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (res.ok) {
            // 2. Show Alert BEFORE closing
            showAlert('success', data.message || 'Inquiry sent successfully!');
            setFormData({ fullName: '', email: '', phone: '', course: '', message: '' }); 
            onClose(); 
        } else {
            showAlert('error', data.message || data.error || 'Failed to send inquiry.');
        }
    } catch (error) {
        console.error("Inquiry Error:", error);
        showAlert('error', "Network error. Please try again later.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Contact Us / Inquiry</h3>
          <button type="button" className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
                <label>Full Name <span style={{color:'var(--font-color-danger)'}}>*</span></label>
                <input 
                    type="text" 
                    required 
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Enter your full name"
                />
            </div>
            
            <div style={{display:'flex', gap:'1rem'}}>
                <div className="form-group" style={{flex:1}}>
                    <label>Email <span style={{color:'var(--font-color-danger)'}}>*</span></label>
                    <input 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="name@example.com"
                    />
                </div>
                <div className="form-group" style={{flex:1}}>
                    <label>Phone <span style={{color:'var(--font-color-danger)'}}>*</span></label>
                    <input 
                        type="tel" 
                        required 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        placeholder="Contact number"
                    />
                </div>
            </div>

            <div className="form-group">
                <CustomSelect
                    label="Course of Interest (Optional)"
                    placeholder="Select a Course/Program..."
                    value={formData.course}
                    onChange={handleCourseChange}
                    options={courseOptions}
                    required={false}
                />
            </div>

            <div className="form-group">
                <label>Message / Query <span style={{color:'var(--font-color-danger)'}}>*</span></label>
                <textarea 
                    rows={3}
                    required 
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    placeholder="How can we help you?"
                />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
               {isSubmitting ? 'Sending...' : <><FaPaperPlane /> Send Inquiry</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InquiryModal;