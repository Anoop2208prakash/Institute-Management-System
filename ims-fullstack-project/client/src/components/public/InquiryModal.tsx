// client/src/components/public/InquiryModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import FeedbackAlert from '../common/FeedbackAlert'; // <--- Import FeedbackAlert
import { type AlertColor } from '@mui/material/Alert'; // <--- Import Type
import './InquiryModal.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ClassOption {
    id: string;
    name: string;
}

export const InquiryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', course: '', message: '' });
  const [errors, setErrors] = useState({ fullName: '', email: '', phone: '', course: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);

  // --- ALERT STATE ---
  const [alertInfo, setAlertInfo] = useState<{show: boolean, type: AlertColor, msg: string}>({ 
    show: false, type: 'success', msg: '' 
  });

  const showAlert = (type: AlertColor, msg: string) => {
    setAlertInfo({ show: true, type, msg });
    // Auto-hide after 3 seconds
    setTimeout(() => setAlertInfo(prev => ({ ...prev, show: false })), 3000);
  };

  // 1. Fetch Classes
  useEffect(() => {
    if (isOpen) { 
        const fetchClasses = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/classes');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) setClasses(data);
                }
            } catch (e) {
                console.error("Failed to load courses", e);
            }
        };
        fetchClasses();
    }
  }, [isOpen]);

  // 2. Lock Body Scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  // --- VALIDATION LOGIC ---
  const validate = () => {
      let isValid = true;
      const newErrors = { fullName: '', email: '', phone: '', course: '', message: '' };

      if (!formData.fullName.trim()) {
          newErrors.fullName = 'Full Name is required';
          isValid = false;
      }

      if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
          isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email';
          isValid = false;
      }

      if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
          isValid = false;
      } else if (!/^\d{10,15}$/.test(formData.phone.replace(/[^0-9]/g, ''))) { 
          newErrors.phone = 'Invalid phone number';
          isValid = false;
      }

      if (!formData.message.trim()) {
          newErrors.message = 'Please enter your message';
          isValid = false;
      }

      setErrors(newErrors);
      return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      
      if (errors[name as keyof typeof errors]) {
          setErrors(prev => ({ ...prev, [name]: '' }));
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return; 

    setLoading(true);
    try {
        const res = await fetch('http://localhost:5000/api/inquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if(res.ok) {
            showAlert('success', 'Thank you! Your inquiry has been sent.');
            setFormData({ fullName: '', email: '', phone: '', course: '', message: '' });
            setErrors({ fullName: '', email: '', phone: '', course: '', message: '' });
            // Delay close to show alert
            setTimeout(onClose, 2000);
        } else {
            showAlert('error', 'Failed to send inquiry.');
        }
    } catch(e) {
        console.error(e);
        showAlert('error', 'Network error.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="inquiry-overlay" onClick={onClose}>
      
      {/* Feedback Alert Component */}
      <FeedbackAlert 
        isOpen={alertInfo.show} 
        type={alertInfo.type} 
        message={alertInfo.msg} 
        onClose={() => setAlertInfo({ ...alertInfo, show: false })}
      />

      <div className="inquiry-card" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h3>Admission Inquiry</h3>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>
        
        <div className="modal-body">
            <form onSubmit={handleSubmit}>
                
                <div className="form-group">
                    <label>Full Name <span className="req">*</span></label>
                    <input 
                        name="fullName" 
                        placeholder="Enter your name" 
                        value={formData.fullName} 
                        onChange={handleChange} 
                        className={errors.fullName ? 'input-error' : ''}
                    />
                    {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                    <label>Email Address <span className="req">*</span></label>
                    <input 
                        name="email" 
                        type="email" 
                        placeholder="name@example.com" 
                        value={formData.email} 
                        onChange={handleChange}
                        className={errors.email ? 'input-error' : ''}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label>Phone Number <span className="req">*</span></label>
                    <input 
                        name="phone" 
                        type="tel" 
                        placeholder="+91 98765 43210" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        className={errors.phone ? 'input-error' : ''}
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
                
                <div className="form-group">
                    <label>Interested Course</label>
                    <select 
                        name="course" 
                        value={formData.course} 
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="">Select Course...</option>
                        {classes.length > 0 ? (
                            classes.map(cls => (
                                <option key={cls.id} value={cls.name}>{cls.name}</option>
                            ))
                        ) : (
                            <option disabled>Loading courses...</option>
                        )}
                    </select>
                </div>
                
                <div className="form-group">
                    <label>Message <span className="req">*</span></label>
                    <textarea 
                        name="message" 
                        placeholder="How can we help you?" 
                        rows={3} 
                        value={formData.message} 
                        onChange={handleChange}
                        className={errors.message ? 'input-error' : ''}
                    />
                    {errors.message && <span className="error-text">{errors.message}</span>}
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Submit Inquiry'} <FaPaperPlane style={{marginLeft:'8px'}}/>
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};