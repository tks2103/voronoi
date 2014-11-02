describe("Point", function() {
  var point, point2;

  beforeEach(function() {
    point = new Point(0.5, 0.5);
    point2 = new Point(3.5, 4.5);
  });

  describe(".distance", function() {
    it("should return the distance", function() {
      expect(Point.distance(point, point2)).toEqual(5);
    });
  });

  describe(".lowestPoint", function() {
    it("should return the lowest point", function() {
      expect(Point.lowestPoint(point, point2)).toEqual(point);
    });
  });

  describe("#nearestVerticalParabola", function() {
    var parabola1, parabola2;
    beforeEach(function() {
      parabola1 = new Parabola(1, 0, 1);
      parabola2 = new Parabola(2, -1, 1);
    });

    it("should return the nearest Parabola", function() {
      expect(point.nearestVerticalParabola([parabola1, parabola2])).toEqual(parabola2);
    });
  });
});


describe("Line", function() {
  var line, line2;

  beforeEach(function() {
    line = new Line(1, 0);
    line2 = new Line(2, 1);
  });

  describe(".intersection", function() {
    describe("for intersecting lines", function() {
      it("should return the intersection point", function() {
        var intersection = Line.intersection(line, line2);
        expect(intersection.x).toEqual(-1);
        expect(intersection.y).toEqual(-1);
      });
    });

    describe("for parallel lines", function() {
      var line3;

      beforeEach(function() {
        line3 = new Line(1, 2);
      });

      it("should raise an error", function() {
        expect(function() { Line.intersection(line, line3) }).toThrow(new Error("parallel lines"));
      });
    });
  });

  describe("#perpendicularize", function() {

    describe("for a non-horizontal line", function() {
      it("should return a perpendicular line", function() {
        line.perpendicularize();
        expect(line.slope).toEqual(-1);
      });
    });

    describe("for a horizontal line", function() {
      var line4;

      beforeEach(function() {
        line4 = new Line(0, 0);
      });

      it("should throw an error", function() {
        expect(function() { line4.perpendicularize(); }).toThrow(new Error("slope of 0 in perpendicularize"));
      });
    });
  });

  describe("#shiftIntercept", function() {
    it("should shift the intercept based on the new point", function() {
      line.shiftIntercept(new Point(1, 2));
      expect(line.intercept).toEqual(-1);
    });
  });

  describe("#at", function() {
    it("should return the point at the x coordinate", function() {
      expect(line.at(2)).toEqual(new Point(2, 2));
    });
  });
});


describe("Segment", function() {
  var segment;

  beforeEach(function() {
    segment = new Segment(new Point(0, 0), new Point(3, 4));
  });

  describe("#toLine", function() {
    it("should return the line", function() {
      expect(segment.toLine()).toEqual(new Line(4/3, 0));
    });
  });

  describe("#midpoint", function() {
    it("should return the midpoint", function() {
      expect(segment.midpoint()).toEqual(new Point(1.5, 2));
    });
  });
});
