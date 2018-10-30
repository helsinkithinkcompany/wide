
var NUM_PARTICLES = ( ( ROWS = 100 ) * ( COLS = 300 ) ),
    THICKNESS = Math.pow( 80, 2 ),
    SPACING = 3,
    MARGIN = 100,
    COLOR = 220,
    DRAG = 0.95,
    EASE = 0.02,
    CLOSE = 5,
    
    /*
    
    used for sine approximation, but Math.sin in Chrome is still fast enough :)http://jsperf.com/math-sin-vs-sine-approximation

    B = 4 / Math.PI,
    C = -4 / Math.pow( Math.PI, 2 ),
    P = 0.225,

    */

    container,
    particle,
    canvas,
    mouse,
    stats,
    list,
    ctx,
    tog,
    man,
    dx, dy,
    mx, my,
    d, t, f,
    a, b,
    i, n,
    w, h,
    p, s,
    r, c,
    num_particles,
    nodes,
    edges
    ;

particle = {
  vx: 0,
  vy: 0,
  x: 0,
  y: 0,
  alive: 0,
  i: 0
};

function gaussian(scale=1.0) {
  let u = Math.random();
  let v = Math.random();
  return [Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)*scale,
          Math.sqrt(-2*Math.log(u))*Math.sin(2*Math.PI*v)*scale];
}

function init() {

  container = document.getElementById('container');
  canvas = document.createElement('canvas');

  ctx = canvas.getContext('2d');

  man = false;
  tog = true;

  w = canvas.width = COLS * SPACING + MARGIN * 2;
  h = canvas.height = ROWS * SPACING + MARGIN * 2;

  container.style.marginLeft = Math.round(w * -0.5) + 'px';
  container.style.marginTop = Math.round(h * -0.5) + 'px';

  container.addEventListener( 'mousemove', function(e) {

    bounds = container.getBoundingClientRect();
    mx = e.clientX - bounds.left;
    my = e.clientY - bounds.top;
    man = true;

  });

  if ( typeof Stats === 'function' ) {
    document.body.appendChild( ( stats = new Stats() ).domElement );
  }
  container.appendChild( canvas );

  list = [];
  num_particles = NUM_PARTICLES;
}

function init_particles(graph_p, graph_n, graph_e) {
  console.log("Initing particles");
  list = [];
  console.log("Received ", graph_p.length, " particle groups");

  ind = 0;
  for(i = 0; i < graph_p.length; i++) {
    let group = graph_p[i]
    let count = group["count"];
    for(j = 0; j < count; j++) {
        p = Object.create(particle);
        [dx, dy] = gaussian(3.0);
        p.x = group["path"][0][0] + dx;
        p.y = group["path"][0][1] + dy;
        p.ox = group["path"].slice(1).map(x => x[0] + dx);
        p.oy = group["path"].slice(1).map(x => x[1] + dy + 5);
        list[ind++] = p;
    }
  }
  console.log(list);
  num_particles = list.length;

  nodes = graph_n;
  edges = graph_e;
  step();
}

function step() {

  if ( stats ) stats.begin();

  if ( tog = !tog ) {

    if ( !man ) {

      t = +new Date() * 0.001;
      t = 0;
      mx = w * 0.5 + ( Math.cos( t * 2.1 ) * Math.cos( t * 0.9 ) * w * 0.45 );
      my = h * 0.5 + ( Math.sin( t * 3.2 ) * Math.tan( Math.sin( t * 0.8 ) ) * h * 0.45 );
    }
      
    for ( i = 0; i < num_particles; i++ ) {
      
      p = list[i];
      if(p.alive == 0) {
        if(Math.random() < 0.01) {
          p.alive = 1;
        }
        continue;
      }
      
      d = ( dx = mx - p.x ) * dx + ( dy = my - p.y ) * dy;
      f = -THICKNESS / d;

      if ( d < THICKNESS ) {
        t = Math.atan2( dy, dx );
        p.vx += f * Math.cos(t);
        p.vy += f * Math.sin(t);
      }

      p.x += ( p.vx *= DRAG ) + (p.ox[p.i] - p.x) * EASE;
      p.y += ( p.vy *= DRAG ) + (p.oy[p.i] - p.y) * EASE;
      if(Math.abs(p.x - p.ox[p.i]) < CLOSE && Math.abs(p.y - p.oy[p.i]) && p.i < p.ox.length-1) {
        p.i += 1;
      }
    }

  } else {

    b = ( a = ctx.createImageData( w, h ) ).data;

    for ( i = 0; i < num_particles; i++ ) {

      p = list[i];
      if(p.alive == 0) {
          continue;
      }
      b[n = ( ~~p.x + ( ~~p.y * w ) ) * 4] = b[n+1] = b[n+2] = COLOR, b[n+3] = 255;
      b[n = ( (~~p.x-1) + ( ~~p.y * w ) ) * 4] = b[n+1] = b[n+2] = COLOR, b[n+3] = 255;
      b[n = ( (~~p.x+1) + ( ~~p.y * w ) ) * 4] = b[n+1] = b[n+2] = COLOR, b[n+3] = 255;
      b[n = ( ~~p.x + ( (~~p.y-1) * w ) ) * 4] = b[n+1] = b[n+2] = COLOR, b[n+3] = 255;
      b[n = ( ~~p.x + ( (~~p.y+1) * w ) ) * 4] = b[n+1] = b[n+2] = COLOR, b[n+3] = 255;


    }

    ctx.putImageData( a, 0, 0 );

    ctx.fillStyle = "white";
    //ctx.font = '48px serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (i=0; i < nodes.length; i++) {
      x = nodes[i]["position"][0];
      y = nodes[i]["position"][1];
      ctx.fillText("●", x, y)
      ctx.fillText(nodes[i]["label"], x, y-10);
    }

    ctx.strokeStyle = "white";
    ctx.beginPath();
    for(i=0; i < edges.length; i++) {
      ctx.moveTo(edges[i][0][0], edges[i][0][1]);
      ctx.lineTo(edges[i][1][0], edges[i][1][1]);
    }
    ctx.stroke();
  }

  if ( stats ) stats.end();

  requestAnimationFrame( step );
}

init();