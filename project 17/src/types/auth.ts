export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInData {
  email: string;
  password: string;
}