/**
 * Return up to two uppercase initials from a full name for avatar fallbacks.
 */
export const getInitials = (name = '') =>
    name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
