(function (global) {
  function createMarkerJson(options) {
    const {
      imageName,
      imageWidth,
      imageHeight,
      normalizeMarkers,
      onStatus = () => {}
    } = options;

    function exportMarkers(markers, filename = "markers_xy.json") {
      const payload = {
        imageName,
        imageWidth,
        imageHeight,
        markers
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json"
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      onStatus("Markers exported.", false);
    }

    function loadMarkersFromJsonText(jsonText) {
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (error) {
        onStatus("Invalid JSON file.", true);
        return null;
      }

      const loadedMarkers = normalizeMarkers(parsed.markers);
      onStatus(`Loaded ${loadedMarkers.length} marker(s) from JSON.`, false);
      return loadedMarkers;
    }

    function loadMarkersFromFile(file, callback) {
      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {
        const loadedMarkers = loadMarkersFromJsonText(reader.result);
        if (loadedMarkers) {
          callback(loadedMarkers);
        }
      };

      reader.onerror = () => {
        onStatus("Failed to read JSON file.", true);
      };

      reader.readAsText(file);
    }

    return {
      exportMarkers,
      loadMarkersFromJsonText,
      loadMarkersFromFile
    };
  }

  global.MarkerJson = {
    create: createMarkerJson
  };
})(window);