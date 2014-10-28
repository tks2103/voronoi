var log = function(thing) {
  console.log(thing);
};

(function(exports) {
  var Point = function(x, y) {
    this.x = x;
    this.y = y;
  };

  Point.prototype = {
    nearest_vertical_parabola: function(parabolas) {
      var mindist   = 1000,
          minindex  = -1;
      for(var i = 0; i < parabolas.length; i++) {
        var parabola  = parabolas[i],
            dist      = parabola.at(this.x) - this.x;
        if(dist < mindist) {
          mindist = dist;
          minindex = i;
        }
      }
      return parabolas[i];
    }
  }

  exports.Point = Point;
})(this);


(function(exports) {
  var Segment = function(start, end) {
    this.start = start;
    this.end   = end;
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

  Parabola.generate_from_directrix_and_focus = function(directrix, focus) {
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
  var TreeNode = function(left, right, data) {
    this.left = left;
    this.right = right;
    this.data = data;
  };

  TreeNode.prototype = {
    postTraverse: function(visitor) {
      if(this.left) {
        this.left.postTraverse(visitor);
      }
      if(this.right) {
        this.right.postTraverse(visitor);
      }
      visitor(this.data);
    },

    isLeaf: function() {
      if(this.left === null && this.right === null) { return true; }
      else                                          { return false; }
    },

    search: function(point) {
      if(this.isLeaf()) {
        return this;
      } else {
        parabola1 = exports.Parabola.generate_from_directrix_and_focus(point.y, this.data.start);
        parabola2 = exports.Parabola.generate_from_directrix_and_focus(point.y, this.data.end);
        nearest_parabola = point.nearest_vertical_parabola([parabola1, parabola2]);
        if(nearest_parabola == parabola1) {
          return this.left.search(point);
        } else {
          return this.right.search(point);
        }
      }
    },

    insert: function(tree) {
      this.left   = tree.root.left;
      this.right  = tree.root.right;
      this.data   = tree.root.data;
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

    generate_tree: function(node, point) {
      leaf1 = new TreeNode(null, null, node.data);
      leaf2 = new TreeNode(null, null, point);
      leaf3 = new TreeNode(null, null, node.data);
      inner_node2 = new TreeNode(leaf2, leaf3, new exports.Segment(point, node.data));
      inner_node1 = new TreeNode(leaf1, inner_node2, new exports.Segment(node.data, point));
      return new Tree(inner_node1);
    },

    insert: function(point) {
      if(!this.root) {
        this.root = new TreeNode(null, null, point);
        return;
      }
      insert_node = this.search(point);
      new_tree = this.generate_tree(insert_node, point);
      insert_node.insert(new_tree);
    }
  };

  exports.TreeNode = TreeNode;
  exports.Tree = Tree;
})(this);


(function(exports) {
  var TOP = 15;
  var RESOLUTION = 0.1;
  var generatePoints = function(num) {
    var points = [];
    for(var i = 0; i < num; i++) {
      points.push(new Point(Math.random() * TOP * 2 - TOP, Math.random() * TOP * 2 - TOP));
    }
    return points;
  };

  var Algorithm = function(numPoints) {
    this.points     = generatePoints(numPoints);
    this.tree       = new exports.Tree();
    this.queue      = this.points.sort(function(a, b) { return b.y - a.y; });
    this.sweepLine  = TOP;
  };

  Algorithm.prototype = {
    nextPoint: function() {
      return this.queue[0];
    },

    nextStep: function() {
      var nextPoint = this.nextPoint();
      if(this.sweepLine < -(TOP + TOP / 10.0)) { return; }
      if(!nextPoint) { this.sweepLine -= RESOLUTION; return; }
      if(this.sweepLine - RESOLUTION < nextPoint.y) {
        this.sweepLine = nextPoint.y;
        this.tree.insert(nextPoint);
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

    drawParabola: function(parabola) {
      var segments = parabola.segments(-50, 50);
      for(var i = 0; i < segments.length; i++) {
        var segment = segments[i];
        this.drawLine(segment.start, segment.end);
      }
    },

    drawLine: function(pt1, pt2) {
      pt1 = this.localToWorldCoordinates(pt1);
      pt2 = this.localToWorldCoordinates(pt2);
      var ctx = this.getCtx();
      ctx.beginPath();
      ctx.moveTo(pt1.x, pt1.y);
      ctx.lineTo(pt2.x, pt2.y);
      ctx.stroke();
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
var algorithm = new window.Algorithm(10);
console.log(algorithm);

var loop = function() {
  algorithm.nextStep();
  var points    = [],
      parabolas = [],
      retrieve  = function(item) {
        if (item.x !== undefined) { points.push(item); }
      };
  algorithm.tree.postTraverse(retrieve);

  for(var i = 0; i < points.length; i++) {
    var pt = points[i],
        parabola = window.Parabola.generate_from_directrix_and_focus(algorithm.sweepLine, pt);

        parabolas.push(parabola);
  }

  renderer.clear();
  for(var i = 0; i < parabolas.length; i++) {
    renderer.drawParabola(parabolas[i]);
  }
  for(var i = 0; i < points.length; i++) {
    renderer.drawPoint(points[i]);
  }
  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
