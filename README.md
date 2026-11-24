# AI Feature Documentation & Mockup Generator

A professional SaaS workspace application that generates comprehensive product feature documentation and optional UI mockups using Google's Gemini API, acting as an experienced Senior Product Owner.

---

## Features

1. **AI-Powered Product Owner Workspace**: Generates professional product documentation in Polish (Feature Name, Description, Assumptions, Dependencies, Risks, User Benefits, Conditions of Satisfaction, Success Metrics, Open Questions, and Completeness Score).
2. **Multimodal Screenshot Analysis**: Upload screenshots of existing applications as visual references for documentation and mockup generation.
3. **Conceptual UI Mockup Generator**: Automatically generates interactive React + Tailwind CSS UI mockups rendered inside a secure sandboxed preview environment.
4. **Independent AI Editing**: Edit documentation or mockup UI code using natural language instructions via AI assistants.
5. **Section Regeneration & Manual Editing**: Edit any documentation section manually or regenerate individual sections with AI.
6. **Export Capabilities**: Export documentation as Markdown (`.md`) and mockup code as TypeScript (`.tsx`).
7. **Externalized AI Prompts**: All AI prompt instructions are stored in separate Markdown files (`server/src/ai/prompts/*.md`), allowing full customization of AI behavior without changing application code.

---

## Project Architecture

```
/Agent Features
  /client          # React + TypeScript + Tailwind CSS Frontend
    /src
      /components  # UI components (Header, LeftPanel, DocumentationPanel, MockupPanel)
      /services    # API service client
      /types       # TypeScript definitions
  /server          # Node.js + Express + TypeScript Backend
    /src
      /ai
        /prompts   # Editable Markdown prompt templates
        /services  # Gemini service, prompt loader, doc & mockup services
      /routes      # REST API endpoints
      /middleware  # File upload (Multer) & error handling
      /schemas     # Zod validation schemas
      /utils       # Export helpers
  /.env.example    # Environment variable template
  /README.md       # Project documentation
```

---

## Gemini API Key Configuration

1. Copy `server/env.example` to `server/.env` (or create `.env` in the root/server directory).
2. Set your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODELS=gemini-3.1-flash-lite,gemini-1.5-flash,gemini-2.0-flash,gemini-1.5-pro
   PORT=3001
   ```
   *Note: The API key is securely stored only on the backend and never exposed to the browser.*

---

## Installation & Setup

### Prerequisites
- Node.js (v18+ recommended, v24 tested)
- npm

### 1. Install Server Dependencies
```bash
cd server
npm install
```

### 2. Install Client Dependencies
```bash
cd ../client
npm install
```

---

## Running the Application

### 1. Start the Backend Server
```bash
cd server
npm run dev
```
*(Server runs on http://localhost:3001)*

### 2. Start the Frontend Client
```bash
cd client
npm run dev
```
*(Client runs on http://localhost:3000 with proxy configured to backend)*

---

## Where to Edit AI Instructions

All AI prompts and instructions are located in:
`server/src/ai/prompts/`

Files include:
- `feature-documentation.md`: Instructions for generating product documentation.
- `screenshot-analysis.md`: Instructions for analyzing UI screenshots.
- `mockup-generation.md`: Instructions for generating React + Tailwind mockups.
- `documentation-editing.md`: Instructions for natural language document edits.
- `mockup-editing.md`: Instructions for natural language mockup edits.
- `section-regeneration.md`: Instructions for single-section regeneration.
- `consistency-check.md`: Instructions for consistency checks.

You can modify any of these Markdown files to tune the AI's persona, output format, or guidelines without touching application code.

---

## Production Build

### Server Build
```bash
cd server
npm run build
```

### Client Build
```bash
cd client
npm run build
```

---

## Known Limitations & MVP Scope
- UI mockups generated are conceptual prototypes meant for product discovery and design alignment, not production-ready code.
- Local disk storage (`/server/uploads`) is used for uploaded screenshots in the MVP.
