/**
 * Utility functions for handling tags in different formats
 */

/**
 * Parse tags from various formats (string, array, JSON string) into a consistent array
 * @param tags - Tags in any format (string, array, or null/undefined)
 * @returns Array of tag strings
 */
export function parseTagsToArray(tags: any): string[] {
  if (!tags) return [];
  
  // If already an array, return as-is
  if (Array.isArray(tags)) {
    return tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0);
  }
  
  // If it's a string, try to parse it
  if (typeof tags === 'string') {
    // First try to parse as JSON
    try {
      const parsedTags = JSON.parse(tags);
      if (Array.isArray(parsedTags)) {
        return parsedTags.filter(tag => typeof tag === 'string' && tag.trim().length > 0);
      }
    } catch {
      // If JSON parsing fails, split by comma
    }
    
    // Split by comma and clean up
    return tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }
  
  return [];
}

/**
 * Convert tags array to a comma-separated string for keywords
 * @param tags - Tags in any format
 * @returns Comma-separated string of tags
 */
export function parseTagsToString(tags: any): string {
  const tagsArray = parseTagsToArray(tags);
  return tagsArray.join(', ');
}

/**
 * Check if tags exist and have content
 * @param tags - Tags in any format
 * @returns Boolean indicating if tags exist
 */
export function hasTags(tags: any): boolean {
  return parseTagsToArray(tags).length > 0;
}