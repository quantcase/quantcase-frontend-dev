'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { BACKEND_URL, CALLS } from '@/lib/constants';
import { SummaryData } from '@/models/summary';
import { apiCall } from '@/lib/api';

export default function SummaryPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string>(CALLS[1]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCalls = inputValue.trim() === ''
    ? CALLS
    : CALLS.filter(call => call.toLowerCase().includes(inputValue.toLowerCase()));

  const fetchData = (callId: string) => {
    if (!callId.trim()) return;

    apiCall<SummaryData>(`${BACKEND_URL}/api/summary/${callId}`, {
      onStart: () => {
        setLoading(true);
        setError(null);
        setData(null);
      },
      onSuccess: (data) => {
        setData(data);
        setLoading(false);
      },
      onError: (error) => {
        setError(error);
        setData(null);
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    fetchData(selectedCallId);
  }, [selectedCallId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCall = (callId: string) => {
    setSelectedCallId(callId);
    setInputValue('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      setSelectedCallId(inputValue);
      setInputValue('');
      setIsOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Combined Header Bar */}
      <div className="sticky top-0 z-20 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Title and Metadata */}
            {!loading && !error && data ? (
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    Earnings Call Summary
                  </h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
                    {data.data.callId}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs border-l border-zinc-200 dark:border-zinc-800 pl-6">
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-500">Confidence: </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50 capitalize">
                      {data.data.confidence}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-500">Created: </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {new Date(data.data.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Earnings Call Summary
                </h1>
              </div>
            )}

            {/* Right: Search and Back Button */}
            <div className="flex items-center gap-3">
              <div className="relative w-80" ref={dropdownRef}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsOpen(true)}
                  placeholder="Search or enter transcript ID..."
                  className="w-full px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50"
                />
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredCalls.length > 0 ? (
                      filteredCalls.map((call) => (
                        <button
                          key={call}
                          onClick={() => handleSelectCall(call)}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 transition-colors"
                        >
                          {call}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                        No matching calls. Press Enter to search for &ldquo;{inputValue}&rdquo;
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Link
                href="/"
                className="px-4 py-1.5 text-sm font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-zinc-900 dark:text-zinc-50 whitespace-nowrap"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Loading...</div>
          </div>
        )}

        {error && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <div className="text-red-600 dark:text-red-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Failed to Load Data
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {error}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                  Please check the call ID and try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Entities */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-3">Entities</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500 mb-2">People</h3>
                  <ol className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-sm list-decimal list-inside">
                    {data.data.entities.people.map((person, idx) => (
                      <li key={idx} className="text-zinc-900 dark:text-zinc-50">{person}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500 mb-2">Geographies</h3>
                  <ol className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-sm list-decimal list-inside">
                    {data.data.entities.geographies.map((geo, idx) => (
                      <li key={idx} className="text-zinc-900 dark:text-zinc-50">{geo}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500 mb-2">Business Segments</h3>
                  <ol className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-sm list-decimal list-inside">
                    {data.data.entities.business_segments.map((segment, idx) => (
                      <li key={idx} className="text-zinc-900 dark:text-zinc-50">{segment}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Promises */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-3">Promises</h2>
              <div className="space-y-2">
                {data.data.promises.map((promise, idx) => (
                  <div key={idx} className="border-l-3 border-blue-500 pl-3 py-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{promise.metric}</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-2">{promise.statement}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{promise.target}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">{promise.timeline}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-3">Milestones</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.data.milestones.map((milestone, idx) => (
                  <div key={idx} className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-md">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{milestone.metric}</h3>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400">{milestone.period}</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">{milestone.guided_value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-3">Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.data.metrics.map((metric, idx) => (
                  <div key={idx} className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-md">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{metric.metric}</h3>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400">{metric.period}</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">{metric.guided_value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Governance Signals */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-3">Governance Signals</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${data.data.governanceSignals.transparent ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-zinc-900 dark:text-zinc-50">Transparent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${data.data.governanceSignals.defensive_language ? 'bg-red-500' : 'bg-green-500'}`} />
                  <span className="text-sm text-zinc-900 dark:text-zinc-50">No Defensive Language</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${data.data.governanceSignals.capital_allocation_clarity ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-zinc-900 dark:text-zinc-50">Capital Allocation Clarity</span>
                </div>
              </div>
            </div>

            {/* Notable Patterns */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-3">Notable Patterns</h2>
              <div className="space-y-3">
                <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">Tone</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 capitalize mt-0.5">
                    {data.data.notablePatterns.tone}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500 mb-2">Risk Disclosures</h3>
                  <div className="space-y-2">
                    {data.data.notablePatterns.risk_disclosures.map((risk, idx) => (
                      <div key={idx} className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-md">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-zinc-900 dark:text-zinc-50 flex-1">{risk.risk}</p>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              risk.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                              risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                              'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            }`}>
                              {risk.severity}
                            </span>
                            {risk.disclosed_early && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                Early
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
