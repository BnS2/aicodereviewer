export interface UserProps {
  id: string;
  name: string;
  email: string;
  image?: string | null | undefined;
}

export interface HeaderProps {
  user: UserProps;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
}
