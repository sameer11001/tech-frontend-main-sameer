export const environment = {
    apiUrl: 'https://75fa13ec249e.ngrok-free.app',
    production: false,
    socketIo: {
      url: 'https://75fa13ec249e.ngrok-free.app',
      options: {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 500000,  
        withCredentials: true,
        forceNew: false,
        autoConnect: false,
        upgrade: true,
        rememberUpgrade: true
      }
    }
  };
