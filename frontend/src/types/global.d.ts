// This file contains declarations for modules without TypeScript types

// Shim the JSX namespace for React, which is needed by TypeScript
declare namespace React {
  interface JSX {
    // The namespace is intentionally left empty
    // This is a minimal shim to make TypeScript happy
    // without importing the entire React JSX namespace
  }
}

// Declare modules for which we don't have type declarations
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}

// Include environment variables type
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 