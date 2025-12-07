// client/src/components/teacher/AddQuestionsStepper.tsx
import React, { useState } from 'react';
import { FaQuestionCircle, FaCheck } from 'react-icons/fa';
import '../admin/CreateRoleModal.scss'; // Container logic
import './AddQuestionsStepper.scss'; // New Styles

// Interface for internal state (form fields)
interface QuestionData {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: number;
  marks: number;
}

// Interface for data sent to backend (API payload)
export interface QuestionPayload {
  questionText: string;
  options: string[];
  correctOption: number;
  marks: number;
}

// Helper type for mapping options
type OptionKey = 'optionA' | 'optionB' | 'optionC' | 'optionD';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  // FIX 1: Replace 'any[]' with strict type
  onSave: (questions: QuestionPayload[]) => Promise<void>;
}

const INITIAL_QUESTION: QuestionData = {
  questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 0, marks: 1
};

export const AddQuestionsStepper: React.FC<Props> = ({ isOpen, onClose, examId, onSave }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [questions, setQuestions] = useState<QuestionData[]>(Array(10).fill(INITIAL_QUESTION));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // FIX 2: Replace 'any' with 'string | number'
  const handleChange = (field: keyof QuestionData, value: string | number) => {
    const updatedQuestions = [...questions];
    // We need to ensure the value type matches the field type, or cast carefully
    updatedQuestions[activeStep] = { ...updatedQuestions[activeStep], [field]: value };
    setQuestions(updatedQuestions);
  };

  const handleNext = () => { if (activeStep < 9) setActiveStep(prev => prev + 1); };
  const handlePrev = () => { if (activeStep > 0) setActiveStep(prev => prev - 1); };
  const jumpToStep = (idx: number) => setActiveStep(idx);

  const handleFinish = async () => {
    const validQuestions = questions.filter(q => q.questionText.trim() !== '');
    if (validQuestions.length === 0) {
        alert("Please add at least one question.");
        return;
    }
    setIsSubmitting(true);
    
    // Transform internal state to API payload structure
    const payload: QuestionPayload[] = validQuestions.map(q => ({
        questionText: q.questionText,
        options: [q.optionA, q.optionB, q.optionC, q.optionD],
        correctOption: q.correctOption,
        marks: q.marks
    }));

    await onSave({ examId, questions: payload } as any);
    setIsSubmitting(false);
    setQuestions(Array(10).fill(INITIAL_QUESTION));
    setActiveStep(0);
  };

  const currentQ = questions[activeStep];
  const isQuestionFilled = (idx: number) => questions[idx].questionText.trim() !== '';

  const optionFields: { key: OptionKey; label: string; idx: number }[] = [
      { key: 'optionA', label: 'Option A', idx: 0 },
      { key: 'optionB', label: 'Option B', idx: 1 },
      { key: 'optionC', label: 'Option C', idx: 2 },
      { key: 'optionD', label: 'Option D', idx: 3 }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-container"> 
        
        <div className="stepper-header">
            <h3><FaQuestionCircle /> Quiz Creator Wizard</h3>
        </div>

        <div className="stepper-body">
            {/* Sidebar Navigation */}
            <div className="step-sidebar">
                {questions.map((q, idx) => (
                    <div 
                        key={idx} 
                        className={`step-item ${idx === activeStep ? 'active' : ''} ${isQuestionFilled(idx) ? 'completed' : ''}`}
                        onClick={() => jumpToStep(idx)}
                    >
                        <div className="circle">{isQuestionFilled(idx) ? <FaCheck /> : idx + 1}</div>
                        <span>Question {idx + 1}</span>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="step-content">
                <div className="question-editor">
                    <div className="form-group">
                        <label>Question Text (Q{activeStep+1})</label>
                        <textarea 
                            placeholder="Type your question here..." 
                            value={currentQ.questionText} 
                            onChange={e => handleChange('questionText', e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="options-container">
                        {optionFields.map((opt) => (
                            <div className="option-box" key={opt.key}>
                                <div 
                                    className={`radio-check ${currentQ.correctOption === opt.idx ? 'selected' : ''}`}
                                    onClick={() => handleChange('correctOption', opt.idx)}
                                    title="Mark as Correct Answer"
                                ></div>
                                <input 
                                    value={currentQ[opt.key]} 
                                    onChange={e => handleChange(opt.key, e.target.value)} 
                                    placeholder={opt.label}
                                    className={currentQ.correctOption === opt.idx ? 'correct' : ''}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="marks-input">
                        <label>Points for this question:</label>
                        <input 
                            type="number" min="1" 
                            value={currentQ.marks} 
                            onChange={e => handleChange('marks', Number(e.target.value))} 
                        />
                    </div>
                </div>
            </div>
        </div>

        <div className="stepper-footer">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>

            <div style={{display:'flex', gap:'1rem'}}>
                <button className="btn-nav prev" onClick={handlePrev} disabled={activeStep === 0 || isSubmitting}>
                    Previous
                </button>
                
                {activeStep < 9 ? (
                    <button className="btn-nav next" onClick={handleNext}>
                        Next Question
                    </button>
                ) : (
                    <button className="btn-nav finish" onClick={handleFinish} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Finish & Save All'}
                    </button>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};