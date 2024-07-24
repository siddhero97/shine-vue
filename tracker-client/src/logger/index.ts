/**
 * Global instance of vue-logger-plugin logger, configured based on environment
 * variables.
 * - VUE_APP_LOGGER_ENABLED
 * - VUE_APP_LOGGER_LEVEL
 *
 * See: https://github.com/dev-tavern/vue-logger-plugin
 *
 * NOTE: We only expose a subset of vue-logger-plugin as environment variables
 *       and our default fallback for those variables may be different than
 *       the default fallback of the options for its createLogger call.
 */

import { createLogger, StringifyObjectsHook } from "vue-logger-plugin";

//
// --- HELPERS ---
//

/**
 * Trims and lowercases a string.
 *
 * @param rawValue The value to trim and make lowercase.
 */
const trimAndLowercase = (rawValue: string): string => {
  return rawValue.trim().toLowerCase();
}

/**
 * Computes the "enabled" option for the logger based on the
 * VUE_APP_LOGGER_ENABLED environment variable. If the variable is 'false'
 * (case-insensitive), logging is disabled. Otherwise (by default) it is
 * enabled.
 *
 * @returns true if logging should be enabled; false if it should be disabled.
 */
const computeEnabledOption = (): boolean => {
  const enabledConfig: string = process.env.VUE_APP_LOGGER_ENABLED ?? 'true';
  return trimAndLowercase(enabledConfig) !== 'false';
}

/**
 * Computes the "level" option for the logger based on the VUE_APP_LOGGER_LEVEL
 * environment variable. This represents the minimum level of log messages to
 * output to the console if the logger is enabled. The level (case-insensitive)
 * can be 'debug' (most inclusive), 'info', 'warn', 'error' (our default), or
 * 'log' (least inclusive). If VUE_APP_LOGGER_LEVEL does not have a value or has
 * an invalid value.
 *
 * NOTE: We chose a more restrictive default of 'error' than vue-logger-plugin's
 *       default (of 'debug').
 *
 * @returns The minimum level of log messages to output to the console if the
 * logger is enabled. The returned value is one of: 'debug', 'info', 'warn',
 * 'error' (our default), or 'log'.
 */
const computeLevelOption = (): string => {
  const levelConfig: string = process.env.VUE_APP_LOGGER_LEVEL ?? 'error';
  const trimmedLowercaseLevel: string = trimAndLowercase(levelConfig);
  switch (trimmedLowercaseLevel) {
    case 'debug':
    case 'info':
    case 'warn':
    case 'error':
    case 'log':
      return trimmedLowercaseLevel;
    default:
      return 'error';
  }
}

//
// --- LOGGER INSTANCE ---
//

/**
 * The configured logger instance
 */
const logger = createLogger({
  enabled: computeEnabledOption(),
  consoleEnabled: true, // logs to console (only when overall logging is enabled)
  level: computeLevelOption(),
  beforeHooks: [
    StringifyObjectsHook
  ]
});

//
// --- EXPORTS ---
//

export default logger
