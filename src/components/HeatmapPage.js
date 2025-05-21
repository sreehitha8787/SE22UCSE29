import { useState, useEffect } from 'react';
import { Box, Paper, Select, MenuItem, CircularProgress, Typography, Alert } from '@mui/material';
import axios from 'axios';
import { calculateCorrelation } from '../utils/calculations';

function HeatmapPage() {
    const [timeFrame, setTimeFrame] = useState(30);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stockData, setStockData] = useState({});
    const [correlationData, setCorrelationData] = useState([]);
    const [hoveredStock, setHoveredStock] = useState(null);

    useEffect(() => {
        const fetchStockData = async () => {
            setLoading(true);
            setError(null);
            try {
                // First get all stocks
                const stocksResponse = await axios.get('http://20.244.56.144/evaluation-service/stocks');
                const tickers = Object.keys(stocksResponse.data);
                
                // Fetch historical data for each stock
                const historicalData = {};
                for (const ticker of tickers) {
                    const response = await axios.get(
                        `http://20.244.56.144/evaluation-service/stocks/${ticker}?minutes=${timeFrame}`
                    );
                    historicalData[ticker] = response.data.map(d => d.price);
                }
                setStockData(historicalData);

                // Calculate correlations and statistics
                calculateCorrelationsAndStats(historicalData);
            } catch (error) {
                setError('Error fetching data. Please try again later.');
                console.error('Error:', error);
            }
            setLoading(false);
        };

        fetchStockData();
        const interval = setInterval(fetchStockData, 60000);
        return () => clearInterval(interval);
    }, [timeFrame]);

    const calculateCorrelationsAndStats = (historicalData) => {
        const tickers = Object.keys(historicalData);
        const correlations = [];
        tickers.forEach((ticker1) => {
            tickers.forEach((ticker2) => {
                if (ticker1 <= ticker2) {
                    const correlation = calculateCorrelation(
                        historicalData[ticker1],
                        historicalData[ticker2]
                    );
                    correlations.push({
                        ticker1,
                        ticker2,
                        correlation: correlation.toFixed(2)
                    });
                }
            });
        });
        setCorrelationData(correlations);
    };

    const getCorrelationColor = (correlation) => {
        const value = Math.abs(parseFloat(correlation));
        return `hsl(${120 - (value * 120)}, 70%, 50%)`;
    };

    return (
        <Box p={3}>
            <Select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)}>
                <MenuItem value={30}>30 minutes</MenuItem>
                <MenuItem value={60}>1 hour</MenuItem>
                <MenuItem value={120}>2 hours</MenuItem>
            </Select>

            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <Paper sx={{ p: 2, mt: 2, display: 'grid', gap: 2 }}>
                    {correlationData.map(({ ticker1, ticker2, correlation }) => (
                        <Box 
                            key={`${ticker1}-${ticker2}`}
                            sx={{
                                p: 1,
                                backgroundColor: getCorrelationColor(correlation),
                                borderRadius: 1,
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={() => setHoveredStock(`${ticker1} - ${ticker2}`)}
                            onMouseLeave={() => setHoveredStock(null)}
                        >
                            <Typography>{`${ticker1} - ${ticker2}: ${correlation}`}</Typography>
                            {hoveredStock === `${ticker1} - ${ticker2}` && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        borderRadius: 1,
                                        p: 1,
                                        boxShadow: 3
                                    }}
                                >
                                    <Typography>{`Correlation: ${correlation}`}</Typography>
                                </Box>
                            )}
                        </Box>
                    ))}
                </Paper>
            )}
        </Box>
    );
}

export default HeatmapPage;
