
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y,   x+w, y+h, r);
    this.arcTo(x+w, y+h, x,   y+h, r);
    this.arcTo(x,   y+h, x,   y,   r);
    this.arcTo(x,   y,   x+w, y,   r);
    this.closePath();
    return this;
}

var current_ind;
function renderInd(elem){
    current_ind = elem;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    for(var i=0; i < elem.N; i++){
        for(var j=0; j < elem.N; j++){
            if(ctx){
                ctx.fillText(elem.board[i][j], (j+1/2) * cellSize, (i+1/2) * cellSize);

            } else {
                console.log(elem.board[i][j]);
            }
        }
    }
}

var alphabet = "ABCDEFGHIJKLMNOPRSTUVYZXQabcdefghijklmnoprstuvyzxq";
function renderAlph(board, n){
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    for(var i=0; i < n; i++){
        for(var j=0; j < n; j++){
            ctx.fillText(alphabet[board[i][j]], (j+1/2) * cellSize, (i+1/2) * cellSize);
        }
    }
}

var colors = [];
for(var i =0; i < 150; i++){
    let c;
    do{
        c = getRandomColor();
    }while(colors.includes(c));
    colors.push(c);
}
function renderColor(board, n){
    for(var i=0; i < n; i++){
        for(var j=0; j < n; j++){
            ctx.fillStyle = colors[board[i][j]];
            ctx.roundRect(j * cellSize, i * cellSize, cellSize, cellSize, cellSize/4).fill();
        }
    }
}
function getRandomColor() {
    var varters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += varters[Math.floor(Math.random() * 16)];
    }
    return color;
}
var current_render_mode = "Renk-Sayı";
function onRenderChoiceChange(e){
    if(current_ind){
        current_render_mode = e;
        render(current_ind, e);
    }
}
function render(ind, e){
    var board = ind.board;
    var n = ind.N;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(e == "Renk"){
        renderColor(board, n);
    } else if(e == "Harf"){
        renderAlph(board, n);
    } else if(e == "Renk-Harf"){
        renderColor(board, n);
        renderAlph(board, n);
    } else if(e == "Renk-Sayı"){
        renderColor(board, n);
        renderInd(ind);
    } else {
        renderInd(ind);
    }
}