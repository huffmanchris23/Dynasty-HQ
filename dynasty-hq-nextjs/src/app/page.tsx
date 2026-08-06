'use client';

import { useEffect, useState } from 'react';
import type { DashboardData } from '@/lib/types';
import DashboardApp from '@/components/DashboardApp';

export default function Page() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Port of boot(): google.script.run.withSuccessHandler(onData).withFailureHandler(onError).getDashboardData()
  useEffect(() => {
    let cancelled = false;
    fetch('/api/dashboard')
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'Request failed');
        return body as DashboardData;
      })
      .then((body) => {
        if (!cancelled) setData(body);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div id="app">
        <div className="empty-state">
          Couldn&apos;t load Dynasty HQ.
          <br />
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div id="app">
        <div className="loading-screen">
          <div className="spinner" />
          <div className="loading-text">Loading Dynasty HQ…</div>
        </div>
      </div>
    );
  }

  return (
    <div id="app">
      <DashboardApp data={data} />
    </div>
  );
}
