export function parseUtcDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  let adjusted = dateStr;
  
  // Check if timezone is missing. We check for 'Z' suffix, '+' offset,
  // or a '-' offset that appears after the 'T' indicator (to avoid matching date hyphens).
  const hasTimezone = adjusted.endsWith('Z') || 
                      adjusted.includes('+') || 
                      (adjusted.includes('T') && adjusted.indexOf('-', adjusted.indexOf('T')) !== -1);
                      
  if (!hasTimezone) {
    adjusted += 'Z';
  }
  return new Date(adjusted);
}
