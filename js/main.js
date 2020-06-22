
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




canvas.onmousedown = (e) => {
    var x = Math.floor(e.pageX / canvas.offsetWidth * canvas.width);
    var y =  Math.floor(e.pageY / canvas.offsetHeight * canvas.height);
    console.log(x, y)

    ctx.fillStyle = "red";
    ctx.fillRect(x, y, 20, 20);

}

/*var props = {
    mutation_probability: 0.4,
    timeout: 999999,
    population_size: 1000,
    individual_length: N,
    keep_alive_rate: 0.1
};*/

var GAWorker = new Worker('js/geneticAlgorithm.js');

var lastInd;
let ui2 = document.getElementById("ui2");

GAWorker.onmessage = function(msg){
    if(msg.data?.finish){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        render(lastInd, current_render_mode);
        lastInd = null;
        toggleState();
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        render(msg.data.ind, current_render_mode);
        var h = document.createElement("H4")                
        var t = document.createTextNode(`Curren Max Score: (required=${(N**2+N**3)/2}) ` + msg.data.score);
        h.style.color = "white"; 
        h.appendChild(t);                           
        ui2.appendChild(h);
        if(lastInd && lastInd.board.length == msg.data.ind.board.length){
            for(var i=0; i < N; i++){
                for(var j=1; j<N; j++){
                    if(msg.data.ind.board[i][j] != lastInd.board[i][j]){
                        ctx.strokeStyle = "aqua";
                        ctx.lineWidth = "16";
    
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
/*var GA = new GeneticAlgorithm(props);
GA.create_first_generation();

var lastRender = Date.now();
var flag;
do{
    flag = GA.create_next_generation();
    if((Date.now() - lastRender) > 200){
        renderInd(GA.best_fit_ind);
        lastRender = Date.now();
        console.log("rendered")
    }
}while(!flag);
var i = new Ind(N);
i.fillRandom();
renderInd(i);*/

