export function previewContent(content: string, limit: number = 100): string {
  // If content is within the limit, return the original content
  if (content.length <= limit) {
    return content;
  }

  // Adjust the ratio to show more content from the beginning
  const startRatio = 0.75; // 75% from the beginning

  const startLimit = Math.floor(limit * startRatio);
  const endLimit = limit - startLimit;

  const startPreview = content.slice(0, startLimit);
  const endPreview = content.slice(-endLimit);

  return `${startPreview} ... ${endPreview}`;
}

export function matchTimestamp(entryTimestamp: string, providedTimestamp: string): boolean {
  const regex = new RegExp(`^${providedTimestamp.replace('*', '.*')}`);
  return regex.test(entryTimestamp);
}
