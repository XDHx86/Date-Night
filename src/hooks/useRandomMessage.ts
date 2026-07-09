import { useMemo } from "react";
import { messages } from "@/lib/messages";

/**
 * Hook to get a random message from a specific category
 * @param category - The message category to draw from
 * @returns A random string from the category
 */
export function useRandomMessage(
  category: keyof typeof messages
): string {
  const categoryMessages = useMemo(() => messages[category], [category]);

  return useMemo(() => {
    if (!categoryMessages || categoryMessages.length === 0) {
      return "";
    }
    const randomIndex = Math.floor(Math.random() * categoryMessages.length);
    return categoryMessages[randomIndex];
  }, [categoryMessages]);
}

/**
 * Hook to get a random message from any category
 */
export function useAnyRandomMessage(): string {
  const allCategories = useMemo(() => Object.keys(messages) as (keyof typeof messages)[], []);
  const randomCategory = useMemo(
    () => allCategories[Math.floor(Math.random() * allCategories.length)],
    [allCategories]
  );

  return useRandomMessage(randomCategory);
}