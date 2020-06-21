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
            //natural selection şart yoksa algoritma ilerlemiyor.
            //cocuk, anne veya babadan en ıyı fıtnessa sahıp olanı yenı nesıle ekle
            let fx = x.calcScore();
            let fy = y.calcScore();
            let fc = child.calcScore();
            if (fc >= fx && fc >= fy) {
                new_population.push(child);
            } else if (fx > fy) {
                new_population.push(x);
            } else {
                new_population.push(y);
            }
        }
        console.assert(this.population.length === new_population.length, { error: "population size changed" });
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
            if (current_fit >= this.individual_length**2/2) {
                renderInd(this.population[i])
                alert("buldum");
                this.best_fit_ind = this.population[i];
                this.max_score = current_fit;
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

        list.sort(function (a, b) {
            return a.prob < b.prob;
        });
        for (var k = 0; k < list.length; k++) {
            this.population[k] = list[k].ind;
            this.probabilities[k] = list[k].prob;
        }
        this.best_fit_ind = this.population[this.population.length - 1];
        this.max_score = this.population[this.population.length - 1].calcScore();
        console.log(this.max_score);
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
        return this.population[this.population.length - 1];
    };
    /**
     * verilen iki atadan her bir geni yuzde 50 olasılıkla anneden veya babadan alarak
     * bir child olusturur ve dondurur
     */
    this.reproduce = function (ind1, ind2) {
        let child = new Ind(this.individual_length);
        for (let i = 0; i < this.individual_length; i++) {
            child.board[i] = Math.random() > 0.5 ? ind1.board[i] : ind2.board[i];
        }
        return child;
    };

};