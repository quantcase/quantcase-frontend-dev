'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BACKEND_URL, CALLS } from '@/lib/constants';
import { CallData } from '@/models/call';
import { apiCall } from '@/lib/api';

function TranscriptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<CallData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<string>(() => {
    return searchParams.get('callId') || CALLS[1];
  });
  const [inputValue, setInputValue] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCalls = inputValue.trim() === ''
    ? CALLS
    : CALLS.filter(call => call.toLowerCase().includes(inputValue.toLowerCase()));

  const fetchData = (callId: string) => {
    if (!callId.trim()) return;

    apiCall<CallData>(`${BACKEND_URL}/api/calls/${callId}/`, {
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
    <div className="min-h-screen" style={{ background: "var(--qc-bg)" }}>
      {/* Combined Header Bar */}
      <div className="sticky top-0 z-20 shadow-sm" style={{ background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Title and Metadata */}
            {!loading && !error && data ? (
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-lg font-bold" style={{ color: "var(--qc-ink)" }}>
                    Earnings Call Transcript
                  </h1>
                  <p className="text-xs mt-0.5" style={{ color: "var(--qc-ink-2)" }}>
                    {data.data.id}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs pl-6" style={{ borderLeft: "1px solid var(--qc-hair)" }}>
                  <div>
                    <span className="" style={{ color: "var(--qc-ink-2)" }}>Company: </span>
                    <span className="font-semibold" style={{ color: "var(--qc-ink)" }}>
                      {data.data.company}
                    </span>
                  </div>
                  <div>
                    <span className="" style={{ color: "var(--qc-ink-2)" }}>Quarter: </span>
                    <span className="font-semibold" style={{ color: "var(--qc-ink)" }}>
                      {data.data.fiscal_year} {data.data.quarter}
                    </span>
                  </div>
                  <div>
                    <span className="" style={{ color: "var(--qc-ink-2)" }}>Date: </span>
                    <span className="font-semibold" style={{ color: "var(--qc-ink)" }}>
                      {data.data.call_date}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-lg font-bold" style={{ color: "var(--qc-ink)" }}>
                  Earnings Call Transcript
                </h1>
              </div>
            )}

            {/* Center: Toggle Navigation */}
            <div className="flex items-center gap-1 rounded-md p-1" style={{ background: "var(--qc-section)" }}>
              <Link
                href={`/summary?callId=${selectedCallId}`}
                className="px-4 py-1.5 text-sm font-medium rounded transition-colors" style={{ color: "var(--qc-ink-2)" }}
              >
                Summary
              </Link>
              <button
                className="px-4 py-1.5 text-sm font-medium rounded shadow-sm" style={{ background: "var(--qc-card)", color: "var(--qc-ink)" }}
              >
                Transcript
              </button>
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
                  placeholder="Search or enter call ID..."
                  className="w-full px-3 py-1.5 text-sm rounded-md focus:outline-none" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", color: "var(--qc-ink)" }}
                />
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: "var(--qc-ink-2)" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="absolute z-10 w-full mt-1 rounded-md shadow-lg max-h-60 overflow-auto" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}>
                    {filteredCalls.length > 0 ? (
                      filteredCalls.map((call) => (
                        <button
                          key={call}
                          onClick={() => handleSelectCall(call)}
                          className="w-full px-3 py-2 text-sm text-left transition-colors" style={{ color: "var(--qc-ink)" }}
                        >
                          {call}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm" style={{ color: "var(--qc-ink-2)" }}>
                        No matching calls. Press Enter to search for &ldquo;{inputValue}&rdquo;
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Link
                href="/dashboard"
                className="px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", color: "var(--qc-ink)" }}
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
            <div className="text-sm" style={{ color: "var(--qc-ink)" }}>Loading...</div>
          </div>
        )}

        {error && (
          <div className="rounded-lg p-4" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-down-soft)" }}>
            <div className="flex items-start gap-3">
              <div className="shrink-0" style={{ color: "var(--qc-down)" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--qc-ink)" }}>
                  Failed to Load Data
                </h3>
                <p className="text-sm mt-1" style={{ color: "var(--qc-ink)" }}>
                  {error}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--qc-ink-2)" }}>
                  Please check the call ID and try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Call Information */}
            <div className="rounded-lg p-4" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}>
              <h2 className="text-lg font-bold mb-3" style={{ color: "var(--qc-ink)" }}>Call Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs" style={{ color: "var(--qc-ink-2)" }}>Company</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--qc-ink)" }}>
                    {data.data.company_name || data.data.company}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--qc-ink-2)" }}>Industry</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--qc-ink)" }}>
                    {data.data.basic_industry || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--qc-ink-2)" }}>Fiscal Year</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--qc-ink)" }}>
                    {data.data.fiscal_year}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--qc-ink-2)" }}>Quarter</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--qc-ink)" }}>
                    {data.data.quarter}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--qc-ink-2)" }}>Call Date</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--qc-ink)" }}>
                    {data.data.call_date}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--qc-ink-2)" }}>Last Updated</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--qc-ink)" }}>
                    {new Date(data.data.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Transcript Section */}
            <div className="rounded-lg p-4" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold" style={{ color: "var(--qc-ink)" }}>Transcript</h2>
                {data.data.transcript_url && (
                  <a
                    href={data.data.transcript_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium hover:underline" style={{ color: "var(--qc-blue)" }}
                  >
                    View Original
                  </a>
                )}
              </div>
              {data.data.transcript_text ? (
                <div className="p-4 rounded-md" style={{ background: "var(--qc-section)" }}>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--qc-ink)" }}>
                    {data.data.transcript_text}
                  </p>
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--qc-ink-2)" }}>
                  No transcript available
                </p>
              )}
            </div>

            {/* Presentation Section */}
            <div className="rounded-lg p-4" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold" style={{ color: "var(--qc-ink)" }}>Presentation</h2>
                {data.data.ppt_url && (
                  <a
                    href={data.data.ppt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium hover:underline" style={{ color: "var(--qc-blue)" }}
                  >
                    View PDF
                  </a>
                )}
              </div>
              {data.data.ppt_text ? (
                <div className="p-4 rounded-md max-h-96 overflow-y-auto" style={{ background: "var(--qc-section)" }}>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--qc-ink)" }}>
                    {data.data.ppt_text}
                  </p>
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--qc-ink-2)" }}>
                  No presentation text available
                </p>
              )}
            </div>

            {/* Quarterly Results Section */}
            <div className="rounded-lg p-4" style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold" style={{ color: "var(--qc-ink)" }}>Quarterly Results</h2>
                {data.data.quarterly_result_url && (
                  <a
                    href={data.data.quarterly_result_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium hover:underline" style={{ color: "var(--qc-blue)" }}
                  >
                    View Original
                  </a>
                )}
              </div>
              {data.data.quarterly_result_text ? (
                <div className="p-4 rounded-md max-h-96 overflow-y-auto" style={{ background: "var(--qc-section)" }}>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--qc-ink)" }}>
                    {data.data.quarterly_result_text}
                  </p>
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--qc-ink-2)" }}>
                  No quarterly results available
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TranscriptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--qc-bg)" }}>
        <div className="text-sm" style={{ color: "var(--qc-ink)" }}>Loading...</div>
      </div>
    }>
      <TranscriptContent />
    </Suspense>
  );
}
