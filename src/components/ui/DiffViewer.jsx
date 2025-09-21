import { useState, useEffect } from 'react';
import { computeLineDiff, groupDiffLines, getDiffStats } from '../../utils/diffUtils';

const DiffViewer = ({ oldContent, newContent, onClose, isDarkMode }) => {
  const [viewMode, setViewMode] = useState('unified'); // 'unified' or 'split'
  
  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // Handle empty content gracefully
  const safeOldContent = oldContent || '';
  const safeNewContent = newContent || '';
  
  const diff = computeLineDiff(safeOldContent, safeNewContent);
  const groupedDiff = groupDiffLines(diff);
  const stats = getDiffStats(diff);
  
  const border = isDarkMode ? 'border-neutral-700' : 'border-neutral-200';
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`w-[90vw] h-[80vh] max-w-6xl rounded-xl border ${border} ${
        isDarkMode ? 'bg-neutral-900' : 'bg-white'
      } flex flex-col shadow-2xl`}>
        
        {/* Header */}
        <div className={`p-4 border-b ${border} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm">📝</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">Story Improvement</h2>
              <p className="text-sm opacity-70">
                {stats.added} additions, {stats.removed} deletions
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-neutral-300 dark:border-neutral-600 overflow-hidden">
              <button
                onClick={() => setViewMode('unified')}
                className={`px-3 py-1 text-sm transition-colors ${
                  viewMode === 'unified'
                    ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    : isDarkMode ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Unified
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 text-sm transition-colors ${
                  viewMode === 'split'
                    ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    : isDarkMode ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Split
              </button>
            </div>
            
            <button
              onClick={onClose}
              className={`p-2 rounded-lg border ${border} transition-colors hover:scale-105 ${
                isDarkMode ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-neutral-100 text-black hover:bg-neutral-200'
              }`}
              title="Close diff view"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {stats.added === 0 && stats.removed === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-white text-2xl">✓</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">No Changes Detected</h3>
                <p className="text-sm opacity-70">The improved content is identical to the original.</p>
              </div>
            </div>
          ) : viewMode === 'unified' ? (
            <UnifiedDiffView 
              groupedDiff={groupedDiff} 
              isDarkMode={isDarkMode} 
              border={border}
            />
          ) : (
            <SplitDiffView 
              oldContent={safeOldContent} 
              newContent={safeNewContent} 
              isDarkMode={isDarkMode} 
              border={border}
            />
          )}
        </div>
        
        {/* Footer */}
        <div className={`p-4 border-t ${border} flex justify-between items-center text-sm opacity-70`}>
          <div>
            Story improved successfully
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded"></span>
              +{stats.added} added
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded"></span>
              -{stats.removed} removed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-neutral-500 rounded"></span>
              {stats.unchanged} unchanged
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const UnifiedDiffView = ({ groupedDiff, isDarkMode, border }) => {
  return (
    <div className="h-full overflow-auto font-mono text-sm">
      {groupedDiff.map((group, groupIndex) => (
        <div key={groupIndex}>
          {group.lines.map((line, lineIndex) => (
            <div 
              key={`${groupIndex}-${lineIndex}`}
              className={`flex border-b ${border} ${
                line.type === 'added' ? 
                  isDarkMode ? 'bg-green-900/30 hover:bg-green-900/40' : 'bg-green-50 hover:bg-green-100'
                : line.type === 'removed' ?
                  isDarkMode ? 'bg-red-900/30 hover:bg-red-900/40' : 'bg-red-50 hover:bg-red-100'
                : isDarkMode ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-50'
              }`}
            >
              <div className={`w-16 px-2 py-1 text-xs text-center border-r ${border} ${
                isDarkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-500'
              }`}>
                {line.oldLineNumber || ''}
              </div>
              <div className={`w-16 px-2 py-1 text-xs text-center border-r ${border} ${
                isDarkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-500'
              }`}>
                {line.newLineNumber || ''}
              </div>
              <div className="w-8 px-2 py-1 text-center">
                {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
              </div>
              <div className="flex-1 px-2 py-1 whitespace-pre-wrap">
                {line.content}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const SplitDiffView = ({ oldContent, newContent, isDarkMode, border }) => {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  
  return (
    <div className="h-full flex">
      {/* Old content */}
      <div className="flex-1 border-r border-neutral-300 dark:border-neutral-600">
        <div className={`p-2 text-sm font-medium border-b ${border} ${
          isDarkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'
        }`}>
          Original Story
        </div>
        <div className="h-full overflow-auto font-mono text-sm">
          {oldLines.map((line, index) => (
            <div 
              key={index}
              className={`flex border-b ${border} hover:bg-neutral-800/30`}
            >
              <div className={`w-12 px-2 py-1 text-xs text-center border-r ${border} ${
                isDarkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-500'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 px-2 py-1 whitespace-pre-wrap">
                {line}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* New content */}
      <div className="flex-1">
        <div className={`p-2 text-sm font-medium border-b ${border} ${
          isDarkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'
        }`}>
          Improved Story
        </div>
        <div className="h-full overflow-auto font-mono text-sm">
          {newLines.map((line, index) => (
            <div 
              key={index}
              className={`flex border-b ${border} hover:bg-neutral-800/30`}
            >
              <div className={`w-12 px-2 py-1 text-xs text-center border-r ${border} ${
                isDarkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-500'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 px-2 py-1 whitespace-pre-wrap">
                {line}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;