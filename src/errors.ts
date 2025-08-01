/**
 * Custom error class for Sagmal application-specific errors.
 * Used for validation errors, configuration errors, and other application logic errors.
 * Not used for external API errors or unknown errors.
 */
export class SagmalError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "SagmalError";
		// Maintain proper stack trace for where our error was thrown (Node.js only)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, SagmalError);
		}
	}
}

/**
 * Converts an unknown error value to a readable string.
 *
 * @param error - Error value to stringify
 * @returns Formatted error string
 */
export function stringifyError(error: unknown): string {
	if (error instanceof Error) {
		return `${error.name} > ${error.message}`;
	}
	return String(error);
}
