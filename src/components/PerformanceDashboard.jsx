import { useState, useEffect } from 'react';
import { getPerformanceReport } from '../utils/performanceMonitor';
import './PerformanceDashboard.css';

function PerformanceDashboard() {
  const [report, setReport] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('components');

  useEffect(() => {
    const fetchReport = () => {
      const performanceReport = getPerformanceReport();
      setReport(performanceReport);
    };

    fetchReport();

    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(fetchReport, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh]);

  if (!report?.enabled) {
    return null;
  }

  const formatTime = (time) => `${time.toFixed(2)}ms`;

  const toggleDashboard = () => setIsOpen(!isOpen);
  
  // Utility to format component data as table rows
  const renderComponentRows = (components) => {
    if (!components || components.length === 0) {
      return <tr><td colSpan="5">No component data available</td></tr>;
    }
    
    return components.map((component, index) => (
      <tr key={index} className={component.averageTime > 100 ? 'critical' : component.averageTime > 50 ? 'warning' : ''}>
        <td>{component.name}</td>
        <td>{formatTime(component.averageTime)}</td>
        <td>{formatTime(component.maxTime)}</td>
        <td>{component.totalRenders}</td>
        <td>{formatTime(component.lastRenderTime)}</td>
      </tr>
    ));
  };
  
  // Utility to format page data as table rows
  const renderPageRows = (pages) => {
    if (!pages || pages.length === 0) {
      return <tr><td colSpan="5">No page data available</td></tr>;
    }
    
    return pages.map((page, index) => (
      <tr key={index} className={page.averageRenderTime > 300 ? 'critical' : page.averageRenderTime > 100 ? 'warning' : ''}>
        <td>{page.name}</td>
        <td>{formatTime(page.averageRenderTime)}</td>
        <td>{formatTime(page.maxRenderTime)}</td>
        <td>{page.visits}</td>
        <td>{formatTime(page.lastRenderTime)}</td>
      </tr>
    ));
  };
  
  // Utility to format long tasks data as table rows
  const renderLongTaskRows = (tasks) => {
    if (!tasks || tasks.length === 0) {
      return <tr><td colSpan="3">No long tasks detected</td></tr>;
    }
    
    return tasks.map((task, index) => (
      <tr key={index} className={task.duration > 300 ? 'critical' : task.duration > 100 ? 'warning' : ''}>
        <td>{formatTime(task.duration)}</td>
        <td>{task.name}</td>
        <td>{new Date(task.timestamp).toLocaleTimeString()}</td>
      </tr>
    ));
  };

  return (
    <div className="performance-dashboard">
      <button
        className={`toggle-dashboard ${isOpen ? 'open' : ''}`}
        onClick={toggleDashboard}
      >
        {isOpen ? 'Close Performance' : 'Show Performance'}
      </button>
      
      {isOpen && (
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h2>Performance Dashboard</h2>
            <div className="dashboard-controls">
              <label>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={() => setAutoRefresh(!autoRefresh)}
                />
                Auto Refresh
              </label>
              <button onClick={() => setReport(getPerformanceReport())}>
                Refresh Now
              </button>
            </div>
          </div>
          
          <div className="dashboard-tabs">
            <button
              className={activeTab === 'components' ? 'active' : ''}
              onClick={() => setActiveTab('components')}
            >
              Components
            </button>
            <button
              className={activeTab === 'pages' ? 'active' : ''}
              onClick={() => setActiveTab('pages')}
            >
              Pages
            </button>
            <button
              className={activeTab === 'longtasks' ? 'active' : ''}
              onClick={() => setActiveTab('longtasks')}
            >
              Long Tasks
            </button>
          </div>
          
          <div className="dashboard-panel">
            {activeTab === 'components' && (
              <>
                <h3>Slowest Components</h3>
                <table className="metrics-table">
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Avg Time</th>
                      <th>Max Time</th>
                      <th>Renders</th>
                      <th>Last Render</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderComponentRows(report.slowestComponents)}
                  </tbody>
                </table>
              </>
            )}
            
            {activeTab === 'pages' && (
              <>
                <h3>Slowest Pages</h3>
                <table className="metrics-table">
                  <thead>
                    <tr>
                      <th>Page</th>
                      <th>Avg Time</th>
                      <th>Max Time</th>
                      <th>Visits</th>
                      <th>Last Render</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderPageRows(report.slowestPages)}
                  </tbody>
                </table>
              </>
            )}
            
            {activeTab === 'longtasks' && (
              <>
                <h3>Recent Long Tasks</h3>
                <table className="metrics-table">
                  <thead>
                    <tr>
                      <th>Duration</th>
                      <th>Name</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderLongTaskRows(report.recentLongTasks)}
                  </tbody>
                </table>
              </>
            )}
          </div>
          
          <div className="dashboard-footer">
            <div className="dashboard-summary">
              <div>Components: {report.summary.componentsTracked}</div>
              <div>Pages: {report.summary.pagesTracked}</div>
              <div>Network Requests: {report.summary.networkRequestsTracked}</div>
              <div>Long Tasks: {report.summary.longTasksDetected}</div>
            </div>
            <div className="dashboard-timestamp">
              Updated: {new Date(report.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformanceDashboard; 