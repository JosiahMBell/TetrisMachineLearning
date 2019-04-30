function Tetromino(cells){
    this.cells = cells;

    this.dimension = this.cells.length;
    this.row = 0;
    this.column = 0;
};

Tetromino.fromIndex = function(index){
    var tetromino;
    switch (index){
        case 0:// O
            tetromino = new Tetromino([
                [0xFFFF00, 0xFFFF00],
                [0xFFFF00, 0xFFFF00]
            ]);
            break;
        case 1: // J
            tetromino = new Tetromino([
                [0x0000FF, 0x000000, 0x000000],
                [0x0000FF, 0x0000FF, 0x0000FF],
                [0x000000, 0x000000, 0x000000]
            ]);
            break;
        case 2: // L
            tetromino = new Tetromino([
                [0x000000, 0x000000, 0xFFA500],
                [0xFFA500, 0xFFA500, 0xFFA500],
                [0x000000, 0x000000, 0x000000]
            ]);
            break;
        case 3: // Z
            tetromino = new Tetromino([
                [0xFF0000, 0xFF0000, 0x000000],
                [0x000000, 0xFF0000, 0xFF0000],
                [0x000000, 0x000000, 0x000000]
            ]);
            break;
        case 4: // S
            tetromino = new Tetromino([
                [0x000000, 0x00FF00, 0x00FF00],
                [0x00FF00, 0x00FF00, 0x000000],
                [0x000000, 0x000000, 0x000000]
            ]);
            break;
        case 5: // T
            tetromino = new Tetromino([
                [0x000000, 0xA020F0, 0x000000],
                [0xA020F0, 0xA020F0, 0xA020F0],
                [0x000000, 0x000000, 0x000000]
            ]);
            break;
        case 6: // I
            tetromino = new Tetromino([
                [0x000000, 0x000000, 0x000000, 0x000000],
                [0x00F5FF, 0x00F5FF, 0x00F5FF, 0x00F5FF],
                [0x000000, 0x000000, 0x000000, 0x000000],
                [0x000000, 0x000000, 0x000000, 0x000000]
            ]);
            break;

    }
    tetromino.row = 0;
    tetromino.column = Math.floor((10 - tetromino.dimension) / 2); // Centralize
    return tetromino;
};

Tetromino.prototype.clone = function(){
    var copyCells = new Array(this.dimension);
    for (var r = 0; r < this.dimension; r++) {
        copyCells[r] = new Array(this.dimension);
        for(var c = 0; c < this.dimension; c++){
            copyCells[r][c] = this.cells[r][c];
        }
    }

    var tetromino = new Tetromino(copyCells);
    tetromino.row = this.row;
    tetromino.column = this.column;
    return tetromino;
};

Tetromino.prototype.canMoveLeft = function(grid){
    for(var r = 0; r < this.cells.length; r++){
        for(var c = 0; c < this.cells[r].length; c++){
            var rSet = this.row + r;
            var cSet = this.column + c - 1;
            if (this.cells[r][c] != 0){
                if (!(cSet >= 0 && grid.cells[rSet][cSet] == 0)){
                    return false;
                }
            }
        }
    }
    return true;
};

Tetromino.prototype.canMoveRight = function(grid){
    for(var r = 0; r < this.cells.length; r++){
        for(var c = 0; c < this.cells[r].length; c++){
            var rSet = this.row + r;
            var cSet = this.column + c + 1;
            if (this.cells[r][c] != 0){
                if (!(cSet >= 0 && grid.cells[rSet][cSet] == 0)){
                    return false;
                }
            }
        }
    }
    return true;
};


Tetromino.prototype.canMoveDown = function(grid){
    for(var r = 0; r < this.cells.length; r++){
        for(var c = 0; c < this.cells[r].length; c++){
            var rSet = this.row + r + 1;
            var cSet = this.column + c;
            if (this.cells[r][c] != 0 && rSet >= 0){
                if (!(rSet < grid.rows && grid.cells[rSet][cSet] == 0)){
                    return false;
                }
            }
        }
    }
    return true;
};

Tetromino.prototype.moveLeft = function(grid){
    if(!this.canMoveLeft(grid)){
        return false;
    }
    this.column--;
    return true;
};

Tetromino.prototype.moveRight = function(grid){
    if(!this.canMoveRight(grid)){
        return false;
    }
    this.column++;
    return true;
};

Tetromino.prototype.moveDown = function(grid){
    if(!this.canMoveDown(grid)){
        return false;
    }
    this.row++;
    return true;
};

Tetromino.prototype.rotateCells = function(){
    var rotatedCells = new Array(this.dimension);
    for (var r = 0; r < this.dimension; r++) {
        rotatedCells[r] = new Array(this.dimension);
    }

    switch (this.dimension) { // Assumed square matrix
        case 2:
            rotatedCells[0][0] = this.cells[1][0];
            rotatedCells[0][1] = this.cells[0][0];
            rotatedCells[1][0] = this.cells[1][1];
            rotatedCells[1][1] = this.cells[0][1];
            break;
        case 3:
            rotatedCells[0][0] = this.cells[2][0];
            rotatedCells[0][1] = this.cells[1][0];
            rotatedCells[0][2] = this.cells[0][0];
            rotatedCells[1][0] = this.cells[2][1];
            rotatedCells[1][1] = this.cells[1][1];
            rotatedCells[1][2] = this.cells[0][1];
            rotatedCells[2][0] = this.cells[2][2];
            rotatedCells[2][1] = this.cells[1][2];
            rotatedCells[2][2] = this.cells[0][2];
            break;
        case 4:
            rotatedCells[0][0] = this.cells[3][0];
            rotatedCells[0][1] = this.cells[2][0];
            rotatedCells[0][2] = this.cells[1][0];
            rotatedCells[0][3] = this.cells[0][0];
            rotatedCells[1][3] = this.cells[0][1];
            rotatedCells[2][3] = this.cells[0][2];
            rotatedCells[3][3] = this.cells[0][3];
            rotatedCells[3][2] = this.cells[1][3];
            rotatedCells[3][1] = this.cells[2][3];
            rotatedCells[3][0] = this.cells[3][3];
            rotatedCells[2][0] = this.cells[3][2];
            rotatedCells[1][0] = this.cells[3][1];

            rotatedCells[1][1] = this.cells[2][1];
            rotatedCells[1][2] = this.cells[1][1];
            rotatedCells[2][2] = this.cells[1][2];
            rotatedCells[2][1] = this.cells[2][2];
            break;
    }

    this.cells = rotatedCells;
};

Tetromino.prototype.computeRotateOffset = function(grid){
    var clonedTetromino = this.clone();
    clonedTetromino.rotateCells();
    if (grid.valid(clonedTetromino)) {
        return { rowOffset: clonedTetromino.row - this.row, columnOffset: clonedTetromino.column - this.column };
    }

    var initialRow = clonedTetromino.row;
    var initialColumn = clonedTetromino.column;

    for (var i = 0; i < clonedTetromino.dimension - 1; i++) {
        clonedTetromino.column = initialColumn + i;
        if (grid.valid(clonedTetromino)) {
            return { rowOffset: clonedTetromino.row - this.row, columnOffset: clonedTetromino.column - this.column };
        }

        for (var j = 0; j < clonedTetromino.dimension - 1; j++) {
            clonedTetromino.row = initialRow - j;
            if (grid.valid(clonedTetromino)) {
                return { rowOffset: clonedTetromino.row - this.row, columnOffset: clonedTetromino.column - this.column };
            }
        }
        clonedTetromino.row = initialRow;
    }
    clonedTetromino.column = initialColumn;

    for (var i = 0; i < clonedTetromino.dimension - 1; i++) {
        clonedTetromino.column = initialColumn - i;
        if (grid.valid(clonedTetromino)) {
            return { rowOffset: clonedTetromino.row - this.row, columnOffset: clonedTetromino.column - this.column };
        }

        for (var j = 0; j < clonedTetromino.dimension - 1; j++) {
            clonedTetromino.row = initialRow - j;
            if (grid.valid(clonedTetromino)) {
                return { rowOffset: clonedTetromino.row - this.row, columnOffset: clonedTetromino.column - this.column };
            }
        }
        clonedTetromino.row = initialRow;
    }
    clonedTetromino.column = initialColumn;

    return null;
};

Tetromino.prototype.rotate = function(grid){
    var offset = this.computeRotateOffset(grid);
    if (offset != null){
        this.rotateCells(grid);
        this.row += offset.rowOffset;
        this.column += offset.columnOffset;
    }
};