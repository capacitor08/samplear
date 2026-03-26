(function (global) {

  function createMapViewport(options) {
    const {
      viewport,
      stage,
      mapImage,
      imageWidth,
      imageHeight,
      minZoom = 0.2,
      maxZoom = 5,
      zoomStep = 0.25,
      onClick = () => {},
      onZoomChange = () => {}
    } = options;

    let zoom = 1;
    let fitZoom = 1;

    let isDragging = false;
    let dragMoved = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;

    function clamp(v, min, max) {
      return Math.min(max, Math.max(min, v));
    }

    function getFitZoom() {
      const scaleX = viewport.clientWidth / imageWidth;
      const scaleY = viewport.clientHeight / imageHeight;
      return Math.min(scaleX, scaleY);
    }

    function updateStage() {
      stage.style.width = imageWidth + "px";
      stage.style.height = imageHeight + "px";

      mapImage.style.width = imageWidth + "px";
      mapImage.style.height = imageHeight + "px";

      stage.style.transform = `scale(${zoom})`;

      onZoomChange(zoom);
    }

    function center() {
      viewport.scrollLeft = (imageWidth * zoom - viewport.clientWidth) / 2;
      viewport.scrollTop = (imageHeight * zoom - viewport.clientHeight) / 2;
    }

    function zoomTo(nextZoom) {
      const prevZoom = zoom;
      const minAllowed = fitZoom;

      const target = clamp(nextZoom, minAllowed, maxZoom);
      if (target === zoom) return;

      const cx = viewport.scrollLeft + viewport.clientWidth / 2;
      const cy = viewport.scrollTop + viewport.clientHeight / 2;

      const imgX = cx / prevZoom;
      const imgY = cy / prevZoom;

      zoom = target;
      updateStage();

      viewport.scrollLeft = imgX * zoom - viewport.clientWidth / 2;
      viewport.scrollTop = imgY * zoom - viewport.clientHeight / 2;
    }

    function resetToFit() {
      fitZoom = Math.max(minZoom, getFitZoom());
      zoom = fitZoom;
      updateStage();
      center();
    }

    function getImageCoords(clientX, clientY) {
      const rect = mapImage.getBoundingClientRect();
      const x = (clientX - rect.left) / zoom;
      const y = (clientY - rect.top) / zoom;
      return {
        x: clamp(x, 0, imageWidth),
        y: clamp(y, 0, imageHeight)
      };
    }

    // ===== Events =====

    viewport.addEventListener("wheel", (e) => {
      e.preventDefault();
      zoomTo(zoom + (e.deltaY < 0 ? zoomStep : -zoomStep));
    }, { passive: false });

    viewport.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      isDragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      startScrollLeft = viewport.scrollLeft;
      startScrollTop = viewport.scrollTop;
      viewport.classList.add("dragging");
      e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragMoved = true;
      }

      viewport.scrollLeft = startScrollLeft - dx;
      viewport.scrollTop = startScrollTop - dy;
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
      viewport.classList.remove("dragging");
      setTimeout(() => dragMoved = false, 0);
    });

    mapImage.addEventListener("click", (e) => {
      if (dragMoved) return;
      const coords = getImageCoords(e.clientX, e.clientY);
      onClick(coords);
    });

    window.addEventListener("resize", () => {
      const newFit = getFitZoom();
      if (zoom < newFit) {
        zoom = newFit;
        updateStage();
        center();
      }
    });

    // ===== Public API =====

    return {
      zoomIn: () => zoomTo(zoom + zoomStep),
      zoomOut: () => zoomTo(zoom - zoomStep),
      reset: resetToFit,
      getZoom: () => zoom
    };
  }

  global.MapViewport = {
    create: createMapViewport
  };

})(window);