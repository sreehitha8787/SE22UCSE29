import React, { useState, useEffect } from 'react';
import { Box, Paper, Select, MenuItem, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { getStocks, getStockPrice } from '../services/api';
import { calculateStdDev } from '../utils/calculations';

function StockPage() {
    const [data, setData] = useState([]);
    const [stocks, setStocks] = useState({});
    const [selectedStock, setSelectedStock] = useState('');
    const [timeFrame, setTimeFrame] = useState(30);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ average: 0, stdDev: 0 });

    useEffect(() => {
        const fetchStocks = async () => {
            try {
                const stocksData = await getStocks();
                setStocks(stocksData);
                if (!selectedStock && Object.keys(stocksData).length > 0) {
                    setSelectedStock(Object.values(stocksData)[0]);
                }
            } catch (err) {
                setError('Failed to fetch stocks');
            }
        };

        fetchStocks();
    }, []);

    useEffect(() => {
        if (!selectedStock) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const stockData = await getStockPrice(selectedStock, timeFrame);
                const prices = Array.isArray(stockData) ? stockData : [stockData];
                
                const formattedData = prices.map(item => ({
                    ...item,
                    price: Number(item.price),
                    lastUpdatedAt: new Date(item.lastUpdatedAt).toLocaleTimeString()
                }));

                setData(formattedData);
                
                const priceValues = formattedData.map(item => item.price);
                const average = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
                const stdDev = calculateStdDev(priceValues);
                
                setStats({ average: average.toFixed(2), stdDev: stdDev.toFixed(2) });
                setError(null);
            } catch (err) {
                setError('Failed to fetch price data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [selectedStock, timeFrame]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Box mb={2} display="flex" alignItems="center" gap={2}>
                    <Select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)}>
                        <MenuItem value={30}>30 minutes</MenuItem>
                        <MenuItem value={60}>1 hour</MenuItem>
                        <MenuItem value={120}>2 hours</MenuItem>
                    </Select>
                </Box>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Box mb={2} display="flex" alignItems="center" gap={2}>
                <Select 
                    value={selectedStock} 
                    onChange={(e) => setSelectedStock(e.target.value)}
                    sx={{ minWidth: 200 }}
                >
                    {Object.entries(stocks).map(([name, symbol]) => (
                        <MenuItem key={symbol} value={symbol}>
                            {name} ({symbol})
                        </MenuItem>
                    ))}
                </Select>
                <Select 
                    value={timeFrame} 
                    onChange={(e) => setTimeFrame(e.target.value)}
                    sx={{ minWidth: 150 }}
                >
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={60}>1 hour</MenuItem>
                    <MenuItem value={120}>2 hours</MenuItem>
                </Select>
                <Typography variant="h6">
                    Average Price: ${stats.average} (±${stats.stdDev})
                </Typography>
            </Box>
            
            <Paper sx={{ p: 2, mb: 2 }}>
                <LineChart width={800} height={400} data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="lastUpdatedAt" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#8884d8"
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                    />
                    <ReferenceLine 
                        y={Number(stats.average)} 
                        stroke="red" 
                        strokeDasharray="3 3"
                        label={{ value: 'Average', position: 'right' }}
                    />
                </LineChart>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Time</TableCell>
                            <TableCell align="right">Price ($)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row.lastUpdatedAt}</TableCell>
                                <TableCell align="right">{row.price}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default StockPage;
