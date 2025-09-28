import { Request } from "express";
import { User } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: User;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FilterParams {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export enum UserRole {
  ADMIN = "ADMIN",
  OWNER = "OWNER", 
  GUEST = "GUEST"
}
