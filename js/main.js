



let N = 9;
let cellSize = Math.floor(1200 / N);

var canvas = document.createElement('canvas');
canvas.id = "MainBoard";
canvas.width = 1200;
canvas.height = 1200;

document.body.appendChild(canvas);

var ctx = canvas.getContext("2d");

ctx.font = `${cellSize/2}px Arial`;
ctx.textAlign = "center";
ctx.textBaseline = 'middle';
ctx.fillStyle = "green";

function renderInd(elem){
    for(let i=0; i < elem.N; i++){
        for(let j=0; j < elem.N; j++){
            if(ctx){
                ctx.fillText(elem.board[i][j], (j+1/2) * cellSize, (i+1/2) * cellSize);

            } else {
                console.log(elem.board[i][j]);
            }
        }
    }
}

canvas.onmousedown = (e) => {
    let x = Math.floor(e.pageX / canvas.offsetWidth * canvas.width);
    let y =  Math.floor(e.pageY / canvas.offsetHeight * canvas.height);
    console.log(x, y)

    ctx.fillStyle = "red";
    ctx.fillRect(x, y, 20, 20);

}

let props = {
    mutation_probability: 0.35,
    timeout: 999999,
    population_size: 150,
    individual_length: N,
    keep_alive_rate: 0.05
};
let GAWorker = new Worker('js/geneticAlgorithm.js');
GAWorker.postMessage(props);

GAWorker.onmessage = function(msg){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderInd(msg.data);

}

/*let GA = new GeneticAlgorithm(props);
GA.create_first_generation();

let lastRender = Date.now();
let flag;
do{
    flag = GA.create_next_generation();
    if((Date.now() - lastRender) > 200){
        renderInd(GA.best_fit_ind);
        lastRender = Date.now();
        console.log("rendered")
    }
}while(!flag);*/

