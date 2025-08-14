export interface AuthResponse {
  success: boolean;
  status_code: number;
  data: {
    access_token: string;
  }
  message?: string;

}

export interface LoginCredentials {
  email: string;
  password: string;
  client_id: string;
}

export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  REFRESH_FAILED = 'REFRESH_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED'
}

export enum Role {
  ADMINISTRATOR = "ADMINISTRATOR",
  AUTOMATION_MANAGER = "AUTOMATION_MANAGER",
  BILLING_MANAGER = "BILLING_MANAGER",
  BROADCAST_MANAGER = "BROADCAST_MANAGER",
  DEVELOPER = "DEVELOPER",
  DASHBOARD_VIEWER = "DASHBOARD_VIEWER",
  TEMPLATE_MANAGER = "TEMPLATE_MANAGER"
}

export class AuthError extends Error {
  constructor(
    public type: AuthErrorType,
    public override message: string
  ) {
    super(message);
  }
}
