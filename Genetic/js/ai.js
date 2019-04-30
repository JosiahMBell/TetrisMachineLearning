function AI(heightWeight, linesWeight, holesWeight, roughnessWeight){
    this.heightWeight = heightWeight;
    this.linesWeight = linesWeight;
    this.holesWeight = holesWeight;
    this.roughnessWeight = roughnessWeight;
};

AI.prototype.setWeights = function(newHeight, newLines, newHoles, newRoughness) {
    this.heightWeight = newHeight;
    this.linesWeight = newLines;
    this.holesWeight = newHoles;
    this.roughnessWeight = newRoughness;
}

AI.prototype.findBest = function(grid, nextTetrominoes, nextTetrominoIndex){
    var bestOrientation = null;
    var bestScore = null;
    var nextTetromino = nextTetrominoes[nextTetrominoIndex];

    for(var rotation = 0; rotation < 4; rotation++){
        var copyTetromino = nextTetromino.clone();
        for(var i = 0; i < rotation; i++) {
            copyTetromino.rotate(grid);
        }

        while(copyTetromino.moveLeft(grid));

        while(grid.valid(copyTetromino)){
            var copyTetSet = copyTetromino.clone();
            while(copyTetSet.moveDown(grid));

            var copyGrid = grid.clone();
            copyGrid.addTetromino(copyTetSet);

            var score = null;
            if (nextTetrominoIndex == (nextTetrominoes.length - 1)) {
                score = -this.heightWeight * copyGrid.totalHeight() + this.linesWeight * copyGrid.lines() - this.holesWeight * copyGrid.holes() - this.roughnessWeight * copyGrid.roughness();
            }else{
                score = this.findBest(copyGrid, nextTetrominoes, nextTetrominoIndex + 1).score;
            }

            if (score > bestScore || bestScore == null) {
                bestScore = score;
                bestOrientation = copyTetromino.clone();
            }

            copyTetromino.column++;
        }
    }

    return {tetromino:bestOrientation, score:bestScore};
};

AI.prototype.best = function(grid, nextTetrominoes){
    return this.findBest(grid, nextTetrominoes, 0).tetromino;
};

AI.prototype.randomMove = function(grid, nextTetromino){
    var rotations = Math.floor(Math.random() * 10);
    var copyTetromino = nextTetromino.clone();

    for(var rot = 0; rot < rotations; rot++) {
        copyTetromino.rotate(grid);
    }

    while(copyTetromino.moveLeft(grid));

    var placement = Math.floor(Math.random() * grid.columns);

    while(copyTetromino.column < placement) {
        copyTetromino.column++;
    }

    while(copyTetromino.moveDown(grid));

    return copyTetromino;
}