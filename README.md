# TaleWeaver ✨

A beautiful, intuitive storytelling app powered by AI. Create immersive stories with a clean two-panel interface: chat with your AI writing assistant on the left, see your story unfold on the right.

## ✨ Features

- **🎨 Beautiful UI/UX**: Modern gradient design with smooth animations and hover effects
- **🤖 AI-Powered**: Direct integration with Google's Gemini API for intelligent story generation
- **💾 Auto-Save**: Your story is automatically saved to localStorage - never lose your work
- **🎭 Customizable**: Set genres, characters, and opening scenes to guide your story
- **🌓 Dark/Light Themes**: Switch between beautiful dark and light modes
- **🔊 Text-to-Speech**: Listen to your story with built-in voice synthesis
- **📝 Dual View**: Toggle between formatted preview and markdown source editing
- **💬 Interactive Chat**: Intuitive conversation flow with your AI writing assistant
- **⚡ Frontend-Only**: No backend server required - runs entirely in your browser

## 🚀 Quick Start

1. **Install dependencies**
```powershell
npm install
```

2. **Start the app**
```powershell
npm run dev
```

3. **Open your browser** to `http://localhost:5173`

4. **Start writing!** Enter your story setup and let the AI help craft your tale.

## 🎛️ Configuration

The app comes pre-configured with a Gemini API key. For your own setup, create a `.env.local` file:

```env
# Required for story generation
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_MODEL=gemini-1.5-flash
```

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **AI Integration**: Direct Gemini API calls from the frontend  
- **Storage**: localStorage for persistence
- **Styling**: Modern gradient design with CSS animations

### Folder Structure

```
├── src/
│   ├── TaleWeaver.jsx           # Main app component
│   ├── components/ui/           # Reusable UI components
│   ├── hooks/                   # Custom React hooks
│   └── index.css               # Enhanced styling with animations
└── public/                     # Static assets
```

## 🎨 UI/UX Improvements

- **Enhanced Header**: Gradient backgrounds and modern iconography
- **Beautiful Buttons**: Hover effects, scaling animations, and gradients
- **Chat Interface**: Message bubbles with timestamps and avatars
- **Loading States**: Animated dots and shimmer effects
- **Error Handling**: User-friendly error messages with auto-dismissal
- **Chapter Manager**: Improved styling with word counts and statistics
- **Responsive Design**: Works beautifully on all screen sizes

## � Development

```powershell
# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Usage Tips

- **First Story**: Enter genres, character, and opening scene to get started
- **Continue Stories**: Use the chat to guide your story's direction
- **Quick Suggestions**: Click the suggested prompts for inspiration
- **Export**: Save your story as a Markdown file
- **Voice**: Listen to your story with the Read button
- **Themes**: Switch between dark/light modes anytime

## 🚀 What's New

- ✅ **Direct Gemini Integration**: Frontend calls Gemini API directly, no backend needed
- ✅ **Simplified Architecture**: Single story focus instead of multiple chapters
- ✅ **Enhanced UI/UX**: Beautiful gradients, animations, and modern design
- ✅ **Auto-Save**: Story persists automatically in your browser
- ✅ **Better Error Handling**: User-friendly messages and auto-recovery
- ✅ **Improved Performance**: Optimized rendering and state management
- ✅ **Responsive Design**: Works perfectly on desktop and mobile
- ✅ **Accessibility**: Focus states, keyboard navigation, and screen reader support

---

Happy storytelling! �✨
