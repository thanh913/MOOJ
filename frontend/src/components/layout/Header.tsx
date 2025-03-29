import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Container,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SchoolIcon from '@mui/icons-material/School';
import { selectIsAuthenticated, selectCurrentUser, logout } from '../../store/slices/authSlice';
import { UserRole } from '../../types/user'; // Make sure UserRole is imported

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  
  // Mobile menu state
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // User menu state
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Get auth state from Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  
  // Navigation items
  const navItems = [
    { text: 'Problems', path: '/problems' },
    { text: 'Leaderboard', path: '/leaderboard' },
    { text: 'About', path: '/about' },
  ];
  
  // Handle mobile drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Handle user menu toggle
  const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };
  
  // Handle Logout
  const handleLogout = () => {
    dispatch(logout());
    handleCloseUserMenu();
    navigate('/'); // Optional: Redirect to home after logout
  };
  
  // Mobile drawer content
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: 'center' }}>
        <SchoolIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div">
          MOOJ
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            key={item.text} 
            component={Link} 
            to={item.path}
            sx={{ 
              textAlign: 'center',
              color: location.pathname.startsWith(item.path) ? 'primary.main' : 'text.primary',
              bgcolor: location.pathname.startsWith(item.path) ? 'rgba(63, 81, 181, 0.08)' : 'transparent',
            }}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
  
  return (
    <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'background.paper' }}>
      <Container>
        <Toolbar disableGutters>
          {/* Logo and Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                mr: 2,
                fontWeight: 700,
                color: 'text.primary',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              MOOJ
              <Box 
                component="span" 
                role="img" 
                aria-label="logo cow" 
                sx={{ 
                  ml: 1,
                  fontSize: '1.25rem', 
                  display: { xs: 'none', sm: 'inline' }
                }}
              >
                🐄
              </Box>
            </Typography>
          </Box>

          {/* Mobile menu button */}
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ ml: 'auto' }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <>
              {/* Desktop navigation */}
              <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.text}
                    component={Link}
                    to={item.path}
                    sx={{
                      my: 2,
                      color: 'text.primary',
                      display: 'block',
                      mx: 1,
                      fontWeight: location.pathname.startsWith(item.path) ? 700 : 400,
                      borderBottom: location.pathname.startsWith(item.path) ? 2 : 0,
                      borderColor: 'primary.main',
                      borderRadius: 0,
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>

              {/* Authentication buttons */}
              <Box sx={{ flexGrow: 0 }}>
                {isAuthenticated ? (
                  <>
                    <IconButton onClick={handleUserMenu} sx={{ p: 0 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>U</Avatar>
                    </IconButton>
                    <Menu
                      sx={{ mt: '45px' }}
                      anchorEl={userMenuAnchor}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      open={Boolean(userMenuAnchor)}
                      onClose={handleCloseUserMenu}
                    >
                      <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                        <Typography textAlign="center">Profile</Typography>
                      </MenuItem>
                      <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/submissions'); }}>
                        <Typography textAlign="center">My Submissions</Typography>
                      </MenuItem>
                      {currentUser?.role && [UserRole.Moderator, UserRole.Admin].includes(currentUser.role) && (
                        <MenuItem onClick={() => {
                          handleCloseUserMenu();
                          navigate('/moderator/problems');
                        }}>
                          <Typography textAlign="center">Moderator Dashboard</Typography>
                        </MenuItem>
                      )}
                      <MenuItem onClick={() => {
                        handleLogout();
                      }}>
                        <Typography textAlign="center">Logout</Typography>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button component={Link} to="/register" color="primary" variant="outlined" sx={{ mr: 1 }}>
                      Sign Up
                    </Button>
                    <Button component={Link} to="/login" color="primary" variant="contained">
                      Login
                    </Button>
                  </>
                )}
              </Box>
            </>
          )}
        </Toolbar>
      </Container>
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header; 