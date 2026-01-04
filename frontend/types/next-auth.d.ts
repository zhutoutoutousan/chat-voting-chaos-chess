import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    username?: string;
    name?: string | null;
    accessToken?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      username?: string;
      name?: string | null;
      image?: string | null;
    };
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    username?: string;
    accessToken?: string;
  }
}
