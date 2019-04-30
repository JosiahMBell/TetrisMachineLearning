function Grid(){
    this.rows = 22;
    this.columns = 10;

    this.cells = new Array(this.rows);
    for (var r = 0; r < this.rows; r++) {
        this.cells[r] = new Array(this.columns);
        for(var c = 0; c < this.columns; c++){
            this.cells[r][c] = 0;
        }
    }
};

Grid.prototype.clone = function(){
    var clonedGrid = new Grid();
    for (var r = 0; r < this.rows; r++) {
        for(var c = 0; c < this.columns; c++){
            clonedGrid.cells[r][c] = this.cells[r][c];
        }
    }
    return clonedGrid;
};

Grid.prototype.clearLines = function(){
    var lines = 0;
    for(var r = this.rows - 1; r >= 0; r--){
        if (this.isLine(r)){
            lines++;
            for(var c = 0; c < this.columns; c++){
                this.cells[r][c] = 0;
            }
        }else if (lines > 0){
            for(var c = 0; c < this.columns; c++){
                this.cells[r + lines][c] = this.cells[r][c];
                this.cells[r][c] = 0;
            }
        }
    }
    return lines;
};

Grid.prototype.isLine = function(row){
    for(var c = 0; c < this.columns; c++){
        if (this.cells[row][c] == 0){
            return false;
        }
    }
    return true;
};

Grid.prototype.isRowEmpty = function(row){
    for(var c = 0; c < this.columns; c++){
        if (this.cells[row][c] != 0){
            return false;
        }
    }
    return true;
};

Grid.prototype.heightExceeded = function(){
    return !this.isRowEmpty(0) || !this.isRowEmpty(1);
};

Grid.prototype.lines = function(){
    var lines = 0;
    for(var r = 0; r < this.rows; r++){
        if (this.isLine(r)){
            lines++;
        }
    }
    return lines;
};

Grid.prototype.holes = function(){
    var holes = 0;
    for(var c = 0; c < this.columns; c++){
        var block = false;
        for(var r = 0; r < this.rows; r++){
            if (this.cells[r][c] != 0) {
                block = true;
            }else if (this.cells[r][c] == 0 && block){
                holes++;
            }
        }
    }
    return holes;
};

Grid.prototype.tallestColumnHeight = function() {
    var height = 0;
    for(var c = 0; c < this.columns; c++) {
        if(this.columnHeight(c) > height) {
            height = this.columnHeight(c);
        }
    }
    return height;
};

Grid.prototype.totalHeight = function(){
    var total = 0;
    for(var c = 0; c < this.columns; c++){
        total += this.columnHeight(c);
    }
    return total;
};

Grid.prototype.roughness = function(){
    var total = 0;
    for(var c = 0; c < this.columns - 1; c++){
        total += Math.abs(this.columnHeight(c) - this.columnHeight(c+ 1));
    }
    return total;
}

Grid.prototype.columnHeight = function(column){
    var r = 0;
    for(; r < this.rows && this.cells[r][column] == 0; r++);
    return this.rows - r;
};

Grid.prototype.addTetromino = function(tetromino) {
    for(var r = 0; r < tetromino.cells.length; r++) {
        for (var c = 0; c < tetromino.cells[r].length; c++) {
            var rSet = tetromino.row + r;
            var cSet = tetromino.column + c;
            if (tetromino.cells[r][c] != 0 && rSet >= 0){
                this.cells[rSet][cSet] = tetromino.cells[r][c];
            }
        }
    }
};

Grid.prototype.valid = function(tetromino){
    for(var r = 0; r < tetromino.cells.length; r++){
        for(var c = 0; c < tetromino.cells[r].length; c++){
            var rSet = tetromino.row + r;
            var cSet = tetromino.column + c;
            if (tetromino.cells[r][c] != 0){
                if(rSet < 0 || rSet >= this.rows){
                    return false;
                }
                if(cSet < 0 || cSet >= this.columns){
                    return false;
                }
                if (this.cells[rSet][cSet] != 0){
                    return false;
                }
            }
        }
    }
    return true;
};