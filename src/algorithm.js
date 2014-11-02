(function(exports) {
  var TOP = 10;
  var RESOLUTION = 0.1;
  var generatePoints = function(num) {
    var points = [];
    for(var i = 0; i < num; i++) {
      points.push(new Point(Math.random() * TOP * 2 - TOP, Math.random() * TOP * 2 - TOP + 5));
    }
    //return [new Point(4.09, -1.46), new Point(-1.24, 6.45), new Point(-0.07, -.937)];
    return points;
  };

  var Algorithm = function(numPoints) {
    var points      = generatePoints(numPoints);
    this.tree       = new exports.Tree();
    this.queue      = new exports.PriorityQueue(exports.Event.convertPoints(points));
    this.sweepLine  = TOP;
  };

  Algorithm.prototype = {
    nextEvent: function() {
      return this.queue.nextEvent();
    },


    potentialCircleNodes: function(nodes, point) {
      var potentialNodes  = [],
          length          = nodes.length;
      for(var i = 0; i < length; i++) {
        if(nodes[i].data == point) {
          if(i >= 2) {
            potentialNodes.push([nodes[i-1], nodes[i-2]]);
          }
          if(i <= length - 3) {
            potentialNodes.push([nodes[i+1], nodes[i+2]]);
          }
          return potentialNodes;
        }
      }
    },

    checkCircleEvent: function(point, directrix) {
      var nodes           = this.tree.serialize(),
          potentialNodes  = this.potentialCircleNodes(nodes, point);
      for(var i = 0; i < potentialNodes.length; i++) {
        var node        = potentialNodes[i],
            segment1    = new exports.Segment(node[0].data, point),
            line1       = segment1.toLine().perpendicularize().shift_intercept(segment1.midpoint()),
            parabola1   = window.Parabola.generateFromDirectrixAndFocus(directrix, node[0].data),
            segment2    = new exports.Segment(node[1].data, point),
            line2       = segment2.toLine().perpendicularize().shift_intercept(segment2.midpoint()),
            parabola2   = window.Parabola.generateFromDirectrixAndFocus(directrix, node[1].data);
        var intersection = exports.Line.intersection(line1, line2);
        var dist1 = intersection.y - parabola1.at(intersection.x),
            dist2 = intersection.y - parabola2.at(intersection.x);
        if(intersection.y < parabola1.at(intersection.x) && intersection.y < parabola2.at(intersection.x)) {
          var radius  = exports.Point.distance(intersection, node[0].data);
          var point   = new exports.Point(intersection.x, intersection.y - radius),
              ev      = new exports.Event(point, "circle");

          this.queue.insert(ev);
          node[0].event = ev;
        } else {
        }
      }
    },

    nextStep: function() {
      var nextEvent = this.nextEvent();
      if(this.sweepLine < -(TOP + TOP / 15.0)) { return; }
      if(!nextEvent) { this.sweepLine -= RESOLUTION; return; }

      var nextPoint = nextEvent.point;
      if(this.sweepLine - RESOLUTION < nextPoint.y) {
        this.sweepLine = nextPoint.y;
        if(nextEvent.type == "site") {
          var ev = this.tree.insert(nextPoint);
          if(ev !== null) {
            this.queue.deleteEvent(ev);
          }
          this.checkCircleEvent(nextPoint, this.sweepLine);
        } else {
          var nodes  = this.tree.serialize(),
              node, ind;

          for(var i = 0; i < nodes.length; i++) {
            if(nodes[i].event == nextEvent) {
              node = nodes[i];
              ind = i;
            }
          }

          this.tree.deleteNode(node);
          this.tree.rebalance();
          if(ind > 0) { nodes[ind-1].event = null; this.checkCircleEvent(nodes[ind-1].data, this.sweepLine); }
          if(ind < nodes.length-1) { nodes[ind+1].event = null; this.checkCircleEvent(nodes[ind+1].data, this.sweepLine); }
        }
        this.queue.shift();
      } else {
        this.sweepLine -= RESOLUTION;
      }
    }
  };

  exports.Algorithm = Algorithm;
})(this);
