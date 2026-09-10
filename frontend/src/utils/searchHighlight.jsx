import React from 'react';

// Normalize Vietnamese accents for regex building
function getAccentInsensitivePattern(query = '') {
  const map = {
    a: '[aàáảãạăằắẳẵặâầấẩẫậ]',
    e: '[eèéẻẽẹêềếểễệ]',
    i: '[iìíỉĩị]',
    o: '[oòóỏõọôồốổỗộơờớởỡợ]',
    u: '[uùúủũụưừứửữự]',
    y: '[yỳýỷỹỵ]',
    d: '[dđ]',
  };

  const words = query.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  const wordPatterns = words.map((word) => {
    let pattern = '';
    for (const char of word.toLowerCase()) {
      if (map[char]) {
        pattern += map[char];
      } else {
        pattern += char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
    }
    return pattern;
  });

  return new RegExp(`(${wordPatterns.join('|')})`, 'gi');
}

/**
 * Renders text with matched query keywords highlighted / bolded (bôi đen / làm nổi bật)
 */
export function HighlightedText({ text = '', query = '', className = '' }) {
  if (!text) return null;
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  try {
    const regex = getAccentInsensitivePattern(query);
    if (!regex) return <span className={className}>{text}</span>;

    const parts = text.split(regex);

    return (
      <span className={className}>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark
              key={index}
              className="bg-yellow-300 text-gray-950 font-bold px-1 py-0.5 rounded-xs shadow-2xs mx-0.5 border-b-2 border-yellow-500"
            >
              {part}
            </mark>
          ) : (
            <React.Fragment key={index}>{part}</React.Fragment>
          )
        )}
      </span>
    );
  } catch {
    return <span className={className}>{text}</span>;
  }
}
