import MenuItem from '@mui/material/MenuItem';
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItemText,
  Divider,
  ListItemIcon,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School'; // MOOJ Logo
import ListAltIcon from '@mui/icons-material/ListAlt'; // Problems Icon
import AssignmentIcon from '@mui/icons-material/Assignment'; // Submissions Icon (Placeholder for future)

// Consistent width for the mobile drawer
const drawerWidth = 240;

const Header: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Simplified nav items - No auth/roles needed
  const navItems = [
    { text: 'Problems', path: '/problems', icon: <ListAltIcon /> },
    // Add submission link placeholder
    { text: 'Submissions', path: '/submissions', icon: <AssignmentIcon /> }, 
  ];
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Simplified: Remove user menu handlers
  // const handleUserMenu = ...
  // const handleCloseUserMenu = ...
  // const handleLogout = ...
  
  // Common menu/list item rendering function (keep for drawer)
  const renderMenuItem = (text: string, path: string, icon?: React.ReactNode, closeMenu?: () => void) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    return (
      <MenuItem // Use MenuItem for consistency in list/drawer
        key={text}
        component={RouterLink}
        to={path}
        selected={isActive}
        onClick={closeMenu}
        sx={{ 
          color: isActive ? theme.palette.primary.main : 'inherit',
          fontWeight: isActive ? 'bold' : 'normal',
          borderRadius: 1,
          mx: 1,
          my: 0.5,
        }}
      >
        {icon && <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{icon}</ListItemIcon>}
        <ListItemText primary={text} />
      </MenuItem>
    );
  }
  
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" noWrap component="div">
          MOOJ 🐄
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => renderMenuItem(item.text, item.path, item.icon, handleDrawerToggle))}
        {/* Remove Role-based links */}
      </List>
      {/* Remove Auth buttons at the bottom */}
    </Box>
  );
  
  return (
    <AppBar 
      position="fixed"
      color="default" 
      elevation={1} 
      sx={{ 
        bgcolor: 'background.paper', 
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo and Brand */}
          <SchoolIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: 'primary.main' }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            MOOJ 🐄
          </Typography>

          {/* Mobile Menu Button & Logo */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                flexGrow: 1,
                justifyContent: 'center',
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                alignItems: 'center'
              }}
            >
              <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} /> MOOJ 🐄
            </Typography>
            <Box sx={{ width: 48 }} />
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={RouterLink}
                to={item.path}
                sx={{
                  my: 2,
                  color: 'text.primary',
                  display: 'block',
                  mx: 1,
                  fontWeight: location.pathname.startsWith(item.path) ? 600 : 400,
                  borderBottom: location.pathname.startsWith(item.path) ? 2 : 0,
                  borderColor: 'primary.main',
                  borderRadius: 0,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* Remove User Menu/Login Button section */}
          <Box sx={{ flexGrow: 0 }}>
             {/* Intentionally left empty - No login/user needed */}
          </Box>
        </Toolbar>
      </Container>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
    </AppBar>
  );
};

export default Header; 