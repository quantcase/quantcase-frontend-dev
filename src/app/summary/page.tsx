'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { BACKEND_URL, CALLS } from '@/lib/constants';

interface SummaryData {
  success: boolean;
  data: {
    id: string;
    callId: string;
    entities: {
      people: string[];
      geographies: string[];
      business_segments: string[];
    };
    promises: Array<{
      metric: string;
      target: string;
      timeline: string;
      statement: string;
    }>;
    milestones: Array<{
      metric: string;
      period: string;
      guided_value: string;
    }>;
    metrics: Array<{
      metric: string;
      period: string;
      guided_value: string;
    }>;
    governanceSignals: {
      transparent: boolean;
      defensive_language: boolean;
      capital_allocation_clarity: boolean;
    };
    notablePatterns: {
      tone: string;
      risk_disclosures: Array<{
        risk: string;
        severity: string;
        disclosed_early: boolean;
      }>;
    };
    managementScore: number | null;
    confidence: string;
    createdAt: string;
    updatedAt: string;
  };
}

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

    setLoading(true);
    setError(null);
    setData(null);

    fetch(`${BACKEND_URL}/api/summary/${callId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        if (!data || !data.success || !data.data) {
          throw new Error('Invalid response format from API');
        }
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load data');
        setData(null);
        setLoading(false);
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

  const handleLoadClick = () => {
    if (inputValue.trim()) {
      setSelectedCallId(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Combobox */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Select or Enter Transcript ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsOpen(true)}
                  placeholder="Search or enter custom call ID..."
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50"
                />
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {isOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredCalls.length > 0 ? (
                    filteredCalls.map((call) => (
                      <button
                        key={call}
                        onClick={() => handleSelectCall(call)}
                        className="w-full px-4 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 transition-colors"
                      >
                        {call}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-zinc-500 dark:text-zinc-400">
                      No matching calls. Press Enter to search for "{inputValue}"
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleLoadClick}
              className="mt-7 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Load
            </button>
            <Link
              href="/"
              className="mt-7 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-zinc-900 dark:text-zinc-50"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-zinc-600 dark:text-zinc-400">Loading...</div>
          </div>
        )}

        {error && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-8 border border-red-200 dark:border-red-800">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="text-red-600 dark:text-red-400">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  Failed to Load Data
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {error}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                  Please check the call ID and try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                  Earnings Call Summary
                </h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-2">
                  {data.data.callId}
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Confidence</p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 capitalize">
                    {data.data.confidence}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Created At</p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {new Date(data.data.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Entities */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Entities</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">People</h3>
                  <ul className="space-y-1">
                    {data.data.entities.people.map((person, idx) => (
                      <li key={idx} className="text-zinc-900 dark:text-zinc-50">{person}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">Geographies</h3>
                  <ul className="space-y-1">
                    {data.data.entities.geographies.map((geo, idx) => (
                      <li key={idx} className="text-zinc-900 dark:text-zinc-50">{geo}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">Business Segments</h3>
                  <ul className="space-y-1">
                    {data.data.entities.business_segments.map((segment, idx) => (
                      <li key={idx} className="text-zinc-900 dark:text-zinc-50">{segment}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Promises */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Promises</h2>
              <div className="space-y-4">
                {data.data.promises.map((promise, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{promise.metric}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{promise.statement}</p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{promise.target}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">{promise.timeline}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Milestones</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.data.milestones.map((milestone, idx) => (
                  <div key={idx} className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{milestone.metric}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{milestone.period}</span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{milestone.guided_value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.data.metrics.map((metric, idx) => (
                  <div key={idx} className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{metric.metric}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{metric.period}</span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{metric.guided_value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Governance Signals */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Governance Signals</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${data.data.governanceSignals.transparent ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-zinc-900 dark:text-zinc-50">Transparent</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${data.data.governanceSignals.defensive_language ? 'bg-red-500' : 'bg-green-500'}`} />
                  <span className="text-zinc-900 dark:text-zinc-50">No Defensive Language</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${data.data.governanceSignals.capital_allocation_clarity ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-zinc-900 dark:text-zinc-50">Capital Allocation Clarity</span>
                </div>
              </div>
            </div>

            {/* Notable Patterns */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Notable Patterns</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Tone</p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 capitalize">
                    {data.data.notablePatterns.tone}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">Risk Disclosures</h3>
                  <div className="space-y-3">
                    {data.data.notablePatterns.risk_disclosures.map((risk, idx) => (
                      <div key={idx} className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                          <p className="text-zinc-900 dark:text-zinc-50 flex-1">{risk.risk}</p>
                          <div className="ml-4 flex flex-col items-end gap-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              risk.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                              risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                              'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            }`}>
                              {risk.severity}
                            </span>
                            {risk.disclosed_early && (
                              <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                Early Disclosure
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
