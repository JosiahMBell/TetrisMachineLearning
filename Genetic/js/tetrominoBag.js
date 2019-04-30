function TetrominoBag(){
    this.bag = [0, 1, 2, 3, 4, 5, 6];
    this.shuffleBag();
    this.index = -1;
    this.prevTet = -1;
};

TetrominoBag.prototype.nextTetromino = function(randType){
    if(randType === -1) {
        //Fully random piece generator (memoryless randomizer)
        return Tetromino.fromIndex(Math.round(Math.random() * 6));
    } else if(randType === 0) {
        //NES Tetris Random Piece Generator
        var nextTet = Math.round(Math.random() * 7);
        var reroll = false;
        if(nextTet <= 6) {
            if(nextTet === this.prevTet) {
                reroll = true;
            } else {
                this.prevTet = nextTet;
                return Tetromino.fromIndex(nextTet);
            }
        } else if(nextTet === 7) {
            reroll = true;
        }
        if(reroll) {
            return Tetromino.fromIndex(Math.round(Math.random() * 6));
        }
    } else if(randType === 1) {
        //Current Official Tetris Random Piece Generator
        this.index++;
        if (this.index >= this.bag.length){
            this.shuffleBag();
            this.index = 0;
        }
        return Tetromino.fromIndex(this.bag[this.index]);
    }
};

TetrominoBag.prototype.shuffleBag = function() {
    var currentIndex = this.bag.length;
    var temporaryValue;
    var randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = this.bag[currentIndex];
        this.bag[currentIndex] = this.bag[randomIndex];
        this.bag[randomIndex] = temporaryValue;
    }
};