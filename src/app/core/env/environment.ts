export const environment = {
    apiUrl: 'https://8752e7985705.ngrok-free.app/api',
    production: false,
    socketIo: {
      url: 'https://8752e7985705.ngrok-free.app/api',
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
