import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuizItem {
  id: number;
  type: 'choice' | 'blank';
  question: string;
  options?: string[];
  answer: number | string;
  explanation: string;
}

interface InteractiveQuizProps {
  quizData: string | null;
}

const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ quizData }) => {
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [blankInput, setBlankInput] = useState('');

  useEffect(() => {
    if (quizData) {
      try {
        const parsed = typeof quizData === 'string' ? JSON.parse(quizData) : quizData;
        setQuiz(parsed.quiz || []);
      } catch (e) {
        console.error("解析測驗資料失敗", e);
      }
    }
  }, [quizData]);

  const handleChoiceSelect = (idx: number) => {
    if (isSubmitted) return;
    setUserAnswer(idx);
  };

  const handleSubmit = () => {
    if (userAnswer === null && quiz[currentIdx].type === 'choice') return;
    if (blankInput.trim() === '' && quiz[currentIdx].type === 'blank') return;

    const currentQuestion = quiz[currentIdx];
    let correct = false;

    if (currentQuestion.type === 'choice') {
      correct = userAnswer === currentQuestion.answer;
    } else {
      correct = blankInput.trim() === String(currentQuestion.answer).trim();
    }

    if (correct) setScore(prev => prev + 1);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setUserAnswer(null);
      setBlankInput('');
      setIsSubmitted(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setUserAnswer(null);
    setBlankInput('');
    setIsSubmitted(false);
    setScore(0);
    setShowResult(false);
  };

  if (!quiz || quiz.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <HelpCircle size={48} className="mb-4 opacity-20" />
        <p className="font-bold">尚未生成測驗題庫</p>
      </div>
    );
  }

  if (showResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <Trophy size={48} className="text-indigo-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">測驗結束！</h2>
        <p className="text-slate-500 mb-8">你的得分是：<span className="text-3xl font-black text-indigo-600">{score}</span> / {quiz.length}</p>
        
        <div className="flex gap-4">
          <button 
            onClick={resetQuiz}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <RotateCcw size={18} /> 再試一次
          </button>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = quiz[currentIdx];
  const isCorrect = currentQuestion.type === 'choice' 
    ? userAnswer === currentQuestion.answer 
    : blankInput.trim() === String(currentQuestion.answer).trim();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black rounded-full uppercase tracking-widest">
            Question {currentIdx + 1} / {quiz.length}
          </span>
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${currentQuestion.type === 'choice' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
            {currentQuestion.type === 'choice' ? '選擇題' : '填空題'}
          </span>
        </div>
        <div className="text-xs font-bold text-slate-400">
          目前得分: {score}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-bold text-slate-800 leading-relaxed">
            {currentQuestion.question}
          </h3>

          {currentQuestion.type === 'choice' ? (
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options?.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoiceSelect(idx)}
                  disabled={isSubmitted}
                  className={`p-4 text-left rounded-xl border-2 transition-all font-bold flex items-center justify-between ${
                    userAnswer === idx 
                      ? (isSubmitted 
                          ? (idx === currentQuestion.answer ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-rose-500 bg-rose-50 text-rose-700')
                          : 'border-indigo-500 bg-indigo-50 text-indigo-700')
                      : (isSubmitted && idx === currentQuestion.answer 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-100 bg-white hover:border-slate-300 text-slate-600')
                  }`}
                >
                  <span>{option}</span>
                  {isSubmitted && idx === currentQuestion.answer && <CheckCircle2 size={20} className="text-emerald-500" />}
                  {isSubmitted && userAnswer === idx && idx !== currentQuestion.answer && <XCircle size={20} className="text-rose-500" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <input 
                type="text"
                value={blankInput}
                onChange={(e) => setBlankInput(e.target.value)}
                disabled={isSubmitted}
                placeholder="請輸入答案..."
                className={`w-full p-4 rounded-xl border-2 font-bold outline-none transition-all ${
                  isSubmitted 
                    ? (isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-rose-500 bg-rose-50 text-rose-700')
                    : 'border-slate-200 focus:border-indigo-500 bg-white'
                }`}
              />
              {isSubmitted && !isCorrect && (
                <div className="text-sm font-bold text-emerald-600">
                  正確答案：{currentQuestion.answer}
                </div>
              )}
            </div>
          )}

          {isSubmitted && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}
            >
              <div className="flex items-center gap-2 mb-1 font-black text-sm">
                {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {isCorrect ? '答對了！' : '答錯了，再接再厲！'}
              </div>
              <p className="text-xs font-medium opacity-80 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </motion.div>
          )}

          <div className="pt-6 flex justify-end">
            {!isSubmitted ? (
              <button 
                onClick={handleSubmit}
                disabled={(currentQuestion.type === 'choice' && userAnswer === null) || (currentQuestion.type === 'blank' && blankInput.trim() === '')}
                className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                提交答案
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                {currentIdx < quiz.length - 1 ? '下一題' : '查看結果'} <ArrowRight size={18} />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default InteractiveQuiz;
