# BranchVision - Standard Chartered Hackathon

BranchVision is a web-based application designed to streamline the loan application process. It provides features like document upload, OCR-based data extraction, real-time application status updates, and user authentication.

[▶ Watch the demo]((https://private-user-images.githubusercontent.com/115695901/424236630-24dc9b67-0e3b-4854-b0aa-4fc4e4cdc34a.mp4?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDIzNDMxMTQsIm5iZiI6MTc0MjM0MjgxNCwicGF0aCI6Ii8xMTU2OTU5MDEvNDI0MjM2NjMwLTI0ZGM5YjY3LTBlM2ItNDg1NC1iMGFhLTRmYzRlNGNkYzM0YS5tcDQ_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwMzE5JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDMxOVQwMDA2NTRaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT00ZGZlYTY1NmUxNThkOTNlYWE4N2NkNjcxNTJiYTllZTBkNjZiNDEzMmE4MGQ2NDc3ZDM3ZWEzYzA5Nzc1YWMzJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9._oM7ERcmrjEx99QGkUQiNdOegRo7cHaH_j09sqvySsE))

<video controls>
  <source src="https://github.com/MorningstarDeep/BranchVision/issues/1#issue-2930095387" type="video/mp4">
</video>


## Features

- **User Authentication**: Secure signup and login functionality using bcrypt and JWT.
- **Document Upload**: Upload and validate documents with real-time feedback.
- **OCR Integration**: Extract information from Aadhaar and PAN cards using OCR.
- **Real-Time Updates**: Get live updates on application status via Socket.IO.
- **Responsive Design**: Built with React, Tailwind CSS, and Vite for a seamless user experience.

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, SQLite
- **OCR**: Tesseract.js
- **Real-Time Communication**: Socket.IO
- **Build Tools**: ESLint, Prettier

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/MorningstarDeep/BranchVision.git
   cd BranchVision
   ```

2. Install dependencies for both frontend and backend:

   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

3. Start the development servers:

   - Frontend:
     ```bash
     cd frontend
     npm run dev
     ```
   - Backend:
     ```bash
     cd backend
     node server.js
     ```

4. Access the application at `http://localhost:3000`.

## Folder Structure

- **frontend**: Contains the React-based frontend code.
- **backend**: Contains the Node.js backend code.
- **public**: Static assets for the frontend.

## API Endpoints

### Authentication

- `POST /api/auth/signup`: Register a new user.
- `POST /api/auth/login`: Login an existing user.

### Document Upload

- `POST /api/upload`: Upload a document.
- `POST /api/ocr`: Perform OCR on an uploaded document.

### Application Submission

- `POST /api/submit-application`: Submit loan application details.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
