class Ind{
    constructor(N=5){
        this.N = N;
        this.board = [];        
    }
    fillRandom(){
        for(let i = 0; i < this.N; i++){
            this.board[i] = this.getShuffledRow();
        }
    }
    getShuffledRow(){
        let row = [...Array(this.N).keys()];
        let counter = row.length;
        while (counter > 0) {
            let index = Math.floor(Math.random() * counter);
            counter--;
            let temp = row[counter];
            row[counter] = row[index];
            row[index] = temp;
        }
        return row;
    }
    mutate(){
        /*let nof = randgen(0, this.N);
        for(let i = 0; i < nof; i++){
            this.board[randgen(0, this.N-1)] = this.getShuffledRow();
        }*/
        let idxs = [];
        for(let i=0; i < this.N; i++){
            let score_dict = {};
            for(let j=0; j < this.N; j++){
                let elm = this.board[j][i];
                if( score_dict[elm] ){
                    idxs.push(j);
                    //this.board[j] = this.getShuffledRow();
                } else {
                    score_dict[elm] = j;
                }
            }
        }
        //console.log(idxs)

        for(let i = 0; i < idxs.length; i++){
            this.board[idxs[i]] = this.getShuffledRow();
        }
    }
    calcScore(){
        let score = 0;
        for(let i=0; i < this.N; i++){
            let score_dict = {};
            for(let j=0; j < this.N; j++){
                let elm = this.board[j][i];
                if( score_dict[elm] ){
                    score_dict[elm]++;
                } else {
                    score_dict[elm] = 1;
                }
            }
            let k =  Object.keys(score_dict).length; // 1 - N
            let sum = 0;
            for (let key in score_dict){
                let value = score_dict[key];
                if(value == 1){
                    sum++; //max +N k=N
                } else {
                    sum -= value; //min -N  k=1
                }
            }
            score += (this.N / 2 / k * sum); // -N^3/2  ...  +N^2/2 
        }
        return this.N**3/2 + score;
    }
}

function randgen(start, end) {
    return Math.floor(Math.random() * (end - start)) + start;
};
