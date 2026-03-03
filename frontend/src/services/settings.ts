import axios from "axios"
import { API_URL } from '@/lib/api'

export const settingsService = {
    getAppName: async () => {
        try {
            const response = await axios.get(`${API_URL}/settings/appName`)
            return response.data.value || "Master LMS"
        } catch (error) {
            return "Master LMS"
        }
    },

    updateAppName: async (name: string) => {
        const token = localStorage.getItem("token")
        const response = await axios.post(`${API_URL}/settings`,
            { key: "appName", value: name },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return response.data
    },

    getBusinessModel: async () => {
        try {
            const response = await axios.get(`${API_URL}/settings/business_model`)
            return response.data.value || "MARKETPLACE"
        } catch (error) {
            return "MARKETPLACE"
        }
    },

    updateBusinessModel: async (model: "SUBSCRIPTION" | "MARKETPLACE") => {
        const token = localStorage.getItem("token")
        const response = await axios.post(`${API_URL}/settings`,
            { key: "business_model", value: model },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return response.data
    },

    getRenewalLink: async () => {
        try {
            const response = await axios.get(`${API_URL}/settings/renewal_link`)
            return response.data.value || ""
        } catch (error) {
            return ""
        }
    },

    updateRenewalLink: async (link: string) => {
        const token = localStorage.getItem("token")
        const response = await axios.post(`${API_URL}/settings`,
            { key: "renewal_link", value: link },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return response.data
    },

    getSupportLink: async () => {
        try {
            const response = await axios.get(`${API_URL}/settings/support_link`)
            return response.data.value || ""
        } catch (error) {
            return ""
        }
    },

    updateSupportLink: async (link: string) => {
        const token = localStorage.getItem("token")
        const response = await axios.post(`${API_URL}/settings`,
            { key: "support_link", value: link },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return response.data
    },

    getEvolutionConfig: async () => {
        try {
            const [urlRes, keyRes, instanceRes] = await Promise.all([
                axios.get(`${API_URL}/settings/EVOLUTION_API_URL`),
                axios.get(`${API_URL}/settings/EVOLUTION_API_KEY`),
                axios.get(`${API_URL}/settings/EVOLUTION_INSTANCE_NAME`)
            ])

            return {
                baseUrl: urlRes.data.value || "",
                apiKey: keyRes.data.value || "",
                instanceName: instanceRes.data.value || ""
            }
        } catch (error) {
            return { baseUrl: "", apiKey: "", instanceName: "" }
        }
    },

    updateEvolutionConfig: async (config: { baseUrl: string, apiKey: string, instanceName: string }) => {
        const token = localStorage.getItem("token")
        const headers = { Authorization: `Bearer ${token}` }

        await Promise.all([
            axios.post(`${API_URL}/settings`, { key: "EVOLUTION_API_URL", value: config.baseUrl }, { headers }),
            axios.post(`${API_URL}/settings`, { key: "EVOLUTION_API_KEY", value: config.apiKey }, { headers }),
            axios.post(`${API_URL}/settings`, { key: "EVOLUTION_INSTANCE_NAME", value: config.instanceName }, { headers })
        ])

        return true
    },

    // Generic methods for any setting
    getSettingValue: async (key: string) => {
        try {
            const response = await axios.get(`${API_URL}/settings/${key}`)
            return response.data.value || ""
        } catch (error) {
            return ""
        }
    },

    updateSettingValue: async (key: string, value: string) => {
        const token = localStorage.getItem("token")
        const response = await axios.post(`${API_URL}/settings`,
            { key, value },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        return response.data
    }
}
