import React, { useState } from 'react';
import EquipmentForm from './components/EquipmentForm';
import Results from './components/Results';
import EquipmentTable from './components/EquipmentTable';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('selector');

  const handleSelectionResults = (selectionResults) => {
    setResults(selectionResults);
    setActiveTab('results');
  };

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="#home">
            <i className="fas fa-hard-hat me-2"></i>
            Mining Equipment Selector
          </a>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <ul className="nav nav-tabs" id="mainTabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'selector' ? 'active' : ''}`}
                  id="selector-tab" 
                  data-bs-toggle="tab" 
                  data-bs-target="#selector" 
                  type="button" 
                  role="tab"
                  onClick={() => setActiveTab('selector')}
                >
                  Equipment Selector
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'results' ? 'active' : ''}`}
                  id="results-tab" 
                  data-bs-toggle="tab" 
                  data-bs-target="#results" 
                  type="button" 
                  role="tab"
                  onClick={() => setActiveTab('results')}
                >
                  Selection Results
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'equipment' ? 'active' : ''}`}
                  id="equipment-tab" 
                  data-bs-toggle="tab" 
                  data-bs-target="#equipment" 
                  type="button" 
                  role="tab"
                  onClick={() => setActiveTab('equipment')}
                >
                  Equipment Database
                </button>
              </li>
            </ul>

            <div className="tab-content" id="mainTabContent">
              <div 
                className={`tab-pane fade ${activeTab === 'selector' ? 'show active' : ''}`}
                id="selector" 
                role="tabpanel"
              >
                <div className="card mt-3">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Mining Requirements</h5>
                  </div>
                  <div className="card-body">
                    <EquipmentForm 
                      onResults={handleSelectionResults} 
                      loading={loading} 
                      setLoading={setLoading} 
                    />
                  </div>
                </div>
              </div>

              <div 
                className={`tab-pane fade ${activeTab === 'results' ? 'show active' : ''}`}
                id="results" 
                role="tabpanel"
              >
                <div className="card mt-3">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Equipment Recommendations</h5>
                  </div>
                  <div className="card-body">
                    <Results results={results} />
                  </div>
                </div>
              </div>

              <div 
                className={`tab-pane fade ${activeTab === 'equipment' ? 'show active' : ''}`}
                id="equipment" 
                role="tabpanel"
              >
                <div className="card mt-3">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Available Equipment</h5>
                  </div>
                  <div className="card-body">
                    <EquipmentTable />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-dark text-light mt-5 py-3">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <p className="mb-0">&copy; 2024 Mining Equipment Selector. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;