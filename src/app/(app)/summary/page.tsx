'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CALLS } from '@/lib/constants';
import { useSummary } from '@/hooks/useSummary';

function SummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCallId, setSelectedCallId] = useState<string>(() => {
    return searchParams.get('callId') || CALLS[1];
  });
  const [inputValue, setInputValue] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, loading, error } = useSummary(selectedCallId);

  const filteredCalls = inputValue.trim() === ''
    ? CALLS
    : CALLS.filter(call => call.toLowerCase().includes(inputValue.toLowerCase()));

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('callId', selectedCallId);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [selectedCallId, router, searchParams]);

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
    <div className="min-h-screen bg-secondary">
      {/* Combined Header Bar */}
      <div className="sticky top-0 z-20 bg-card border-b border-hair shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Title and Metadata */}
            {!loading && !error && data ? (
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-lg font-bold text-ink">
                    Earnings Call Summary
                  </h1>
                  <p className="text-xs text-ink-3 mt-0.5">
                    {data.data.callId}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs border-l border-hair pl-6">
                  <div>
                    <span className="text-ink-3">Confidence: </span>
                    <span className="font-semibold text-ink capitalize">
                      {data.data.confidence}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-3">Created: </span>
                    <span className="font-semibold text-ink">
                      {new Date(data.data.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-lg font-bold text-ink">
                  Earnings Call Summary
                </h1>
              </div>
            )}

            {/* Center: Toggle Navigation */}
            <div className="flex items-center gap-1 bg-secondary rounded-md p-1">
              <button
                className="px-4 py-1.5 text-sm font-medium rounded bg-card text-ink shadow-sm"
              >
                Summary
              </button>
              <Link
                href={`/transcript?callId=${selectedCallId}`}
                className="px-4 py-1.5 text-sm font-medium rounded text-ink-2 hover:text-ink transition-colors"
              >
                Transcript
              </Link>
            </div>

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
                  className="w-full px-3 py-1.5 text-sm bg-card border border-hair rounded-md focus:outline-none focus:ring-2 focus:ring-blue text-ink"
                />
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-hair rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredCalls.length > 0 ? (
                      filteredCalls.map((call) => (
                        <button
                          key={call}
                          onClick={() => handleSelectCall(call)}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-secondary text-ink transition-colors"
                        >
                          {call}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-ink-3">
                        No matching calls. Press Enter to search for &ldquo;{inputValue}&rdquo;
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Link
                href="/dashboard"
                className="px-4 py-1.5 text-sm font-medium bg-card border border-hair rounded-md hover:bg-secondary transition-colors text-ink whitespace-nowrap"
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
            <div className="text-sm text-ink-2">Loading...</div>
          </div>
        )}

        {error && (
          <div className="bg-card rounded-lg p-4 border border-down">
            <div className="flex items-start gap-3">
              <div className="text-down shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Failed to Load Data
                </h3>
                <p className="text-sm text-ink-2 mt-1">
                  {error}
                </p>
                <p className="text-xs text-ink-3 mt-1">
                  Please check the call ID and try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Entities */}
            <div className="bg-card rounded-lg p-4 border border-hair">
              <h2 className="text-lg font-bold text-ink mb-3">Entities</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2">People</h3>
                  <ol className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-sm list-decimal list-inside">
                    {data.data.entities.people.map((person, idx) => (
                      <li key={idx} className="text-ink">{person}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2">Geographies</h3>
                  <ol className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-sm list-decimal list-inside">
                    {data.data.entities.geographies.map((geo, idx) => (
                      <li key={idx} className="text-ink">{geo}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2">Business Segments</h3>
                  <ol className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-sm list-decimal list-inside">
                    {data.data.entities.business_segments.map((segment, idx) => (
                      <li key={idx} className="text-ink">{segment}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Promises */}
            <div className="bg-card rounded-lg p-4 border border-hair">
              <h2 className="text-lg font-bold text-ink mb-3">Promises</h2>
              <div className="space-y-2">
                {data.data.promises.map((promise, idx) => (
                  <div key={idx} className="border-l-3 border-blue pl-3 py-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-ink">{promise.metric}</h3>
                        <p className="text-xs text-ink-2 mt-0.5 line-clamp-2">{promise.statement}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-ink">{promise.target}</p>
                        <p className="text-xs text-ink-3">{promise.timeline}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-card rounded-lg p-4 border border-hair">
              <h2 className="text-lg font-bold text-ink mb-3">Milestones</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.data.milestones.map((milestone, idx) => (
                  <div key={idx} className="bg-secondary p-3 rounded-md">
                    <h3 className="text-sm font-semibold text-ink">{milestone.metric}</h3>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-ink-2">{milestone.period}</span>
                      <span className="font-medium text-ink">{milestone.guided_value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-card rounded-lg p-4 border border-hair">
              <h2 className="text-lg font-bold text-ink mb-3">Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.data.metrics.map((metric, idx) => (
                  <div key={idx} className="bg-secondary p-3 rounded-md">
                    <h3 className="text-sm font-semibold text-ink">{metric.metric}</h3>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-ink-2">{metric.period}</span>
                      <span className="font-medium text-ink">{metric.guided_value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Governance Signals */}
            <div className="bg-card rounded-lg p-4 border border-hair">
              <h2 className="text-lg font-bold text-ink mb-3">Governance Signals</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${data.data.governanceSignals.transparent ? 'bg-up' : 'bg-down'}`} />
                  <span className="text-sm text-ink">Transparent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${data.data.governanceSignals.defensive_language ? 'bg-down' : 'bg-up'}`} />
                  <span className="text-sm text-ink">No Defensive Language</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${data.data.governanceSignals.capital_allocation_clarity ? 'bg-up' : 'bg-down'}`} />
                  <span className="text-sm text-ink">Capital Allocation Clarity</span>
                </div>
              </div>
            </div>

            {/* Notable Patterns */}
            <div className="bg-card rounded-lg p-4 border border-hair">
              <h2 className="text-lg font-bold text-ink mb-3">Notable Patterns</h2>
              <div className="space-y-3">
                <div className="pb-3 border-b border-hair">
                  <p className="text-xs text-ink-3">Tone</p>
                  <p className="text-sm font-semibold text-ink capitalize mt-0.5">
                    {data.data.notablePatterns.tone}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2">Risk Disclosures</h3>
                  <div className="space-y-2">
                    {data.data.notablePatterns.risk_disclosures.map((risk, idx) => (
                      <div key={idx} className="bg-secondary p-3 rounded-md">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-ink flex-1">{risk.risk}</p>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              risk.severity === 'high' ? 'bg-down-soft text-down' :
                              risk.severity === 'medium' ? 'bg-warn-soft text-warn' :
                              'bg-up-soft text-up'
                            }`}>
                              {risk.severity}
                            </span>
                            {risk.disclosed_early && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-soft text-blue">
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

export default function SummaryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-sm text-ink-2">Loading...</div>
      </div>
    }>
      <SummaryContent />
    </Suspense>
  );
}
