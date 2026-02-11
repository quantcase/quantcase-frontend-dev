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
                    Earnings Call Transcript
                  </h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
                    {data.data.id}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs border-l border-zinc-200 dark:border-zinc-800 pl-6">
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-500">Company: </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {data.data.company}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-500">Quarter: </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {data.data.fiscal_year} {data.data.quarter}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-500">Date: </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {data.data.call_date}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Earnings Call Transcript
                </h1>
              </div>
            )}

            {/* Center: Toggle Navigation */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-md p-1">
              <Link
                href={`/summary?callId=${selectedCallId}`}
                className="px-4 py-1.5 text-sm font-medium rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
              >
                Summary
              </Link>
              <button
                className="px-4 py-1.5 text-sm font-medium rounded bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm"
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
            {/* Call Information */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-3">Call Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">Company</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mt-0.5">
                    {data.data.company_name || data.data.company}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">Industry</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mt-0.5">
                    {data.data.basic_industry || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">Fiscal Year</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mt-0.5">
                    {data.data.fiscal_year}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">Quarter</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mt-0.5">
                    {data.data.quarter}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">Call Date</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mt-0.5">
                    {data.data.call_date}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">Last Updated</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mt-0.5">
                    {new Date(data.data.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Transcript Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Transcript</h2>
                {data.data.transcript_url && (
                  <a
                    href={data.data.transcript_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Original
                  </a>
                )}
              </div>
              {data.data.transcript_text ? (
                <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-md">
                  <p className="text-sm text-zinc-900 dark:text-zinc-50 whitespace-pre-wrap">
                    {data.data.transcript_text}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  No transcript available
                </p>
              )}
            </div>

            {/* Presentation Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Presentation</h2>
                {data.data.ppt_url && (
                  <a
                    href={data.data.ppt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View PDF
                  </a>
                )}
              </div>
              {data.data.ppt_text ? (
                <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-md max-h-96 overflow-y-auto">
                  <p className="text-sm text-zinc-900 dark:text-zinc-50 whitespace-pre-wrap">
                    {data.data.ppt_text}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  No presentation text available
                </p>
              )}
            </div>

            {/* Quarterly Results Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Quarterly Results</h2>
                {data.data.quarterly_result_url && (
                  <a
                    href={data.data.quarterly_result_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Original
                  </a>
                )}
              </div>
              {data.data.quarterly_result_text ? (
                <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-md max-h-96 overflow-y-auto">
                  <p className="text-sm text-zinc-900 dark:text-zinc-50 whitespace-pre-wrap">
                    {data.data.quarterly_result_text}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
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
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    }>
      <TranscriptContent />
    </Suspense>
  );
}
