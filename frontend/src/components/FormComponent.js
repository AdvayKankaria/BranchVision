import React, { useState } from 'react';

const FormComponent = ({ onNextStep, onPreviousStep, isFirstStep }) => {
    const [formData, setFormData] = useState({
        field1: '',
        field2: '',
        // ...add other fields as needed
    });

    const isFormComplete = Object.values(formData).every(value => value.trim() !== '');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    return (
        <div>
            <form>
                <input
                    type="text"
                    name="field1"
                    value={formData.field1}
                    onChange={handleInputChange}
                    placeholder="Enter Field 1"
                />
                <input
                    type="text"
                    name="field2"
                    value={formData.field2}
                    onChange={handleInputChange}
                    placeholder="Enter Field 2"
                />
                {/* Add more input fields as needed */}
            </form>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                {!isFirstStep && (
                    <button
                        onClick={onPreviousStep}
                        disabled={isFirstStep}
                    >
                        Back
                    </button>
                )}
                <button
                    onClick={onNextStep}
                    disabled={!isFormComplete}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default FormComponent;
