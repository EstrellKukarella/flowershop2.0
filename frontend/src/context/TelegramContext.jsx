import { createContext, useContext, useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

const TelegramContext = createContext({});

export function TelegramProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        WebApp.ready();
        WebApp.expand();

        // Set header color
        WebApp.setHeaderColor(WebApp.themeParams.bg_color || '#ffffff');

        if (WebApp.initDataUnsafe?.user) {
            setUser(WebApp.initDataUnsafe.user);
        }
    }, []);

    const value = {
        WebApp,
        user,
    };

    return (
        <TelegramContext.Provider value={value}>
            {children}
        </TelegramContext.Provider>
    );
}

export const useTelegram = () => useContext(TelegramContext);
