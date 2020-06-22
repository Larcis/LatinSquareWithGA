
var N = 6;
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

var props = {
    mutation_probability: 0.3,
    timeout: 999999,
    population_size: 500,
    individual_length: N,
    keep_alive_rate: 0.1
};

var GAWorker = new Worker('js/geneticAlgorithm.js');
GAWorker.postMessage(props);

var lastInd;
GAWorker.onmessage = function(msg){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    render(msg.data, current_render_mode);
    if(lastInd){
        for(var i=0; i < N; i++){
            for(var j=1; j<N; j++){
                if(msg.data.board[i][j] != lastInd.board[i][j]){
                    ctx.strokeStyle = "aqua";
                    ctx.lineWidth = "16";

                    ctx.beginPath();
                    ctx.rect(j * cellSize, i * cellSize, cellSize, cellSize);
                    ctx.stroke();
                }
            }
        }
    }
    lastInd = msg.data; 

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

