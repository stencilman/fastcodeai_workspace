import { NextRequest, NextResponse } from "next/server";
import { users } from "@/data/users";
import { UserRole } from "@/models/user";

export async function GET(_request: NextRequest) {
    // Filter out admin users, only return employees/candidates
    const employeeUsers = users.filter(user => user.role === UserRole.CANDIDATE || user.role === UserRole.EMPLOYEE);
    return NextResponse.json(employeeUsers);
}
