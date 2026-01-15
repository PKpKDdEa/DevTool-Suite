# DevelopTool---JSON-Converter-Commit-Generator-Regex-Explainer
# 🛠️ DevTool Suite: All-in-One Developer Utilities

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-4285F4?logo=google-cloud&logoColor=white)](https://deepmind.google/technologies/gemini/)

> **A "Swiss Army Knife" for modern developers.**  
> Instantly convert JSON to Class definitions, generate AI-powered Git commit messages, and decode Regex patterns—all in one privacy-focused dashboard.

---

## 🚀 Features

### 1. 🧬 JSON to Code Converter
Stop writing boilerplate code manually.
- **Instant Parsing:** Paste any JSON object and get ready-to-use class definitions.
- **Multi-Language Support:** Generates **C# (POCO)**, **Python (Pydantic)**, and **TypeScript** interfaces.
- **Smart Type Inference:** Automatically detects nested objects, lists, and nullable types.

### 2. 🤖 AI Git Commit Generator
Write better commit messages in seconds.
- **Smart Summaries:** Uses **Google Gemini Flash** to analyze your `git diff`.
- **Conventional Commits:** Generates messages following standard formats (e.g., `feat:`, `fix:`, `chore:`).
- **Context Aware:** Understands code logic to write meaningful descriptions, not just "updated files".

### 3. 🔍 Regex Explainer (Coming Soon)
- **Plain English:** Translates complex Regex patterns into human-readable explanations.
- **Visual Debugger:** Highlights matching groups and potential errors.

---

## 🛠️ Tech Stack

- **Frontend:** React 18 (Vite)
- **Styling:** Tailwind CSS + shadcn/ui
- **AI Engine:** Vercel AI SDK + Google Gemini API
- **State Management:** React Hooks
- **Deployment:** Vercel

---

## 📦 Installation & Setup

Clone the repository and run it locally in minutes.

```bash
# 1. Clone the repo
git clone https://github.com/PKpKDdEa/DevelopTool---JSON-Converter-Commit-Generator-Regex-Explainer.git

# 2. Enter the directory
cd DevelopTool---JSON-Converter-Commit-Generator-Regex-Explainer

# 3. Install dependencies
npm install

# 4. Set up Environment Variables
# Create a .env.local file and add your Gemini API Key
echo "VITE_GOOGLE_API_KEY=your_api_key_here" > .env.local

# 5. Run the development server
npm run dev
