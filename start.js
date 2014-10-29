'use strict';

var log = function(thing) {
  console.log(thing.data);
};

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
    nearest_vertical_parabola: function(parabolas) {
      var mindist   = 1000,
          minindex  = -1;
      for(var i = 0; i < parabolas.length; i++) {
        var parabola  = parabolas[i],
            dist      = parabola.at(this.x) - this.x;
        if(dist < mindist) {
          mindist   = dist;
          minindex  = i;
        }
      }
      return parabolas[i];
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
      return new exports.Point(x, this.slope * x + this.intercept);
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
      return new Segment(new exports.Point(this.start.x, this.end.y), new exports.Point(this.end.x, this.start.y));
    },

    toLine: function() {
      var slope     = (this.end.y - this.start.y) / (1.0 * (this.end.x - this.start.x));
      var intersect = (this.end.y - slope * this.end.x);
      return new exports.Line(slope, intersect);
    },

    midpoint: function() {
      return new exports.Point( (this.start.x + this.end.x) / 2.0,
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

  Parabola.getRegions = function(parabolas) {
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
        var segment = new exports.Segment(new exports.Point(i, this.at(i)),
                                          new exports.Point(i + this.RESOLUTION, this.at(i + this.RESOLUTION)))
        segs.push(segment);
      }
      segs.push(new exports.Segment(new exports.Point(i, this.at(i)),
                                    new exports.Point(end, this.at(end))));

      return segs;
    }
  };

  exports.Parabola = Parabola;
})(this);


(function(exports) {
  var TreeNode  = function(left, right, parent, data) {
    this.left   = left;
    this.right  = right;
    this.parent = parent;
    this.data   = data;
    this.event  = null;
  };

  TreeNode.prototype = {
    type: function() {
      if(this.data.x !== undefined) { return 'Point'; }
      else                          { return 'Segment'; }
    },
    postTraverse: function(visitor) {
      if(this.left) {
        this.left.postTraverse(visitor);
      }
      if(this.right) {
        this.right.postTraverse(visitor);
      }
      visitor(this);
    },

    visualize: function(str) {
      str = typeof str !== 'undefined' ? str : "";
      console.log(this, str, this.data);
      if(this.left) {
        this.left.visualize(str + "L");
      }
      if(this.right) {
        this.right.visualize(str + "R");
      }
    },

    isLeaf: function() {
      if(this.left === null && this.right === null) { return true; }
      else                                          { return false; }
    },

    search: function(point) {
      if(this.isLeaf()) {
        return this;
      } else {
        var parabola1 = exports.Parabola.generateFromDirectrixAndFocus(point.y, this.data.start);
        var parabola2 = exports.Parabola.generateFromDirectrixAndFocus(point.y, this.data.end);
        var nearest_parabola = point.nearest_vertical_parabola([parabola1, parabola2]);
        if(nearest_parabola == parabola1) {
          return this.left.search(point);
        } else {
          return this.right.search(point);
        }
      }
    },

    deleteNode: function(node) {
      if(this.left == node) { this.left = null; }
      else if(this.right == node) { this.right = null; }
      else {
        if(this.left) { this.left.deleteNode(node); }
        if(this.right) { this.right.deleteNode(node); }
      }
    },

    insert: function(tree) {
      this.left   = tree.root.left;
      this.right  = tree.root.right;
      this.data   = tree.root.data;
      tree.root.parent = this;
    },

    rebalance: function() {
      if(this.type() == 'Segment') {
        if(!this.left) { this.left = this.right.left; this.data = this.right.data; this.right = this.right.right; return; }
        if(!this.right) { this.right = this.left.right; this.data = this.left.data; this.left = this.left.left; return; }
        this.left.rebalance();
        this.right.rebalance();
      }
    }
  };

  var Tree = function(root) {
    this.root = root;
  };

  Tree.prototype = {
    postTraverse: function(visitor) {
      if(!this.root) { return []; }
      this.root.postTraverse(visitor);
    },

    search: function(point) {
      return this.root.search(point);
    },

    generateTree: function(node, point) {
      var leaf1 = new TreeNode(null, null, null, node.data),
          leaf2 = new TreeNode(null, null, null, point),
          leaf3 = new TreeNode(null, null, null, node.data),
          inner_node2 = new TreeNode(leaf2, leaf3, null, new exports.Segment(point, node.data)),
          inner_node1 = new TreeNode(leaf1, inner_node2, null, new exports.Segment(node.data, point));

      leaf1.parent = inner_node1;
      leaf2.parent = inner_node2;
      leaf3.parent = inner_node2;
      inner_node2.parent = inner_node1;
      return new Tree(inner_node1);
    },

    insert: function(point) {
      if(!this.root) {
        this.root = new TreeNode(null, null, null, point);
        return;
      }
      var insertNode = this.search(point),
          newTree = this.generateTree(insertNode, point);
      insertNode.insert(newTree);
    },

    visualize: function() {
      this.root.visualize();
    },

    serialize: function() {
      this.state = [];
      this.postTraverse(this.serializerHelper.bind(this));
      return this.state;
    },

    serializerHelper: function(item) {
      if(item.data.x !== undefined) {
        this.state.push(item);
      }
    },

    deleteNode: function(node) {
      if(this.root == node) { this.root = null; }
      else                  { this.root.deleteNode(node); }
    },

    rebalance: function() {
      if(!this.root) { return; }
      if(this.root.type() == 'Segment') {
        if(!this.root.left) { this.root = this.root.right; return; }
        if(!this.root.right) { this.root = this.root.left; return; }
        this.root.rebalance();
      }
    }
  };

  exports.TreeNode = TreeNode;
  exports.Tree = Tree;
})(this);


(function(exports) {
  var Event = function(point, type) {
    this.point = point;
    this.type = type;
  };

  Event.convertPoints = function(points) {
    return points.map(function(point) { return new Event(point, "site") });
  };

  var PriorityQueue = function(events) {
    var events = typeof events !== 'undefined' ? events : [];
    this.queue = events;
    this.sort();
  };

  PriorityQueue.prototype = {
    sort: function() {
      this.queue.sort(function(a, b) { return b.point.y - a.point.y; });
    },

    insert: function(event) {
      this.queue.push(event);
      this.sort();
    },

    nextEvent: function() {
      return this.queue[0];
    },

    shift: function() {
      this.queue.shift();
    },

    points: function() {
      return this.queue.map(function(item) { return item.point; });
    }
  };

  exports.PriorityQueue = PriorityQueue;
  exports.Event         = Event;
})(this);


(function(exports) {
  var TOP = 10;
  var RESOLUTION = 0.1;
  var generatePoints = function(num) {
    var points = [];
    for(var i = 0; i < num; i++) {
      points.push(new Point(Math.random() * TOP * 2 - TOP, Math.random() * TOP * 2 - TOP + 5));
    }
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

    checkCircleEvent: function(point) {
      var nodes   = this.tree.serialize(),
          potentialNodes = this.potentialCircleNodes(nodes, point);
      for(var i = 0; i < potentialNodes.length; i++) {
        var node     = potentialNodes[i],
            segment1 = new exports.Segment(node[0].data, point),
            line1    = segment1.toLine().perpendicularize().shift_intercept(segment1.midpoint()),
            segment2 = new exports.Segment(node[1].data, point),
            line2    = segment2.toLine().perpendicularize().shift_intercept(segment2.midpoint());
        var intersection = exports.Line.intersection(line1, line2);
        if(intersection.y < exports.Point.lowestPoint(node[0].data, node[1].data).y) {
          console.log('converging');
          var radius  = exports.Point.distance(intersection, node[0].data);
          var point   = new exports.Point(intersection.x, intersection.y - radius),
              ev      = new exports.Event(point, "circle");

          this.queue.insert(ev);
          node[0].event = ev;
          paused = true;
        } else {
          console.log('diverging');
          paused = true;
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
          this.tree.insert(nextPoint);
          this.checkCircleEvent(nextPoint);
        } else {
          console.log("circle event");
          var nodes  = this.tree.serialize(),
              node;

          for(var i = 0; i < nodes.length; i++) {
            if(nodes[i].event == nextEvent) {
              node = nodes[i];
            }
          }

          this.tree.deleteNode(node);
          this.tree.rebalance();
          console.log(this.tree.serialize());

          //deleteEvents();
          //checkCircleEvents();
          paused = true;
        }
        this.queue.shift();
      } else {
        this.sweepLine -= RESOLUTION;
      }
    }
  };

  exports.Algorithm = Algorithm;
})(this);


(function(exports) {
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
      ctx.fillRect(pt.x, pt.y, 5, 5);
    },
  };

  exports.Renderer = Renderer;
})(this);


var renderer = new window.Renderer(800, 600);

var line = -10;
var algorithm = new window.Algorithm(3);
var paused = false;

document.addEventListener('keydown', function(event) {
  if(event.keyCode == 80) {
    if(paused) { paused = false; }
    else       { paused = true; }
  }
});

var loop = function() {
  if(paused) {
    window.requestAnimationFrame(loop);
    return;
  }
  algorithm.nextStep();
  var points    = [],
      segments  = [],
      parabolas = [],
      retrieve  = function(item) {
        var item = item.data;
        if (item.x !== undefined) { points.push(item); }
        else                      { segments.push(item); }
      };
  algorithm.tree.postTraverse(retrieve);

  for(var i = 0; i < points.length; i++) {
    var pt = points[i],
        parabola = window.Parabola.generateFromDirectrixAndFocus(algorithm.sweepLine, pt);
        parabolas.push(parabola);
  }

  renderer.clear();
  for(var i = 0; i < parabolas.length; i++) {
    renderer.drawParabola(parabolas[i]);
  }
  for(var i = 0; i < points.length; i++) {
    renderer.drawPoint(points[i]);
  }
  var pts = algorithm.queue.points();
  for(var i = 0; i < pts.length; i++) {
    renderer.drawPoint(pts[i]);
  }
  for(var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    var line    = segment.toLine().perpendicularize().shift_intercept(segment.midpoint());
    renderer.drawLine(line);
  }
  renderer.drawLine(new window.Line(0, algorithm.sweepLine));
  window.requestAnimationFrame(loop);
}

//window.requestAnimationFrame(loop);

renderer.drawParabola(new window.Parabola(1, 0 ,0));
