importScripts('individual.js');

function GeneticAlgorithm(props) {
    this.mutation_probability = props.mutation_probability; //olusan cocugun mutasyon gecırme olasılıgı 0-1 aralıgında
    this.timeout = props.timeout || 999999; //algoritmanın maksimum calısabılecegı sure ms cinsinden
    this.population_size = props.population_size || 100; //populasyon icerisindeki toplam birey sayısı
    this.individual_length = props.individual_length; //bireyin uzunlugu(atacagı adım sayısı)
    this.keep_alive_rate = props.keep_alive_rate || 0.5; //oncekı populasyondan dırek olarak yenı populasyona aktarılma yuzdesı 
    this.sp = 0;
    this.population = []; //populasyon
    this.probabilities = []; //fitness degerlerı normalize edilmis
    this.start_time = 0; //algoritmanın baslatılma zamanı
    this.max_score = 0; //generasyondakı maksımum skor
    this.best_fit_ind = null; //generasyondakı en yuksek skora sahıp bırey
    /**
     * ilk generasyonu rastgele üretme fonksiyonu
     * bu fonksiyonda keep_alive_rate e gore bolunme ındexi de belırlenıyor
     */
    this.create_first_generation = function () {
        for (let i = 0; i < this.population_size; i++) {
            let new_ind = new Ind(this.individual_length);
            new_ind.fillRandom();
            this.population.push(new_ind);
        }
        this.start_time = Date.now();
        this.sp = Math.round(this.population.length * this.keep_alive_rate);
    };

    /**
     * Yenı generasyon uretme fonksıyonu
     * adımlar:
     * -o anki populasyon icin accumulate array olusturuluyor ve timeout kontrol edılıyor
     * -accumulate dizisini olusutururken elde ettigimiz en iyi birey cizdirilir
     * -yeni populasyona o ankı populasyonun keep_alive_rate i kadarı direk olarak aktarılır
     * -yeni populasyonun boyutunu o anki ile aynı hale getirecek  kadar yenı eleman uretılır ve eklenır
     * -o anki populasyon yenisi ile değiştirilir
     */
    this.create_next_generation = function () {

        if (!this.create_acumulate_array() || (Date.now() - this.start_time) > this.timeout) {
            return this.best_fit_ind;
        }
        //renderInd(this.best_fit_ind);
        let new_population = this.population.slice(0, this.sp);
        for (let i = 0; i < (this.population.length - this.sp); i++) {
            //populasyondan olasılıkları yuksek olanlara oncelık verecek sekılde rastgele ıkı bırey sec
            let x = this.random_selection();
            let y = this.random_selection();
            //cocuktakı her gen ıcın yuzde 50 ihtimalle  x ten ya da yuzde 50 ihtimalle y den gen sec(crossover)
            let child = this.reproduce(x, y);
            if (Math.random() < this.mutation_probability) { //cocuk mutasyona ugrasın mı? mutation_probability olasılıgıyla
                child.mutate();
            }
            new_population.push(child);
        }
        //console.assert(this.population.length === new_population.length, { error: "population size changed" });
        this.population = new_population; //o ankı populasyon yenı popusyonun yerıne gectı
        return null;
    };

    /**
     * O anki populasyon icin accumulate array olustur
     * adımlar:
     * -populasyondakı her eleman ıcın fitness degerı hesaplat(eger birey sona ulasmıssa fitness fonksiyonu 666666 dondurur ve algorıtma durur)
     * -fitness degerlernını normalıze et
     * -kucukten buyuge sırala
     * -en uygun bıreyı set etasdasd u
     */
    
    this.create_acumulate_array = function () {
        this.probabilities = [];
        let sum = 0;
        for (let i = 0; i < this.population.length; i++) {
            let current_fit = this.population[i].calcScore();
            if (current_fit >= (this.individual_length**2+this.individual_length**3)/2) {
                postMessage({ind: this.population[i], score: current_fit});
                //postMessage(this.population[i]);
                console.log(current_fit);
                this.best_fit_ind = this.population[i];
                this.max_score = current_fit;
                postMessage({"finish": true});
                return false;
            }
            this.probabilities.push(current_fit);
            sum += current_fit;
        }
        for (let i = 0; i < this.probabilities.length; i++) {
            this.probabilities[i] /= sum;
        }
        var list = [];
        for (var j = 0; j < this.probabilities.length; j++)
            list.push({ 'ind': this.population[j], 'prob': this.probabilities[j] });
        list.sort(compare);
        for (var k = 0; k < list.length; k++) {
            this.population[k] = list[k].ind;
            this.probabilities[k] = list[k].prob;
        }
        this.best_fit_ind = this.population[0];
        this.max_score = this.population[0].calcScore();
        //console.log(this.max_score);
        return true;
    }
    /**
     * Sıralı bır olasılık dızısınden cdf e gore eleman secer
     * adımlar:
     * - 0-1 aralıgında rastgele bır sayı uret
     * - bu sayı olasılık dızısınde nereye gelıyor lınear search ıle bul
     * - bu ındıse denk gelen bıreyı dondur
     */
    this.random_selection = function () {
        let rnd = Math.random();
        let acc = 0;
        for (let i = 0; i < this.probabilities.length; i++) {
            acc += this.probabilities[i];
            if (acc >= rnd) {
                return this.population[i];
            }
        }
        return this.population[0];
    };
    /**
     * verilen iki atadan her bir geni yuzde 50 olasılıkla anneden veya babadan alarak
     * bir child olusturur ve dondurur
     */
    this.reproduce = function (ind1, ind2) {
        let child = new Ind(this.individual_length);
        //var child = Object.assign({}, ind1);
        /*child.board = Object.assign({}, ind1.board);
        let idx = randgen(0, ind1.N-1);
        child.board[idx] = Object.assign({}, ind2.board[idx]);*/
        for (let i = 0; i < this.individual_length; i++) {
            child.board[i] = Math.random() > 0.6 ? [...ind1.board[i]] : [...ind2.board[i]];
        }
        return child;
    };

};

function compare( a, b ) {
    if ( a.prob < b.prob ){
        return 1;
    }
    if ( a.prob > b.prob ){
        return -1;
    }
    return 0;
}

let state = "free";
let flag;

onmessage = function(msg){
    console.log(msg.data)
    if(state == "free" && msg.data?.mutation_probability){
        state = "solve";
        let GA = new GeneticAlgorithm(msg.data);
        GA.create_first_generation();
        let lastRender = Date.now();
        let lastMax;
        do{
            flag = GA.create_next_generation();
            if(lastMax != GA.max_score && (Date.now() - lastRender) > 50){
                lastRender = Date.now();
                lastMax = GA.max_score;
                postMessage({ind: GA.best_fit_ind, score: lastMax});
                console.log(lastMax);
            }
        }while(!flag);
        console.log("end end end");
        state = "free";
    } else {
        flag = true;
        state = "free";
        postMessage({"finish": true});

    }
    
}