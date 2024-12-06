import React, { useEffect, useState } from 'react';

const App = () => {
  const rows = 15;
  const cols = 20;

  const [drops, setDrops] = useState([]);
  const [activeColumns, setActiveColumns] = useState([]); 
  const [currentColor, setCurrentColor] = useState('blue');

  const colorGradients = {
    blue: ['#00BFFF', '#0000FF'],
    green: ['#90EE90', '#006400'],
    yellow: ['#FFFF00', '#FFA500'],
    orange: ['#FFA500', '#FF4500'],
    pink: ['#FF69B4', '#FF1493'],
    purple: ['#9370DB', '#4B0082'],
    cyan: ['#00FFFF', '#008B8B'],
    red: ['#FF6347', '#8B0000']
  };

  const colors = Object.keys(colorGradients);

  // Initialize drops
  useEffect(() => {
    const initialDrops = Array(rows)
      .fill(0)
      .map(() =>
        Array(cols).fill({
          active: false,
          currentRainRow: 0
        })
      );
    setDrops(initialDrops);
  }, []);

  // Color change effect
  useEffect(() => {
    const colorChangeInterval = setInterval(() => {
      const currentColorIndex = colors.indexOf(currentColor);
      let newColorIndex;
      do {
        newColorIndex = Math.floor(Math.random() * colors.length);
      } while (newColorIndex === currentColorIndex);
      
      setCurrentColor(colors[newColorIndex]);
    }, 5000);

    return () => clearInterval(colorChangeInterval);
  }, [currentColor]);

  // Handle rainfall logic
  useEffect(() => {
    if (activeColumns.length < 4) {
      const numColumnsToAdd = Math.floor(Math.random() * 3) + 4;
      const newActiveColumns = [];
      
      while (newActiveColumns.length < numColumnsToAdd) {
        const randomColumn = Math.floor(Math.random() * cols);
        if (!newActiveColumns.includes(randomColumn)) {
          newActiveColumns.push(randomColumn);
        }
      }
      
      setActiveColumns(prevColumns => [...new Set([...prevColumns, ...newActiveColumns])]);
    }

    const interval = setInterval(() => {
      setDrops((prevDrops) => 
        prevDrops.map((row, rowIndex) => 
          row.map((cell, colIndex) => {
            const isActiveColumn = activeColumns.includes(colIndex);
            
            if (isActiveColumn) {
              if (rowIndex >= cell.currentRainRow && rowIndex < cell.currentRainRow + 6) {
                return {
                  ...cell,
                  active: true,
                };
              }
            }
            
            return {
              ...cell,
              active: false,
            };
          })
        )
      );

      setActiveColumns((prevActiveColumns) => {
        const updatedActiveColumns = prevActiveColumns.filter((colIndex) => {
          const columnState = drops[drops.length - 1][colIndex];
          
          return !(columnState.currentRainRow + 6 >= rows && Math.random() > 0.3);
        });

        while (updatedActiveColumns.length < 4) {
          const randomColumn = Math.floor(Math.random() * cols);
          if (!updatedActiveColumns.includes(randomColumn)) {
            updatedActiveColumns.push(randomColumn);
          }
        }

        return updatedActiveColumns;
      });

      setDrops((prevDrops) => 
        prevDrops.map((row) => 
          row.map((cell, colIndex) => 
            activeColumns.includes(colIndex) 
              ? {
                  ...cell,
                  currentRainRow: cell.currentRainRow + 1 >= rows 
                    ? 0 
                    : cell.currentRainRow + 1
                }
              : cell
          )
        )
      );
    }, 100);

    return () => clearInterval(interval);
  }, [activeColumns]);

  const getDropOpacity = (rowIndex, currentRainRow) => {
    const maxRows = 6;
    const distanceFromStart = Math.abs(rowIndex - currentRainRow);
    return distanceFromStart < maxRows 
      ? 1 - ((maxRows - distanceFromStart) / maxRows)
      : 0.1;
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-center">
      <h1 className="text-white text-4xl font-bold mb-6">Rainfall Grid</h1>
      <table className="rounded-lg bg-black" style={{borderTop:'10px solid gray',borderBottom:'10px solid gray',borderLeft:'4px solid gray',borderRight:'4px solid gray'}}>
        <tbody>
          {drops.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((drop, colIndex) => {
                const isActiveColumn = activeColumns.includes(colIndex);
                const opacity = isActiveColumn 
                  ? getDropOpacity(rowIndex, drop.currentRainRow)
                  : 0;
                
                const [startColor, endColor] = colorGradients[currentColor];
                
                return (
                  <td
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    border: '2px solid gray',
                    background: isActiveColumn
                      ? `linear-gradient(to bottom, 
                          ${startColor}, 
                          ${endColor})`
                      : 'transparent',
                    opacity: drop.active ? opacity : 0,
                    width: '24px',
                    height: '24px',
                    transition: 'opacity 0.2s ease-in-out, background 0.2s ease-in-out',
                  }}
                ></td>
                
                
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-gray-400 mt-6">Enjoy the dynamic rainfall pattern!</p>
    </div>
  );
};

export default App;

