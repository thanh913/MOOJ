import React from 'react';
import { Box, Container, Typography, Link, Divider, Grid, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Divider />
      <Container maxWidth="lg">
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              MOOJ
              <Box 
                component="span" 
                role="img" 
                aria-label="cow" 
                sx={{ ml: 1 }}
              >
                🐄
              </Box>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mathematical Online Open Judge
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Evaluate your mathematical proofs with our innovative platform
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Box>
              <Link href="/problems" color="inherit" sx={{ display: 'block', mb: 1 }}>
                Problems
              </Link>
              <Link href="/about" color="inherit" sx={{ display: 'block', mb: 1 }}>
                About
              </Link>
              <Link href="/faq" color="inherit" sx={{ display: 'block', mb: 1 }}>
                FAQ
              </Link>
              <Link href="/contact" color="inherit" sx={{ display: 'block' }}>
                Contact
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Connect
            </Typography>
            <Box>
              <IconButton color="inherit" aria-label="GitHub" component="a" href="#">
                <GitHubIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn" component="a" href="#">
                <LinkedInIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter" component="a" href="#">
                <TwitterIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} MOOJ - Mathematical Online Open Judge. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 