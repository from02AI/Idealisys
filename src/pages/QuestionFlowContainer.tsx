import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import QuestionScreen from './QuestionScreen';
import Q1scr from './Q1scr';
import Q2scr from './Q2scr';
import Q3scr from './Q3scr';
import Q4scr from './Q4scr';
import Q5scr from './Q5scr';
import { Question, AdvisorPersona } from '../types';
import { getQuestionById, QUESTIONS } from '../data/questions';
import { getAdvisorById } from '../data/advisors';
import NotFound from './NotFound';
import LoadingSpinner from '../components/LoadingSpinner';

const QuestionFlowContainer: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mentorId = searchParams.get('mentor');
  const initialUserIdea = searchParams.get('idea') || "My groundbreaking new startup idea!";

  const currentStep = parseInt(questionId || '1', 10);
  const totalSteps = QUESTIONS.length;

  const [question, setQuestion] = useState<Question | undefined>(undefined);
  const [advisor, setAdvisor] = useState<AdvisorPersona | undefined>(undefined);
  const [allAnswers, setAllAnswers] = useState<Record<number, string>>({}); 

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const loadData = () => {
      const foundQuestion = getQuestionById(currentStep);
      const foundAdvisor = mentorId ? getAdvisorById(mentorId as AdvisorPersona['id']) : undefined;

      if (!foundQuestion) {
        setError("Question not found.");
        setLoading(false);
        return;
      }
      if (!foundAdvisor && mentorId) {
        setError("Advisor not found.");
        setLoading(false);
        return;
      }
      if (!mentorId) {
        setError("Mentor not provided. Please select a mentor from the Welcome screen.");
        setLoading(false);
        return;
      }

      setQuestion(foundQuestion);
      setAdvisor(foundAdvisor);
      setLoading(false);
    };

    loadData();
  }, [currentStep, mentorId, questionId]);

  const handleAnswer = (answer: string, isAIGenerated: boolean) => {
    setAllAnswers(prevAnswers => ({
      ...prevAnswers,
      [currentStep]: answer,
    }));

    let nextStep = currentStep + 1;

    if (nextStep <= totalSteps) {
      navigate(`/question/${nextStep}?mentor=${mentorId}&idea=${encodeURIComponent(initialUserIdea)}`);
    } else {
      console.log("All answers:", allAnswers);
      navigate('/summary-or-results');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      navigate(`/question/${currentStep - 1}?mentor=${mentorId}&idea=${encodeURIComponent(initialUserIdea)}`);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner message="Loading question..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600 font-bold">
        Error: {error}
        <Button onClick={() => navigate('/')} className="ml-4">Go to Home</Button>
      </div>
    );
  }

  if (!question || !advisor) {
    return <NotFound />;
  }

  // Render different screens based on current step
  if (currentStep === 1) {
    return (
      <Q1scr
        question={question}
        currentStep={currentStep}
        totalSteps={totalSteps}
        advisor={advisor}
        userIdea={initialUserIdea}
        onAnswer={handleAnswer}
        onBack={handleBack}
      />
    );
  } else if (currentStep === 2) {
    return (
      <Q2scr
        currentStep={currentStep}
        totalSteps={totalSteps}
        advisor={advisor}
        userIdea={initialUserIdea}
        onAnswer={handleAnswer}
        onBack={handleBack}
      />
    );
  } else if (currentStep === 3) {
    return (
      <Q3scr
        question={question}
        currentStep={currentStep}
        totalSteps={totalSteps}
        advisor={advisor}
        userIdea={initialUserIdea}
        onAnswer={handleAnswer}
        onBack={handleBack}
      />
    );
  } else if (currentStep === 4) {
    return (
      <Q4scr
        question={question}
        currentStep={currentStep}
        totalSteps={totalSteps}
        advisor={advisor}
        userIdea={initialUserIdea}
        onAnswer={handleAnswer}
        onBack={handleBack}
      />
    );
  } else if (currentStep === 5) {
    return (
      <Q5scr
        question={question}
        currentStep={currentStep}
        totalSteps={totalSteps}
        advisor={advisor}
        userIdea={initialUserIdea}
        allAnswers={allAnswers}
        onAnswer={handleAnswer}
        onBack={handleBack}
      />
    );
  } else {
    return (
      <QuestionScreen
        question={question}
        currentStep={currentStep}
        totalSteps={totalSteps}
        advisor={advisor}
        userIdea={initialUserIdea}
        onAnswer={handleAnswer}
        onBack={handleBack}
      />
    );
  }
};

export default QuestionFlowContainer;
