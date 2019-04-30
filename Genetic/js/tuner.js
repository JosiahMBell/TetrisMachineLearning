function Tuner(){

    this.averageScores = new Array(6);
    this.optimalIndividuals = new Array(6);

    function randomInteger(min, max){
        return Math.floor(Math.random() * (max - min) + min);
    }

    function normalize(individual){
        var norm = Math.sqrt(individual.heightWeight * individual.heightWeight + individual.linesWeight * individual.linesWeight + individual.holesWeight * individual.holesWeight + individual.roughnessWeight * individual.roughnessWeight);
        individual.heightWeight /= norm;
        individual.linesWeight /= norm;
        individual.holesWeight /= norm;
        individual.roughnessWeight /= norm;
    }

    function generateRandomIndividual(){
        var individual = {
            heightWeight: Math.random() - 0.5,
            linesWeight: Math.random() - 0.5,
            holesWeight: Math.random() - 0.5,
            roughnessWeight: Math.random() - 0.5
        };
        normalize(individual);
        return individual;
    }

    function sort(individual){
        individual.sort(function(a, b){
            return b.fitness - a.fitness;
        });
    }

    function computeFitnesses(generation, games, maxMoves){
        for(var i = 0; i < generation.length; i++){
            console.log('\nIndividual ' + (i+1) + ' fitness is being computed');
            var individual = generation[i];
            var ai = new AI(individual.heightWeight, individual.linesWeight, individual.holesWeight, individual.roughnessWeight);
            var totalScore = 0;
            for(var j = 0; j < games; j++){
                //console.log('Candidate ' + i + ' | Game ' + j + ' [START]');
                var grid = new Grid();
                var bag = new TetrominoBag();
                var nextTetrominoes = [bag.nextTetromino(bagType), bag.nextTetromino(bagType)];
                var nextTetromino = nextTetrominoes[0];
                var score = 0;
                var moves = 0;
                while((moves++) < maxMoves && !grid.heightExceeded()){
                    nextTetromino = ai.best(grid, nextTetrominoes);
                    while(nextTetromino.moveDown(grid));
                    grid.addTetromino(nextTetromino);
                    score += grid.clearLines();
                    for(var k = 0; k < nextTetrominoes.length - 1; k++){
                        nextTetrominoes[k] = nextTetrominoes[k + 1];
                    }
                    nextTetrominoes[nextTetrominoes.length - 1] = bag.nextTetromino(bagType);
                    nextTetromino = nextTetrominoes[0];
                }
                totalScore += score;
                console.log('Individual: ' + (i+1) + ' | Game: ' + (j+1) + ' | LinesCleared: ' + score + ' | Moves Made: ' + (moves-1));
            }
            individual.fitness = totalScore;
            console.log('Individual ' + (i+1) + ' Fitness Computed: ' + totalScore);
        }
    }

    function tournamentSelectPair(population, ways){
        var indices = [];
        for(var i = 0; i <  population.length; i++){
            indices.push(i);
        }

        var fittestIndex1 = null;
        var fittestIndex2 = null;
        for(var i = 0; i < ways; i++){
            var selectedIndex = indices.splice(randomInteger(0, indices.length), 1)[0];
            if(fittestIndex1 === null || selectedIndex < fittestIndex1){
                fittestIndex2 = fittestIndex1;
                fittestIndex1 = selectedIndex;
            }else if (fittestIndex2 === null || selectedIndex < fittestIndex2){
                fittestIndex2 = selectedIndex;
            }
        }
        return [population[fittestIndex1], population[fittestIndex2]];
    }

    function crossOver(father, mother){
        var child = {
            heightWeight: father.fitness * father.heightWeight + mother.fitness * mother.heightWeight,
            linesWeight: father.fitness * father.linesWeight + mother.fitness * mother.linesWeight,
            holesWeight: father.fitness * father.holesWeight + mother.fitness * mother.holesWeight,
            roughnessWeight: father.fitness * father.roughnessWeight + mother.fitness * mother.roughnessWeight
        };
        normalize(child);
        return child;
    }

    function mutate(individual){
        var mutation = Math.random() * 0.4 - 0.2; // plus or minus 0.2
        switch(randomInteger(0, 4)){
            case 0:
                individual.heightWeight += mutation;
                break;
            case 1:
                individual.linesWeight += mutation;
                break;
            case 2:
                individual.holesWeight += mutation;
                break;
            case 3:
                individual.roughnessWeight += mutation;
                break;
        }
    }

    function deleteNLastReplacement(population, offspring){
        population.slice(-offspring.length);
        for(var i = 0; i < offspring.length; i++){
            population.push(offspring[i]);
        }
        sort(population);
    }

    /*
        Population size = 100
        Rounds per candidate = 5
        Max moves per round = 200
        Theoretical fitness limit = 5 * 200 * 4 / 10 = 400
    */
    this.tune = function() {
        var population = [];

        // Initial population generation of 100 individuals
        for (var i = 0; i < 100; i++) {
            population.push(generateRandomIndividual());
        }
        if(bagType === -1) {
            console.log('Tuning with a fully randomized bag of tetrominoes');
        } else if(bagType === 0){
            console.log('Tuning with the NES Classis randomized bag of tetrominoes');
        } else if(bagType === 1) {
            console.log('Tuning with the official randomized bag of tetrominoes');
        }

        console.log('Computing fitnesses of initial population...');
        computeFitnesses(population, 5, 500);
        console.log('\nFitnesses of initial population computed');
        console.log('\nSorting population by fitness...\n');
        sort(population);
        console.log('\nPopulation sorted');

        console.log('\nBest individual fitness: ' + population[0].fitness + '\nParameter Values: ' + JSON.stringify(population[0]));
        console.log('Worst individual fitness: ' + population[population.length - 1].fitness + '\nParameter Values: ' + JSON.stringify(population[0]));

        var gen = 0;
        while (true) {
            var offspring = [];
            for (var i = 0; i < 30; i++) { // 30% of population
                console.log('\nOffspring ' + i + ' is being computed...');
                var parents = tournamentSelectPair(population, 10); // 10% of population
                console.log('Father\'s fitness:' + parents[0].fitness + ' | Mother\'s fitness: ' + parents[1].fitness);
                var individual = crossOver(parents[0], parents[1]);
                if (Math.random() < 0.05) {// 5% chance of mutation
                    mutate(individual);
                    console.log('[MUTATION]');
                }
                normalize(individual);
                offspring.push(individual);
                console.log('Offspring ' + i + ' computed');
            }
            console.log('\nComputing fitnesses of the offspring (Generation ' + gen + ')');
            computeFitnesses(offspring, 5, 500);
            console.log('Fitnesses of new candidates computed. Replacing bottom 30% of the population...');
            deleteNLastReplacement(population, offspring);
            console.log('Bottom 30% of the population replaced with the offspring');

            var totalFitness = 0;
            for (var i = 0; i < population.length; i++) {
                totalFitness += population[i].fitness;
            }

            console.log('Average fitness: ' + (totalFitness / population.length));
            console.log('Highest fitness: ' + population[0].fitness + '(' + gen + ')');
            console.log('Fittest individual: ' + JSON.stringify(population[0]) + '(' + gen + ')');

            if(gen >= 0 && gen < 6) {
                this.averageScores[gen] = totalFitness / population.length;
                this.optimalIndividuals[gen] = population[0];
            } else {
                break;
            }
            gen++;
        }
        console.log('\nAverage scores: ')
        for(var i = 0; i < 6; i++) {
            console.log(this.averageScores[i]);
        }

        console.log('\nOptimal Height Weights: ')
        for(var i = 0; i < 6; i++) {
            console.log(this.optimalIndividuals[i].heightWeight);
        }
        console.log('\nOptimal lines Weights: ')
        for(var i = 0; i < 6; i++) {
            console.log(this.optimalIndividuals[i].linesWeight);
        }
        console.log('\nOptimal Holes Weights: ')
        for(var i = 0; i < 6; i++) {
            console.log(this.optimalIndividuals[i].holesWeight);
        }
        console.log('\nOptimal Roughness Weights: ')
        for(var i = 0; i < 6; i++) {
            console.log(this.optimalIndividuals[i].roughnessWeight);
        }
    };

    this.setBagRandom = function(setting) {
        bagType = setting;
        if(bagType === -1) {
            console.log('Fully Randomized Tetromino Bag');
        } else if(bagType === 0) {
            console.log('NES Classic Randomized Tetromino Bag');
        } else if(bagType === 1) {
            console.log('Tetris Official Randomized Tetromino Bag');
        }
    };

    this.testFitness = function(heightWeight, linesWeight, holesWeight, roughnessWeight, games, maxMoves) {
            console.log('\nIndividual fitness is being computed');
            var ai = new AI(heightWeight, linesWeight, holesWeight, roughnessWeight);
            var totalScore = 0;
            for(var j = 0; j < games; j++){
                //console.log('Candidate ' + i + ' | Game ' + j + ' [START]');
                var grid = new Grid();
                var bag = new TetrominoBag();
                var nextTetrominoes = [bag.nextTetromino(bagType), bag.nextTetromino(bagType)];
                var nextTetromino = nextTetrominoes[0];
                var score = 0;
                var moves = 0;
                while((moves++) < maxMoves && !grid.heightExceeded()){
                    nextTetromino = ai.best(grid, nextTetrominoes);
                    while(nextTetromino.moveDown(grid));
                    grid.addTetromino(nextTetromino);
                    score += grid.clearLines();
                    for(var k = 0; k < nextTetrominoes.length - 1; k++){
                        nextTetrominoes[k] = nextTetrominoes[k + 1];
                    }
                    nextTetrominoes[nextTetrominoes.length - 1] = bag.nextTetromino(bagType);
                    nextTetromino = nextTetrominoes[0];
                    console.log('')
                }
                totalScore += score;
                console.log('Game: ' + (j+1) + ' | LinesCleared: ' + score + ' | Moves Made: ' + (moves-1));
            }
            console.log('Individual Fitness Computed: ' + totalScore);
    };

    this.testEndurance = function(heightWeight, linesWeight, holesWeight, roughnessWeight) {
        if (bagType === -1) {
            console.log('\nIndividual is testing how long it can last with a fully random bag.');
        } else if(bagType === 0) {
            console.log('\nIndividual is testing how long it can last with the NES Classic bag.');
        } else if(bagType === 1) {
            console.log('\nIndividual is testing how long it can last with the official Tetris random bag.');
        }
        var ai = new AI(heightWeight, linesWeight, holesWeight, roughnessWeight);
        var grid = new Grid();
        var bag = new TetrominoBag();
        var nextTetrominoes = [bag.nextTetromino(bagType), bag.nextTetromino(bagType)];
        var nextTetromino = nextTetrominoes[0];
        var score = 0;
        var moves = 0;
        while(!grid.heightExceeded()){
            moves++;
            nextTetromino = ai.best(grid, nextTetrominoes);
            while(nextTetromino.moveDown(grid));
            grid.addTetromino(nextTetromino);
            score += grid.clearLines();
            for(var k = 0; k < nextTetrominoes.length - 1; k++){
                nextTetrominoes[k] = nextTetrominoes[k + 1];
            }
            nextTetrominoes[nextTetrominoes.length - 1] = bag.nextTetromino(bagType);
            nextTetromino = nextTetrominoes[0];
            console.log('')
        }
        console.log('LinesCleared: ' + score + ' | Moves Made: ' + (moves-1));
    };

    this.tuneRL = function() {
        console.log('Individual AI being generated...')
        //Initialize the AI
        var individual = generateRandomIndividual();
        console.log('Individual AI generated with randomized weights: '
            + '\nHeightWeight: ' + individual.heightWeight
            + '\nLinesWeight: ' + individual.linesWeight
            + '\nHolesWeight: ' + individual.holesWeight
            + '\nRoughnessWeight: ' + individual.roughnessWeight);

        if(bagType === -1) {
            console.log('Tuning with a fully randomized bag of tetrominoes');
        } else if(bagType === 0){
            console.log('Tuning with the NES Classis randomized bag of tetrominoes');
        } else if(bagType === 1) {
            console.log('Tuning with the official randomized bag of tetrominoes');
        }

        learn(individual, 10000);

        console.log('Finished');
    };

    function learn(individual, games) {
        for(var i = 0; i < games; i++) {
            console.log('\nGame: ' + i);
            var score = 0;
            var explore_change = 0.5;
            var grid = new Grid();
            var bag = new TetrominoBag();
            var nextTetrominoes = [bag.nextTetromino(bagType), bag.nextTetromino(bagType)];
            var nextTetromino = nextTetrominoes[0];
            var moves = 0;
            while(!grid.heightExceeded()) {
                var ai = new AI(individual.heightWeight, individual.linesWeight, individual.holesWeight, individual.roughnessWeight);
                if(Math.random() < explore_change) {
                    nextTetromino = ai.randomMove(grid, nextTetromino);
                } else {
                    nextTetromino = ai.best(grid, nextTetrominoes);
                }
                if(explore_change > 0.001) {
                    explore_change = explore_change * 0.99;
                } else {
                    explore_change = 0;
                }
                var totalHeightBefore = grid.totalHeight();
                var heightBefore = grid.tallestColumnHeight();
                var holesBefore = grid.holes();
                var roughnessBefore = grid.roughness();
                while(nextTetromino.moveDown(grid));
                grid.addTetromino(nextTetromino);
                moves++;
                var linesAfter  = grid.lines();
                score += grid.clearLines();
                for(var k = 0; k < nextTetrominoes.length - 1; k++) {
                    nextTetrominoes[k] = nextTetrominoes[k+1];
                }
                nextTetrominoes[nextTetrominoes.length - 1] = bag.nextTetromino(bagType);
                nextTetromino = nextTetrominoes[0];
                //may need to forego this
                //var one_step_reward = 5 * (score * score) - (grid.totalHeight() - totalHeightBefore);

                //gradient_descent (THIS PART NEEDS FIXING)
                if(grid.totalHeight() < totalHeightBefore && score > 0) {
                    individual.heightWeight = individual.heightWeight - individual.heightWeight * 0.01 * score * (totalHeightBefore - grid.totalHeight());
                } else if (grid.totalHeight() > totalHeightBefore && score > 0) {
                    individual.heightWeight = individual.heightWeight + individual.heightWeight * 0.01 * score * (grid.totalHeight() - totalHeightBefore);
                }

                //lines weight adjustment
                if(grid.totalHeight() < totalHeightBefore || grid.holes() < holesBefore || grid.roughness() < roughnessBefore) {
                    individual.linesWeight = individual.linesWeight + individual.linesWeight * 0.01 * score * (totalHeightBefore - grid.totalHeight());
                } else {
                    individual.linesWeight = individual.linesWeight - individual.linesWeight * 0.01 * score * (grid.totalHeight() - totalHeightBefore);
                }

                if(grid.holes < holesBefore && score > 0) {
                    individual.holesWeight = individual.holesWeight - individual.holesWeight * 0.01 * score * (holesBefore - grid.holes());
                } else if (grid.holes() > holesBefore && score > 0) {
                    individual.holesWeight = individual.holesWeight + individual.holesWeight * 0.01 * score * (grid.holes() - holesBefore);
                }

                if(grid.roughness() < roughnessBefore && score > 0) {
                    individual.roughnessWeight = individual.roughnessWeight - individual.roughnessWeight * 0.01 * score * (roughnessBefore - grid.roughness());
                } else if (grid.roughness() > roughnessBefore && score > 0) {
                    individual.roughnessWeight = individual.roughnessWeight + individual.roughnessWeight * 0.01 * score * (grid.roughness() - roughnessBefore);
                }

                normalize(individual);

                /*
                if(Math.random() <= 0.05) {
                    console.log('Individual mutated');
                    mutate(individual);
                }
                */
            }
            console.log('Game ' + i + ' completed | Lines Cleared: ' + score + ' | Moves Made: ' + moves);
            console.log('Individual weights after game ' + i + ':'
                + '\nHeightWeight: ' + individual.heightWeight
                + '\nLinesWeight: ' + individual.linesWeight
                + '\nholesWeight: ' + individual.holesWeight
                + '\nroughnessWeight: ' + individual.roughnessWeight
            );
        }
    }
}