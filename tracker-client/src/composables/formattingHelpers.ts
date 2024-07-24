export interface UseFormattingHelpersPublic {
  formatRawDateStringForDisplay: (rawDateString: string) => string;
}

export const useFormattingHelpers = (): UseFormattingHelpersPublic => {
  const formatRawDateStringForDisplay = (rawDateString: string): string => {
    try {
      const rawDate: Date = new Date(rawDateString);
      if (isNaN(rawDate.getTime())) {
        // It was an invalidly formatted date or a string such as "Unknown Date".
        // Just return the original string.
        return rawDateString;
      }

      return rawDate.toLocaleDateString('en-US', {
        weekday: 'long',
        //year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      // This was an unexpected error - just return the original "date" string.
      return rawDateString;
    }
  };

  return {
    formatRawDateStringForDisplay
  };
}
