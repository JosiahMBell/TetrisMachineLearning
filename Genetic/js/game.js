function Game(){
    var gridCanvas = document.getElementById('grid-canvas');
    var nextCanvas = document.getElementById('next-canvas');
    var levelContainer = document.getElementById('level-container');
    var scoreContainer = document.getElementById("score-container");
    var resetButton = document.getElementById('reset-button');
    var aiButton = document.getElementById('ai-button');
    var bagButton = document.getElementById('bag-button');
    var gridContext = gridCanvas.getContext('2d');
    var nextContext = nextCanvas.getContext('2d');
    document.addEventListener('keydown', onKeyDown);

    var grid = new Grid();
    var bagType = 1;
    var bag = new TetrominoBag();
    var ai = new AI(0.510066, 0.760666, 0.35663, 0.184483);
    var nextTetrominoes = [null, bag.nextTetromino(bagType)];
    var nextTetromino = null;
    var activeAI = true;
    var activeUser = false;
    var timer = new Timer(onTimerTick, 500);
    var level = 0;
    var score = 0;

    var button = new Audio('sounds/button.mp3');
    var move = new Audio('sounds/move.mp3');
    var line = new Audio('sounds/line.mp3');
    var rotate = new Audio('sounds/rotate.mp3');
    var place = new Audio('sounds/place.mp3');

    // Graphics
    function intToRGBHexString(v){
        return 'rgb(' + ((v >> 16) & 0xFF) + ',' + ((v >> 8) & 0xFF) + ',' + (v & 0xFF) + ')';
    }

    function redrawGridCanvas(nextTetrominoVerticalOffset = 0){
        gridContext.save();

        gridContext.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

        for(var r = 2; r < grid.rows; r++){
            for(var c = 0; c < grid.columns; c++){
                if (grid.cells[r][c] != 0){
                    gridContext.fillStyle= intToRGBHexString(grid.cells[r][c]);
                    gridContext.fillRect(20 * c, 20 * (r - 2), 20, 20);
                    gridContext.strokeStyle="#000000";
                    gridContext.strokeRect(20 * c, 20 * (r - 2), 20, 20);
                }
            }
        }

        for(var r = 0; r < nextTetromino.dimension; r++){
            for(var c = 0; c < nextTetromino.dimension; c++){
                if (nextTetromino.cells[r][c] != 0){
                    gridContext.fillStyle = intToRGBHexString(nextTetromino.cells[r][c]);
                    gridContext.fillRect(20 * (c + nextTetromino.column), 20 * ((r + nextTetromino.row) - 2) + nextTetrominoVerticalOffset, 20, 20);
                    gridContext.strokeStyle="#000000";
                    gridContext.strokeRect(20 * (c + nextTetromino.column), 20 * ((r + nextTetromino.row) - 2) + nextTetrominoVerticalOffset, 20, 20);
                }
            }
        }

        gridContext.restore();
    }

    function redrawNextCanvas(){
        nextContext.save();

        nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        var next = nextTetrominoes[1];
        var xOffset = next.dimension == 2 ? 20 : next.dimension == 3 ? 10 : next.dimension == 4 ? 0 : null;
        var yOffset = next.dimension == 2 ? 20 : next.dimension == 3 ? 20 : next.dimension == 4 ? 10 : null;
        for(var r = 0; r < next.dimension; r++){
            for(var c = 0; c < next.dimension; c++){
                if (next.cells[r][c] != 0){
                    nextContext.fillStyle = intToRGBHexString(next.cells[r][c]);
                    nextContext.fillRect(xOffset + 20 * c, yOffset + 20 * r, 20, 20);
                    nextContext.strokeStyle = "#000000";
                    nextContext.strokeRect(xOffset + 20 * c, yOffset + 20 * r, 20, 20);
                }
            }
        }

        nextContext.restore();
    }

    function updateScoreContainer(){
        /*
        level = (score / 10) + 1;
        level = level.floor;
        var lvl = level + "";
        */
        level = 1 + (score - (score % 10))/10;
        levelContainer.innerHTML = level.toString();
        scoreContainer.innerHTML = score.toString();
    }

    var stopwatch = null;
    function DropAnimation(callback = function(){}){
        down = 0;
        nextTet = nextTetromino.clone();
        while(nextTet.moveDown(grid)){
            down++;
        }

        var sw = new Stopwatch(function(elapsed){
            if(elapsed >= down * 20){
                sw.stop();
                redrawGridCanvas(20 * down);
                callback();
                return;
            }

            redrawGridCanvas(20 * elapsed / 20);
        });

        stopwatch = sw;
    }

    function stopDropAnimation(){
        if(stopwatch === null){
            return;
        }
        stopwatch.stop();
        stopwatch = null;
    }

    function startTurn(){
        for(var i = 0; i < nextTetrominoes.length - 1; i++){
            nextTetrominoes[i] = nextTetrominoes[i + 1];
        }
        nextTetrominoes[nextTetrominoes.length - 1] = bag.nextTetromino(bagType);
        nextTetromino = nextTetrominoes[0];

        // Refresh Graphics
        redrawGridCanvas();
        redrawNextCanvas();

        if(activeAI){
            activeUser = false;
            nextTetromino = ai.best(grid, nextTetrominoes);
            DropAnimation(function(){
                while(nextTetromino.moveDown(grid)); // Drop working piece
                if(!endTurn()){
                    alert('Game Over!');
                    return;
                }
                startTurn();
            })
        }else{
            activeUser = true;
            timer.resetForward(500);
        }
    }

    function endTurn() {
        grid.addTetromino(nextTetromino);

        var before = score;
        score += grid.clearLines();
        if (score > before) {
            line.play();
        }

        if(!activeAI) {
            place.play();
        }

        redrawGridCanvas();
        updateScoreContainer();

        return !grid.heightExceeded();
    }

    function onTimerTick(){
        if(nextTetromino.canMoveDown(grid)){
            nextTetromino.moveDown(grid);
            redrawGridCanvas();
            return;
        }

        timer.stop();

        if(!endTurn()){
            activeUser = false;
            alert('Game Over!');
            return;
        }

        startTurn();
    }

    function onKeyDown(event){
        if(!activeUser){
            return;
        }
        switch(event.which){
            case 32: // spacebar
                activeUser = false;
                timer.stop(); // Stop gravity
                DropAnimation(function(){ // Start drop animation
                    while(nextTetromino.moveDown(grid)); // Drop working piece
                    if(!endTurn()){
                        alert('Game Over!');
                        return;
                    }
                    startTurn();
                });
                break;
            case 40: // down
                timer.resetForward(500);
                break;
            case 37: //left
                move.play();
                if(nextTetromino.canMoveLeft(grid)){
                    nextTetromino.moveLeft(grid);
                    redrawGridCanvas();
                }
                break;
            case 39: //right
                move.play();
                if(nextTetromino.canMoveRight(grid)){
                    nextTetromino.moveRight(grid);
                    redrawGridCanvas();
                }
                break;
            case 38: //up
                rotate.play();
                nextTetromino.rotate(grid);
                redrawGridCanvas();
                break;
        }
    }

    aiButton.onclick = function(){
        button.play();
        if (activeAI){
            activeAI = false;
            aiButton.style.backgroundColor = "#111111";
            aiButton.textContent = "AI: OFF";
        }else{
            activeAI = true;
            aiButton.style.backgroundColor = "#373737";
            aiButton.textContent = "AI: ON";

            activeUser = false;
            timer.stop();
            DropAnimation(function(){
                while(nextTetromino.moveDown(grid));
                if(!endTurn()){
                    alert('Game Over!');
                    return;
                }
                startTurn();
            });
        }
    }

    resetButton.onclick = function(){
        button.play();
        timer.stop();
        stopDropAnimation();
        grid = new Grid();
        bag = new TetrominoBag();
        nextTetrominoes = [null, bag.nextTetromino(bagType)];
        nextTetromino = null;
        score = 0;
        activeUser = true;
        updateScoreContainer();
        startTurn();
    }

    bagButton.onclick = function() {
        button.play();
        if (bagType === -1) {
            bagType = 0;
        } else if (bagType === 0) {
            bagType = 1;
        } else if (bagType === 1) {
            bagType = -1;
        }

        if (bagType === -1) {
            //ai.setWeights(0.23009339906720042, 0.8050884951983819, 0.4876283829892118, 0.2472005313672159);
            ai.setWeights(0.617953227109972, 0.6730783452988718, 0.3024146373414192, 0.2713756387661983);
            bagButton.textContent = "Random";
        } else if(bagType === 0) {
            ai.setWeights(0.371437, 0.630619, 0.661616, 0.163151);
            bagButton.textContent = "NES Classic";
        } else if(bagType === 1) {
            //ai.setWeights(0.510066, 0.760666, 0.35663, 0.184483);
            ai.setWeights(0.273094, 0.695375, 0.576813, 0.330394);
            bagButton.textContent = "Official";
        }
    }

    aiButton.style.backgroundColor = "#373737";
    startTurn();
}