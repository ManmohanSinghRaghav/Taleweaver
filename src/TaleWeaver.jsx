// TaleWeaver - Two-Panel Interactive Writing Assistant
import { useEffect, useMemo, useRef, useState } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop, faDownload, faRotateRight, faWandMagicSparkles, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import ThemeToggle from './components/ui/ThemeToggle';
import CharacterSetup from './components/ui/CharacterSetup';
import DiffViewer from './components/ui/DiffViewer';
import { useAppState } from './hooks/useAppState';
import { useStoryApi } from './hooks/useStoryApi';

// Add icons to the library
library.add(faPlay, faStop, faDownload, faRotateRight, faWandMagicSparkles, faCheck, faXmark);

const TaleWeaver = () => {
  const {
    isDarkMode,
    isLoading,
    setIsLoading,
    error,
    setError,
    toggleTheme,
    isSpeaking,
    setIsSpeaking,
  } = useAppState();

  const { callStoryAPI, buildImprovementPayload } = useStoryApi();

  // Simple story state management with localStorage persistence
  const [storyData, setStoryData] = useState(() => {
    try {
      const saved = localStorage.getItem('taleweaver-story');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load story from localStorage:', error);
    }
    return {
      editorContent: '',
      chatHistory: [],
      characters: [
        {
          id: '1',
          name: '',
          role: '',
          description: '',
          traits: []
        }
      ],
      themes: [],
      genres: [],
      setting: '',
      plotPoints: [],
      wordCount: 0,
      createdAt: Date.now(),
    };
  });
  
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('preview'); // 'preview', 'source', 'setup'
  
  // Diff viewer state
  const [showDiff, setShowDiff] = useState(false);
  const [diffData, setDiffData] = useState(null);
  
  // Flag to prevent auto-sync from overwriting manual edits
  const [isManualEdit, setIsManualEdit] = useState(false);
  
  // Story title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  // Ref for the source editor textarea
  const editorTextareaRef = useRef(null);

  // Save story to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('taleweaver-story', JSON.stringify(storyData));
    } catch (error) {
      console.warn('Failed to save story to localStorage:', error);
    }
  }, [storyData]);

  // Story update method
  const updateStory = (updates) => {
    setStoryData(prev => ({ 
      ...prev, 
      ...updates, 
      wordCount: updates.editorContent 
        ? updates.editorContent.split(/\s+/).filter(word => word.length > 0).length 
        : prev.wordCount 
    }));
  };

  // Auto-sync disabled in new workflow - users write directly in canvas
  useEffect(() => {
    // Only set initial content if completely empty
    if (!storyData.editorContent) {
      const initialContent = `# ${storyData.title || 'Your Story'}\n\nStart writing your story here...`;
      updateStory({ editorContent: initialContent });
    }
  }, [storyData.title, storyData.editorContent]); // Only depend on title changes

  // Voice state (male/female)
  const [voices, setVoices] = useState([]);
  const [voiceType, setVoiceType] = useState('female');

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      // cleanup to avoid setState on unmounted
      isMounted.current = false;
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch {
        // no-op
      }
    };
  }, []);

  useEffect(() => {
    if (!(typeof window !== 'undefined' && window.speechSynthesis)) return;
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const pickVoice = () => {
    if (!voices || voices.length === 0) return null;
    const english = voices.filter(v => (v.lang || '').toLowerCase().startsWith('en'));
    const list = english.length ? english : voices;
    const needle = voiceType === 'female'
      ? /(female|zira|samantha|victoria|karen|serena|allison|susan)/i
      : /(male|daniel|alex|google uk english male|fred|michael|george)/i;
    return list.find(v => needle.test(v.name)) || list[0] || null;
  };  const readStory = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      if (isMounted.current) setIsSpeaking(false);
      return;
    }
    
    // Read from the actual story content in the editor, not from chat history
    const rawText = storyData.editorContent || '';
    
    // Clean the text by removing markdown formatting for better speech
    const cleanText = rawText
      .replace(/^#+\s*/gm, '')           // Remove markdown headers (# ## ###)
      .replace(/\*\*(.*?)\*\*/g, '$1')   // Remove bold formatting (**)
      .replace(/\*(.*?)\*/g, '$1')       // Remove italic formatting (*)
      .replace(/^>\s*/gm, '')            // Remove blockquotes (>)
      .replace(/^-\s*/gm, '')            // Remove list markers (-)
      .replace(/^\*\s*/gm, '')           // Remove list markers (*)
      .replace(/---+/g, '')              // Remove horizontal rules
      .replace(/\n\s*\n\s*\n/g, '\n\n')  // Clean up excessive line breaks
      .trim();
    
    if (!cleanText) {
      // If no story content, inform the user
      const message = "No story content to read. Please write your story first.";
      const utter = new SpeechSynthesisUtterance(message);
      const v = pickVoice();
      if (v) utter.voice = v;
      utter.lang = (v && v.lang) || 'en-US';
      utter.onend = () => {
        if (isMounted.current) setIsSpeaking(false);
      };
      window.speechSynthesis.speak(utter);
      if (isMounted.current) setIsSpeaking(true);
      return;
    }

    const utter = new SpeechSynthesisUtterance(cleanText);
    const v = pickVoice();
    if (v) utter.voice = v;
    utter.lang = (v && v.lang) || 'en-US';
    utter.onend = () => {
      if (isMounted.current) setIsSpeaking(false);
    };
    window.speechSynthesis.speak(utter);
    if (isMounted.current) setIsSpeaking(true);
  };

  const improvementSuggestions = [
    'Make this scene more dramatic and engaging',
    'Improve the dialogue to sound more natural',
    'Add more sensory details and atmosphere',
    'Enhance character development and depth',
  ];

  const sendMessage = async () => {
    const text = message.trim();
    if (!text || isLoading) return;

    setError('');
    setIsLoading(true);
    
    // In new workflow, all chat messages are treated as improvement requests
    
    // Check if there's content to improve
    if (!storyData.editorContent || storyData.editorContent.trim() === `# ${storyData.title || 'Your Story'}\n\nStart writing your story here...`) {
      setError('Please write some story content in the canvas above first, then I can help improve it.');
      setIsLoading(false);
      return;
    }
    
    // Add user's improvement request to chat
    const newChatHistory = [...storyData.chatHistory, { type: 'choice', content: text }];
    updateStory({ chatHistory: newChatHistory });
    setMessage('');

    try {
      // Always use improvement payload since all chat is for improvements
      const payload = buildImprovementPayload(storyData, storyData.editorContent, text);
      
      const result = await callStoryAPI(payload);

      if (result && result.storySegment) {
        if (!isMounted.current) return;
        
        // Show diff view and update content
        setDiffData({
          oldContent: storyData.editorContent,
          newContent: result.storySegment,
          improvementRequest: text
        });
        setShowDiff(true);
        
        // Mark as manual edit to prevent auto-sync override
        setIsManualEdit(true);
        
        // Update the content
        updateStory({ 
          editorContent: result.storySegment,
          chatHistory: [...newChatHistory, { type: 'story', content: `Applied improvement: ${text}` }]
        });
        
        // Clear any previous errors on success
        setError('');
        
      } else {
        throw new Error('No improved content received from the API');
      }
    } catch (e) {
      console.error('Story improvement error:', e);
      if (isMounted.current) {
        const errorMessage = e.message || 'Failed to improve the story. Please try again.';
        setError(errorMessage);
        
        // Auto-clear error after 10 seconds
        setTimeout(() => {
          if (isMounted.current) setError('');
        }, 10000);
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // Export current story
  const exportCurrentStory = () => {
    const content = storyData.editorContent || `# Your Story\n\nNo content yet.`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle title editing
  const startTitleEdit = () => {
    setTempTitle(storyData.title || 'Untitled Story');
    setIsEditingTitle(true);
  };

  const saveTitleEdit = () => {
    updateStory({ title: tempTitle.trim() || 'Untitled Story' });
    setIsEditingTitle(false);
  };

  const cancelTitleEdit = () => {
    setIsEditingTitle(false);
    setTempTitle('');
  };

  // Close diff modal
  const closeDiff = () => {
    setShowDiff(false);
    setDiffData(null);
  };

  // Reset current story
  const resetCurrentStory = () => {
    updateStory({
      title: '',
      editorContent: '',
      chatHistory: [],
      characters: [
        {
          id: '1',
          name: '',
          role: '',
          description: '',
          traits: []
        }
      ],
      themes: [],
      genres: [],
      setting: '',
      plotPoints: [],
      wordCount: 0,
      createdAt: Date.now(),
    });
    // Reset manual edit flag
    setIsManualEdit(false);
    // Reset title editing state if active
    setIsEditingTitle(false);
    setTempTitle('');
  };

  // Clean glass theme without neumorphism variables

  // Ensure welcome message exists at start
  const chatMessages = useMemo(() => {
    const base = [{ type: 'story', content: 'Welcome to TaleWeaver! Start writing your story directly in the canvas above. Use this chat to describe improvements or changes you want to make, and I\'ll help enhance your writing with professional polish.' }];
    return storyData.chatHistory.length ? storyData.chatHistory : base;
  }, [storyData.chatHistory]);

  return (
    <div className={`min-h-screen h-screen w-screen bg-primary transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* VS Code-like Header - 48px height */}
      <header className="glass-header flex items-center justify-between px-6">
        <div className="flex items-center gap-base">
          <div className="glass-button w-8 h-8 p-0 flex items-center justify-center">
            <img src="/logo.png" alt="TaleWeaver" className="w-6 h-6 object-contain" />
          </div>
          <div className="text-base font-medium">TaleWeaver</div>
        </div>
        
        <div className="flex items-center gap-sm">
          <select
            value={voiceType}
            onChange={(e) => setVoiceType(e.target.value)}
            className="glass-input text-sm py-xs px-base w-auto"
            title="Voice"
          >
            <option value="female">♀ Female</option>
            <option value="male">♂ Male</option>
          </select>
          
          <button
            onClick={readStory}
            className={`glass-button text-sm font-light px-base py-xs ${
              isSpeaking 
                ? 'text-mono-900 dark:text-mono-100'
                : 'text-mono-600 dark:text-mono-400'
            }`}
          >
            <div className="flex items-center gap-sm">
              {isSpeaking ? (
                <>
                  <FontAwesomeIcon icon={faStop} className="w-3 h-3" />
                  Stop
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlay} className="w-3 h-3" />
                  Read
                </>
              )}
            </div>
          </button>
          
          <button
            onClick={exportCurrentStory}
            className="glass-button text-sm font-light px-base py-xs text-mono-600 dark:text-mono-400"
          >
            <div className="flex items-center gap-sm">
              <FontAwesomeIcon icon={faDownload} className="w-3 h-3" />
              Save
            </div>
          </button>
          
          <button
            onClick={() => { 
              if (window.confirm('Reset entire story? This will clear:\n• Story content (canvas)\n• Chat history\n• Setup (characters, genres, themes, setting)\n• Story title\n\nThis action cannot be undone.')) {
                resetCurrentStory();
              }
            }}
            className="glass-button text-sm font-light px-base py-xs text-mono-600 dark:text-mono-400"
            title="Reset entire story including content and setup"
          >
            <div className="flex items-center gap-sm">
              <FontAwesomeIcon icon={faRotateRight} className="w-3 h-3" />
              Reset All
            </div>
          </button>
          
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </div>
      </header>

      {/* Main layout: Sidebar + Editor */}
      <div className="h-[calc(100vh-48px)] w-full flex overflow-hidden bg-primary">
        {/* Sidebar */}
        <aside className="flex-[2] h-full glass-sidebar overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Chat header */}
            <div className="p-4 border-b border-glass-border">
              <div className="flex items-center">
                <div className="text-base font-medium">AI Assistant</div>
              </div>
            </div>

            {/* Chat messages with compact spacing */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-base scrollbar-clean"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
            {chatMessages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="w-12 h-12 bg-mono-200 dark:bg-mono-800 flex items-center justify-center">
                        <FontAwesomeIcon icon={faWandMagicSparkles} className="w-5 h-5 text-mono-600 dark:text-mono-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-medium">AI Story Assistant</h3>
                  <p className="text-sm text-mono-600 dark:text-mono-400 max-w-48">
                    Write your story in the editor, then ask me to improve it.
                  </p>
                </div>
                <div className="space-y-2 text-sm text-mono-500">
                  <p className="font-medium">Try asking:</p>
                  <div className="space-y-1">
                    <p>• "Make this more dramatic"</p>
                    <p>• "Add more dialogue"</p>
                    <p>• "Improve the pacing"</p>
                    <p>• "Fix grammar and style"</p>
                  </div>
                </div>
              </div>
            )}
            {chatMessages.map((item, idx) => (
              <div key={idx} className="space-y-2" style={{ animationDelay: `${idx * 0.1}s` }}>
                {item.type === 'story' ? (
                  <div className="border border-mono-200 dark:border-mono-800 p-4 bg-mono-50/50 dark:bg-mono-900/50">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-5 h-5 bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm text-white">C</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">AI Assistant</span>
                          <span className="text-sm text-mono-500">{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm leading-relaxed ml-6">{item.content}</div>
                  </div>
                ) : (
                  <div className="border border-mono-200 dark:border-mono-800 p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-5 h-5 bg-mono-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm text-white">U</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">You</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm leading-relaxed ml-6">{item.content}</div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="text-center py-lg">
                <div className="glass-card inline-flex items-center gap-base px-xl py-lg">
                  <div className="flex gap-sm">
                    <div className="w-2 h-2 bg-mono-600 dark:bg-mono-400 animate-bounce"></div>
                    <div className="w-2 h-2 bg-mono-700 dark:bg-mono-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-mono-800 dark:bg-mono-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faWandMagicSparkles} className="w-4 h-4" />
                    <span className="text-body font-light">Crafting your story...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-lg">
                <div className="glass-card inline-flex items-center gap-base px-lg py-base text-body">
                  <span>⚠️</span>
                  <span className="text-sm font-light">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Compact suggestions panel */}
          {!isLoading && (
            <div className="border-t border-glass-border p-4">
              <div className="text-sm text-mono-600 dark:text-mono-400 mb-2">Suggestions:</div>
              <div className="grid grid-cols-1 gap-1">
                {improvementSuggestions.slice(0, 2).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(s)}
                    className="text-left text-sm p-2 border border-mono-200 dark:border-mono-800 hover:bg-mono-100 dark:hover:bg-mono-800 text-mono-700 dark:text-mono-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Compact input panel */}
          <div className="border-t border-glass-border p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask AI to improve your story..."
                  rows={2}
                  className="w-full text-sm p-3 border border-mono-200 dark:border-mono-800 bg-mono-50 dark:bg-mono-900 text-mono-800 dark:text-mono-200 placeholder-mono-500 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={isLoading || !message.trim()}
                className={`px-4 py-2 text-sm font-medium ${
                  isLoading || !message.trim() 
                    ? 'bg-mono-200 dark:bg-mono-800 text-mono-500 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </div>
          </div>
          </div>
        </aside>

        {/* Main Content Area - Glass Panel with systematic spacing */}
        <section className="flex-[3] h-full glass-panel overflow-hidden relative">
          <div className="h-full flex flex-col p-base space-y-base">
            {/* Header with clean styling like chat */}
            <div className="p-4 border-b border-glass-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div>
                    {isEditingTitle ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tempTitle}
                          onChange={(e) => setTempTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTitleEdit();
                            if (e.key === 'Escape') cancelTitleEdit();
                          }}
                          onBlur={saveTitleEdit}
                          autoFocus
                          className="text-sm bg-transparent border-b border-mono-400 dark:border-mono-600 outline-none text-mono-800 dark:text-mono-100"
                          placeholder="Enter story title..."
                        />
                        <button
                          onClick={saveTitleEdit}
                          className="text-xs text-mono-600 dark:text-mono-400 hover:text-mono-800 dark:hover:text-mono-200"
                          title="Save title (Enter)"
                        >
                          <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelTitleEdit}
                          className="text-xs text-mono-600 dark:text-mono-400 hover:text-mono-800 dark:hover:text-mono-200"
                          title="Cancel (Escape)"
                        >
                          <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <h2 
                        className="text-base font-medium cursor-pointer transition-colors flex items-center gap-2 text-mono-800 dark:text-mono-100"
                        onClick={startTitleEdit}
                        title="Click to edit story title"
                      >
                        {storyData.title || 'Untitled Story'}
                      </h2>
                    )}
                    <div className="flex items-center gap-2 text-sm text-mono-600 dark:text-mono-400 mt-1">
                      <span>
                        {activeTab === 'preview' && 'Formatted preview'}
                        {activeTab === 'source' && 'Markdown editor'}
                        {activeTab === 'setup' && 'Story configuration'}
                      </span>
                      <span>•</span>
                      <span>{storyData.wordCount || 0} words</span>
                      {isManualEdit && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <span>🔒</span> Manual edit
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* VS Code-style Tab Bar */}
            <div className="vscode-tab-bar">
              <button
                onClick={() => setActiveTab('preview')}
                className={`vscode-tab ${activeTab === 'preview' ? 'active' : ''}`}
              >
                Preview
              </button>
              <button
                onClick={() => setActiveTab('source')}
                className={`vscode-tab ${activeTab === 'source' ? 'active' : ''}`}
              >
                Source
              </button>
              <button
                onClick={() => setActiveTab('setup')}
                className={`vscode-tab ${activeTab === 'setup' ? 'active' : ''}`}
              >
                Setup
              </button>
            </div>

            {activeTab === 'preview' && (
              <div className="flex-1 overflow-auto p-4">
                <div className="max-w-none">
                  {storyData.editorContent ? (
                    <div className="formatted-story space-y-4">
                      {storyData.editorContent.split('\n').map((line, idx) => {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('# ')) {
                          return <h1 key={idx} className="text-xl font-semibold mb-4 pb-2 border-b border-mono-300 dark:border-mono-600 text-mono-800 dark:text-mono-100">{trimmed.slice(2)}</h1>;
                        } else if (trimmed.startsWith('## ')) {
                          return <h2 key={idx} className="text-lg font-medium mb-3 mt-4 text-mono-800 dark:text-mono-100">{trimmed.slice(3)}</h2>;
                        } else if (trimmed.startsWith('### ')) {
                          return <h3 key={idx} className="text-base font-medium mb-2 mt-3 text-mono-600 dark:text-mono-400">{trimmed.slice(4)}</h3>;
                        } else if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
                          return <p key={idx} className="font-semibold mb-2 text-sm text-mono-800 dark:text-mono-100">{trimmed.slice(2, -2)}</p>;
                        } else if (trimmed.startsWith('*') && trimmed.endsWith('*') && trimmed.length > 2) {
                          return <p key={idx} className="italic mb-2 text-sm text-mono-600 dark:text-mono-400">{trimmed.slice(1, -1)}</p>;
                        } else if (trimmed === '---') {
                          return <hr key={idx} className="border-mono-400 dark:border-mono-600 my-4" />;
                        } else if (trimmed.startsWith('> ')) {
                          return <blockquote key={idx} className="pl-3 border-l-2 italic mb-3 border-mono-400 dark:border-mono-600 text-mono-600 dark:text-mono-300 text-sm">{trimmed.slice(2)}</blockquote>;
                        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                          return <li key={idx} className="ml-4 mb-1 list-disc text-sm text-mono-800 dark:text-mono-100">{trimmed.slice(2)}</li>;
                        } else if (trimmed) {
                          return <p key={idx} className="mb-3 leading-relaxed text-sm text-mono-800 dark:text-mono-100">{trimmed}</p>;
                        } else {
                          return <br key={idx} />;
                        }
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                      <div className="w-12 h-12 bg-mono-200 dark:bg-mono-800 flex items-center justify-center">
                        <FontAwesomeIcon icon={faWandMagicSparkles} className="w-5 h-5 text-mono-600 dark:text-mono-400" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Your Writing Canvas</h3>
                        <p className="text-xs text-mono-600 dark:text-mono-400 max-w-48">
                          Start writing your story here! Click the title above to rename it.
                        </p>
                      </div>
                      <div className="space-y-2 text-xs text-mono-500">
                        <p className="font-medium">Quick start:</p>
                        <div className="space-y-1">
                          <p>• Click title to rename your story</p>
                          <p>• Use Setup tab for characters & themes</p>
                          <p>• Write directly in Source tab</p>
                          <p>• Use chat for improvement requests</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'source' && (
              <div className="flex-1 overflow-auto p-4">
                <div className="h-full flex flex-col">
                  <textarea
                    ref={editorTextareaRef}
                    value={storyData.editorContent || ''}
                    onChange={(e) => {
                      setIsManualEdit(true);
                      updateStory({ editorContent: e.target.value });
                    }}
                    placeholder={`# ${storyData.title || 'Your Story Title'}\n\nStart writing your story here! This is your primary writing space.\n\nUse markdown formatting:\n- **Bold text** for emphasis\n- *Italic text* for thoughts/emphasis\n- ## Chapter titles\n- * * * for scene breaks\n- > "Quoted dialogue"\n\nTip: Use the chat below to request improvements like:\n- "Make this more dramatic"\n- "Improve the dialogue"\n- "Add more sensory details"`}
                    className="flex-1 w-full resize-none font-mono text-sm leading-relaxed text-mono-800 dark:text-mono-100 bg-mono-50 dark:bg-mono-900 border border-mono-200 dark:border-mono-800 p-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        const text = storyData.editorContent || '';
                        if (navigator.clipboard && window.isSecureContext) {
                          navigator.clipboard.writeText(text);
                        } else {
                          const ta = document.createElement('textarea');
                          ta.value = text;
                          document.body.appendChild(ta);
                          ta.select();
                          document.execCommand('copy');
                          document.body.removeChild(ta);
                        }
                      }}
                      className="px-3 py-1 text-sm text-mono-600 dark:text-mono-400 hover:text-mono-800 dark:hover:text-mono-200 border border-mono-200 dark:border-mono-800 bg-mono-50 dark:bg-mono-900"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => updateStory({ editorContent: '' })}
                      className="px-3 py-1 text-sm text-mono-600 dark:text-mono-400 hover:text-mono-800 dark:hover:text-mono-200 border border-mono-200 dark:border-mono-800 bg-mono-50 dark:bg-mono-900"
                    >
                      Clear
                    </button>
                    {isManualEdit && (
                      <button
                        onClick={() => setIsManualEdit(false)}
                        className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
                        title="Re-enable automatic sync from chat"
                      >
                        🔄 Auto-sync
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'setup' && (
              <div className="flex-1 overflow-auto">
                <CharacterSetup storyData={storyData} updateStory={updateStory} />
              </div>
            )}
          </div>
        </section>
      </div>
      
      {/* Diff Viewer Modal */}
      {showDiff && diffData && (
        <DiffViewer
          oldContent={diffData.oldContent}
          newContent={diffData.newContent}
          onClose={closeDiff}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default TaleWeaver;