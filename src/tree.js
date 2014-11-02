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
        var nearestParabola = point.nearestVerticalParabola([parabola1, parabola2]);
        if(nearestParabola == parabola1) {
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
      var nodes = this.serialize(),
          parabolas = [];
      for(var i = 0; i < nodes.length; i++) {
        var pt = nodes[i].data,
            parabola = window.Parabola.generateFromDirectrixAndFocus(algorithm.sweepLine, pt);
            parabolas.push(parabola);
      }

      var roots = window.Parabola.getRegions(parabolas);
      for(var i = 0; i < roots.length; i++) {
        if(point.x < roots[i]) {
          return nodes[i-1];
        }
      }
      throw "couldnt find the node in search";
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
          newTree = this.generateTree(insertNode, point),
          event = null;
      if(insertNode.event != null) {
        event = insertNode.event;
        insertNode.event = null;
      }
      insertNode.insert(newTree);
      return event;
    },

    visualize: function() {
      if(this.root) {
        this.root.visualize();
      }
    },

    serialize: function() {
      this.state = [];
      this.postTraverse(this.serializerHelper.bind(this));
      return this.state;
    },

    serializerHelper: function(item) {
      if(item.type() == 'Point') {
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
