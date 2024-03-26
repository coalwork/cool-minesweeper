class Cell {
  isRevealed = false;
  isFlagged = false;
  adjacentMineCount = 0;
  constructor(isMine = false) {
    this.adjacentMineCount = isMine ? -1 : 0;
    this.isMine = isMine;
  }
  reveal() {
    if (this.isFlagged || this.isRevealed) return false;
    this.isRevealed = true; 
    return true;
  }
  toggleFlag() {
    if (this.isRevealed) return false;
    this.isFlagged = !this.isFlagged; 
    return true;
  }
  
  static generate(chance) {
    return new Cell(Math.random() < chance);
  }
}