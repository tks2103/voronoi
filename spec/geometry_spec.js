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
