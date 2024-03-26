let resolve;
addEventListener('DOMContentLoaded', async () => {
  const titleScreen = document.getElementById('title-screen');
  const startNotice = document.getElementById('start-notice');
  const difficultyChooser = document.getElementById('difficulty-chooser');
  const customPickerPanel = document.forms['custom-picker-panel'];

  let difficulty;
  let minefield;
  let grid;
  let isGameActive = false;
  let firstMoveMade = false;
  
  titleScreen.addEventListener('click', () => {
    titleScreen.classList.add('fade');
    startNotice.classList.add('fade');

    difficultyChooser.classList.add('visible');
  });

  customPickerPanel.addEventListener('submit', event => {
    event.preventDefault();
  });

  while (true) {
    console.log('game started');
    difficultyChooser.addEventListener('click', async event => {
      if (event.target.nodeName !== 'BUTTON') return;
      if (isGameActive) return;

      difficulty = event.target.id;

      let rowCount;
      let columnCount;
      switch (difficulty) {
        case 'easy':
          rowCount = 12;
          columnCount = 12;
          mineDensity = 0.15;
          break;
        case 'normal':
          rowCount = 16;
          columnCount = 24;
          mineDensity = 0.15;
          break;
        case 'hard':
          rowCount = 24;
          columnCount = 24;
          mineDensity = 0.2;
          break;
        case 'custom':
          customPickerPanel.classList.add('visible');

          const data = await new Promise(resolve => {
            customPickerPanel.addEventListener('submit', event => {
              resolve(new FormData(event.target));
            }, { once: true });
          });

          rowCount = +data.get('row-count');
          columnCount = +data.get('column-count');
          mineDensity = (+data.get('mine-density')) / 100;
          
          customPickerPanel.classList.remove('visible');
          break;
      }

      minefield = new Minesweeper(rowCount, columnCount, mineDensity);
      grid = createMinesweeperGrid(minefield, firstMoveMade);
      grid.style.setProperty('--table-bg-color', `var(--${difficulty})`);
      document.body.append(grid);

      difficultyChooser.classList.add('chosen');
      
      grid.addEventListener('click', event => {
        const { target } = event;
        const cellElement = target.closest('td');
        if (cellElement === null) return;

        const [ _, row, column ] = cellElement.id.match(/cell-(\d+)-(\d+)/);
        minefield.randomizeMinePlacements(row, column);

        firstMoveMade = true;
        grid.replaceChildren(...createMinesweeperGrid(minefield, firstMoveMade).children);

        reveal(minefield, row, column);
      }, { once: true });

      isGameActive = true;
    }, { once: true });
    
    await new Promise($ => resolve = $);

    console.log('game ended');
    isGameActive = false;
    firstMoveMade = false;
    difficultyChooser.classList.add('visible');
    difficultyChooser.classList.remove('chosen');
    await new Promise(res => setTimeout(() => document.getElementById('minesweeper-grid').remove() + res(), 4000));
  }
});

function createMinesweeperGrid(minefield, firstMoveMade) {
  const template = document.getElementById('minesweeper-grid-template');
  const fragment = template.content.cloneNode(true);
  const table = fragment.getElementById('minesweeper-grid');
  const iconsTemplate = document.getElementById('icons-template');

  table.setAttribute('data-row-count', minefield.rowCount);
  table.setAttribute('data-column-count', minefield.columnCount);
  table.style.setProperty('--row-count', minefield.rowCount);
  table.style.setProperty('--column-count', minefield.columnCount);

  if (firstMoveMade) addMinesweeperInteractableListeners(minefield);

  {
    let i = 0;
    for (let row of minefield.minefield) {
      let j = 0;
      for (let cell of row) {
        const tableCell = document.createElement('td');
        tableCell.append(iconsTemplate.content.cloneNode(true));
        table.append(tableCell);
        tableCell.id = `cell-${i}-${j++}`;

        if (firstMoveMade)
          tableCell.setAttribute('data-char', cell.isMine ? '' : cell.adjacentMineCount === 0 ? '' : cell.adjacentMineCount);

        if (cell.isMine) tableCell.classList.add('mine');
      }
      i++;
    }
  }

  return table;
}

function reveal(minefield, row, column) {
  if (minefield.minefield[row][column].isFlagged) return;
  
  const coordinates = minefield.reveal(row, column);

  for (let { row, column } of coordinates) {
    const cellElement = document.getElementById(`cell-${row}-${column}`);
    // need timeout otherwise smooth transition doesn't occur
    setTimeout(() => cellElement.classList.add('revealed'), 1);
  }

  if (minefield.isMinefieldCleared) {
    const grid = document.getElementById('minesweeper-grid');
    const difficultyChooser = document.getElementById('difficulty-chooser');
    grid.classList.add('cleared');
    resolve();
    return;
  }

  if (!minefield.gameOver) return;

  const grid = document.getElementById('minesweeper-grid');
  grid.classList.add('game-over');

  let greatestDistance = 0;
  for (let child of grid.children) {
    if (child.nodeName === 'DIV') continue;
    
    const [_, r, c] = child.id.match(/cell-(\d+)-(\d+)/);
    const xDistance = Math.abs(c - column);
    const yDistance = Math.abs(r - row);
    const explosionProximity = Math.max(xDistance, yDistance);
    child.style.setProperty('--explosion-proximity', explosionProximity);

    greatestDistance = explosionProximity > greatestDistance ? explosionProximity : greatestDistance;
  }
  grid.style.setProperty('--greatest-distance', greatestDistance);
  resolve();
}

function toggleFlag(minefield, row, column) {
  const cell = minefield.minefield[row][column];
  const cellElement = document.getElementById(`cell-${row}-${column}`);
  if (!cell.toggleFlag()) return;
  cellElement.classList.toggle('flagged');
}

function addMinesweeperInteractableListeners(minefield) {
  const grid = document.getElementById('minesweeper-grid');
  
  const listener = event => {
    const { target } = event;
    const cellElement = target.closest('td');
    if (cellElement === null) return;
    event.preventDefault();
    const [ _, row, column ] = cellElement.id.match(/cell-(\d+)-(\d+)/);
    toggleFlag(minefield, row, column);
    return false;
  }
  
  grid.addEventListener('click', event => {
    if (event.shiftKey) {
      listener(event);
      return;
    }
    
    const { target } = event;
    const cellElement = target.closest('td');
    if (cellElement === null) return;

    const [ _, row, column ] = cellElement.id.match(/cell-(\d+)-(\d+)/);
    reveal(minefield, row, column);
  });
  
  grid.addEventListener('contextmenu', listener);
}