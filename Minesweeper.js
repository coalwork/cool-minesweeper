class Minesweeper {
  mineCount = 0;
  revealedCellCount = 0;
  minefield = [];
  gameOver = false;
  constructor(rows, columns, mineDensity) {
    this.rowCount = rows;
    this.columnCount = columns;
    this.mineDensity = mineDensity;
    
    for (let r = 0; r < rows; r++) {
      const row = Array.from({ length: columns });
      this.minefield.push(row);

      for (let c = 0; c < columns; c++) {
        const cell = Cell.generate(mineDensity);
        row[c] = cell;

        this.mineCount += cell.isMine;
      }
    }
  }
  countAdjacentMines(row, column) {
    let adjacentMineCount = 0;

    for (let r = -1; r <= 1; r++) {
      if (row + r < 0 || row + r >= this.rowCount) continue;
      for (let c = -1; c <= 1; c++) {
        if (column + c < 0 || column + c >= this.columnCount) continue;
        if (r === 0 && c === 0) continue;

        const cell = this.minefield[row + r][column + c];
        if (!cell?.isMine) continue;
        adjacentMineCount++;
      }
    }

    return adjacentMineCount;
  }
  reveal(row, column) {
    const revealed = [{ row, column }];
    const cell = this.minefield[row][column]; 

    if (!cell.reveal()) return;
    if (cell.isMine) {
      this.gameOver = true;
      return revealed;
    }

    this.revealedCellCount++;
    console.log('revealed cell count: ' + this.revealedCellCount);
    
    if (cell.adjacentMineCount !== 0) return revealed;

    for (let r = -1; r <= 1; r++) {
      if (+row + r < 0 || +row + r >= this.rowCount) continue;
      for (let c = -1; c <= 1; c++) {
        if (+column + c < 0 || +column + c >= this.columnCount) continue;
        if (r === 0 && c === 0) continue;

        const cell = this.minefield[+row + r][+column + c];
        if (cell.isRevealed) continue;

        revealed.push(...this.reveal(+row + r, +column + c));
      }
    }

    return revealed;
  }
  randomizeMinePlacements(row, column) {
    for (let r = -1; r <= 1; r++) {
      if (+row + r < 0 || +row + r >= this.rowCount) continue;
      for (let c = -1; c <= 1; c++) {
        if (+column + c < 0 || +column + c >= this.columnCount) continue;

        const cell = this.minefield[+row + r][+column + c];
        if (!cell.isMine) continue;

        let randomCoordinate;
        while (
          !randomCoordinate
          || Math.abs(randomCoordinate.r - row) <= 1
          || Math.abs(randomCoordinate.c - column) <= 1
          || this.minefield[randomCoordinate.r][randomCoordinate.c].isMine
        ) randomCoordinate = this.generateRandomCoordinates();

        this.minefield[+row + r][+column + c] = this.minefield[randomCoordinate.r][randomCoordinate.c];
        this.minefield[randomCoordinate.r][randomCoordinate.c] = cell;
      }
    }

    for (let r = 0; r < this.rowCount; r++) {
      for (let c = 0; c < this.columnCount; c++) {
        const cell = this.minefield[r][c];
        cell.adjacentMineCount = this.countAdjacentMines(r, c);
      }
    }
  }
  generateRandomCoordinates() {
    return {
      r: Math.floor(Math.random() * this.rowCount),
      c: Math.floor(Math.random() * this.columnCount)
    };
  }
  toString() {
    let str = '';
    for (let r = 0; r < this.rowCount; r++) {
      let row = '';
      for (let c = 0; c < this.columnCount; c++) {
        row += this.minefield[r][c].isMine ? 'X' : this.minefield[r][c].adjacentMineCount;
      }
      row += '\n';
      str += row;
    }
    return str;
  }
  get isMinefieldCleared() {
    return this.revealedCellCount === this.rowCount * this.columnCount - this.mineCount;
  }
}