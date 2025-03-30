declare module 'react-katex' {
  import React from 'react';
  
  interface KatexProps {
    children?: string;
    math?: string;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
    settings?: any;
    strict?: boolean | string;
  }
  
  export const BlockMath: React.FC<KatexProps>;
  export const InlineMath: React.FC<KatexProps>;
} 