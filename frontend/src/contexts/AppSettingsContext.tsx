"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsService } from '@/services/settings';

interface AppSettings {
    appName: string;
    supportLink: string;
    businessModel: string;
    renewalLink: string;
}

interface AppSettingsContextType {
    settings: AppSettings;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const defaultSettings: AppSettings = {
    appName: "Master LMS",
    supportLink: "",
    businessModel: "MARKETPLACE",
    renewalLink: ""
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const [appName, supportLink, businessModel, renewalLink] = await Promise.all([
                settingsService.getAppName(),
                settingsService.getSupportLink(),
                settingsService.getBusinessModel(),
                settingsService.getRenewalLink()
            ]);

            setSettings({
                appName,
                supportLink,
                businessModel,
                renewalLink
            });
        } catch (error) {
            console.error("Failed to fetch app settings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <AppSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </AppSettingsContext.Provider>
    );
}

export function useAppSettings() {
    const context = useContext(AppSettingsContext);
    if (context === undefined) {
        throw new Error('useAppSettings must be used within an AppSettingsProvider');
    }
    return context;
}
