
import React, { useState } from 'react';
import Welcome from './Welcome';
import QuestionScreen from './QuestionScreen';
import Review from './Review';
import Report from './Report';
import LoadingSpinner from '../components/LoadingSpinner';
import { AdvisorPersona, UserAnswer, ValidationReport } from '../types';
import { questions } from '../data/questions';
import { generateValidationReport } from '../services/openai';
import { useLocalStorage } from '../hooks/useLocalStorage';

type Screen = 'welcome' | 'question' | 'review' | 'report';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [selectedAdvisor, setSelectedAdvisor] = useLocalStorage<AdvisorPersona | null>('selectedAdvisor', null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useLocalStorage<Record<number, string>>('answers', {});
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  const handleAdvisorSelect = (advisor: AdvisorPersona) => {
    setSelectedAdvisor(advisor);
    setCurrentScreen('question');
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (answer: string, isAIGenerated: boolean) => {
    const currentQuestion = questions[currentQuestionIndex];
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: answer
    };
    setAnswers(newAnswers);

    // Move to next question or review
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentScreen('review');
    }
  };

  const handleBack = () => {
    if (currentScreen === 'question' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentScreen === 'question' && currentQuestionIndex === 0) {
      setCurrentScreen('welcome');
    } else if (currentScreen === 'review') {
      setCurrentQuestionIndex(questions.length - 1);
      setCurrentScreen('question');
    } else if (currentScreen === 'report') {
      setCurrentScreen('review');
    }
  };

  const handleEdit = (questionId: number) => {
    const questionIndex = questions.findIndex(q => q.id === questionId);
    setCurrentQuestionIndex(questionIndex);
    setCurrentScreen('question');
  };

  const handleGenerateReport = async () => {
    if (!selectedAdvisor) return;

    setIsGeneratingReport(true);
    try {
      const userIdea = answers[1] || 'No idea provided';
      const report = await generateValidationReport(answers, selectedAdvisor.tone, userIdea);
      setValidationReport(report);
      setCurrentScreen('report');
    } catch (error) {
      console.error('Error generating report:', error);
      // Handle error - could show a toast or error message
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleStartNew = () => {
    setSelectedAdvisor(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setValidationReport(null);
    setCurrentScreen('welcome');
  };

  if (isGeneratingReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner message="Generating your personalized validation report..." />
      </div>
    );
  }

  switch (currentScreen) {
    case 'welcome':
      return <Welcome onAdvisorSelect={handleAdvisorSelect} />;

    case 'question':
      if (!selectedAdvisor) {
        setCurrentScreen('welcome');
        return null;
      }
      const currentQuestion = questions[currentQuestionIndex];
      const userIdea = answers[1] || '';
      
      return (
        <QuestionScreen
          question={currentQuestion}
          currentStep={currentQuestionIndex + 1}
          totalSteps={questions.length}
          advisor={selectedAdvisor}
          userIdea={userIdea}
          onAnswer={handleAnswer}
          onBack={handleBack}
        />
      );

    case 'review':
      return (
        <Review
          answers={answers}
          onEdit={handleEdit}
          onGenerateReport={handleGenerateReport}
          onBack={handleBack}
        />
      );

    case 'report':
      if (!validationReport) {
        setCurrentScreen('review');
        return null;
      }
      return (
        <Report
          report={validationReport}
          onStartNew={handleStartNew}
          onBack={handleBack}
        />
      );

    default:
      return <Welcome onAdvisorSelect={handleAdvisorSelect} />;
  }
};

export default Index;
