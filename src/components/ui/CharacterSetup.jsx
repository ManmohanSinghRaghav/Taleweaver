import { useState, useEffect } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faTrash, 
  faGear, 
  faBook, 
  faEarth, 
  faMask, 
  faLightbulb, 
  faUsers,
  faPencil
} from '@fortawesome/free-solid-svg-icons';

// Add icons to the library
library.add(faPlus, faTrash, faGear, faBook, faEarth, faMask, faLightbulb, faUsers, faPencil);

const CharacterSetup = ({ storyData, updateStory }) => {
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [newGenre, setNewGenre] = useState('');
  const [newTheme, setNewTheme] = useState('');

  // Ensure all characters have properly initialized traits arrays
  useEffect(() => {
    if (storyData.characters && storyData.characters.some(char => !Array.isArray(char.traits))) {
      const fixedCharacters = storyData.characters.map(char => ({
        ...char,
        traits: Array.isArray(char.traits) ? char.traits : [],
        description: char.description || ''
      }));
      updateStory({ characters: fixedCharacters });
    }
  }, [storyData.characters, updateStory]);

  // Character management
  const addCharacter = () => {
    const newCharacter = {
      id: Date.now().toString(),
      name: '',
      role: '',
      description: '',
      traits: [] // Ensure traits is always an array
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
    if (trait && trait.trim()) {
      const character = storyData.characters?.find(c => c.id === characterId);
      if (character) {
        // Ensure traits array exists and initialize if needed
        const currentTraits = character.traits || [];
        const trimmedTrait = trait.trim();
        
        // Check if trait already exists (case-insensitive)
        if (!currentTraits.some(t => t.toLowerCase() === trimmedTrait.toLowerCase())) {
          updateCharacter(characterId, {
            traits: [...currentTraits, trimmedTrait]
          });
        }
      }
    }
  };

  const removeCharacterTrait = (characterId, trait) => {
    const character = storyData.characters?.find(c => c.id === characterId);
    if (character && character.traits) {
      updateCharacter(characterId, {
        traits: character.traits.filter(t => t !== trait)
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6 text-mono-800 dark:text-mono-100">
      {/* Story Settings Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <FontAwesomeIcon icon={faGear} className="w-4 h-4 text-mono-600 dark:text-mono-400" />
          </div>
          <h3 className="text-base font-medium">Story Configuration</h3>
        </div>

        {/* Story Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2 text-mono-600 dark:text-mono-400">
            <FontAwesomeIcon icon={faBook} className="w-4 h-4" /> Story Title
          </label>
          <input
            type="text"
            value={storyData.title || ''}
            onChange={(e) => updateStory({ title: e.target.value })}
            placeholder="Enter your story title..."
            className="w-full text-sm p-3 border border-mono-200 dark:border-mono-800 bg-mono-50 dark:bg-mono-900 text-mono-800 dark:text-mono-200 placeholder-mono-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Setting */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2 text-mono-600 dark:text-mono-400">
            <FontAwesomeIcon icon={faEarth} className="w-4 h-4" /> Setting & World
          </label>
          <textarea
            value={storyData.setting || ''}
            onChange={(e) => updateStory({ setting: e.target.value })}
            placeholder="Describe the world, time period, and setting of your story..."
            rows={3}
            className="w-full text-sm p-3 border border-mono-200 dark:border-mono-800 bg-mono-50 dark:bg-mono-900 text-mono-800 dark:text-mono-200 placeholder-mono-500 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Genres */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2 text-mono-600 dark:text-mono-400">
            <FontAwesomeIcon icon={faMask} className="w-4 h-4" /> Genres
          </label>
          <div className="flex gap-sm w-full">
            <input
              type="text"
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGenre()}
              placeholder="Add genre (fantasy, sci-fi, mystery...)"
              className="glass-input flex-1 text-sm"
            />
            <button
              onClick={addGenre}
              className="glass-button-primary px-base py-sm text-sm"
            >
              <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-sm">
            {storyData.genres?.map((genre, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-sm px-sm py-xs text-sm font-medium glass-card"
              >
                {genre}
                <button
                  onClick={() => removeGenre(genre)}
                  className="hover:opacity-80 transition-opacity"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Themes */}
        <div className="space-y-md">
          <label className="text-base font-medium flex items-center gap-2">
            <FontAwesomeIcon icon={faLightbulb} className="w-4 h-4" /> Themes & Messages
          </label>
          <div className="flex gap-sm w-full">
            <input
              type="text"
              value={newTheme}
              onChange={(e) => setNewTheme(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTheme()}
              placeholder="Add theme (love, redemption, courage...)"
              className="glass-input flex-1 text-sm"
            />
            <button
              onClick={addTheme}
              className="glass-button-primary px-base py-sm text-sm"
            >
              <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-sm">
            {storyData.themes?.map((theme, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-sm px-sm py-xs text-sm font-medium glass-card"
              >
                {theme}
                <button
                  onClick={() => removeTheme(theme)}
                  className="hover:opacity-80 transition-opacity"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Characters Section */}
      <div className="space-y-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-md">
            <div className="glass-button w-8 h-8 p-0 flex items-center justify-center">
              <FontAwesomeIcon icon={faUsers} className="w-4 h-4 text-mono-600 dark:text-mono-400" />
            </div>
            <h3 className="text-title font-light">Characters</h3>
          </div>
          <button
            onClick={addCharacter}
            className="glass-button-primary flex items-center gap-sm px-base py-sm"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
            Add Character
          </button>
        </div>

        <div className="space-y-base">
          {storyData.characters?.map((character, index) => (
            <div
              key={character.id}
              className="glass-card p-base"
            >
              <div className="flex items-center justify-between mb-base">
                <div className="flex items-center gap-sm">
                  <span className="glass-button w-6 h-6 p-0 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  {index === 0 && <span className="text-xs text-mono-600 dark:text-mono-400 font-medium">Main Character</span>}
                </div>
                <div className="flex gap-sm">
                  <button
                    onClick={() => setEditingCharacter(editingCharacter === character.id ? null : character.id)}
                    className="glass-button p-xs"
                  >
                    <FontAwesomeIcon icon={faPencil} className="w-3 h-3" />
                  </button>
                  {storyData.characters.length > 1 && (
                    <button
                      onClick={() => removeCharacter(character.id)}
                      className="glass-button p-xs hover:text-red-400"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {editingCharacter === character.id ? (
                <div className="space-y-base">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-base">
                    <div>
                      <label className="block text-xs font-medium mb-sm">Name</label>
                      <input
                        type="text"
                        value={character.name}
                        onChange={(e) => updateCharacter(character.id, { name: e.target.value })}
                        placeholder="Character name..."
                        className="glass-input text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-sm">Role</label>
                      <input
                        type="text"
                        value={character.role}
                        onChange={(e) => updateCharacter(character.id, { role: e.target.value })}
                        placeholder="Protagonist, villain, mentor..."
                        className="glass-input text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-sm">Description</label>
                    <textarea
                      value={character.description}
                      onChange={(e) => updateCharacter(character.id, { description: e.target.value })}
                      placeholder="Physical appearance, background, personality..."
                      rows={3}
                      className="glass-textarea text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-sm">Traits</label>
                    <div className="flex gap-sm mb-sm">
                      <input
                        type="text"
                        placeholder="Add trait..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const value = e.target.value.trim();
                            if (value) {
                              addCharacterTrait(character.id, value);
                              e.target.value = '';
                            }
                          }
                        }}
                        className="glass-input flex-1 text-sm"
                      />
                    </div>
                    <div className="flex flex-wrap gap-sm">
                      {(character.traits || []).map((trait, traitIndex) => (
                        <span
                          key={traitIndex}
                          className="inline-flex items-center gap-xs px-sm py-xs text-xs glass-card"
                        >
                          {trait}
                          <button
                            onClick={() => removeCharacterTrait(character.id, trait)}
                            className="hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-sm">
                  <div className="flex items-center gap-sm">
                    <span className="font-medium">{character.name || 'Unnamed Character'}</span>
                    {character.role && (
                      <span className="text-xs px-sm py-xs glass-card">
                        {character.role}
                      </span>
                    )}
                  </div>
                  {character.description && (
                    <p className="text-sm text-mono-600 dark:text-mono-400">{character.description}</p>
                  )}
                  {(character.traits || []).length > 0 && (
                    <div className="flex flex-wrap gap-xs mt-sm">
                      {(character.traits || []).map((trait, traitIndex) => (
                        <span
                          key={traitIndex}
                          className="text-xs px-sm py-xs glass-card"
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