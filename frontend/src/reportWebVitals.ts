// Define the ReportHandler type locally to eliminate the web-vitals dependency
type ReportHandler = (metric: {
  name: string;
  delta: number;
  id: string;
  value?: number;
}) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Create dummy metrics since web-vitals package is not available
    const metrics = ['CLS', 'FID', 'FCP', 'LCP', 'TTFB'];
    metrics.forEach(name => {
      setTimeout(() => {
        onPerfEntry({
          name: name,
          delta: 0,
          id: `dummy-${name}`,
          value: 0
        });
      }, 100);
    });
    
    console.log('Using dummy web vitals implementation. Install web-vitals package for actual metrics.');
  }
};

export default reportWebVitals; 