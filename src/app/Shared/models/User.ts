export interface User {
  firstName: string;
  lastName: string;
  email: string;
  address: Address;
  roles: string | string[];
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserDto {
  userName: string;
  email: string;
  token: string;
  refreshToken: string;
  address?: Address;
  roles: string | string[];

}

export interface GoogleSignInVM {
  idToken: string;
  clientId: string;
}

export interface FacebookSignInVM {
  accessToken: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ForgetPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  password: string;
  token: string;
}


export interface ApiResponse {
  statusCode: number;
  message?: string;
  errors?: string[];
}