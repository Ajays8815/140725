import React, { useState } from 'react';

const DraglineModal = ({ show, onHide }) => {
  const [inputs, setInputs] = useState({
    // Dragline specifications
    draglineReach: 100, // meters
    benchHeight: 30, // meters
    cutWidth: 40, // meters
    
    // Geological parameters
    coalSeamThickness: 5, // meters
    overburdenThickness: 25, // meters
    swellFactor: 1.2,
    
    // Operational parameters
    dumpSlope: 37, // degrees
    highwallSlope: 70, // degrees
    coalSeamDip: 5, // degrees
    
    // Areas for calculation
    haulDistance: 200, // meters
    spoilHeight: 35, // meters
  });

  const [results, setResults] = useState(null);
  const [diagramData, setDiagramData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const calculateDraglineBalance = () => {
    const {
      draglineReach,
      benchHeight,
      cutWidth,
      coalSeamThickness,
      overburdenThickness,
      swellFactor,
      dumpSlope,
      highwallSlope,
      coalSeamDip,
      haulDistance,
      spoilHeight
    } = inputs;

    // Calculate First-dig area (A1) - cross-sectional area to be removed
    const firstDigArea = cutWidth * overburdenThickness;
    
    // Calculate Dumping Area (A2) - limited by dragline reach and dump slope
    const dumpSlopeRad = (dumpSlope * Math.PI) / 180;
    const maxDumpWidth = draglineReach * 0.7; // 70% of reach for safe operation
    const dumpingArea = (maxDumpWidth * spoilHeight) / 2; // Triangular dump profile
    
    // Calculate overburden accommodation with swell factor
    const swelledOverburden = firstDigArea * swellFactor;
    
    // Calculate rehandling percentage
    const rehandlingPercentage = Math.max(0, ((swelledOverburden - dumpingArea) / swelledOverburden) * 100);
    
    // Calculate coal exposure rate (simplified)
    const coalExposureArea = cutWidth * coalSeamThickness;
    const coalExposureRate = coalExposureArea / (benchHeight / 10); // simplified daily rate
    
    // Calculate matching factor (simplified dragline efficiency)
    const operationalEfficiency = Math.min(100, (dumpingArea / swelledOverburden) * 100);
    
    const calculatedResults = {
      firstDigArea: firstDigArea.toFixed(2),
      dumpingArea: dumpingArea.toFixed(2),
      swelledOverburden: swelledOverburden.toFixed(2),
      rehandlingPercentage: rehandlingPercentage.toFixed(2),
      coalExposureArea: coalExposureArea.toFixed(2),
      coalExposureRate: coalExposureRate.toFixed(2),
      operationalEfficiency: operationalEfficiency.toFixed(2)
    };

    setResults(calculatedResults);
    generateDiagramData(calculatedResults);
  };

  const generateDiagramData = (results) => {
    const {
      draglineReach,
      benchHeight,
      cutWidth,
      coalSeamThickness,
      overburdenThickness,
      dumpSlope,
      spoilHeight
    } = inputs;

    // Create coordinate system for the diagram
    const scale = 2; // pixels per meter
    const svgWidth = 800;
    const svgHeight = 400;
    
    // Base coordinates
    const baseY = svgHeight - 50;
    const baseX = 50;
    
    // Calculate key points for the diagram
    const points = {
      // Coal seam base points (ABCO)
      coalA: { x: baseX, y: baseY },
      coalB: { x: baseX + cutWidth * scale, y: baseY },
      coalC: { x: baseX + cutWidth * scale, y: baseY - coalSeamThickness * scale },
      coalO: { x: baseX, y: baseY - coalSeamThickness * scale },
      
      // Overburden removal area (BCDE)
      overburdenB: { x: baseX + cutWidth * scale, y: baseY },
      overburdenC: { x: baseX + cutWidth * scale, y: baseY - coalSeamThickness * scale },
      overburdenD: { x: baseX + cutWidth * scale, y: baseY - (coalSeamThickness + overburdenThickness) * scale },
      overburdenE: { x: baseX, y: baseY - (coalSeamThickness + overburdenThickness) * scale },
      
      // Dump area (FGKH)
      dumpF: { x: baseX + cutWidth * scale + 20, y: baseY },
      dumpG: { x: baseX + cutWidth * scale + 20 + draglineReach * 0.7 * scale, y: baseY },
      dumpK: { x: baseX + cutWidth * scale + 20 + draglineReach * 0.7 * scale, y: baseY - spoilHeight * scale },
      dumpH: { x: baseX + cutWidth * scale + 20, y: baseY - spoilHeight * scale },
      
      // Dragline position
      draglineX: baseX - 30,
      draglineY: baseY - benchHeight * scale,
    };

    setDiagramData({ points, scale, svgWidth, svgHeight });
  };

  const renderDiagram = () => {
    if (!diagramData) return null;

    const { points, svgWidth, svgHeight } = diagramData;

    return (
      <svg width={svgWidth} height={svgHeight} className="border">
        {/* Coal seam (ABCO) */}
        <polygon
          points={`${points.coalA.x},${points.coalA.y} ${points.coalB.x},${points.coalB.y} ${points.coalC.x},${points.coalC.y} ${points.coalO.x},${points.coalO.y}`}
          fill="#2c3e50"
          stroke="#34495e"
          strokeWidth="2"
        />
        <text x={points.coalA.x + 20} y={points.coalA.y - 10} fill="#2c3e50" fontSize="12">Coal Seam (ABCO)</text>

        {/* First-dig area (BCDE) */}
        <polygon
          points={`${points.overburdenB.x},${points.overburdenB.y} ${points.overburdenC.x},${points.overburdenC.y} ${points.overburdenD.x},${points.overburdenD.y} ${points.overburdenE.x},${points.overburdenE.y}`}
          fill="#8b4513"
          fillOpacity="0.7"
          stroke="#a0522d"
          strokeWidth="2"
        />
        <text x={points.overburdenE.x + 10} y={points.overburdenE.y - 10} fill="#8b4513" fontSize="12">First-dig (BCDE)</text>

        {/* Dump area (FGKH) */}
        <polygon
          points={`${points.dumpF.x},${points.dumpF.y} ${points.dumpG.x},${points.dumpG.y} ${points.dumpK.x},${points.dumpK.y} ${points.dumpH.x},${points.dumpH.y}`}
          fill="#daa520"
          fillOpacity="0.6"
          stroke="#b8860b"
          strokeWidth="2"
        />
        <text x={points.dumpF.x + 10} y={points.dumpF.y + 20} fill="#b8860b" fontSize="12">Dump Area (FGKH)</text>

        {/* Dragline representation */}
        <circle cx={points.draglineX} cy={points.draglineY} r="8" fill="#e74c3c" />
        <line 
          x1={points.draglineX} 
          y1={points.draglineY} 
          x2={points.draglineX + inputs.draglineReach * diagramData.scale * 0.8} 
          y2={points.draglineY + 20} 
          stroke="#e74c3c" 
          strokeWidth="3"
        />
        <text x={points.draglineX - 20} y={points.draglineY - 15} fill="#e74c3c" fontSize="12">Dragline</text>

        {/* Dimension lines and labels */}
        <line x1={points.coalA.x} y1={svgHeight - 20} x2={points.coalB.x} y2={svgHeight - 20} stroke="#333" strokeWidth="1" />
        <text x={points.coalA.x + (inputs.cutWidth * diagramData.scale / 2) - 20} y={svgHeight - 5} fill="#333" fontSize="10">
          Cut Width: {inputs.cutWidth}m
        </text>

        <line x1={20} y1={points.coalA.y} x2={20} y2={points.overburdenE.y} stroke="#333" strokeWidth="1" />
        <text x={5} y={points.coalA.y - (inputs.coalSeamThickness + inputs.overburdenThickness) * diagramData.scale / 2} 
              fill="#333" fontSize="10" transform={`rotate(-90, 5, ${points.coalA.y - (inputs.coalSeamThickness + inputs.overburdenThickness) * diagramData.scale / 2})`}>
          Bench Height: {inputs.benchHeight}m
        </text>
      </svg>
    );
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Dragline Balancing Diagram Generator</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <div className="row">
              {/* Input Form */}
              <div className="col-md-4">
                <h6>Dragline Specifications</h6>
                <div className="mb-3">
                  <label className="form-label">Dragline Reach (m)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="draglineReach"
                    value={inputs.draglineReach}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Bench Height (m)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="benchHeight"
                    value={inputs.benchHeight}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Cut Width (m)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="cutWidth"
                    value={inputs.cutWidth}
                    onChange={handleInputChange}
                  />
                </div>

                <h6 className="mt-4">Geological Parameters</h6>
                <div className="mb-3">
                  <label className="form-label">Coal Seam Thickness (m)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="coalSeamThickness"
                    value={inputs.coalSeamThickness}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Overburden Thickness (m)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="overburdenThickness"
                    value={inputs.overburdenThickness}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Swell Factor</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    name="swellFactor"
                    value={inputs.swellFactor}
                    onChange={handleInputChange}
                  />
                </div>

                <h6 className="mt-4">Operational Parameters</h6>
                <div className="mb-3">
                  <label className="form-label">Dump Slope (degrees)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="dumpSlope"
                    value={inputs.dumpSlope}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Spoil Height (m)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="spoilHeight"
                    value={inputs.spoilHeight}
                    onChange={handleInputChange}
                  />
                </div>

                <button 
                  className="btn btn-primary w-100" 
                  onClick={calculateDraglineBalance}
                >
                  Generate Diagram
                </button>
              </div>

              {/* Results and Diagram */}
              <div className="col-md-8">
                {results && (
                  <div className="mb-4">
                    <h6>Calculation Results</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-body">
                            <h6 className="card-title">Areas & Volumes</h6>
                            <p><strong>First-dig Area (A1):</strong> {results.firstDigArea} m²</p>
                            <p><strong>Dumping Area (A2):</strong> {results.dumpingArea} m²</p>
                            <p><strong>Swelled Overburden:</strong> {results.swelledOverburden} m²</p>
                            <p><strong>Coal Exposure Area:</strong> {results.coalExposureArea} m²</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-body">
                            <h6 className="card-title">Performance Metrics</h6>
                            <p><strong>Rehandling %:</strong> {results.rehandlingPercentage}%</p>
                            <p><strong>Coal Exposure Rate:</strong> {results.coalExposureRate} m²/day</p>
                            <p><strong>Operational Efficiency:</strong> {results.operationalEfficiency}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Diagram Display */}
                <div className="mb-4">
                  <h6>Dragline Balancing Diagram</h6>
                  <div className="border p-3 bg-light">
                    {diagramData ? renderDiagram() : (
                      <div className="text-center text-muted p-5">
                        Click "Generate Diagram" to view the dragline balancing diagram
                      </div>
                    )}
                  </div>
                </div>

                {results && (
                  <div className="alert alert-info">
                    <h6>Diagram Interpretation:</h6>
                    <ul className="mb-0">
                      <li><strong>Coal Seam (ABCO):</strong> Dark area representing the coal seam to be exposed</li>
                      <li><strong>First-dig (BCDE):</strong> Brown area showing overburden to be removed</li>
                      <li><strong>Dump Area (FGKH):</strong> Yellow area showing spoil accommodation zone</li>
                      <li><strong>Dragline:</strong> Red circle showing dragline position with reach indicator</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraglineModal;