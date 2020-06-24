
var N = 9;
var canvas_size = 3200;
var cellSize = Math.floor(canvas_size / N);

var canvas = document.createElement('canvas');
canvas.id = "MainBoard";
canvas.width = canvas_size;
canvas.height = canvas_size;

document.getElementById("canvasContainer").appendChild(canvas);

var ctx = canvas.getContext("2d");
ctx.font = `${cellSize/2}px Arial`;
ctx.textAlign = "center";
ctx.textBaseline = 'middle';



let draw=false;
let x_old, y_old;
canvas.onmouseup = (e) => {
    draw = false;
}
canvas.onmousedown = (e) => {
    draw = true;
    x_old = Math.floor(e.pageX / canvas.offsetWidth * canvas.width);
    y_old = Math.floor(e.pageY / canvas.offsetHeight * canvas.height);
}
canvas.onmousemove = (e) => {
    if(draw){
        var x = Math.floor(e.pageX / canvas.offsetWidth * canvas.width);
        var y = Math.floor(e.pageY / canvas.offsetHeight * canvas.height);
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x_old, y_old);
        ctx.lineTo(x, y);
        ctx.stroke();
        x_old = x;
        y_old = y;
    }
}

var GAWorker = new Worker('js/geneticAlgorithm.js');

var lastInd;
let ui2 = document.getElementById("ui2");
let show_change_cb;

function checkboxChanged(val){
    show_change_cb = val;
}
GAWorker.onmessage = function(msg){
    if(msg.data?.finish){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        render(lastInd, current_render_mode);
        lastInd = null;
        toggleState();
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        render(msg.data.ind, current_render_mode);
        var h = document.createElement("H5")                
        var t = document.createTextNode(`Curren Max Score: (required=${(N**2+N**3)/2}) ` + msg.data.score);
        h.style.color = "white"; 
        h.appendChild(t);                           
        ui2.appendChild(h);
        if(msg.data?.start_time){
            let tstr = (Date.now() - msg.data.start_time) +" ms"
            console.log(tstr);
            var h = document.createElement("H3")                
            var t = document.createTextNode(`Total Time: ` + tstr);
            h.style.color = "red"; 
            h.appendChild(t);                           
            ui2.appendChild(h);
        }
        if(show_change_cb && lastInd && lastInd.board.length == msg.data.ind.board.length){
            for(var i=0; i < N; i++){
                for(var j=1; j<N; j++){
                    if(msg.data.ind.board[i][j] != lastInd.board[i][j]){
                        ctx.strokeStyle = "aqua";
                        ctx.lineWidth = "12";
    
                        ctx.beginPath();
                        ctx.rect(j * cellSize, i * cellSize, cellSize, cellSize);
                        ctx.stroke();
                    }
                }
            }
        }
        lastInd = msg.data.ind; 
    }
}

let state = "free";

function toggleState(){
    let btn = document.getElementById("buttonn")
    if(state == "free"){
        document.getElementById("ui").style.display = "none";
        btn.className = "btn btn-block btn-danger";
        btn.innerHTML = "Cancel";
        state = "solve";
    } else {
        document.getElementById("ui").style.display = "block";
        btn.className = "btn btn-block btn-primary";
        btn.innerHTML = "Start";
        state="free";
    }
}

function startOnClick(){
    if(state == "free"){
        toggleState();
        ui2.innerHTML = "";
        N = parseInt(document.getElementById("board_size").value);
        cellSize = Math.floor(canvas_size / N);
        ctx.font = `${cellSize/2}px Arial`;
        var props = {
            mutation_probability: parseFloat(document.getElementById("mut_prob").value),
            timeout:  parseInt(document.getElementById("timeout").value),
            population_size: parseInt(document.getElementById("pop_size").value),
            individual_length: N,
            keep_alive_rate:  parseFloat(document.getElementById("kar").value)
        };
        GAWorker.postMessage(props);
    } else {
        GAWorker.postMessage({});
    }
  

}
startOnClick();
