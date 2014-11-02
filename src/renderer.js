(function(exports) {
  var POINT_SIZE = 6;
  var Renderer = function(width, height) {
    var canvas = document.getElementById('canvas');
    this.width = width;
    this.height = height;
    this.zoom = 20;
    canvas.width = width;
    canvas.height = height;
    this._ctx = canvas.getContext('2d');
    this._ctx.strokeStyle = "rgb(200,0,0)";
    this._ctx.fillStyle   = "rgb(200,0,0)";
  };

  Renderer.prototype = {
    clear: function() {
      var canvas = document.getElementById('canvas');
      canvas.width = canvas.width;
    },

    getCtx: function() {
      return this._ctx;
    },

    localToWorldCoordinates: function(pt) {
      return { x: this.width / 2.0 + pt.x * this.zoom, y: this.height / 2.0 - pt.y * this.zoom };
    },

    drawParabolaSegment: function(parabola, start, end) {
      var segments = parabola.segments(start, end);
      for(var i = 0; i < segments.length; i++) {
        var segment = segments[i];
        this.drawSegment(segment.start, segment.end);
      }
    },

    drawParabola: function(parabola) {
      this.drawParabolaSegment(parabola, -50, 50);
    },

    drawSegment: function(pt1, pt2) {
      pt1 = this.localToWorldCoordinates(pt1);
      pt2 = this.localToWorldCoordinates(pt2);
      var ctx = this.getCtx();
      ctx.beginPath();
      ctx.moveTo(pt1.x, pt1.y);
      ctx.lineTo(pt2.x, pt2.y);
      ctx.stroke();
    },

    drawLine: function(line) {
      this.drawSegment(line.at(-20), line.at(20));
    },

    drawPoint: function(pt) {
      pt = this.localToWorldCoordinates(pt);
      var ctx = this.getCtx();
      ctx.fillRect(pt.x-POINT_SIZE / 2, pt.y-POINT_SIZE / 2, POINT_SIZE, POINT_SIZE);
    },
  };

  exports.Renderer = Renderer;
})(this);
