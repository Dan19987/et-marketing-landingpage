const CounterStats = () => {
  const targets = {
    orders: 1500,
    experience: 20,
    providers: 40
  };

  const [counts, setCounts] = React.useState({
    orders: 0,
    experience: 0,
    providers: 0
  });

  React.useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const interval = duration / steps;
    const animate = () => {
      for (let i = 1; i <= steps; i++) {
        setTimeout(() => {
          setCounts({
            orders: Math.ceil((targets.orders / steps) * i),
            experience: Math.ceil((targets.experience / steps) * i),
            providers: Math.ceil((targets.providers / steps) * i)
          });
        }, interval * i);
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(document.querySelector('.stats-container'));
    return () => observer.disconnect();
  }, []);

  return React.createElement('div', {
    className: 'stats-container'
  }, 
    React.createElement('div', {
      className: 'stats-grid'
    }, [
      React.createElement('div', { className: 'stats-item', key: 'orders' }, [
        React.createElement('div', {
          className: 'stats-number',
          key: 'orders-count'
        }, `${counts.orders}+`),
        React.createElement('div', {
          className: 'stats-label',
          key: 'orders-label'
        }, 'Aufträge im Jahr')
      ]),
      React.createElement('div', { className: 'stats-item', key: 'experience' }, [
        React.createElement('div', {
          className: 'stats-number',
          key: 'experience-count'
        }, `${counts.experience}+`),
        React.createElement('div', {
          className: 'stats-label',
          key: 'experience-label'
        }, 'Jahre Erfahrung')
      ]),
      React.createElement('div', { className: 'stats-item', key: 'providers' }, [
        React.createElement('div', {
          className: 'stats-number',
          key: 'providers-count'
        }, `${counts.providers}+`),
        React.createElement('div', {
          className: 'stats-label',
          key: 'providers-label'
        }, 'Anbieter')
      ])
    ])
  );
};

export default CounterStats;