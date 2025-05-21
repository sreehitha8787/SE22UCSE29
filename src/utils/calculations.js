export const calculateCovariance = (x, y) => {
    const xMean = x.reduce((a, b) => a + b) / x.length;
    const yMean = y.reduce((a, b) => a + b) / y.length;
    const sum = x.map((xi, i) => (xi - xMean) * (y[i] - yMean)).reduce((a, b) => a + b);
    return sum / (x.length - 1);
};

export const calculateStdDev = (x) => {
    const mean = x.reduce((a, b) => a + b) / x.length;
    const sum = x.map(xi => Math.pow(xi - mean, 2)).reduce((a, b) => a + b);
    return Math.sqrt(sum / (x.length - 1));
};

export const calculateCorrelation = (x, y) => {
    const covariance = calculateCovariance(x, y);
    const stdDevX = calculateStdDev(x);
    const stdDevY = calculateStdDev(y);
    return covariance / (stdDevX * stdDevY);
};
