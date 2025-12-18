// client/src/components/teacher/AddQuestionsStepper.tsx
import React, { useState } from 'react';
import { FaQuestionCircle, FaCheck, FaTrash, FaPlus } from 'react-icons/fa';
import '../admin/CreateRoleModal.scss'; 
import './AddQuestionsStepper.scss'; 

interface QuestionData {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: number;
  marks: number;
}

export interface QuestionPayload {
  questionText: string;
  options: string[];
  correctOption: number;
  marks: number;
}

type OptionKey = 'optionA' | 'optionB' | 'optionC' | 'optionD';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
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

  const handleChange = (field: keyof QuestionData, value: string | number) => {
    const updatedQuestions = [...questions];
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
      <div className="modal-container quiz-modal"> 
        
        {/* Header */}
        <div className="stepper-header">
            <div className="title-section">
                <h3><FaQuestionCircle /> Quiz Creator</h3>
                <span className="subtitle">Add questions for your test</span>
            </div>
            <div className="progress-badge">
                Question {activeStep + 1} / 10
            </div>
        </div>

        <div className="stepper-body">
            {/* Sidebar (Desktop) */}
            <div className="step-sidebar">
                <div className="sidebar-title">Question List</div>
                <div className="questions-list">
                    {questions.map((q, idx) => (
                        <div 
                            key={idx} 
                            className={`step-item ${idx === activeStep ? 'active' : ''} ${isQuestionFilled(idx) ? 'completed' : ''}`}
                            onClick={() => jumpToStep(idx)}
                        >
                            <div className="step-indicator">
                                {isQuestionFilled(idx) ? <FaCheck /> : `Q${idx + 1}`}
                            </div>
                            <div className="step-info">
                                <span className="q-label">Question {idx + 1}</span>
                                <span className="q-preview">
                                    {q.questionText ? q.questionText.substring(0, 15) + '...' : 'Empty'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="step-content">
                <div className="question-editor">
                    
                    {/* Question Header & Marks */}
                    <div className="editor-top-row">
                        <label className="section-label">Question Text</label>
                        <div className="marks-wrapper">
                            <label>Marks:</label>
                            <input 
                                type="number" 
                                min="1" 
                                max="100"
                                value={currentQ.marks} 
                                onChange={e => handleChange('marks', Number(e.target.value))} 
                            />
                        </div>
                    </div>

                    <textarea 
                        className="question-input"
                        placeholder="Type your question here..." 
                        value={currentQ.questionText} 
                        onChange={e => handleChange('questionText', e.target.value)}
                        autoFocus
                    />

                    <div className="divider"></div>

                    <label className="section-label">Answer Options <span className="hint">(Click circle to mark correct answer)</span></label>
                    
                    <div className="options-grid">
                        {optionFields.map((opt) => (
                            <div 
                                className={`option-card ${currentQ.correctOption === opt.idx ? 'correct' : ''}`} 
                                key={opt.key}
                            >
                                <div className="card-header-row">
                                    <span className="opt-badge">{String.fromCharCode(65 + opt.idx)}</span>
                                    <div 
                                        className="radio-check"
                                        onClick={() => handleChange('correctOption', opt.idx)}
                                        title="Mark as Correct Answer"
                                    >
                                        {currentQ.correctOption === opt.idx && <FaCheck />}
                                    </div>
                                </div>
                                <input 
                                    value={currentQ[opt.key]} 
                                    onChange={e => handleChange(opt.key, e.target.value)} 
                                    placeholder={`Type answer for ${opt.label}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="stepper-footer">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>

            <div className="nav-actions">
                <button className="btn-nav prev" onClick={handlePrev} disabled={activeStep === 0 || isSubmitting}>
                    Previous
                </button>
                
                {activeStep < 9 ? (
                    <button className="btn-nav next" onClick={handleNext}>
                        Next Question
                    </button>
                ) : (
                    <button className="btn-nav finish" onClick={handleFinish} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Finish & Save'}
                    </button>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};