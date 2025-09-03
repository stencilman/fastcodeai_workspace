import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BloodGroup } from "../models/user"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts database enum values to display values for blood groups
 * @param bloodGroup The blood group enum value from the database
 * @returns The display value (e.g., "A+") or undefined if no blood group provided
 */
export function getDisplayBloodGroup(bloodGroup?: BloodGroup): string | undefined {
  if (!bloodGroup) return undefined;

  // Map database enum values to display values
  const bloodGroupMapping: Record<string, string> = {
    'A_POSITIVE': 'A+',
    'A_NEGATIVE': 'A-',
    'B_POSITIVE': 'B+',
    'B_NEGATIVE': 'B-',
    'AB_POSITIVE': 'AB+',
    'AB_NEGATIVE': 'AB-',
    'O_POSITIVE': 'O+',
    'O_NEGATIVE': 'O-',
  };

  return bloodGroupMapping[bloodGroup as string] || undefined;
}
