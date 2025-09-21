// TaleWeaver - Two-Panel Interactive Writing Assistant
import { useEffect, useMemo, useRef, useState } from 'react';
import ThemeToggle from './components/ui/ThemeToggle';
import CharacterSetup from './components/ui/CharacterSetup';
import DiffViewer from './components/ui/DiffViewer';
import { useAppState } from './hooks/useAppState';
import { useStoryApi } from './hooks/useStoryApi';

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
    const text = storyData.chatHistory
      .filter(i => i.type === 'story')
      .map(i => i.content)
      .join(' ')
      .trim();
    if (!text) return;

    const utter = new SpeechSynthesisUtterance(text);
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
          chatHistory: [...newChatHistory, { type: 'story', content: `✨ Applied improvement: ${text}` }]
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
      editorContent: '',
      chatHistory: [],
      genreText: '',
      character: '',
      wordCount: 0,
    });
  };

  // Styling helpers: strict black/white theme
  const containerBg = isDarkMode ? 'bg-black text-white' : 'bg-white text-black';
  const leftBg = isDarkMode ? 'bg-neutral-950' : 'bg-neutral-50';
  const rightBg = isDarkMode ? 'bg-neutral-900' : 'bg-white';
  const border = isDarkMode ? 'border-neutral-800' : 'border-neutral-300';

  // Ensure welcome message exists at start
  const chatMessages = useMemo(() => {
    const base = [{ type: 'story', content: 'Welcome to TaleWeaver! Start writing your story directly in the canvas above. Use this chat to describe improvements or changes you want to make, and I\'ll help enhance your writing with professional polish.' }];
    return storyData.chatHistory.length ? storyData.chatHistory : base;
  }, [storyData.chatHistory]);

  return (
    <div className={`min-h-screen h-screen w-screen ${containerBg} transition-colors duration-300`}>
      {/* Enhanced Top bar with gradient backdrop */}
      <header className={`h-14 flex items-center justify-between px-6 border-b ${border} ${rightBg} relative overflow-hidden`}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">TW</span>
          </div>
          <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TaleWeaver
          </div>
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <select
            value={voiceType}
            onChange={(e) => setVoiceType(e.target.value)}
            className={`text-xs px-3 py-2 rounded-lg border ${border} transition-all duration-200 ${isDarkMode ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-white text-black hover:bg-neutral-50'} focus:ring-2 focus:ring-blue-500`}
            title="Voice"
          >
            <option value="female">♀ Female Voice</option>
            <option value="male">♂ Male Voice</option>
          </select>
          
          <button
            onClick={readStory}
            className={`px-3 py-2 rounded-lg text-xs font-medium border ${border} transition-all duration-200 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-blue-500 ${
              isSpeaking 
                ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
                : isDarkMode ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' : 'bg-green-500 text-white border-green-500 hover:bg-green-600'
            }`}
          >
            {isSpeaking ? '⏹ Stop' : '▶ Read'}
          </button>
          
          <button
            onClick={exportCurrentStory}
            className={`px-3 py-2 rounded-lg text-xs font-medium border ${border} transition-all duration-200 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'}`}
          >
            💾 Save
          </button>
          
          <button
            onClick={() => { if (window.confirm('Reset current story?')) resetCurrentStory(); }}
            className={`px-3 py-2 rounded-lg text-xs font-medium border ${border} transition-all duration-200 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-orange-500 ${isDarkMode ? 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700' : 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600'}`}
          >
            🔄 Reset
          </button>
          
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </div>
      </header>

      {/* Main two-column layout with enhanced spacing */}
      <div className={`h-[calc(100vh-3.5rem)] w-full flex overflow-hidden`}>
        {/* Enhanced Chat Panel (Left) */}
        <aside className={`flex-[2] h-full ${leftBg} border-r ${border} overflow-hidden`}>
          <div className="h-full flex flex-col">
            {/* Chat header with gradient */}
            <div className={`p-4 border-b ${border} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10"></div>
              <div className="relative z-10 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <span className="text-white text-sm">�</span>
                </div>
                <div className="text-base font-semibold">Writing Assistant</div>
              </div>
            </div>

            {/* Enhanced conversation messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm custom-scrollbar"
              style={{ maxHeight: 'calc(100vh - 14rem)' }}
            >
            {chatMessages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <span className="text-2xl">🔧</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Writing Assistant</h3>
                  <p className="text-sm opacity-70 max-w-xs">
                    Write your story in the canvas tab, then use this chat to request improvements and refinements.
                  </p>
                </div>
                <div className="space-y-2 text-xs opacity-60">
                  <p>Try requests like:</p>
                  <div className="space-y-1">
                    <p>• &ldquo;Make this more dramatic&rdquo;</p>
                    <p>• &ldquo;Add more dialogue&rdquo;</p>
                    <p>• &ldquo;Improve the pacing&rdquo;</p>
                    <p>• &ldquo;Fix grammar and style&rdquo;</p>
                  </div>
                </div>
              </div>
            )}
            {chatMessages.map((item, idx) => (
              <div key={idx} className="space-y-2 message-enter" style={{ animationDelay: `${idx * 0.1}s` }}>
                {item.type === 'story' ? (
                  <div className={`p-4 rounded-2xl border ${border} ${
                    isDarkMode ? 'bg-gradient-to-br from-neutral-900 to-neutral-800' : 'bg-gradient-to-br from-white to-neutral-50'
                  } shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
                    <div className="relative z-10">
                      <div className="text-xs opacity-70 mb-3 flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center`}>
                          <span className="text-white text-xs">✨</span>
                        </div>
                        <span className="font-medium">TaleWeaver</span>
                        <div className="flex-1"></div>
                        <span className="text-xs opacity-50">{new Date().toLocaleTimeString()}</span>
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed text-base">{item.content}</div>
                    </div>
                  </div>
                ) : (
                  <div className={`ml-6 pl-4 border-l-2 ${isDarkMode ? 'border-emerald-500/50' : 'border-emerald-400/50'} opacity-90 relative`}>
                    <div className="text-xs opacity-70 mb-2 flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center`}>
                        <span className="text-white text-xs">👤</span>
                      </div>
                      <span className="font-medium">You</span>
                    </div>
                    <div className="whitespace-pre-wrap bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-3 rounded-lg">
                      {item.content}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="text-center py-6">
                <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl ${
                  isDarkMode ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50' : 'bg-gradient-to-r from-blue-50 to-purple-50'
                } border ${border}`}>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm font-medium">✨ Crafting your story...</span>
                </div>
              </div>
            )}

            {error && (
              <div className={`text-center py-4`}>
                <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border-2 ${
                  isDarkMode 
                    ? 'border-red-500/50 bg-red-900/20 text-red-300' 
                    : 'border-red-400/50 bg-red-50 text-red-700'
                }`}>
                  <span>⚠️</span>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced suggestions above input */}
          {!isLoading && (
            <div className={`border-t ${border} p-4 space-y-3 ${isDarkMode ? 'bg-gradient-to-r from-neutral-900 to-neutral-800' : 'bg-gradient-to-r from-neutral-50 to-white'}`}>
              <div className="text-xs font-medium opacity-70 flex items-center gap-1">
                <span>💡</span> Improvement suggestions:
              </div>
              <div className="flex gap-3">
                {improvementSuggestions.slice(0, 2).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(s)}
                    className={`flex-1 text-xs px-4 py-3 rounded-xl border ${border} transition-all duration-200 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-neutral-800 text-white hover:bg-neutral-700 border-neutral-600' 
                        : 'bg-white text-black hover:bg-neutral-50 border-neutral-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced input row */}
          <div className={`border-t ${border} p-4 ${isDarkMode ? 'bg-neutral-900' : 'bg-white'}`}>
            <div className="flex items-end gap-4">
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
                  placeholder={'Request story improvements: "Make it more dramatic", "Add dialogue", "Improve pacing", "Fix grammar"... (Enter to send, Shift+Enter for new line)'}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border ${border} text-sm resize-none transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-neutral-800 text-white placeholder:text-neutral-400 focus:bg-neutral-700' 
                      : 'bg-white text-black placeholder:text-neutral-500 focus:bg-neutral-50'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={isLoading || !message.trim()}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                  isLoading || !message.trim() 
                    ? 'opacity-50 cursor-not-allowed bg-neutral-400 text-neutral-200' 
                    : isDarkMode
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Send</span>
                    <span>🚀</span>
                  </div>
                )}
              </button>
            </div>
          </div>
          </div>
        </aside>

        {/* Enhanced Editor Panel (Right) */}
        <section className={`flex-[3] h-full ${rightBg} overflow-hidden relative`}>
          <div className={`h-full flex flex-col`}>
            {/* Enhanced header with gradient */}
            <div className={`p-5 border-b ${border} flex items-center justify-between relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-pink-500/10"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-600 flex items-center justify-center">
                    <span className="text-white text-sm">📝</span>
                  </div>
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
                          className={`text-lg font-bold bg-transparent border-b-2 border-blue-500 outline-none ${
                            isDarkMode ? 'text-white' : 'text-black'
                          }`}
                          placeholder="Enter story title..."
                        />
                        <button
                          onClick={saveTitleEdit}
                          className="text-green-500 hover:text-green-600 text-sm"
                          title="Save title (Enter)"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelTitleEdit}
                          className="text-red-500 hover:text-red-600 text-sm"
                          title="Cancel (Escape)"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <h2 
                        className="text-lg font-bold cursor-pointer hover:text-blue-500 transition-colors flex items-center gap-2"
                        onClick={startTitleEdit}
                        title="Click to edit story title"
                      >
                        {storyData.title || 'Untitled Story'}
                        <span className="text-xs opacity-50">✏️</span>
                      </h2>
                    )}
                    <p className="text-xs opacity-70">
                      {activeTab === 'preview' && 'Formatted preview of your story'}
                      {activeTab === 'source' && 'Edit markdown source directly'}
                      {activeTab === 'setup' && 'Configure characters, themes, and story elements'}
                      <span className="ml-2">• {storyData.wordCount || 0} words</span>
                      <span className="ml-2 text-green-500">• Auto-saved ✓</span>
                      {isManualEdit && (
                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400">
                          <span>🔒</span> Manual edit mode
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative z-10 flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === 'preview'
                      ? isDarkMode ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg' : 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg'
                      : isDarkMode ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  } hover:scale-105 active:scale-95 focus:ring-2 focus:ring-violet-500`}
                >
                  👁️ Preview
                </button>
                <button
                  onClick={() => setActiveTab('source')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === 'source'
                      ? isDarkMode ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg' : 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg'
                      : isDarkMode ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  } hover:scale-105 active:scale-95 focus:ring-2 focus:ring-violet-500`}
                >
                  ⚡ Source
                </button>
                <button
                  onClick={() => setActiveTab('setup')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === 'setup'
                      ? isDarkMode ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg' : 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg'
                      : isDarkMode ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  } hover:scale-105 active:scale-95 focus:ring-2 focus:ring-violet-500`}
                >
                  ⚙️ Setup
                </button>
              </div>
            </div>

            {activeTab === 'preview' && (
              <div className={`flex-1 overflow-auto p-4`}>
                <div className={`max-w-none`}>
                  {storyData.editorContent ? (
                    <div className="formatted-story space-y-3">
                      {storyData.editorContent.split('\n').map((line, idx) => {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('# ')) {
                          return <h1 key={idx} className="text-2xl font-bold mb-6 pb-2 border-b border-neutral-300">{trimmed.slice(2)}</h1>;
                        } else if (trimmed.startsWith('## ')) {
                          return <h2 key={idx} className="text-xl font-semibold mb-4 mt-6">{trimmed.slice(3)}</h2>;
                        } else if (trimmed.startsWith('### ')) {
                          return <h3 key={idx} className="text-lg font-medium mb-3 mt-4">{trimmed.slice(4)}</h3>;
                        } else if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
                          return <p key={idx} className="font-bold mb-2 text-sm">{trimmed.slice(2, -2)}</p>;
                        } else if (trimmed.startsWith('*') && trimmed.endsWith('*') && trimmed.length > 2) {
                          return <p key={idx} className="italic mb-2">{trimmed.slice(1, -1)}</p>;
                        } else if (trimmed === '---') {
                          return <hr key={idx} className={`${isDarkMode ? 'border-neutral-600' : 'border-neutral-400'} my-6`} />;
                        } else if (trimmed.startsWith('> ')) {
                          return <blockquote key={idx} className={`pl-4 border-l-4 italic mb-3 ${isDarkMode ? 'border-neutral-600 text-neutral-300' : 'border-neutral-400 text-neutral-600'}`}>{trimmed.slice(2)}</blockquote>;
                        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                          return <li key={idx} className="ml-4 mb-1 list-disc">{trimmed.slice(2)}</li>;
                        } else if (trimmed) {
                          return <p key={idx} className="mb-3 leading-relaxed text-base">{trimmed}</p>;
                        } else {
                          return <br key={idx} />;
                        }
                      })}
                    </div>
                  ) : (
                    <div className="text-center opacity-50 mt-12">
                      <h3 className="text-lg font-medium mb-4">Your Writing Canvas</h3>
                      <p className="mb-2">Start writing your story here! Click the title above to rename it.</p>
                      <p className="text-sm">Switch to the Source tab to write in markdown, or use Setup to configure your story elements.</p>
                      <div className={`mt-6 p-4 rounded border ${border} text-left max-w-md mx-auto`}>
                        <p className="text-sm font-medium mb-2">Quick start:</p>
                        <ul className="text-xs space-y-1 opacity-70">
                          <li>📝 Click title to rename your story</li>
                          <li>⚙️ Use Setup tab for characters & themes</li>
                          <li>✍️ Write directly in Source tab</li>
                          <li>💬 Use chat for improvement requests</li>
                          <li>👁️ Preview shows formatted story</li>
                        </ul>
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
                    value={storyData.editorContent || ''}
                    onChange={(e) => {
                      setIsManualEdit(true);
                      updateStory({ editorContent: e.target.value });
                    }}
                    placeholder={`# ${storyData.title || 'Your Story Title'}\n\nStart writing your story here! This is your primary writing space.\n\nUse markdown formatting:\n- **Bold text** for emphasis\n- *Italic text* for thoughts/emphasis\n- ## Chapter titles\n- * * * for scene breaks\n- > "Quoted dialogue"\n\nTip: Use the chat below to request improvements like:\n- "Make this more dramatic"\n- "Improve the dialogue"\n- "Add more sensory details"`}
                    className={`flex-1 w-full resize-none focus:outline-none font-mono text-sm leading-relaxed ${
                      isDarkMode 
                        ? 'bg-neutral-800 text-white placeholder-neutral-400' 
                        : 'bg-neutral-50 text-black placeholder-neutral-500'
                    } p-3 rounded border ${border}`}
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
                      className={`px-3 py-1 text-xs rounded border ${border} ${isDarkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-100 hover:bg-neutral-200'}`}
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={() => updateStory({ editorContent: '' })}
                      className={`px-3 py-1 text-xs rounded border ${border} ${isDarkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-100 hover:bg-neutral-200'}`}
                    >
                      🗑️ Clear
                    </button>
                    <div className="border-l mx-2"></div>
                    <button
                      onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const selectedText = text.substring(start, end);
                          const newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
                          updateStory({ editorContent: newText });
                          setIsManualEdit(true);
                        }
                      }}
                      className={`px-3 py-1 text-xs rounded border ${border} ${isDarkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-100 hover:bg-neutral-200'}`}
                      title="Make selected text bold"
                    >
                      **B**
                    </button>
                    <button
                      onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const selectedText = text.substring(start, end);
                          const newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
                          updateStory({ editorContent: newText });
                          setIsManualEdit(true);
                        }
                      }}
                      className={`px-3 py-1 text-xs rounded border ${border} ${isDarkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-100 hover:bg-neutral-200'}`}
                      title="Make selected text italic"
                    >
                      *I*
                    </button>
                    <button
                      onClick={() => {
                        const currentContent = storyData.editorContent || '';
                        const newContent = currentContent + '\n\n* * *\n\n';
                        updateStory({ editorContent: newContent });
                        setIsManualEdit(true);
                      }}
                      className={`px-3 py-1 text-xs rounded border ${border} ${isDarkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-100 hover:bg-neutral-200'}`}
                      title="Add scene break"
                    >
                      * * *
                    </button>
                    {isManualEdit && (
                      <button
                        onClick={() => setIsManualEdit(false)}
                        className={`px-3 py-1 text-xs rounded border ${border} ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                        title="Re-enable automatic sync from chat"
                      >
                        🔄 Enable Auto-sync
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'setup' && (
              <div className={`flex-1 overflow-auto`}>
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