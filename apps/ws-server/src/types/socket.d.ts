declare module "socket.io" {
  interface Socket {
    data: {
      user: {
        id: string;
        name: string;
        email: string;
        username?: string;
        avatar?: string;
      };
    };
  }
}

export {};
