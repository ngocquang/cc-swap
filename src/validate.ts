/** Returns an error message string, or null if the name is valid. */
export function validateName(name: string): string | null {
  if (!name) return "Name cannot be empty";
  if (name.length > 50) return "Name must be 50 characters or fewer";
  if (name.startsWith(".") || name.startsWith("-"))
    return "Name cannot start with '.' or '-'";
  if (!/^[a-zA-Z0-9_-]+$/.test(name))
    return "Name can only contain letters, numbers, hyphens, and underscores";
  return null;
}
