import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import QuestionScreen from './QuestionScreen';
import { Question, AdvisorPersona } from '../types';
import { getQuestionById, QUESTIONS } from '../data/questions'; // Import QUESTIONS array for total steps
import { getAdvisorById } from '../data/advisors';
import NotFound from './NotFound'; // Assuming you have a NotFound component for invalid IDs
import LoadingSpinner from '../components/LoadingSpinner'; // Assuming you have a LoadingSpinner

const QuestionFlowContainer: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>(); // questionId will be a string from URL
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mentorId = searchParams.get('mentor');
  // For now, userIdea is a placeholder. In a real app, it would come from initial input (e.g., Welcome screen).
  const initialUserIdea = searchParams.get('idea') || "My groundbreaking new startup idea!";

  const currentStep = parseInt(questionId || '1', 10);
  const totalSteps = QUESTIONS.length; // Total questions in your flow

  const [question, setQuestion] = useState<Question | undefined>(undefined);
  const [advisor, setAdvisor] = useState<AdvisorPersona | undefined>(undefined);
  // This state will hold all answers. You might want to move this to a global state (Context API)
  // if you need it accessible by other parts of the app or after a refresh.
  const [allAnswers, setAllAnswers] = useState<Record<number, string>>({}); // Stores answers by question ID

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const loadData = () => {
      const foundQuestion = getQuestionById(currentStep);
      const foundAdvisor = mentorId ? getAdvisorById(mentorId as AdvisorPersona['id']) : undefined; // Cast to ensure type compatibility

      if (!foundQuestion) {
        setError("Question not found.");
        setLoading(false);
        return;
      }
      if (!foundAdvisor && mentorId) { // Only error if mentorId was provided but not found
        setError("Advisor not found.");
        setLoading(false);
        return;
      }
      if (!mentorId) {
        // If no mentor selected, maybe redirect back to welcome or set a default?
        // For now, let's assume a mentor is always provided.
        setError("Mentor not provided. Please select a mentor from the Welcome screen.");
        setLoading(false);
        return;
      }

      setQuestion(foundQuestion);
      setAdvisor(foundAdvisor);
      setLoading(false);
    };

    loadData();
  }, [currentStep, mentorId, questionId]); // Rerun when questionId or mentorId changes

  const handleAnswer = (answer: string, isAIGenerated: boolean) => {
    setAllAnswers(prevAnswers => ({
      ...prevAnswers,
      [currentStep]: answer,
    }));

    // Logic to determine the next question
    let nextStep = currentStep + 1;
    // You would add your branching logic here based on currentStep and potentially the answer
    // Example: if (currentStep === 5 && answer === 'yes_to_alternatives') nextStep = 5.1;
    // For now, it's simple linear progression.

    if (nextStep <= totalSteps) {
      navigate(`/question/${nextStep}?mentor=${mentorId}&idea=${encodeURIComponent(initialUserIdea)}`);
    } else {
      // All questions answered, navigate to a summary or results page
      console.log("All answers:", allAnswers); // Log all collected answers
      navigate('/summary-or-results'); // You'll need to create this route and component
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      navigate(`/question/${currentStep - 1}?mentor=${mentorId}&idea=${encodeURIComponent(initialUserIdea)}`);
    } else {
      navigate('/'); // Go back to the Welcome screen if on the first question
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
    // This case should ideally be caught by 'error' state, but as a fallback:
    return <NotFound />; // Render a 404 or specific error page
  }

  return (
    <QuestionScreen
      question={question}
      currentStep={currentStep}
      totalSteps={totalSteps}
      advisor={advisor}
      userIdea={initialUserIdea} // Pass the user idea
      onAnswer={handleAnswer}
      onBack={handleBack}
    />
  );
};

export default QuestionFlowContainer; 