import React, { useState } from 'react';
import FormComponent from './components/FormComponent';

const App = () => {
    const [currentStep, setCurrentStep] = useState(1);

    const handleNextStep = () => {
        setCurrentStep(prevStep => prevStep + 1);
    };

    const handlePreviousStep = () => {
        setCurrentStep(prevStep => Math.max(prevStep - 1, 1));
    };

    return (
        <div>
            {currentStep === 1 && (
                <FormComponent
                    onNextStep={handleNextStep}
                    onPreviousStep={handlePreviousStep}
                    isFirstStep={currentStep === 1}
                />
            )}
            {currentStep > 1 && (
                <button
                    onClick={handlePreviousStep}
                    style={{ position: 'absolute', top: '20px', left: '20px' }}
                >
                    Back
                </button>
            )}
            {currentStep === 2 && (
                <div>
                    <div>Next Step Content</div>
                </div>
            )}
            {/* Add more steps as needed */}
        </div>
    );
};

export default App;
