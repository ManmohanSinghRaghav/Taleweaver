// Utility functions for computing differences between text content
// Used for showing VS Code-style diffs for story improvements

/**
 * Compute a simple line-based diff between two texts
 * Returns an array of diff objects with type, content, and line numbers
 */
export const computeLineDiff = (oldText, newText) => {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  
  const diff = [];
  
  let oldIndex = 0;
  let newIndex = 0;
  
  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex] || '';
    const newLine = newLines[newIndex] || '';
    
    if (oldIndex >= oldLines.length) {
      // Only new lines left
      diff.push({
        type: 'added',
        content: newLine,
        oldLineNumber: null,
        newLineNumber: newIndex + 1
      });
      newIndex++;
    } else if (newIndex >= newLines.length) {
      // Only old lines left
      diff.push({
        type: 'removed',
        content: oldLine,
        oldLineNumber: oldIndex + 1,
        newLineNumber: null
      });
      oldIndex++;
    } else if (oldLine === newLine) {
      // Lines are identical
      diff.push({
        type: 'unchanged',
        content: oldLine,
        oldLineNumber: oldIndex + 1,
        newLineNumber: newIndex + 1
      });
      oldIndex++;
      newIndex++;
    } else {
      // Lines are different - find the best match
      const lookahead = 3; // How many lines to look ahead for matches
      
      // Look for matching lines nearby
      let bestOldMatch = -1;
      let bestNewMatch = -1;
      let bestDistance = Infinity;
      
      for (let i = 0; i <= lookahead && oldIndex + i < oldLines.length; i++) {
        for (let j = 0; j <= lookahead && newIndex + j < newLines.length; j++) {
          if (oldLines[oldIndex + i] === newLines[newIndex + j]) {
            const distance = i + j;
            if (distance < bestDistance) {
              bestDistance = distance;
              bestOldMatch = i;
              bestNewMatch = j;
            }
          }
        }
      }
      
      if (bestOldMatch !== -1 && bestNewMatch !== -1) {
        // Add removed lines before the match
        for (let i = 0; i < bestOldMatch; i++) {
          diff.push({
            type: 'removed',
            content: oldLines[oldIndex + i],
            oldLineNumber: oldIndex + i + 1,
            newLineNumber: null
          });
        }
        
        // Add added lines before the match
        for (let j = 0; j < bestNewMatch; j++) {
          diff.push({
            type: 'added',
            content: newLines[newIndex + j],
            oldLineNumber: null,
            newLineNumber: newIndex + j + 1
          });
        }
        
        oldIndex += bestOldMatch;
        newIndex += bestNewMatch;
      } else {
        // No good match found, treat as changed line
        diff.push({
          type: 'removed',
          content: oldLine,
          oldLineNumber: oldIndex + 1,
          newLineNumber: null
        });
        diff.push({
          type: 'added',
          content: newLine,
          oldLineNumber: null,
          newLineNumber: newIndex + 1
        });
        oldIndex++;
        newIndex++;
      }
    }
  }
  
  return diff;
};

/**
 * Compute word-level differences within a line
 * Used for more granular highlighting of changes
 */
export const computeWordDiff = (oldLine, newLine) => {
  const oldWords = oldLine.split(/(\s+)/);
  const newWords = newLine.split(/(\s+)/);
  
  const diff = [];
  let oldIndex = 0;
  let newIndex = 0;
  
  while (oldIndex < oldWords.length || newIndex < newWords.length) {
    const oldWord = oldWords[oldIndex] || '';
    const newWord = newWords[newIndex] || '';
    
    if (oldIndex >= oldWords.length) {
      diff.push({ type: 'added', content: newWord });
      newIndex++;
    } else if (newIndex >= newWords.length) {
      diff.push({ type: 'removed', content: oldWord });
      oldIndex++;
    } else if (oldWord === newWord) {
      diff.push({ type: 'unchanged', content: oldWord });
      oldIndex++;
      newIndex++;
    } else {
      diff.push({ type: 'removed', content: oldWord });
      diff.push({ type: 'added', content: newWord });
      oldIndex++;
      newIndex++;
    }
  }
  
  return diff;
};

/**
 * Group consecutive lines of the same type for better readability
 */
export const groupDiffLines = (diff) => {
  const grouped = [];
  let currentGroup = null;
  
  for (const line of diff) {
    if (!currentGroup || currentGroup.type !== line.type) {
      currentGroup = {
        type: line.type,
        lines: [line]
      };
      grouped.push(currentGroup);
    } else {
      currentGroup.lines.push(line);
    }
  }
  
  return grouped;
};

/**
 * Calculate statistics about the diff
 */
export const getDiffStats = (diff) => {
  const stats = {
    added: 0,
    removed: 0,
    unchanged: 0,
    total: diff.length
  };
  
  for (const line of diff) {
    if (line.type === 'added') stats.added++;
    else if (line.type === 'removed') stats.removed++;
    else stats.unchanged++;
  }
  
  return stats;
};