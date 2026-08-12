/* Lightweight line chart for "Estimated Visits" volume trend panels.
   No external dependencies — draws straight to canvas so the site
   has no build step and no CDN dependency. */
(function () {
  function drawChart(canvas) {
    var data = JSON.parse(canvas.dataset.points);      // array of numbers
    var labels = JSON.parse(canvas.dataset.labels);     // array of strings
    var acqIndex = parseInt(canvas.dataset.acq, 10);    // index of acquisition month

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    var w = rect.width, h = rect.height;
    var padL = 54, padR = 16, padT = 20, padB = 34;
    var plotW = w - padL - padR;
    var plotH = h - padT - padB;

    var maxVal = Math.max.apply(null, data) * 1.08;
    var minVal = 0;

    function x(i) { return padL + (i / (data.length - 1)) * plotW; }
    function y(v) { return padT + plotH - ((v - minVal) / (maxVal - minVal)) * plotH; }

    ctx.clearRect(0, 0, w, h);

    // gridlines + y labels
    ctx.strokeStyle = '#e6e9ee';
    ctx.fillStyle = '#8993a3';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    var steps = 5;
    for (var s = 0; s <= steps; s++) {
      var val = (maxVal / steps) * s;
      var yy = y(val);
      ctx.beginPath();
      ctx.moveTo(padL, yy);
      ctx.lineTo(w - padR, yy);
      ctx.stroke();
      ctx.fillText(Math.round(val).toLocaleString(), padL - 8, yy + 4);
    }

    // x labels (sparse)
    ctx.textAlign = 'center';
    var labelEvery = Math.ceil(labels.length / 9);
    for (var i = 0; i < labels.length; i += labelEvery) {
      ctx.fillText(labels[i], x(i), h - 10);
    }

    // acquisition marker
    if (acqIndex >= 0) {
      var ax = x(acqIndex);
      ctx.save();
      ctx.strokeStyle = '#1c63c9';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(ax, padT);
      ctx.lineTo(ax, padT + plotH);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#1c63c9';
      ctx.font = 'italic 11px Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText('Acquisition', ax + 6, padT + 12);
    }

    // line
    ctx.beginPath();
    data.forEach(function (v, i) {
      var px = x(i), py = y(v);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = '#1b2a5e';
    ctx.lineWidth = 2.25;
    ctx.stroke();
  }

  function init() {
    document.querySelectorAll('canvas.volume-chart').forEach(drawChart);
  }
  window.addEventListener('load', init);
  window.addEventListener('resize', function () {
    document.querySelectorAll('canvas.volume-chart').forEach(drawChart);
  });
})();
