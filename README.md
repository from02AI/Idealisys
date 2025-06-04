
# AI Idea Validation App

A beautiful, intelligent React application that guides users through an AI-driven idea validation process with personalized advisor personas.

## Features

- **3 AI Advisor Personas**: Choose from The Supporter, The Strategist, or The Challenger
- **7-Step Validation Process**: Comprehensive idea analysis through targeted questions
- **GPT-4 Integration**: Intelligent, persona-driven responses and insights
- **Multiple Input Methods**: AI suggestions, "Let AI Decide," or custom responses
- **Beautiful Design**: Warm, professional interface with smooth animations
- **Progress Tracking**: Visual progress bar and step-by-step guidance
- **PDF Report Generation**: Download your complete validation report
- **Local Storage**: Preserves progress across browser sessions
- **Responsive Design**: Works beautifully on all devices

## Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **OpenAI GPT-4** for AI responses
- **Vite** for build tooling
- **Local Storage** for data persistence

## Setup Instructions

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone or download the project**
   ```bash
   git clone <your-repo-url>
   cd ai-idea-validation-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

   To get an OpenAI API key:
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Sign up or log in
   - Navigate to API Keys section
   - Create a new API key

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AdvisorCard.tsx
│   ├── ProgressBar.tsx
│   ├── AnswerButton.tsx
│   ├── InsightCard.tsx
│   └── LoadingSpinner.tsx
├── pages/              # Main application screens
│   ├── Welcome.tsx
│   ├── QuestionScreen.tsx
│   ├── Review.tsx
│   └── Report.tsx
├── data/               # Static data and configuration
│   ├── advisors.ts
│   └── questions.ts
├── services/           # API and external service integrations
│   └── openai.ts
├── hooks/              # Custom React hooks
│   └── useLocalStorage.ts
├── types/              # TypeScript type definitions
│   └── index.ts
└── pages/
    └── Index.tsx       # Main app component
```

## How It Works

1. **Welcome Screen**: Users select from 3 AI advisor personas, each with distinct personalities and guidance styles

2. **Question Flow**: 7 carefully crafted questions guide users through idea validation:
   - Idea description
   - Target audience
   - Problem solving
   - Unique differentiators
   - Personal motivation
   - Potential challenges
   - Areas of uncertainty

3. **AI Integration**: Each question generates 4 personalized response options using GPT-4, tailored to the selected advisor's tone and expertise

4. **Flexible Input**: Users can choose AI suggestions, let AI decide randomly, or write custom responses

5. **Review & Edit**: Complete review of all responses with ability to edit any answer

6. **Validation Report**: Comprehensive AI-generated report including:
   - Idea summary
   - Strengths analysis
   - Potential concerns
   - Persona-specific insights
   - Actionable next steps

## Customization

### Adding New Advisors
Edit `src/data/advisors.ts` to add new personas with unique tones and characteristics.

### Modifying Questions
Update `src/data/questions.ts` to change or add validation questions.

### Styling
The app uses Tailwind CSS. Modify styles in component files or extend the Tailwind configuration in `tailwind.config.ts`.

### API Configuration
Adjust OpenAI settings in `src/services/openai.ts` including model selection, temperature, and token limits.

## Future Enhancements

- **Supabase Integration**: User authentication and report storage
- **Advanced Analytics**: Usage tracking and insights
- **Collaboration Features**: Share reports and get feedback
- **Industry-Specific Templates**: Tailored validation for different sectors
- **Integration APIs**: Connect with business planning tools

## Export to Cursor

This project is designed to be easily exported to Cursor IDE:

1. Ensure all dependencies are properly listed in `package.json`
2. Environment variables are documented in this README
3. TypeScript configuration is complete
4. All components are well-commented and modular

## Support

For questions or issues:
1. Check the console for any error messages
2. Verify your OpenAI API key is correctly set
3. Ensure all dependencies are installed
4. Review the network tab for API call issues

## License

This project is open source and available under the MIT License.
