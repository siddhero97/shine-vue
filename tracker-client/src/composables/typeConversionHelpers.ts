export interface UseTypeConversionHelpersPublic {
  convertBooleanToYesNoString: (booleanValue: boolean) => string;
  convertRouteParamToNumber: (routeParam: string) => number;
}

export const useTypeConversionHelpers = (): UseTypeConversionHelpersPublic => {

  const convertBooleanToYesNoString = (booleanValue: boolean): string => {
    return booleanValue ? "Yes" : "No"
  };

  // We need special code to convert a numeric URL route parameter from a string
  // into an actual number data type.
  const convertRouteParamToNumber = (routeParam: string): number => {
    return Number.parseInt((routeParam as string), 10) || 0;
  }

  return {
    convertBooleanToYesNoString,
    convertRouteParamToNumber
  };
}
