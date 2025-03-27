#!/bin/bash

# Script to install all required dependencies for the MOOJ frontend

echo "Installing dependencies for MOOJ frontend..."

# Core dependencies
npm install react react-dom @types/react @types/react-dom

# Routing
npm install react-router-dom @types/react-router-dom

# UI framework
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

# State management
npm install @reduxjs/toolkit react-redux @types/react-redux

# Form handling
npm install formik yup

# API client
npm install axios

# Math and LaTeX
npm install react-markdown remark-math rehype-katex katex

# Development dependencies
npm install --save-dev typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-plugin-react eslint-plugin-react-hooks

echo "All dependencies installed successfully!" 