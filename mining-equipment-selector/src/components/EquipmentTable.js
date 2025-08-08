import React, { useState, useEffect } from 'react';
import { equipmentAPI } from '../api';

const EquipmentTable = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const data = await equipmentAPI.getAllEquipment();
      setEquipment(data);
      setError(null);
    } catch (err) {
      setError('Failed to load equipment data. Please ensure the backend server is running.');
      console.error('Error fetching equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading equipment database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h6 className="alert-heading">Error Loading Equipment</h6>
        <p className="mb-0">{error}</p>
        <hr />
        <button className="btn btn-outline-danger btn-sm" onClick={fetchEquipment}>
          <i className="fas fa-redo me-1"></i>
          Retry
        </button>
      </div>
    );
  }

  if (!equipment || equipment.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <i className="fas fa-database fa-3x text-muted"></i>
        </div>
        <h5 className="text-muted">No Equipment Found</h5>
        <p className="text-muted">
          The equipment database appears to be empty. Please check the backend configuration.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">
          Equipment Database ({equipment.length} items)
        </h6>
        <button className="btn btn-sm btn-outline-secondary" onClick={fetchEquipment}>
          <i className="fas fa-sync-alt me-1"></i>
          Refresh
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Equipment Name</th>
              <th scope="col">Type</th>
              <th scope="col">Capacity</th>
              <th scope="col">Specifications</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="badge bg-secondary">{item.id}</span>
                </td>
                <td>
                  <strong>{item.name}</strong>
                </td>
                <td>
                  <span className="badge bg-primary">{item.type}</span>
                </td>
                <td>{item.capacity}</td>
                <td>
                  <small className="text-muted">{item.specifications}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <small className="text-muted">
          This table shows all available equipment in the database. 
          Use the Equipment Selector to find equipment suitable for your specific requirements.
        </small>
      </div>
    </div>
  );
};

export default EquipmentTable;