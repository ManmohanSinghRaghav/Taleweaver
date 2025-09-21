import { useState } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

const CharacterSetup = ({ storyData, updateStory }) => {
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [newGenre, setNewGenre] = useState('');
  const [newTheme, setNewTheme] = useState('');

  // Use dark mode detection from system/localStorage if available
  const isDarkMode = document.documentElement.classList.contains('dark') || 
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const border = isDarkMode ? 'border-neutral-700' : 'border-neutral-200';

  // Character management
  const addCharacter = () => {
    const newCharacter = {
      id: Date.now().toString(),
      name: '',
      role: '',
      description: '',
      traits: []
    };
    updateStory({
      characters: [...(storyData.characters || []), newCharacter]
    });
    setEditingCharacter(newCharacter.id);
  };

  const updateCharacter = (id, updates) => {
    updateStory({
      characters: (storyData.characters || []).map(char => 
        char.id === id ? { ...char, ...updates } : char
      )
    });
  };

  const removeCharacter = (id) => {
    if ((storyData.characters || []).length > 1) {
      updateStory({
        characters: (storyData.characters || []).filter(char => char.id !== id)
      });
      if (editingCharacter === id) {
        setEditingCharacter(null);
      }
    }
  };

  // Genre management
  const addGenre = () => {
    if (newGenre.trim() && !(storyData.genres || []).includes(newGenre.trim())) {
      updateStory({
        genres: [...(storyData.genres || []), newGenre.trim()]
      });
      setNewGenre('');
    }
  };

  const removeGenre = (genre) => {
    updateStory({
      genres: (storyData.genres || []).filter(g => g !== genre)
    });
  };

  // Theme management
  const addTheme = () => {
    if (newTheme.trim() && !(storyData.themes || []).includes(newTheme.trim())) {
      updateStory({
        themes: [...(storyData.themes || []), newTheme.trim()]
      });
      setNewTheme('');
    }
  };

  const removeTheme = (theme) => {
    updateStory({
      themes: (storyData.themes || []).filter(t => t !== theme)
    });
  };

  const addCharacterTrait = (characterId, trait) => {
    if (trait.trim()) {
      const character = storyData.characters.find(c => c.id === characterId);
      if (character && !character.traits.includes(trait.trim())) {
        updateCharacter(characterId, {
          traits: [...character.traits, trait.trim()]
        });
      }
    }
  };

  const removeCharacterTrait = (characterId, trait) => {
    const character = storyData.characters.find(c => c.id === characterId);
    if (character) {
      updateCharacter(characterId, {
        traits: character.traits.filter(t => t !== trait)
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8">
      {/* Story Settings Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <span className="text-white text-sm">⚙️</span>
          </div>
          <h3 className="text-xl font-bold">Story Configuration</h3>
        </div>

        {/* Story Title */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <span>📖</span> Story Title
          </label>
          <input
            type="text"
            value={storyData.title || ''}
            onChange={(e) => updateStory({ title: e.target.value })}
            placeholder="Enter your story title..."
            className={`w-full px-4 py-3 rounded-xl border ${border} text-sm transition-all duration-200 ${
              isDarkMode 
                ? 'bg-neutral-800 text-white placeholder:text-neutral-400 focus:bg-neutral-700' 
                : 'bg-white text-black placeholder:text-neutral-500 focus:bg-neutral-50'
            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
        </div>

        {/* Setting */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <span>🏞️</span> Setting & World
          </label>
          <textarea
            value={storyData.setting || ''}
            onChange={(e) => updateStory({ setting: e.target.value })}
            placeholder="Describe the world, time period, and setting of your story..."
            rows={3}
            className={`w-full px-4 py-3 rounded-xl border ${border} text-sm resize-none transition-all duration-200 ${
              isDarkMode 
                ? 'bg-neutral-800 text-white placeholder:text-neutral-400 focus:bg-neutral-700' 
                : 'bg-white text-black placeholder:text-neutral-500 focus:bg-neutral-50'
            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
        </div>

        {/* Genres */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <span>🎭</span> Genres
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGenre()}
              placeholder="Add genre (fantasy, sci-fi, mystery...)"
              className={`flex-1 px-4 py-2 rounded-lg border ${border} text-sm transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-neutral-800 text-white placeholder:text-neutral-400' 
                  : 'bg-white text-black placeholder:text-neutral-500'
              } focus:ring-2 focus:ring-purple-500`}
            />
            <button
              onClick={addGenre}
              className={`px-4 py-2 rounded-lg border ${border} transition-all duration-200 hover:scale-105 ${
                isDarkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              <FaPlus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {storyData.genres?.map((genre, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${border} ${
                  isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                }`}
              >
                {genre}
                <button
                  onClick={() => removeGenre(genre)}
                  className="hover:text-red-500 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Themes */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <span>💭</span> Themes & Messages
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTheme}
              onChange={(e) => setNewTheme(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTheme()}
              placeholder="Add theme (love, redemption, courage...)"
              className={`flex-1 px-4 py-2 rounded-lg border ${border} text-sm transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-neutral-800 text-white placeholder:text-neutral-400' 
                  : 'bg-white text-black placeholder:text-neutral-500'
              } focus:ring-2 focus:ring-purple-500`}
            />
            <button
              onClick={addTheme}
              className={`px-4 py-2 rounded-lg border ${border} transition-all duration-200 hover:scale-105 ${
                isDarkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              <FaPlus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {storyData.themes?.map((theme, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${border} ${
                  isDarkMode ? 'bg-pink-900/30 text-pink-300' : 'bg-pink-100 text-pink-700'
                }`}
              >
                {theme}
                <button
                  onClick={() => removeTheme(theme)}
                  className="hover:text-red-500 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Characters Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white text-sm">👥</span>
            </div>
            <h3 className="text-xl font-bold">Characters</h3>
          </div>
          <button
            onClick={addCharacter}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${border} transition-all duration-200 hover:scale-105 ${
              isDarkMode ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            <FaPlus className="w-3 h-3" />
            Add Character
          </button>
        </div>

        <div className="space-y-4">
          {storyData.characters?.map((character, index) => (
            <div
              key={character.id}
              className={`p-4 rounded-xl border ${border} transition-all duration-200 ${
                isDarkMode ? 'bg-neutral-800/50' : 'bg-neutral-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 
                      ? isDarkMode ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white'
                      : isDarkMode ? 'bg-neutral-600 text-white' : 'bg-neutral-400 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  {index === 0 && <span className="text-xs text-emerald-500 font-medium">Main Character</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCharacter(editingCharacter === character.id ? null : character.id)}
                    className={`p-1 rounded transition-colors ${
                      isDarkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'
                    }`}
                  >
                    <FaEdit className="w-3 h-3" />
                  </button>
                  {storyData.characters.length > 1 && (
                    <button
                      onClick={() => removeCharacter(character.id)}
                      className={`p-1 rounded transition-colors hover:text-red-500 ${
                        isDarkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'
                      }`}
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {editingCharacter === character.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={character.name}
                        onChange={(e) => updateCharacter(character.id, { name: e.target.value })}
                        placeholder="Character name..."
                        className={`w-full px-3 py-2 rounded-lg border ${border} text-sm ${
                          isDarkMode 
                            ? 'bg-neutral-900 text-white placeholder:text-neutral-400' 
                            : 'bg-white text-black placeholder:text-neutral-500'
                        } focus:ring-2 focus:ring-emerald-500`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2">Role</label>
                      <input
                        type="text"
                        value={character.role}
                        onChange={(e) => updateCharacter(character.id, { role: e.target.value })}
                        placeholder="Protagonist, villain, mentor..."
                        className={`w-full px-3 py-2 rounded-lg border ${border} text-sm ${
                          isDarkMode 
                            ? 'bg-neutral-900 text-white placeholder:text-neutral-400' 
                            : 'bg-white text-black placeholder:text-neutral-500'
                        } focus:ring-2 focus:ring-emerald-500`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2">Description</label>
                    <textarea
                      value={character.description}
                      onChange={(e) => updateCharacter(character.id, { description: e.target.value })}
                      placeholder="Physical appearance, background, personality..."
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg border ${border} text-sm resize-none ${
                        isDarkMode 
                          ? 'bg-neutral-900 text-white placeholder:text-neutral-400' 
                          : 'bg-white text-black placeholder:text-neutral-500'
                      } focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2">Traits</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Add trait..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addCharacterTrait(character.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg border ${border} text-sm ${
                          isDarkMode 
                            ? 'bg-neutral-900 text-white placeholder:text-neutral-400' 
                            : 'bg-white text-black placeholder:text-neutral-500'
                        } focus:ring-2 focus:ring-emerald-500`}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {character.traits?.map((trait, traitIndex) => (
                        <span
                          key={traitIndex}
                          className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border ${border} ${
                            isDarkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {trait}
                          <button
                            onClick={() => removeCharacterTrait(character.id, trait)}
                            className="hover:text-red-500 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{character.name || 'Unnamed Character'}</span>
                    {character.role && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDarkMode ? 'bg-neutral-700 text-neutral-300' : 'bg-neutral-200 text-neutral-600'
                      }`}>
                        {character.role}
                      </span>
                    )}
                  </div>
                  {character.description && (
                    <p className="text-sm opacity-80">{character.description}</p>
                  )}
                  {character.traits?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {character.traits.map((trait, traitIndex) => (
                        <span
                          key={traitIndex}
                          className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterSetup;