'use strict';

var renderer = new Renderer(800, 600),
    algorithm = new Algorithm(9),
    paused = false;

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

  //Generate Render Objects
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
        parabola = Parabola.generateFromDirectrixAndFocus(algorithm.sweepLine, pt);
        parabolas.push(parabola);
  }

  var roots = Parabola.getRegions(parabolas);

  //Render
  renderer.clear();
  for(var i = 0; i < parabolas.length; i++) {
//    renderer.drawParabola(parabolas[i]);
    renderer.drawParabolaSegment(parabolas[i], roots[i], roots[i+1]);
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
    var line    = segment.toLine().perpendicularize().shiftIntercept(segment.midpoint());
//    renderer.drawLine(line);
  }
  renderer.drawLine(new Line(0, algorithm.sweepLine));
  renderer.drawLine(new Line(0, 0));
  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
