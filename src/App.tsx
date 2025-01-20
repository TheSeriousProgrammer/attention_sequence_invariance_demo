import React, { useState, useEffect } from 'react';
import { Shuffle } from 'lucide-react';

const AttentionVisualizer = () => {
  const [values, setValues] = useState({ A: 1, B: 2, C: 3 });
  const [currentOrder, setCurrentOrder] = useState([0, 1, 2]);
  const [attentionMatrix, setAttentionMatrix] = useState([]);
  const [usePositionalBias, setUsePositionalBias] = useState(false);

  // Calculate attention with optional positional bias based on current order
  const calculateAttention = (values, usePositionalBias, order) => {
    const tokens = ['A', 'B', 'C'];
    const orderedTokens = order.map(i => tokens[i]);
    const matrix = [];
    
    const getPositionalBias = (pos1, pos2) => {
      if (!usePositionalBias) return 0;
      return (0.1 * pos1) * (0.1 * pos2);
    };
    
    for (let i = 0; i < orderedTokens.length; i++) {
      const row = [];
      for (let j = 0; j < orderedTokens.length; j++) {
        const token1 = orderedTokens[i];
        const token2 = orderedTokens[j];
        const posBias = getPositionalBias(i, j);
        row.push(values[token1] * values[token2] + posBias);
      }
      matrix.push(row);
    }
    
    return matrix;
  };

  useEffect(() => {
    setAttentionMatrix(calculateAttention(values, usePositionalBias, currentOrder));
  }, [values, usePositionalBias, currentOrder]);

  const shuffleSequence = () => {
    const newOrder = [...currentOrder];
    for (let i = newOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
    }
    setCurrentOrder(newOrder);
  };

  const handleValueChange = (token, value) => {
    const numValue = parseInt(value) || 0;
    setValues(prev => ({
      ...prev,
      [token]: numValue
    }));
  };

  const tokens = ['A', 'B', 'C'];
  const reorderedTokens = currentOrder.map(i => tokens[i]);

  const getColor = (value) => {
    const maxValue = Math.max(...attentionMatrix.flat());
    const normalizedValue = value / maxValue;
    const intensity = Math.floor(255 * (1 - normalizedValue));
    return `rgb(${intensity}, ${intensity}, 255)`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 md:p-8 border rounded-lg shadow-md flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-center">Attention Visualizer</h1>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-4">Value Matrix with Positional Bias</h2>
      </div>

      <div className="space-y-8">
        {/* Input Fields and Toggle */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tokens.map((token) => (
              <div key={token} className="space-y-2">
                <label className="text-sm font-medium text-center block">Token {token} Value:</label>
                <input
                  type="number"
                  value={values[token]}
                  onChange={(e) => handleValueChange(token, e.target.value)}
                  className="w-full px-4 py-2 border rounded text-center focus:ring focus:ring-blue-200"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-2">
            <input 
              type="checkbox"
              checked={usePositionalBias}
              onChange={(e) => setUsePositionalBias(e.target.checked)}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium">
              Enable Positional Bias (bias = 0.1i * 0.1j)
            </label>
          </div>
        </div>

        {/* Current Sequence Order */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Current Token Order</h3>
          <div className="flex justify-center gap-4 flex-row">
            {reorderedTokens.map((token, idx) => (
              <div key={idx} className="w-12 h-12 flex items-center justify-center border rounded-lg bg-blue-50">
                {token}({values[token]})
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={shuffleSequence}
              className="flex items-center px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring focus:ring-blue-200 justify-center"
            >
              <span className="align-middle">Shuffle Order</span>
            </button>
          </div>
        </div>

        {/* Value Matrix */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">
            Value Matrix {usePositionalBias ? '(with Positional Bias)' : '(Direct Multiplication)'}
          </h3>
          <div className="flex justify-center overflow-x-auto">
            <table className="table-auto border-collapse border">
              <thead>
                <tr>
                  <th className="w-12 border"></th>
                  {reorderedTokens.map((token, idx) => (
                    <th key={idx} className="w-16 h-12 border text-center">
                      {token}({values[token]})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attentionMatrix.map((row, i) => (
                  <tr key={i}>
                    <td className="w-12 h-12 border text-center">
                      {reorderedTokens[i]}
                    </td>
                    {row.map((value, j) => (
                      <td
                        key={j}
                        className="w-16 h-12 border text-center p-1"
                        style={{ backgroundColor: getColor(value) }}
                      >
                        {value.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 border rounded-lg text-center">
          <h3 className="text-lg font-semibold mb-2">Observation</h3>
          <p className="text-sm text-gray-600">
            Without positional bias, token order affects matrix organization but not values.
            With positional bias enabled, both matrix organization and values change with shuffling,
            as bias is computed based on positions in the current sequence.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttentionVisualizer;
