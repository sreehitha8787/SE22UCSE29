import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://20.244.56.144/evaluation-service'

const api = axios.create({
    baseURL: API_BASE_URL
})

export const getStocks = async () => {
    try {
        const response = await api.get('/stocks')
        return response.data.stocks
    } catch (error) {
        throw new Error('Failed to fetch stocks')
    }
}

export const getStockPrice = async (ticker, minutes = 30) => {
    try {
        const response = await api.get(`/stocks/${ticker}?minutes=${minutes}`)
        return response.data
    } catch (error) {
        throw new Error(`Failed to fetch price data for ${ticker}`)
    }
}
