import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  Activity,
  ArrowUpRight,
  CloudSun,
  Droplets,
  Gauge,
  Menu,
  Moon,
  Recycle,
  Route as RouteIcon,
  Server,
  Sun,
  Thermometer,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import { cityDemo, cityHealthScore, dashboardSections } from './data/city-demo';

function useRevealsAndSection() {
  const [activeSection, setActiveSection] = useState('home');
  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      }),
      { threshold: 0.1 },
    );
    document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

    const sectionObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      }),
      { rootMargin: '-28% 0px -58% 0px' },
    );
    dashboardSections.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);
  return activeSection;
}

function AnimatedNumber({
  value,
  decimals = 0,
  suffix = '',
  className = '',
  testId,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
  testId: string;
}) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    let frame = 0;
    let startedAt: number | undefined;
    let observer: IntersectionObserver | undefined;
    const animate = (time: number) => {
      if (startedAt === undefined) startedAt = time;
      const progress = Math.min((time - startedAt) / 1050, 1);
      const eased = 1 - (1 - progress) ** 4;
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        frame = requestAnimationFrame(animate);
        observer?.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(element);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return <span ref={elementRef} className={className} data-testid={testId}>{formatted}{suffix}</span>;
}

function Sparkline({ values, label }: { values: readonly number[]; label: string }) {
  const points = useMemo(() => values.map((value, index) => {
    const x = (index / (values.length - 1)) * 360;
    const y = 55 - value * 0.47;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' '), [values]);
  const pointList = points.split(' ');
  const lastPoint = pointList[pointList.length - 1]?.split(',') ?? ['360', '20'];
  return (
    <svg className="sparkline" viewBox="0 0 360 66" preserveAspectRatio="none" role="img" aria-label={label} data-testid={`chart-${label.toLowerCase().replace(/ /g, '-')}`}>
      <polyline points={points} />
      <circle cx={lastPoint[0]} cy={lastPoint[1]} r="2.8" />
    </svg>
  );
}

function FlowChart({ range }: { range: '24H' | '7D' }) {
  const values = range === '24H' ? cityDemo.mobility.hourlyFlow : cityDemo.mobility.weeklyFlow;
  const coords = values.map((value, index) => ({
    x: (index / (values.length - 1)) * 720,
    y: 155 - value * 1.3,
  }));
  const path = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
  const fillPath = `${path} L 720 170 L 0 170 Z`;
  return (
    <svg className="chart-svg" viewBox="0 0 720 180" preserveAspectRatio="none" role="img" aria-label={`City mobility flow, last ${range}`} data-testid="chart-mobility-flow">
      <defs>
        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity=".48" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[26, 70, 114, 158].map((y) => <line key={y} className="chart-gridline" x1="0" x2="720" y1={y} y2={y} />)}
      <path className="chart-fill" d={fillPath} />
      <path className="chart-line" d={path} />
      {coords.filter((_, index) => index === coords.length - 1).map((point) => (
        <circle key={point.x} className="chart-point" cx={point.x} cy={point.y} r="4" />
      ))}
    </svg>
  );
}

function EnergyTrendChart({
  range,
  onRangeChange,
}: {
  range: '24H' | '7D';
  onRangeChange: (range: '24H' | '7D') => void;
}) {
  const values = range === '24H' ? cityDemo.energy.demandSeries : cityDemo.energy.weeklyDemandSeries;
  const coords = values.map((value, index) => ({
    x: (index / (values.length - 1)) * 720,
    y: 155 - value * 1.3,
  }));
  const path = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
  return (
    <div className="energy-trend" data-testid="energy-trend">
      <div className="energy-trend-head">
        <div><div className="chart-title">ENERGY DEMAND / INDEXED LOAD</div><div className="chart-sub">Illustrative citywide consumption trend</div></div>
        <div className="chart-controls" role="group" aria-label="Energy trend time range">
          {(['24H', '7D'] as const).map((period) => (
            <button key={period} type="button" aria-pressed={range === period} className={range === period ? 'selected' : ''} onClick={() => onRangeChange(period)} data-testid={`button-energy-range-${period.toLowerCase()}`}>{period}</button>
          ))}
        </div>
      </div>
      <svg key={range} className="chart-svg energy-svg" viewBox="0 0 720 180" preserveAspectRatio="none" role="img" aria-label={`Illustrative energy demand trend for ${range}`} data-testid="chart-energy-trend">
        {[26, 70, 114, 158].map((y) => <line key={y} className="chart-gridline" x1="0" x2="720" y1={y} y2={y} />)}
        <path className="chart-line energy-line" d={path} />
        {coords.map((point, index) => (
          <circle key={`${range}-${index}`} className="chart-point energy-point" cx={point.x} cy={point.y} r="3">
            <title>{range === '24H' ? `${String(index).padStart(2, '0')}:00` : `Day ${index + 1}`} · ${values[index]} load index</title>
          </circle>
        ))}
      </svg>
      <div className="chart-labels">{(range === '24H' ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'NOW'] : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']).map((label) => <span key={label}>{label}</span>)}</div>
    </div>
  );
}

function WeatherHourlyTrend() {
  const values = cityDemo.weather.hourlyTrend;
  const min = Math.min(...values.map((point) => point.temperatureC)) - 2;
  const max = Math.max(...values.map((point) => point.temperatureC)) + 2;
  const coords = values.map((point, index) => ({
    ...point,
    x: 35 + (index / (values.length - 1)) * 650,
    y: 135 - ((point.temperatureC - min) / (max - min)) * 95,
  }));
  const path = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
  return (
    <article className="panel weather-hourly" data-testid="weather-hourly-trend">
      <div className="weather-hourly-head">
        <div><div className="metric-label">Hourly temperature / today</div><div className="chart-sub">Illustrative conditions across the metro region</div></div>
        <span className="demo-tag">LIVE DEMO</span>
      </div>
      <svg className="weather-chart" viewBox="0 0 720 170" preserveAspectRatio="none" role="img" aria-label="Hourly weather temperature trend in degrees Celsius">
        {[30, 70, 110, 150].map((y) => <line key={y} className="chart-gridline" x1="0" x2="720" y1={y} y2={y} />)}
        <path className="chart-line weather-line" d={path} />
        {coords.map((point) => (
          <g key={point.time}>
            <circle className="chart-point" cx={point.x} cy={point.y} r="4"><title>{point.time} · {point.temperatureC}°C</title></circle>
            <text className="weather-point-label" x={point.x} y={point.y - 13}>{point.temperatureC}°</text>
          </g>
        ))}
      </svg>
      <div className="chart-labels">{values.map((point) => <span key={point.time}>{point.time}</span>)}</div>
    </article>
  );
}

function App() {
  const [isLight, setIsLight] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [range, setRange] = useState<'24H' | '7D'>('24H');
  const [energyRange, setEnergyRange] = useState<'24H' | '7D'>('24H');
  const [selectedNode, setSelectedNode] = useState<
    (typeof cityDemo.cityNetwork.nodes)[number]
  >(cityDemo.cityNetwork.nodes[0]);
  const activeSection = useRevealsAndSection();
  const healthOffset = 283 - (cityHealthScore / 100) * 283;
  const pointFor = (id: string) => cityDemo.cityNetwork.nodes.find((node) => node.id === id);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', !isLight);
    return () => document.documentElement.classList.remove('dark');
  }, [isLight]);

  const navLinks = dashboardSections.map(({ id, label }) => (
    <a
      href={`#${id}`}
      key={id}
      className={activeSection === id ? 'active' : ''}
      aria-current={activeSection === id ? 'location' : undefined}
      data-testid={`link-nav-${id}`}
      onClick={() => setMobileOpen(false)}
    >
      {label}
    </a>
  ));

  return (
    <div className={`nexus-app${isLight ? ' light' : ''}`}>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="NEXUS home" data-testid="link-home">
          <span className="brand-mark"><span>N</span></span>
          <span className="brand-label">NEXUS<small>THE CITY, CONNECTED.</small></span>
        </a>
        <nav className="header-nav" aria-label="Dashboard sections">{navLinks}</nav>
        <div className="header-actions">
          <span className="live-pill"><i className="live-dot" /> LIVE DEMO</span>
          <button
            className="icon-button"
            type="button"
            aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
            title={`Switch to ${isLight ? 'dark' : 'light'} theme`}
            data-testid="button-theme-toggle"
            onClick={() => setIsLight((current) => !current)}
          >
            {isLight ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          <button
            className="menu-button"
            type="button"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            data-testid="button-mobile-menu"
            onClick={() => setMobileOpen((current) => !current)}
          >
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
        <nav className={`mobile-nav${mobileOpen ? ' open' : ''}`} aria-label="Mobile dashboard sections">{navLinks}</nav>
      </header>

      <main className="page-wrap">
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero-copy reveal">
            <div className="eyebrow">{cityDemo.identity.event} <span className="live-dot" /></div>
            <h1 id="hero-title">NEX<span>US</span></h1>
            <p className="hero-tagline">{cityDemo.identity.descriptor}</p>
            <p className="hero-description">A unified interface for understanding how a city moves, breathes and evolves.</p>
            <a className="hero-cta" href="#pulse" data-testid="link-explore-city">EXPLORE CITY <ArrowUpRight size={14} /></a>
            <div className="hero-meta">
              <span><strong>01</strong> / ONE CITY SURFACE</span>
              <span><strong><AnimatedNumber value={cityDemo.pulse.liveSensors} testId="metric-hero-sensors" /></strong> / SENSOR NODES</span>
              <span><strong>24/7</strong> / CITY SIGNAL</span>
            </div>
            <div className="hero-credit">{cityDemo.identity.makers}</div>
          </div>
          <div className="hero-visual reveal" aria-label="Illustrative connected city network">
            <div className="orbit one" /><div className="orbit two" /><div className="orbit three" /><div className="core" />
            <span className="hero-node hn1"><i />NORTH GATE</span>
            <span className="hero-node hn2"><i />MARKET EAST</span>
            <span className="hero-node hn3"><i />GREEN QUARTER</span>
            <span className="hero-node hn4"><i />CENTRAL STN.</span>
            <span className="visual-label">CITY GRID / 04.28° N</span>
            <div className="visual-coords">NESCOE METRO REGION<br />18.5204° N &nbsp; 73.8567° E</div>
            <div className="hero-stat"><strong><AnimatedNumber value={cityHealthScore} testId="metric-hero-health" /></strong><small>CITY HEALTH INDEX</small></div>
          </div>
          <div className="hero-bottom">
            <span>CONNECTED SYSTEMS. CLEARER DECISIONS.</span>
            <span className="hero-system-status"><i className="live-dot" /> LIVE DEMO / SYSTEM {cityDemo.system.demoStatus}</span>
          </div>
        </section>

        <div className="content">
          <section className="section" id="pulse" aria-labelledby="pulse-title">
            <div className="section-head reveal">
              <div><div className="section-kicker">01 / WHOLE-CITY READOUT</div><h2 className="section-title" id="pulse-title">City <span>Pulse</span></h2></div>
              <p className="section-note">One view across the systems that keep the city moving. Updated for this live demonstration.</p>
            </div>
            <div className="pulse-layout reveal">
              <article className="panel score-panel" data-testid="card-city-health">
                <div className="score-copy">
                  <div className="metric-label">Composite city health</div>
                  <div><AnimatedNumber value={cityHealthScore} className="score-number" testId="metric-city-health" /><span className="score-outof">/ 100</span></div>
                  <p className="score-context">Steady conditions across connected city services.</p>
                  <span className="demo-tag"><i className="live-dot" /> SIMULATED CITY DATA</span>
                </div>
                <svg className="score-ring" viewBox="0 0 100 100" role="img" aria-label={`City health score ${cityHealthScore} out of 100`}>
                  <circle className="ring-track" cx="50" cy="50" r="45" />
                  <circle className="ring-progress" cx="50" cy="50" r="45" style={{ strokeDashoffset: healthOffset }} />
                  <text className="ring-center" x="50" y="51">HEALTH</text>
                </svg>
              </article>
            </div>
            <div className="pulse-metrics-grid reveal" aria-label="Six city pulse metrics">
              <a className="panel pulse-metric-card" href="#mobility" data-testid="link-pulse-traffic"><span className="metric-label">Traffic</span><strong><AnimatedNumber value={cityDemo.pulse.metrics.trafficFlowPercent} suffix="%" testId="metric-pulse-traffic" /></strong><span className="pulse-card-foot">TRAFFIC FLOW <ArrowUpRight size={12} /></span></a>
              <a className="panel pulse-metric-card" href="#weather" data-testid="link-pulse-weather"><span className="metric-label">Weather</span><strong><AnimatedNumber value={cityDemo.pulse.metrics.weatherTemperatureC} suffix="°C" testId="metric-pulse-weather" /></strong><span className="pulse-card-foot">LOCAL TEMPERATURE <ArrowUpRight size={12} /></span></a>
              <a className="panel pulse-metric-card" href="#energy" data-testid="link-pulse-energy"><span className="metric-label">Energy</span><strong><AnimatedNumber value={cityDemo.pulse.metrics.energyConsumptionMw} suffix=" MW" testId="metric-pulse-energy" /></strong><span className="pulse-card-foot">CURRENT DEMAND <ArrowUpRight size={12} /></span></a>
              <a className="panel pulse-metric-card" href="#environment" data-testid="link-pulse-green-space"><span className="metric-label">Green space</span><strong><AnimatedNumber value={cityDemo.pulse.metrics.greenCoverPercent} suffix="%" testId="metric-pulse-green-cover" /></strong><span className="pulse-card-foot">URBAN GREEN COVER <ArrowUpRight size={12} /></span></a>
              <a className="panel pulse-metric-card" href="#mobility" data-testid="link-pulse-transport"><span className="metric-label">Transport</span><strong><AnimatedNumber value={cityDemo.mobility.metroPerformancePercent} suffix="%" testId="metric-pulse-transport" /></strong><span className="pulse-card-foot">METRO · NETWORK <b>{cityDemo.pulse.metrics.networkAvailabilityPercent}%</b><ArrowUpRight size={12} /></span></a>
              <a className="panel pulse-metric-card" href="#waste" data-testid="link-pulse-waste"><span className="metric-label">Waste</span><strong><AnimatedNumber value={cityDemo.pulse.metrics.collectionEfficiencyPercent} suffix="%" testId="metric-pulse-waste" /></strong><span className="pulse-card-foot">COLLECTION EFFICIENCY <ArrowUpRight size={12} /></span></a>
            </div>
            <article className="panel chart-panel reveal">
              <div className="chart-top">
                <div><div className="chart-title">MOBILITY FLOW / VEHICLES PER HOUR INDEX</div><div className="chart-sub">Congestion pressure across the connected district grid</div></div>
                <div className="chart-controls" role="group" aria-label="Select chart time range">
                  {(['24H', '7D'] as const).map((period) => <button key={period} type="button" aria-pressed={range === period} className={range === period ? 'selected' : ''} onClick={() => setRange(period)} data-testid={`button-range-${period.toLowerCase()}`}>{period}</button>)}
                </div>
              </div>
              <FlowChart range={range} />
              <div className="chart-labels">{(range === '24H' ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'NOW'] : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']).map((label) => <span key={label}>{label}</span>)}</div>
            </article>
          </section>

          <section className="section" id="network" aria-labelledby="network-title">
            <div className="section-head reveal">
              <div><div className="section-kicker">02 / CONNECTED CITY FABRIC</div><h2 className="section-title" id="network-title">City <span>Network</span></h2></div>
              <p className="section-note">A schematic view of how local signals connect. Select a node to inspect its role.</p>
            </div>
            <div className="network-layout reveal">
              <div className="panel map-canvas" role="group" aria-label="Illustrative city network map">
                <div className="map-river" />
                <svg className="map-roads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <path className="road" d="M8 16L87 81M15 91L83 14M9 49L93 54M26 5L67 95M4 70L92 31M20 29L75 91" />
                  {cityDemo.cityNetwork.routes.map(([from, to]) => {
                    const start = pointFor(from); const end = pointFor(to);
                    return start && end ? <path key={`${from}-${to}`} className="route" d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`} /> : null;
                  })}
                </svg>
                {cityDemo.cityNetwork.nodes.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    className={`map-node${selectedNode.id === node.id ? ' active' : ''}`}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    aria-label={`${node.label}, ${node.type} node`}
                    aria-pressed={selectedNode.id === node.id}
                    title={`${node.label} · ${node.type} node`}
                    onClick={() => setSelectedNode(node)}
                    data-testid={`button-map-node-${node.id}`}
                  ><i className="node-dot" /><span>{node.label}</span></button>
                ))}
                <span className="map-caption">ILLUSTRATIVE NETWORK / NOT TO SCALE</span>
                <div className="map-legend"><span><i />ACTIVE NODE</span><span><i style={{ opacity: .48 }} />CONNECTED ROUTE</span></div>
              </div>
              <div className="network-aside">
                <article className="panel network-stat">
                  <div><div className="metric-label">Selected network node</div><div className="metric-value node-detail" data-testid="text-selected-node">{selectedNode.label}</div></div>
                  <p>{selectedNode.type} signal point · {selectedNode.id === 'civic' ? 'City operations converge here.' : 'Reporting into the connected city grid.'}</p>
                </article>
                <article className="panel network-stat">
                  <div><div className="metric-label">Signal throughput</div><div className="metric-value"><AnimatedNumber value={cityDemo.cityNetwork.packetsPerMinute} testId="metric-packets" /></div></div>
                  <p>Data points exchanged per hour across the simulated mesh.</p>
                </article>
                <article className="panel network-stat">
                  <div><div className="metric-label">Connected nodes</div><div className="metric-value"><AnimatedNumber value={cityDemo.cityNetwork.nodes.length} testId="metric-connected-nodes" /><em> / {cityDemo.pulse.liveSensors}</em></div></div>
                  <p>Illustrative districts linked to {cityDemo.pulse.activeSensors} active sensors.</p>
                </article>
              </div>
            </div>
          </section>

          <section className="section" id="mobility" aria-labelledby="mobility-title">
            <div className="section-head reveal">
              <div><div className="section-kicker">03 / MOVEMENT & ACCESS</div><h2 className="section-title" id="mobility-title">Mobility</h2></div>
              <p className="section-note">Street and transit signals, brought together to show how the city moves.</p>
            </div>
            <div className="two-col reveal">
              <article className="panel module-panel">
                <div className="module-top"><div className="metric-label">Vehicle flow / citywide</div><RouteIcon size={16} className="mini-icon" /></div>
                <div className="module-main"><strong><AnimatedNumber value={cityDemo.mobility.vehiclesPerHour} testId="metric-vehicles" /></strong><span>vehicles / hr</span></div>
                <p className="module-description">Traffic counted across primary corridors. Current flow remains within the expected range.</p>
                <Sparkline values={cityDemo.mobility.hourlyFlow} label="Mobility hourly flow" />
                <div className="module-footer"><span>LAST 24 HOURS</span><span className="status-good">FLOW STABLE</span></div>
              </article>
              <article className="panel small-module">
                <div><div className="metric-label">Average corridor speed</div><div className="module-main"><strong><AnimatedNumber value={cityDemo.mobility.averageSpeed} decimals={1} testId="metric-average-speed" /></strong><span>km / h</span></div><p className="module-description"><AnimatedNumber value={cityDemo.mobility.congestionEvents} testId="metric-congestion-events" /> active congestion events across monitored routes.</p></div>
                <div className="module-footer"><span>TRANSIT ON-TIME PERFORMANCE</span><span className="status-good"><AnimatedNumber value={cityDemo.mobility.transitOnTime} decimals={1} suffix="%" testId="metric-transit-ontime" /></span></div>
              </article>
            </div>
            <div className="mobility-grid reveal" aria-label="Transit and mobility status">
              <article className="panel mobility-metric"><span className="metric-label">Metro status</span><strong className="online-text" data-testid="status-metro">{cityDemo.mobility.metroStatus}</strong><span className="metric-foot">METRO PERFORMANCE <b><AnimatedNumber value={cityDemo.mobility.metroPerformancePercent} suffix="%" testId="metric-metro-performance" /></b></span></article>
              <article className="panel mobility-metric"><span className="metric-label">Bus performance</span><strong><AnimatedNumber value={cityDemo.mobility.busPerformancePercent} suffix="%" testId="metric-bus-performance" /></strong><span className="metric-foot">ON-TIME ARRIVALS</span></article>
              <article className="panel mobility-metric"><span className="metric-label">Bike sharing</span><strong><AnimatedNumber value={cityDemo.mobility.bikeShareUtilizationPercent} suffix="%" testId="metric-bike-share" /></strong><span className="metric-foot">FLEET UTILIZATION</span></article>
              <article className="panel mobility-metric"><span className="metric-label">Active routes</span><strong><AnimatedNumber value={cityDemo.mobility.activeRoutes} testId="metric-active-routes" /></strong><span className="metric-foot">TRANSIT NETWORK</span></article>
              <article className="panel mobility-metric"><span className="metric-label">Passenger flow</span><strong><AnimatedNumber value={cityDemo.mobility.passengerFlowPerHour} testId="metric-passenger-flow" /></strong><span className="metric-foot">PASSENGERS / HOUR</span></article>
              <article className="panel mobility-metric"><span className="metric-label">Network availability</span><strong><AnimatedNumber value={cityDemo.mobility.networkAvailabilityPercent} suffix="%" testId="metric-mobility-network" /></strong><span className="metric-foot">SIMULATED TRANSIT FEED</span></article>
            </div>
          </section>

          <section className="section" id="energy" aria-labelledby="energy-title">
            <div className="section-head reveal">
              <div><div className="section-kicker">04 / POWER & DEMAND</div><h2 className="section-title" id="energy-title">Energy</h2></div>
              <p className="section-note">Consumption, generation mix and avoided emissions in one city-scale picture.</p>
            </div>
            <div className="two-col reveal">
              <article className="panel module-panel">
                <div className="module-top"><div className="metric-label">Current city consumption</div><Zap size={16} className="mini-icon" /></div>
                <div className="module-main"><strong><AnimatedNumber value={cityDemo.energy.demandMw} testId="metric-energy-demand" /></strong><span>MW</span></div>
                <p className="module-description">Load balancing across connected distribution zones.</p>
                <div className="energy-summary-row">
                  <div><span>PEAK DEMAND</span><strong><AnimatedNumber value={cityDemo.energy.peakDemandMw} testId="metric-peak-demand" /> MW</strong></div>
                  <div><span>DAILY CONSUMPTION</span><strong><AnimatedNumber value={cityDemo.energy.dailyConsumptionMwh} decimals={1} testId="metric-daily-energy" /> MWh</strong></div>
                </div>
                <div className="module-footer"><span>GRID BALANCE</span><span className="status-good"><AnimatedNumber value={cityDemo.energy.gridBalance} decimals={1} suffix="%" testId="metric-grid-balance" /></span></div>
              </article>
              <article className="panel small-module">
                <div><div className="metric-label">Renewable contribution</div><div className="module-main"><strong><AnimatedNumber value={cityDemo.energy.renewableShare} testId="metric-renewable-share" /></strong><span>% of demand</span></div>
                  {cityDemo.energy.sources.map((source) => <div className="bar-row" key={source.label}><span>{source.label}</span><div className="bar-track"><span style={{ '--bar': `${source.share}%` } as CSSProperties} /></div><b>{source.value}</b></div>)}
                </div>
                <div className="module-footer"><span>CARBON AVOIDED TODAY</span><span className="status-good"><AnimatedNumber value={cityDemo.energy.carbonAvoidedTonnes} decimals={1} suffix=" t" testId="metric-carbon-avoided" /></span></div>
              </article>
            </div>
            <article className="panel chart-panel energy-trend-panel reveal">
              <EnergyTrendChart range={energyRange} onRangeChange={setEnergyRange} />
            </article>
          </section>

          <section className="section" id="environment" aria-labelledby="environment-title">
            <div className="section-head reveal">
              <div><div className="section-kicker">05 / AIR & URBAN ECOLOGY</div><h2 className="section-title" id="environment-title">Environment</h2></div>
              <p className="section-note">Ambient conditions measured across a distributed environmental sensor mesh.</p>
            </div>
            <div className="env-panel reveal">
              <article className="panel env-feature">
                <div className="module-top"><div className="metric-label">Air quality / citywide</div><span className="environment-status"><i className="live-dot" />{cityDemo.environment.status}</span></div>
                <div>
                  <div className="module-main"><strong><AnimatedNumber value={cityDemo.environment.aqi} testId="metric-aqi" /></strong><span>AQI · {cityDemo.environment.airQuality}</span></div>
                  <p className="module-description">Air quality is good. Conditions are favorable for outdoor activity.</p>
                  <Sparkline values={cityDemo.environment.airSeries} label="Air quality trend" />
                </div>
                <div className="env-footer-stat">
                  <div><strong><AnimatedNumber value={cityDemo.environment.pm25} decimals={1} testId="metric-pm25" /> µg/m³</strong><span>PM2.5 concentration</span></div>
                  <div><strong><AnimatedNumber value={cityDemo.environment.greenCover} suffix="%" testId="metric-green-cover" /></strong><span>Urban green cover</span></div>
                </div>
              </article>
              <div className="env-side">
                <article className="panel env-mini">
                  <div><div className="metric-label">Ambient temperature</div><strong><AnimatedNumber value={cityDemo.environment.temperatureC} suffix="°C" testId="metric-environment-temperature" /></strong><span className="module-description">Across connected districts</span></div>
                  <Thermometer size={17} className="mini-icon" />
                </article>
                <article className="panel env-mini">
                  <div><div className="metric-label">Relative humidity</div><strong><AnimatedNumber value={cityDemo.environment.humidityPercent} suffix="%" testId="metric-environment-humidity" /></strong><span className="module-description">Across the metro region</span></div>
                  <Droplets size={17} className="mini-icon" />
                </article>
              </div>
            </div>
          </section>

          <section className="section" id="waste" aria-labelledby="waste-title">
            <div className="section-head reveal">
              <div><div className="section-kicker">06 / MATERIALS & COLLECTION</div><h2 className="section-title" id="waste-title">Waste</h2></div>
              <p className="section-note">A route-aware view of collection volume and material recovery.</p>
            </div>
            <div className="waste-layout reveal">
              <article className="panel waste-total">
                <div><div className="module-top"><div className="metric-label">Collected today</div><Recycle size={17} className="mini-icon" /></div><div className="module-main"><strong><AnimatedNumber value={cityDemo.waste.collectedTonnes} decimals={1} testId="metric-waste-tonnes" /></strong><span>tonnes</span></div></div>
                <div><div className="metric-label">Material diverted from landfill</div><div className="module-main" style={{ margin: '12px 0 0' }}><strong style={{ fontSize: 47 }}><AnimatedNumber value={cityDemo.waste.divertedPercent} decimals={1} testId="metric-waste-diverted" /></strong><span>% recovered</span></div></div>
                <div className="module-footer"><span>COLLECTION ROUTES ACTIVE</span><span className="status-good"><AnimatedNumber value={cityDemo.waste.activeRoutes} testId="metric-waste-routes" /></span></div>
              </article>
              <article className="panel waste-bars">
                <div className="metric-label">Daily collection / by material</div>
                {cityDemo.waste.materialStreams.map((stream) => (
                  <div className="bar-row" key={stream.label} data-testid={`row-waste-${stream.label.toLowerCase()}`}>
                    <span>{stream.label}</span><div className="bar-track"><span style={{ '--bar': `${stream.share}%` } as CSSProperties} /></div><b>{stream.tonnes}</b>
                  </div>
                ))}
                <div className="module-footer"><span>SIMULATED COLLECTION ROUTES</span><span>{cityDemo.waste.materialStreams.length} MATERIAL STREAMS</span></div>
              </article>
            </div>
            <div className="waste-metrics reveal" aria-label="Waste collection performance">
              <article className="panel waste-metric"><span className="metric-label">Collection efficiency</span><strong><AnimatedNumber value={cityDemo.waste.collectionEfficiencyPercent} suffix="%" testId="metric-collection-efficiency" /></strong><span className="metric-foot">ROUTE COMPLETION</span></article>
              <article className="panel waste-metric"><span className="metric-label">Recycling rate</span><strong><AnimatedNumber value={cityDemo.waste.recyclingRatePercent} suffix="%" testId="metric-recycling-rate" /></strong><span className="metric-foot">MATERIAL RECOVERED</span></article>
              <article className="panel waste-metric"><span className="metric-label">Active collection vehicles</span><strong><AnimatedNumber value={cityDemo.waste.activeCollectionVehicles} testId="metric-collection-vehicles" /></strong><span className="metric-foot">FLEET IN SERVICE</span></article>
              <article className="panel waste-metric"><span className="metric-label">Waste processed</span><strong><AnimatedNumber value={cityDemo.waste.collectedTonnes} decimals={1} testId="metric-waste-processed" /><small> t</small></strong><span className="metric-foot">TODAY</span></article>
              <article className="panel waste-metric"><span className="metric-label">Recovery rate</span><strong><AnimatedNumber value={cityDemo.waste.recoveryRatePercent} decimals={1} suffix="%" testId="metric-recovery-rate" /></strong><span className="metric-foot">DIVERTED TO REUSE</span></article>
            </div>
          </section>

          <section className="section" id="weather" aria-labelledby="weather-title">
            <div className="section-head reveal">
              <div><div className="section-kicker">07 / LOCAL CONDITIONS</div><h2 className="section-title" id="weather-title">Weather</h2></div>
              <p className="section-note">District conditions help operators understand the context behind city signals.</p>
            </div>
            <div className="weather-layout reveal">
              <article className="panel weather-main">
                <div className="module-top"><div className="metric-label">NESCOE METRO REGION / TODAY</div><CloudSun size={20} className="mini-icon" /></div>
                <div className="weather-big"><div className="weather-temp"><AnimatedNumber value={cityDemo.weather.temperatureC} testId="metric-weather-temperature" /><span className="weather-unit">°C</span><div className="weather-condition">{cityDemo.weather.condition}</div></div></div>
                <div className="weather-bottom">
                  <div><Droplets size={13} /><br />Humidity<strong><AnimatedNumber value={cityDemo.weather.humidityPercent} suffix="%" testId="metric-humidity" /></strong></div>
                  <div><Wind size={13} /><br />Wind<strong><AnimatedNumber value={cityDemo.weather.windKph} decimals={1} suffix=" km/h" testId="metric-wind" /></strong></div>
                  <div><Droplets size={13} /><br />Rain<strong><AnimatedNumber value={cityDemo.weather.rainfallMm} decimals={1} suffix=" mm" testId="metric-rainfall" /></strong></div>
                </div>
              </article>
              <article className="panel forecast">
                <div className="metric-label">Four-day outlook / illustrative</div>
                {cityDemo.weather.forecast.map((day) => <div key={day.day} className="forecast-row" data-testid={`row-forecast-${day.day.toLowerCase()}`}><span>{day.day}</span><span>{day.condition}</span><strong>{day.high} / {day.low}</strong></div>)}
              </article>
            </div>
            <WeatherHourlyTrend />
          </section>

          <section className="section" id="system" aria-labelledby="system-title">
            <div className="section-head reveal">
              <div><div className="section-kicker">08 / OPERATIONS & READINESS</div><h2 className="section-title" id="system-title">System <span>Status</span></h2></div>
              <p className="section-note">A transparent snapshot of the services powering this demonstration.</p>
            </div>
            <div className="system-panel reveal">
              <article className="panel system-summary">
                <div>
                  <div className="demo-tag"><i className="live-dot" /> SIMULATED CITY DATA</div>
                  <h3>All systems<br />in sync.</h3>
                  <p>Service states are illustrative only. NEXUS is a frontend-only concept; it is not connected to municipal infrastructure.</p>
                </div>
                <div className="system-summary-bottom">
                  <div className="health-summary"><span className="metric-label">Derived overall health</span><strong><AnimatedNumber value={cityHealthScore} testId="metric-system-health" /><small> / 100</small></strong></div>
                  <span className="uptime"><Server size={14} style={{ verticalAlign: 'middle', marginRight: 8 }} />{cityDemo.pulse.metrics.networkAvailabilityPercent}% NETWORK AVAILABLE</span>
                </div>
              </article>
              <article className="panel status-list" aria-label="City service status">
                {cityDemo.system.services.map((service, index) => <div className="status-row" key={service.name} data-testid={`status-service-${index}`}><span className="status-name">{service.name}</span><span className="status-label"><i />{service.state}</span></div>)}
                <div className="status-row"><span className="status-name">Average response latency</span><span className="status-label"><Activity size={12} />{cityDemo.system.latencyMs} MS</span></div>
                <div className="status-row"><span className="status-name">Active incident simulations</span><span className="status-label"><Gauge size={12} />{cityDemo.system.activeIncidents} MONITORED</span></div>
              </article>
            </div>
            <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', paddingTop: 19, color: 'var(--muted)', font: '8px var(--app-font-mono)', letterSpacing: '.09em' }}>
              <span><span className="live-dot" style={{ marginRight: 8 }} />LIVE DEMO / LAST SYNC {cityDemo.system.lastSync}</span>
              <span>{cityDemo.system.dataPointsPerHour.toLocaleString('en-US')} SIMULATED DATA POINTS / HR · {cityDemo.system.platformsOnline}/{cityDemo.system.platformCount} SERVICES ONLINE</span>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div><div className="footer-brand">NEX<span>US</span></div><div className="footer-copy">{cityDemo.identity.descriptor}<br />AN ILLUSTRATIVE SMART-CITY CONTROL SURFACE</div></div>
        <div className="footer-copy right">{cityDemo.identity.makers}<br />{cityDemo.identity.event}</div>
        <a className="icon-button" href="#home" aria-label="Back to top" title="Back to top" data-testid="link-back-to-top"><ArrowUpRight size={15} /></a>
      </footer>
    </div>
  );
}

export default App;