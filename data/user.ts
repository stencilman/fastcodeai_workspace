import { db } from "@/lib/db";
import {
  User,
  UserRole,
  BloodGroup,
  CreateUserInput,
  UpdateUserInput,
  OnboardingStatus,
} from "@/models/user";

/**
 * Get a user by their email address
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email || "",
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role === "ADMIN" ? UserRole.ADMIN : UserRole.USER,
      onboardingStatus:
        (user.onboardingStatus as any) || OnboardingStatus.IN_PROGRESS,
      tourCompleted: user.tourCompleted || false,
      slackUserId: user.slackUserId || undefined,
      linkedinProfile: user.linkedinProfile || undefined,
      bloodGroup: user.bloodGroup as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      emailVerified: user.emailVerified || undefined,
      password: user.password || undefined,
      image: user.image || undefined,
    };
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
};

/**
 * Get a user by their ID
 */
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email || "",
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role === "ADMIN" ? UserRole.ADMIN : UserRole.USER,
      onboardingStatus:
        (user.onboardingStatus as any) || OnboardingStatus.IN_PROGRESS,
      tourCompleted: user.tourCompleted || false,
      slackUserId: user.slackUserId || undefined,
      linkedinProfile: user.linkedinProfile || undefined,
      bloodGroup: user.bloodGroup as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      emailVerified: user.emailVerified || undefined,
      password: user.password || undefined,
      image: user.image || undefined,
    };
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
};

/**
 * Create a new user
 */
export const createUser = async (
  data: CreateUserInput & {
    phone?: string;
    address?: string;
    slackUserId?: string;
    linkedinProfile?: string;
    bloodGroup?: BloodGroup;
  }
): Promise<User> => {
  try {
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role === UserRole.ADMIN ? "ADMIN" : "USER",
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        image: data.image,
        phone: data.phone,
        address: data.address,
        slackUserId: data.slackUserId,
        linkedinProfile: data.linkedinProfile,
        bloodGroup: data.bloodGroup as any,
      },
    });

    return {
      id: user.id,
      email: user.email || "",
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role === "ADMIN" ? UserRole.ADMIN : UserRole.USER,
      onboardingStatus:
        (user.onboardingStatus as any) || OnboardingStatus.IN_PROGRESS,
      tourCompleted: user.tourCompleted || false,
      slackUserId: user.slackUserId || undefined,
      linkedinProfile: user.linkedinProfile || undefined,
      bloodGroup: user.bloodGroup as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      emailVerified: user.emailVerified || undefined,
      password: user.password || undefined,
      image: user.image || undefined,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (
  id: string,
  data: UpdateUserInput & Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
): Promise<User> => {
  try {
    const updateData: any = {};

    // Only update fields that exist in the Prisma schema
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.slackUserId !== undefined)
      updateData.slackUserId = data.slackUserId;
    if (data.linkedinProfile !== undefined)
      updateData.linkedinProfile = data.linkedinProfile;
    if (data.onboardingStatus !== undefined)
      updateData.onboardingStatus = data.onboardingStatus;
    if (data.tourCompleted !== undefined)
      updateData.tourCompleted = data.tourCompleted;

    // Handle BloodGroup enum conversion
    if (data.bloodGroup !== undefined) {
      // Map display values to Prisma enum values
      const bloodGroupMapping: Record<string, string> = {
        "A+": "A_POSITIVE",
        "A-": "A_NEGATIVE",
        "B+": "B_POSITIVE",
        "B-": "B_NEGATIVE",
        "AB+": "AB_POSITIVE",
        "AB-": "AB_NEGATIVE",
        "O+": "O_POSITIVE",
        "O-": "O_NEGATIVE",
      };

      // If it's already an enum value or a string that matches the enum format, use it directly
      if (
        typeof data.bloodGroup === "string" &&
        data.bloodGroup in bloodGroupMapping
      ) {
        updateData.bloodGroup = bloodGroupMapping[data.bloodGroup];
      } else {
        // Otherwise assume it's already in the correct format
        updateData.bloodGroup = data.bloodGroup;
      }
    }

    if (data.role !== undefined) {
      updateData.role = data.role === UserRole.ADMIN ? "ADMIN" : "USER";
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
    });

    return {
      id: user.id,
      email: user.email || "",
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role === "ADMIN" ? UserRole.ADMIN : UserRole.USER,
      onboardingStatus:
        (user.onboardingStatus as any) || OnboardingStatus.IN_PROGRESS,
      tourCompleted: user.tourCompleted || false,
      slackUserId: user.slackUserId || undefined,
      linkedinProfile: user.linkedinProfile || undefined,
      bloodGroup: user.bloodGroup as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      emailVerified: user.emailVerified || undefined,
      password: user.password || undefined,
      image: user.image || undefined,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (id: string): Promise<User> => {
  try {
    const user = await db.user.delete({
      where: { id },
    });

    return {
      id: user.id,
      email: user.email || "",
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role === "ADMIN" ? UserRole.ADMIN : UserRole.USER,
      onboardingStatus:
        (user.onboardingStatus as any) || OnboardingStatus.IN_PROGRESS,
      tourCompleted: user.tourCompleted || false,
      slackUserId: user.slackUserId || undefined,
      linkedinProfile: user.linkedinProfile || undefined,
      bloodGroup: user.bloodGroup as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      emailVerified: user.emailVerified || undefined,
      password: user.password || undefined,
      image: user.image || undefined,
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email || "",
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role === "ADMIN" ? UserRole.ADMIN : UserRole.USER,
      onboardingStatus:
        (user.onboardingStatus as any) || OnboardingStatus.IN_PROGRESS,
      tourCompleted: user.tourCompleted || false,
      slackUserId: user.slackUserId || undefined,
      linkedinProfile: user.linkedinProfile || undefined,
      bloodGroup: user.bloodGroup as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      emailVerified: user.emailVerified || undefined,
      password: user.password || undefined,
      image: user.image || undefined,
    }));
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  try {
    const dbRole = role === UserRole.ADMIN ? "ADMIN" : "USER";

    const users = await db.user.findMany({
      where: { role: dbRole },
      orderBy: { createdAt: "desc" },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email || "",
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role === "ADMIN" ? UserRole.ADMIN : UserRole.USER,
      onboardingStatus:
        (user.onboardingStatus as any) || OnboardingStatus.IN_PROGRESS,
      tourCompleted: user.tourCompleted || false,
      slackUserId: user.slackUserId || undefined,
      linkedinProfile: user.linkedinProfile || undefined,
      bloodGroup: user.bloodGroup as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      emailVerified: user.emailVerified || undefined,
      password: user.password || undefined,
      image: user.image || undefined,
    }));
  } catch (error) {
    console.error(`Error fetching users by role ${role}:`, error);
    throw error;
  }
};

/**
 * Search users by name or email
 */
export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const users = await db.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email || "",
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role === "ADMIN" ? UserRole.ADMIN : UserRole.USER,
      onboardingStatus:
        (user.onboardingStatus as any) || OnboardingStatus.IN_PROGRESS,
      tourCompleted: user.tourCompleted || false,
      slackUserId: user.slackUserId || undefined,
      linkedinProfile: user.linkedinProfile || undefined,
      bloodGroup: user.bloodGroup as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      emailVerified: user.emailVerified || undefined,
      password: user.password || undefined,
      image: user.image || undefined,
    }));
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};
