export interface UserProps {
  id: string;
  name: string;
  email: string;
  image?: string | null | undefined;
}

export interface HeaderProps {
  user: UserProps;
}
