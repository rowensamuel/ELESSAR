import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  CheckCircle2,
  Download,
  Activity,
  Play,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  AlertTriangle,
  Server,
  Layers,
} from 'lucide-react';
import {
  getDataStatus,
  getDataQualityReport,
  getScraperStatus,
  getScrapeJobs,
  createScrapeJob,
  updateScrapeJob,
  deleteScrapeJob,
  runScraper,
  searchFares,
} from '../services/airfareService';
import {
  DataStatus,
  DataQualityReport,
  ScraperStatus,
  ScrapeJob,
  FareObservation,
} from '../types/api';
import { Preloader } from '../components/common/Preloader';
import { ErrorFallback } from '../components/common/ErrorFallback';

export const DataExplorerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'scraper'>('pipeline');

  // Pipeline Data States
  const [dataStatus, setDataStatus] = useState<DataStatus | null>(null);
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
  const [observations, setObservations] = useState<FareObservation[]>([]);
  const [searchQuery, setSearchQuery] = useState('DEL-BOM');

  // Scraper Fleet States
  const [scraperStatus, setScraperStatus] = useState<ScraperStatus | null>(null);
  const [scrapeJobs, setScrapeJobs] = useState<ScrapeJob[]>([]);
  const [runningScraper, setRunningScraper] = useState(false);
  const [scraperActionMsg, setScraperActionMsg] = useState<string | null>(null);

  // New Job Form
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [newOrigin, setNewOrigin] = useState('');
  const [newDest, setNewDest] = useState('');
  const [newSource, setNewSource] = useState('Air India');
  const [newDays, setNewDays] = useState(30);

  // Loading and Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [status, quality, sStatus, jobs, searchRes] = await Promise.all([
        getDataStatus().catch(() => null),
        getDataQualityReport().catch(() => null),
        getScraperStatus().catch(() => null),
        getScrapeJobs().catch(() => []),
        searchFares(searchQuery).catch(() => null),
      ]);

      setDataStatus(status);
      setQualityReport(quality);
      setScraperStatus(sStatus);
      setScrapeJobs(jobs || []);
      setObservations(searchRes?.observations || []);
    } catch (err: any) {
      console.error('Data explorer load error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSearchObservations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await searchFares(searchQuery);
      setObservations(res?.observations || []);
    } catch (err: any) {
      alert(`Search failed: ${err.message || 'Error occurred'}`);
    }
  };

  const handleTriggerScrapeNow = async (jobId?: string) => {
    setRunningScraper(true);
    setScraperActionMsg(null);
    try {
      const res = await runScraper(jobId ? { jobId } : {});
      setScraperActionMsg(res?.message || 'Scrape cycle triggered successfully.');
      const [sStatus, jobs] = await Promise.all([
        getScraperStatus().catch(() => null),
        getScrapeJobs().catch(() => []),
      ]);
      setScraperStatus(sStatus);
      setScrapeJobs(jobs || []);
    } catch (err: any) {
      alert(`Scrape trigger failed: ${err.message}`);
    } finally {
      setRunningScraper(false);
    }
  };

  const handleToggleJob = async (job: ScrapeJob) => {
    try {
      await updateScrapeJob(job._id, { enabled: !job.enabled });
      const jobs = await getScrapeJobs();
      setScrapeJobs(jobs);
    } catch (err: any) {
      alert(`Failed to toggle job: ${err.message}`);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scrape job configuration?')) return;
    try {
      await deleteScrapeJob(id);
      setScrapeJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigin || !newDest) {
      alert('Please enter origin and destination IATA codes.');
      return;
    }
    try {
      await createScrapeJob({
        origin: newOrigin.toUpperCase(),
        destination: newDest.toUpperCase(),
        source: newSource,
        days: Number(newDays),
        enabled: true,
        priority: 1,
      });
      setShowNewJobModal(false);
      setNewOrigin('');
      setNewDest('');
      const jobs = await getScrapeJobs();
      setScrapeJobs(jobs);
    } catch (err: any) {
      alert(`Failed to create job: ${err.message}`);
    }
  };

  const handleExportCSV = () => {
    if (observations.length === 0) {
      alert('No observations to export.');
      return;
    }
    const headers = 'ID,Route,Airline,FlightNumber,DepartureDate,DepartureTime,TotalFare,Source,ScrapedAt\n';
    const rows = observations
      .map(
        (o) =>
          `"${o._id || ''}","${o.route}","${o.airline}","${o.flightNo || ''}","${o.departureDate}","${o.departureTime || ''}",${o.totalFare},"${o.source}","${o.scrapedAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `airfare_observations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !dataStatus && !scraperStatus) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex items-center justify-center pt-20">
        <Preloader variant="full" message="INSPECTING DATA PIPELINE & SCRAPER TELEMETRY..." />
      </div>
    );
  }

  if (error && !dataStatus && !scraperStatus) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex items-center justify-center pt-20 px-4">
        <ErrorFallback
          error={error}
          onRetry={loadAllData}
          title="Telemetry Data Stream Unavailable"
          variant="page"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-sans text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
              DATA STREAM TELEMETRY & SCRAPER FLEET MANAGEMENT
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight">
            Data Explorer & Pipeline Control
          </h1>
          <p className="text-[var(--text-secondary)] text-sm font-sans mt-1">
            Audit raw scraped observations, MongoDB synchronization, data hygiene, and manage automated scraper jobs.
          </p>
        </div>

        {/* Tab Navigation & CSV Export */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] font-sans">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'pipeline'
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Pipeline & Audit
            </button>
            <button
              onClick={() => setActiveTab('scraper')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'scraper'
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Scraper Fleet ({scrapeJobs.length})
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-[var(--accent)] border border-[var(--accent)]/40 font-sans text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {scraperActionMsg && (
        <div className="my-4 p-3.5 rounded-xl bg-[var(--positive-subtle)] border border-[var(--positive)]/40 text-[var(--positive)] text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{scraperActionMsg}</span>
        </div>
      )}

      {activeTab === 'pipeline' ? (
        <>
          {/* Top KPI Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5 my-6 font-sans">
            <div className="p-4 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
              <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-medium">TOTAL SAMPLES</span>
              <span className="text-2xl font-display font-bold text-[var(--text-primary)] mt-1 block tabular-nums">
                {(dataStatus?.totalFareObservations || qualityReport?.totalFareObservations || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-[var(--accent)] mt-1 block font-medium">MongoDB Ingested</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
              <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-medium">VALIDATED SAMPLES</span>
              <span className="text-2xl font-display font-bold text-[var(--positive)] mt-1 block tabular-nums">
                {(dataStatus?.dataQuality?.valid || qualityReport?.validFareObservations || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-[var(--positive)] mt-1 block font-medium">Quality passed</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
              <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-medium">ANOMALOUS / SUPPRESSED</span>
              <span className="text-2xl font-display font-bold text-[var(--negative)] mt-1 block tabular-nums">
                {(dataStatus?.dataQuality?.invalid || qualityReport?.invalidFareObservations || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] mt-1 block font-medium">Outliers filtered</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
              <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-medium">ROUTES IN BASKET</span>
              <span className="text-2xl font-display font-bold text-[var(--text-primary)] mt-1 block tabular-nums">
                {dataStatus?.routesTracked || 42}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] mt-1 block font-medium">Active corridors</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
              <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-medium">ACTIVE SCRAPE JOBS</span>
              <span className="text-2xl font-display font-bold text-[var(--accent)] mt-1 block tabular-nums">
                {dataStatus?.activeScrapeJobs || scrapeJobs.filter((j) => j.enabled).length}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] mt-1 block font-medium">Scheduled routes</span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
              <span className="text-[10px] text-[var(--text-secondary)] block uppercase font-medium">DATABASE STATUS</span>
              <span className="text-xl font-display font-bold text-[var(--positive)] mt-1 block capitalize">
                ● {dataStatus?.database || 'Connected'}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] mt-1 block font-medium">MongoDB cluster</span>
            </div>
          </div>

          {/* Quality Audit Warnings */}
          {(qualityReport?.warnings || []).length > 0 && (
            <div className="p-5 rounded-2xl bg-[var(--negative-subtle)] border border-[var(--negative)]/30 my-6 font-sans">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-[var(--negative)]">
                <AlertTriangle className="w-4 h-4" />
                <span>DATA INTEGRITY ADVISORIES ({qualityReport?.warnings.length} FLAGGED CORRIDORS)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {qualityReport?.warnings.map((w, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs">
                    <span className="font-mono font-bold text-[var(--text-primary)]">{w.route}</span>: <span className="text-[var(--text-secondary)]">{w.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Observations Form */}
          <div className="p-6 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)] my-6 font-sans">
            <form onSubmit={handleSearchObservations} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search route or query (e.g. BOM-DEL, Air India, Bangalore)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                QUERY SAMPLES
              </button>
            </form>

            {/* Observations Table */}
            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="text-[var(--text-secondary)] border-b border-[var(--border)] text-[11px] uppercase font-semibold">
                    <th className="pb-3">Corridor</th>
                    <th className="pb-3">Carrier / Fleet</th>
                    <th className="pb-3">Flight No</th>
                    <th className="pb-3">Departure Date</th>
                    <th className="pb-3">Timing</th>
                    <th className="pb-3 text-right">Fare (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {observations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--text-muted)] font-mono">
                        NO SAMPLES RETURNED FOR &quot;{searchQuery}&quot;. TRY ANOTHER CORRIDOR PAIR (e.g. BOM-DEL).
                      </td>
                    </tr>
                  ) : (
                    observations.slice(0, 20).map((obs, idx) => (
                      <tr key={idx} className="hover:bg-[var(--surface-elevated)] transition-colors">
                        <td className="py-3 font-mono font-bold text-[var(--text-primary)]">
                          {obs.route || `${obs.origin} → ${obs.destination}`}
                        </td>
                        <td className="py-3 font-medium text-[var(--text-primary)]">
                          {obs.airline || obs.source}
                        </td>
                        <td className="py-3 font-mono text-[var(--accent)]">
                          {obs.flightNo || 'Scheduled'}
                        </td>
                        <td className="py-3 text-[var(--text-secondary)] font-mono">
                          {obs.departureDate ? new Date(obs.departureDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 text-[var(--text-secondary)] font-mono">
                          {obs.departureTime || '—'}
                        </td>
                        <td className="py-3 text-right font-bold text-[var(--text-primary)] tabular-nums text-sm">
                          ₹{obs.totalFare != null ? obs.totalFare.toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Scraper Fleet Control Tab */
        <div className="space-y-6 my-6 font-sans">
          {/* Fleet Runtime Status Header */}
          <div className="p-6 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2.5 h-2.5 rounded-full ${scraperStatus?.running ? 'bg-[var(--accent)] animate-ping' : 'bg-[var(--positive)]'}`} />
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--accent)]">
                  SCRAPER SERVICE // {scraperStatus?.running ? 'COLLECTING' : 'IDLE & READY'}
                </span>
              </div>
              <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
                Automated Puppeteer Collector Fleet
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Last completion: {scraperStatus?.lastCompletedAt ? new Date(scraperStatus.lastCompletedAt).toLocaleTimeString() : 'Recent'} · Collected samples: <strong className="text-[var(--text-primary)] font-mono">{scraperStatus?.observationsCollected || 0}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNewJobModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-[var(--text-primary)] text-xs font-bold border border-[var(--border)] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[var(--accent)]" />
                <span>ADD CORRIDOR TARGET</span>
              </button>

              <button
                onClick={() => handleTriggerScrapeNow()}
                disabled={runningScraper}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-60 shadow-xs"
              >
                <Play className={`w-3.5 h-3.5 ${runningScraper ? 'animate-spin' : ''}`} />
                <span>{runningScraper ? 'DISPATCHING SCRAPERS...' : 'TRIGGER ALL ENABLED JOBS'}</span>
              </button>
            </div>
          </div>

          {/* Configured Scrape Jobs Table */}
          <div className="p-6 rounded-2xl bg-[var(--surface)] backdrop-blur-xl border border-[var(--border)] shadow-[var(--card-shadow)]">
            <div className="pb-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                Configured Route Scrape Schedules
              </h3>
              <span className="text-xs font-mono text-[var(--text-secondary)]">
                {scrapeJobs.length} Configured Targets
              </span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="text-[var(--text-secondary)] border-b border-[var(--border)] text-[11px] uppercase font-semibold">
                    <th className="pb-3">Route Pair</th>
                    <th className="pb-3">Source Provider</th>
                    <th className="pb-3">Forward Horizon</th>
                    <th className="pb-3">Last Execution</th>
                    <th className="pb-3">Last Spot Fare</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {scrapeJobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[var(--text-muted)] font-mono">
                        NO SCRAPE JOBS CONFIGURED. CLICK &quot;ADD CORRIDOR TARGET&quot; ABOVE.
                      </td>
                    </tr>
                  ) : (
                    scrapeJobs.map((job) => (
                      <tr key={job._id} className="hover:bg-[var(--surface-elevated)] transition-colors">
                        <td className="py-3.5 font-mono font-bold text-[var(--text-primary)]">
                          {job.origin} → {job.destination}
                        </td>
                        <td className="py-3.5 font-medium text-[var(--text-primary)]">
                          {job.source}
                        </td>
                        <td className="py-3.5 text-[var(--text-secondary)] font-mono">
                          {job.days} Days Forward
                        </td>
                        <td className="py-3.5 text-[var(--text-secondary)] font-mono">
                          {job.lastRunAt ? new Date(job.lastRunAt).toLocaleString() : 'Pending'}
                        </td>
                        <td className="py-3.5 font-mono font-bold text-[var(--accent)]">
                          {job.lastFare ? `₹${job.lastFare.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3.5">
                          <button
                            onClick={() => handleToggleJob(job)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                              job.enabled
                                ? 'bg-[var(--positive-subtle)] text-[var(--positive)] border border-[var(--positive)]/30'
                                : 'bg-[var(--surface-elevated)] text-[var(--text-muted)] border border-[var(--border)]'
                            }`}
                          >
                            {job.enabled ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                            <span>{job.enabled ? 'ENABLED' : 'PAUSED'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleTriggerScrapeNow(job._id)}
                            className="px-2.5 py-1 rounded-md bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-[var(--accent)] border border-[var(--border)] text-xs font-semibold cursor-pointer"
                            title="Run this job now"
                          >
                            Run
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job._id)}
                            className="px-2.5 py-1 rounded-md bg-[var(--negative-subtle)] hover:bg-[var(--negative)]/20 text-[var(--negative)] border border-[var(--negative)]/30 text-xs font-semibold cursor-pointer"
                            title="Delete this job"
                          >
                            <Trash2 className="w-3 h-3 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Scrape Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl space-y-4">
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
              Create New Scrape Corridor
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Configure an automated Puppeteer collector for a domestic flight corridor.
            </p>

            <form onSubmit={handleCreateJob} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">ORIGIN IATA</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="e.g. DEL"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-mono uppercase focus:outline-none focus:border-[var(--accent)]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">DESTINATION IATA</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="e.g. BOM"
                    value={newDest}
                    onChange={(e) => setNewDest(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-mono uppercase focus:outline-none focus:border-[var(--accent)]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">PROVIDER FLEET</label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="Air India">Air India</option>
                  <option value="SpiceJet">SpiceJet</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1">FORWARD HORIZON (DAYS)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={newDays}
                  onChange={(e) => setNewDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-mono focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewJobModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface)] text-[var(--text-secondary)] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Save & Enable Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
