(function (global) {
  function createMarkerApi(options) {
    const {
      apiUrl,
      refreshMs = 5000,
      imageWidth,
      imageHeight,
      onStatus = () => {}
    } = options;

    let refreshTimer = null;

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function uid() {
      return Math.random().toString(36).slice(2, 10);
    }

    function normalizeMarkers(rawMarkers) {
      if (!Array.isArray(rawMarkers)) return [];

      return rawMarkers
        .map((item, index) => ({
          id: item.id || uid(),
          label: String(item.label || `Marker ${index + 1}`),
          x: Math.round(clamp(Number(item.x), 0, imageWidth)),
          y: Math.round(clamp(Number(item.y), 0, imageHeight)),
          description: item.description ? String(item.description) : ""
        }))
        .filter(item => !Number.isNaN(item.x) && !Number.isNaN(item.y));
    }

    async function fetchMarkers() {
      const response = await fetch(apiUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const parsed = await response.json();
      return normalizeMarkers(parsed.markers);
    }

    async function refresh(onMarkers) {
      try {
        const markers = await fetchMarkers();
        onMarkers(markers);
        onStatus(`Auto-refreshed ${markers.length} marker(s) from server.`, false);
      } catch (error) {
        onStatus(`Failed to refresh markers from server: ${error.message}`, true);
      }
    }

    function startAutoRefresh(onMarkers) {
      stopAutoRefresh();
      refresh(onMarkers);
      refreshTimer = setInterval(() => refresh(onMarkers), refreshMs);
    }

    function stopAutoRefresh() {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
    }

    return {
      fetchMarkers,
      startAutoRefresh,
      stopAutoRefresh,
      normalizeMarkers
    };
  }

  global.MarkerApi = {
    create: createMarkerApi
  };
})(window);