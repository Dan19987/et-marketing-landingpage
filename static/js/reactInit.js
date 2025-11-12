import CounterStats from './components/CounterStats.js';

document.addEventListener('DOMContentLoaded', () => {
    const statsContainer = document.getElementById('stats-section');
    
    if (statsContainer) {
        const root = ReactDOM.createRoot(statsContainer);
        root.render(React.createElement(CounterStats));
    }
});