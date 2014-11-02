(function(exports) {
  var Point = function(x, y) {
    this.x = x;
    this.y = y;
  };

  Point.distance = function(pt1, pt2) {
    return Math.sqrt((pt1.x - pt2.x) * (pt1.x - pt2.x) + (pt1.y - pt2.y) * (pt1.y - pt2.y));
  },

  Point.lowestPoint = function(pt1, pt2) {
    if(pt1.y < pt2.y) { return pt1; }
    else              { return pt2; }
  };

  Point.prototype = {
    nearestVerticalParabola: function(parabolas) {
      var mindist   = 1000,
          minindex  = -1;
      for(var i = 0; i < parabolas.length; i++) {
        var parabola  = parabolas[i],
            dist      = parabola.at(this.x) - this.y;
        if(dist < mindist) {
          mindist   = dist;
          minindex  = i;
        }
      }
      return parabolas[minindex];
    }
  }

  exports.Point = Point;
})(this);


(function(exports) {
  var Line = function(slope, intercept) {
    this.slope      = slope;
    this.intercept  = intercept;
  };

  Line.intersection = function(line1, line2) {
    if(line2.slope - line1.slope == 0) {
      throw "parallel lines";
    }
    var x = (line1.intercept - line2.intercept) / (line2.slope - line1.slope);

    return line1.at(x);
  };

  Line.prototype = {
    perpendicularize: function() {
      if (this.slope == 0) { throw "slope of 0 in perpendicularize"; }
      this.slope = 1 / (-1.0 * this.slope);
      return this;
    },

    shift_intercept: function(point) {
      this.intercept = (point.y - this.slope * point.x);
      return this;
    },

    at: function(x) {
      return new Point(x, this.slope * x + this.intercept);
    }
  };

  exports.Line = Line;
})(this);


(function(exports) {
  var Segment = function(start, end) {
    this.start = start;
    this.end   = end;
  };

  Segment.prototype = {
    perpendicularBisector: function() {
      return new Segment(new Point(this.start.x, this.end.y), new Point(this.end.x, this.start.y));
    },

    toLine: function() {
      var slope     = (this.end.y - this.start.y) / (1.0 * (this.end.x - this.start.x));
      var intersect = (this.end.y - slope * this.end.x);
      return new Line(slope, intersect);
    },

    midpoint: function() {
      return new Point( (this.start.x + this.end.x) / 2.0,
                                (this.start.y + this.end.y) / 2.0 );
    }
  };

  exports.Segment = Segment;
})(this);


(function(exports) {
  var Parabola = function(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.RESOLUTION = 0.1;
  };

  Parabola.getIntersections = function(parabola1, parabola2) {
    var a = parabola1.a - parabola2.a,
        b = parabola1.b - parabola2.b,
        c = parabola1.c - parabola2.c;

    if(a == 0) {
      return [-c / b, -c / b];
    } else {
      var discriminant = b * b - 4 * a * c;
      return [(-b + Math.sqrt(discriminant)) / (2 * a), (-b - Math.sqrt(discriminant)) / (2 * a)];
    }
  };

  Parabola.getRightIntersect = function(leftBound, parabola1, parabola2) {
    var roots     = Parabola.getIntersections(parabola1, parabola2),
        minRoot   = Math.min(roots[0], roots[1]),
        maxRoot   = Math.max(roots[0], roots[1]);

    if(minRoot > leftBound) { return minRoot; }
    else                    { return maxRoot; }
  };

  Parabola.getRegions = function(parabolas) {
    if(parabolas.length == 1) { return [-50, 50] }
    var leftBound = -50,
        regions = [];
    for(var i = 0; i < parabolas.length - 1; i++) {
      var intersect = Parabola.getRightIntersect(leftBound, parabolas[i], parabolas[i+1]);
      regions.push(intersect);
      leftBound = intersect;
    }
    if(regions[0] > -50) { regions.splice(0, 0, -50); }
    if(regions[regions.length-1] < 50) { regions.push(50); }
    return regions;
  };

  Parabola.generateFromDirectrixAndFocus = function(directrix, focus) {
    var a = 1 / (1.0 * 2 * focus.y - 2 * directrix);
    var b = -(2 * focus.x) / (1.0 * 2 * focus.y - 2 * directrix);
    var c = (focus.x * focus.x + focus.y * focus.y - directrix * directrix) / (1.0 * 2 * focus.y - 2 * directrix);
    return new Parabola(a, b, c);
  };

  Parabola.prototype = {
    at: function(x) {
      return this.a * x * x + this.b * x + this.c;
    },

    segments: function(start, end) {
      var i, segs = [];
      for(i = start; i <= end - this.RESOLUTION; i += this.RESOLUTION) {
        var segment = new Segment(new Point(i, this.at(i)),
                                          new Point(i + this.RESOLUTION, this.at(i + this.RESOLUTION)))
        segs.push(segment);
      }
      segs.push(new Segment(new Point(i, this.at(i)),
                                    new Point(end, this.at(end))));

      return segs;
    }
  };

  exports.Parabola = Parabola;
})(this);
