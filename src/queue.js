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

    deleteEvent: function(event) {
      if(this.queue.indexOf(event) >= 0) {
        this.queue.splice(this.queue.indexOf(event), 0);
      }
    },

    points: function() {
      return this.queue.map(function(item) { return item.point; });
    }
  };

  exports.PriorityQueue = PriorityQueue;
  exports.Event         = Event;
})(this);
