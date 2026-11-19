/**
 * Return the single uppercase first letter of the first name for avatar fallbacks.
 */
export const getInitials = (name = '') =>
    name ? name.trim().charAt(0).toUpperCase() : '';
