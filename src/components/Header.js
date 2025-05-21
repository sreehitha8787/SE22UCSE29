import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

function Header() {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Stock Analytics
                </Typography>
                <Button color="inherit" component={Link} to="/">Stocks</Button>
                <Button color="inherit" component={Link} to="/heatmap">Heatmap</Button>
            </Toolbar>
        </AppBar>
    );
}

export default Header;
