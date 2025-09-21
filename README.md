# TaleWeaver ✨

A minimal, professional storytelling app with VS Code-inspired design. Write immersive stories with clean glassmorphism UI and AI assistance powered by Google's Gemini API.

## ✨ Features

- **🎨 VS Code-Inspired UI**: Clean, minimal interface with glassmorphism effects and sharp angular design
- **🤖 AI Writing Assistant**: Smart story improvement suggestions via Google's Gemini API
- **💾 Auto-Save**: Stories automatically persist to localStorage - never lose your work
- **🎭 Character Setup**: Detailed character management with traits, descriptions, and roles
- **🌓 Dark/Light Themes**: VS Code-style theme switching with monochromatic design
- **🔊 Text-to-Speech**: Listen to your story content with built-in voice synthesis
- **📝 Canvas-First Writing**: Primary writing interface with AI assistance in sidebar
- **💬 AI Chat Assistant**: Focused improvement suggestions and writing guidance
- **⚡ Frontend-Only**: No backend required - runs entirely in your browser
- **🎯 8px Grid System**: Professional spacing following universal design standards

## 🚀 Quick Start

1. **Install dependencies**
```powershell
npm install
```

2. **Start the development server**
```powershell
npm run dev
```

3. **Open your browser** to `http://localhost:5173`

4. **Start writing!** Use the Story Canvas to write directly, then ask the AI Assistant for improvements.

## 🎛️ Configuration

Create a `.env.local` file for your own Gemini API setup:

```env
# Required for AI writing assistance
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_MODEL=gemini-1.5-flash
```

## 🏗️ Architecture

- **Frontend**: React 17 + Vite + Tailwind CSS
- **AI Integration**: Direct Gemini API calls with frontend-only architecture
- **Storage**: localStorage for story persistence
- **Styling**: Glassmorphism with VS Code color palette
- **Icons**: FontAwesome 6 monochromatic icons

### Project Structure

```
├── src/
│   ├── TaleWeaver.jsx              # Main application component
│   ├── components/ui/              # UI components
│   │   ├── CharacterSetup.jsx      # Character management interface
│   │   ├── ThemeToggle.jsx         # Dark/light mode switcher
│   │   └── DiffViewer.jsx          # Story comparison modal
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAppState.js          # Global application state
│   │   └── useStoryApi.js          # Gemini API integration
│   ├── utils/
│   │   └── diffUtils.js            # Text diffing utilities
│   └── index.css                   # Glassmorphism + VS Code styling
├── public/
│   └── logo.png                    # Application logo
└── tailwind.config.js              # Tailwind configuration
```

## 🎨 Design System

- **Color Palette**: Monochromatic using VS Code color tokens
- **Typography**: Clean hierarchy with light font weights (300-400)
- **Spacing**: Universal 8px grid system throughout
- **Components**: Pure glassmorphism with backdrop-blur effects
- **Icons**: FontAwesome 6 monochromatic icons
- **Layout**: VS Code-inspired panels and navigation

### UI Components

- **Glass Panels**: Backdrop-blur with subtle transparency
- **Glass Buttons**: Clean interactions with gentle hover effects
- **Glass Inputs**: Transparent form fields with focus states (100% width)
- **Compact Chat**: GitHub Copilot-inspired AI assistant interface
- **Angular Design**: No rounded borders - sharp, professional edges

## 🎯 Usage Guide

### Writing Workflow
1. **Primary Canvas**: Write your story directly in the Source tab
2. **Character Setup**: Define characters with names, roles, traits, and descriptions
3. **Story Configuration**: Set genres, themes, and world setting
4. **AI Assistance**: Use the chat to request specific improvements
5. **Preview**: View formatted story in the Preview tab

### AI Assistant Commands
- "Make this more dramatic and engaging"
- "Improve the dialogue to sound more natural"
- "Add more sensory details and atmosphere"
- "Enhance character development and depth"

### Key Features
- **Manual Edit Mode**: Disable auto-sync for focused writing
- **Inline Title Editing**: Click-to-edit story titles
- **Character Traits**: Add/remove character traits with validation
- **Diff Viewer**: Compare before/after story improvements

## 🔧 Development

```powershell
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📋 Dependencies

### Core Dependencies
- **React 17.0.2**: Frontend framework (compatible with FontAwesome)
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **@fortawesome/react-fontawesome@0.2.0**: React 17 compatible icons
- **@fortawesome/fontawesome-svg-core**: Icon library core
- **@fortawesome/free-solid-svg-icons**: Solid icon set

### Development Dependencies
- **ESLint**: Code linting with React rules
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes

## ⚡ Performance Features

- **Optimized Bundling**: Vite-based build with code splitting
- **Minimal Dependencies**: Lightweight FontAwesome and focused React hooks
- **Efficient Rendering**: Smart state management with minimal re-renders
- **Local Storage**: Fast persistence without network calls
- **CSS Optimization**: Tailwind purging and minimal custom CSS

## 🎨 Recent Updates

- ✅ **VS Code-Inspired Design**: Complete UI overhaul with professional appearance
- ✅ **Glassmorphism**: Clean glass effects throughout the interface
- ✅ **FontAwesome 6 Icons**: Monochromatic icon system with React 17 compatibility
- ✅ **8px Grid System**: Universal spacing standards
- ✅ **Canvas-First Workflow**: Direct writing with AI assistance
- ✅ **Enhanced Character Management**: Detailed character setup with traits system
- ✅ **Story Reading**: Text-to-speech reads from actual story content (not chat)
- ✅ **Angular Design**: Removed all rounded borders for professional look
- ✅ **Compact Chat**: GitHub Copilot-style AI assistant interface
- ✅ **Full-Width Inputs**: 100% width utilization for better writing experience
- ✅ **Character Traits Fixed**: Robust trait management with null/undefined protection

## 🌟 Key Features

### Story Canvas
- **Direct Writing**: Primary interface for story creation
- **Manual Edit Mode**: Disable auto-sync for focused writing
- **Inline Title Editing**: Click-to-edit story titles
- **Markdown Support**: Full markdown formatting with live preview

### AI Writing Assistant
- **Focused Improvements**: Chat specifically for story enhancement
- **Professional Prompts**: Publication-quality writing guidance
- **Literary Craft**: Advanced prose improvement suggestions
- **Context-Aware**: Understands your story and characters

### Character Management
- **Detailed Profiles**: Names, roles, descriptions, and custom traits
- **Visual Management**: Clean cards with edit/delete functionality
- **Trait System**: Add/remove character traits with validation and duplicate prevention
- **Full-Width Forms**: Enhanced input experience with proper error handling

### Technical Improvements
- **Robust State Management**: Protected against null/undefined character data
- **Input Validation**: Prevents empty traits and duplicate entries (case-insensitive)
- **Error Recovery**: Auto-fixes corrupted character data from localStorage
- **Accessibility**: Focus states, keyboard navigation, and screen reader support

---

**Built with ❤️ for storytellers who demand professional tools and beautiful interfaces.**

Happy writing! ✨📖
