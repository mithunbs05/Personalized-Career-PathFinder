import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';
import { Topic, Assessment, Question } from '../../types/roadmap';

interface PracticeAndAssessmentProps {
  mode: 'PRACTICE' | 'ASSESSMENT' | 'RESULT';
  topic: Topic;
  assessment: Assessment;
  onFinishPractice: () => void;
  onCompleteAssessment: (score: number) => void;
  onRetake: () => void;
  onReviewMaterial: () => void;
  onNextTopic: () => void;
}

export const PracticeAndAssessment: React.FC<PracticeAndAssessmentProps> = ({
  mode,
  topic,
  assessment,
  onFinishPractice,
  onCompleteAssessment,
  onRetake,
  onReviewMaterial,
  onNextTopic,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // For Assessment
  const [answers, setAnswers] = useState<Record<number, number>>({});
  
  const currentQuestion = assessment.questions[currentIndex];

  const handlePracticeSubmit = () => {
    setShowExplanation(true);
  };

  const handlePracticeNext = () => {
    if (currentIndex < assessment.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      onFinishPractice();
    }
  };

  const handleAssessmentNext = () => {
    if (selectedOption !== null) {
      setAnswers(prev => ({ ...prev, [currentIndex]: selectedOption }));
    }
    
    if (currentIndex < assessment.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(answers[currentIndex + 1] ?? null);
    } else {
      // Calculate score
      let correct = 0;
      assessment.questions.forEach((q, i) => {
        if ((answers[i] ?? selectedOption) === q.correctAnswer) correct++;
      });
      const score = Math.round((correct / assessment.questions.length) * 100);
      onCompleteAssessment(score);
    }
  };

  if (mode === 'RESULT') {
    const score = assessment.bestScore || 0;
    let understanding = '';
    let isPassed = score >= assessment.passingScore;

    if (score >= 90) understanding = 'Mastered';
    else if (score >= 75) understanding = 'Strong';
    else if (score >= 50) understanding = 'Needs Practice';
    else understanding = 'Needs Review';

    return (
      <div className="flex-1 bg-white dark:bg-[#1A1A18] rounded-3xl border border-[#E8E6DE] dark:border-[#2C2C29] p-10 flex flex-col items-center justify-center text-center shadow-xs">
        <h2 className="text-3xl font-display font-bold mb-6">Assessment Complete</h2>
        
        <div className="w-48 h-48 rounded-full border-8 flex flex-col items-center justify-center mb-8"
             style={{ borderColor: isPassed ? '#7A8B7C' : '#FF4D31' }}>
          <span className="text-5xl font-black">{score}%</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#7A8B7C] mt-2">Score</span>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold mb-1">Understanding: <span style={{ color: isPassed ? '#7A8B7C' : '#FF4D31' }}>{understanding}</span></h3>
        </div>

        {!isPassed ? (
          <div className="w-full max-w-md bg-[#F9F8F3] dark:bg-[#252522] rounded-2xl p-6 text-left border border-[#E8E6DE] dark:border-[#2C2C29]">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-[#FF4D31]" /> Recommended Action
            </h4>
            <ol className="list-decimal list-inside text-sm text-[#4A4A4A] dark:text-[#A0A09B] space-y-2 mb-6">
              <li>Review {topic.title}</li>
              <li>Study the additional material</li>
              <li>Complete the practice questions</li>
              <li>Retake the assessment</li>
            </ol>
            <div className="flex gap-4">
              <button onClick={onReviewMaterial} className="flex-1 py-3 rounded-full border border-[#FF4D31] text-[#FF4D31] font-bold text-xs hover:bg-[#FF4D31]/10 transition-colors">
                Review Topic
              </button>
              <button onClick={onRetake} className="flex-1 py-3 rounded-full bg-[#FF4D31] text-white font-bold text-xs hover:bg-[#E8402A] transition-colors flex items-center justify-center gap-2">
                <RefreshCcw className="w-4 h-4" /> Retake
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md bg-[#F9F8F3] dark:bg-[#252522] rounded-2xl p-6 text-left border border-[#E8E6DE] dark:border-[#2C2C29]">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#7A8B7C]" /> 🎉 Topic Completed
            </h4>
            <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B] mb-6">
              {topic.title} ✓<br/><br/>
              Your skill progress has been updated based on this verified completion.
            </p>
            <button onClick={onNextTopic} className="w-full py-3 rounded-full bg-[#7A8B7C] text-white font-bold text-xs hover:bg-[#607062] transition-colors flex items-center justify-center gap-2">
              Continue Learning <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // PRACTICE or ASSESSMENT mode
  return (
    <div className="flex-1 bg-white dark:bg-[#1A1A18] rounded-3xl border border-[#E8E6DE] dark:border-[#2C2C29] p-6 sm:p-10 shadow-xs flex flex-col">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8E6DE] dark:border-[#2C2C29]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4D31] block mb-1">
            {mode === 'PRACTICE' ? 'Practice Mode' : `${topic.title} Assessment`}
          </span>
          <h2 className="text-xl font-display font-bold">
            Question {currentIndex + 1} of {assessment.questions.length}
          </h2>
        </div>
        <div className="text-xs font-bold text-[#7A8B7C]">
          {Math.round(((currentIndex + 1) / assessment.questions.length) * 100)}%
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-medium mb-8 leading-relaxed">
          {currentQuestion.text}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            let btnClass = "w-full text-left p-4 rounded-xl border transition-all text-sm font-medium ";
            
            if (mode === 'PRACTICE' && showExplanation) {
              if (idx === currentQuestion.correctAnswer) {
                btnClass += "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400";
              } else if (isSelected) {
                btnClass += "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400";
              } else {
                btnClass += "border-[#E8E6DE] dark:border-[#2C2C29] opacity-50";
              }
            } else {
              if (isSelected) {
                btnClass += "bg-[#F9F8F3] dark:bg-[#252522] border-[#FF4D31] shadow-sm";
              } else {
                btnClass += "border-[#E8E6DE] dark:border-[#2C2C29] hover:border-[#7A8B7C]";
              }
            }

            return (
              <button
                key={idx}
                disabled={mode === 'PRACTICE' && showExplanation}
                onClick={() => setSelectedOption(idx)}
                className={btnClass}
              >
                {option}
              </button>
            );
          })}
        </div>

        {mode === 'PRACTICE' && showExplanation && (
          <div className={`mt-6 p-4 rounded-xl border ${selectedOption === currentQuestion.correctAnswer ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-[#FF4D31]/10 border-[#FF4D31]/20'}`}>
            <h4 className={`text-sm font-bold flex items-center gap-2 mb-1 ${selectedOption === currentQuestion.correctAnswer ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#FF4D31]'}`}>
              {selectedOption === currentQuestion.correctAnswer ? <CheckCircle2 className="w-4 h-4"/> : <XCircle className="w-4 h-4"/>}
              {selectedOption === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
            </h4>
            <p className="text-sm text-[#4A4A4A] dark:text-[#A0A09B]">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      <div className="pt-6 mt-6 border-t border-[#E8E6DE] dark:border-[#2C2C29] flex justify-end">
        {mode === 'PRACTICE' ? (
          !showExplanation ? (
            <button 
              disabled={selectedOption === null}
              onClick={handlePracticeSubmit}
              className="px-8 py-3 rounded-full bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] font-bold text-sm disabled:opacity-50 transition-opacity"
            >
              Check Answer
            </button>
          ) : (
            <button 
              onClick={handlePracticeNext}
              className="px-8 py-3 rounded-full bg-[#FF4D31] text-white font-bold text-sm hover:bg-[#E8402A] transition-colors flex items-center gap-2"
            >
              {currentIndex < assessment.questions.length - 1 ? 'Next Question' : 'Finish Practice'} <ArrowRight className="w-4 h-4" />
            </button>
          )
        ) : (
          <button 
            disabled={selectedOption === null}
            onClick={handleAssessmentNext}
            className="px-8 py-3 rounded-full bg-[#FF4D31] text-white font-bold text-sm disabled:opacity-50 hover:bg-[#E8402A] transition-all"
          >
            {currentIndex < assessment.questions.length - 1 ? 'Next Question' : 'Submit Assessment'}
          </button>
        )}
      </div>
    </div>
  );
};
