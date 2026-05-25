import type { User as AuthUser } from '../features/auth/services/authSchemas'

export type UserRole =
  | 'admin'
  | 'recruiter'
  | 'hiring_manager'
  | 'interviewer'
  | 'candidate'

export type User = AuthUser

export type AuthStore = {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  checkEmail: (email: string) => Promise<'login' | 'signup'>
  login: (email: string, password: string) => Promise<void>
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>
  fetchProfile: () => Promise<void>
  clearError: () => void
  logout: () => void
}

export type ApiFieldError = {
  field: string
  message: string
}

export type ApiErrorResponse = {
  message: string
  errors?: ApiFieldError[]
}


export interface LabelProp { //define the type of LabelProp
  firstmenutext?: string;
  secondmenutext?: string;
  thirdmenutext?: string;
  showFirstMenu?: boolean;
  showSecondMenu?: boolean;
  showThirdMenu?: boolean;
  onFirstClick?: () => void;
  onSecondClick?: () => void;
  onThirdClick?: () => void;
}

export type Comment = {
  _id: string;
  text: string;
  createdBy: string;
  createdAt: string;
};

export type Application = {
  _id: string;

  candidateId: {
    _id: string;
    name: string;
    email: string;
  };

  jobId: string;

  organizationId: string;

  comments: Comment[];

  createdAt: string;

  updatedAt: string;
};

export type GetCommentsResponse = {
  success: boolean;

  message: string;
comments: Comment[];
  applications: Application[];
};
