import React, { useState } from 'react';
import { equipmentAPI } from '../api';

const EquipmentForm = ({ onResults, loading, setLoading }) => {
  const [formData, setFormData] = useState({
    operation_type: '',
    material_type: '',
    production_target: '',
    working_conditions: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.operation_type) {
      newErrors.operation_type = 'Operation type is required';
    }

    if (!formData.material_type) {
      newErrors.material_type = 'Material type is required';
    }

    if (!formData.production_target) {
      newErrors.production_target = 'Production target is required';
    } else if (isNaN(formData.production_target) || Number(formData.production_target) <= 0) {
      newErrors.production_target = 'Production target must be a positive number';
    }

    if (!formData.working_conditions) {
      newErrors.working_conditions = 'Working conditions are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const results = await equipmentAPI.selectEquipment(formData);
      onResults(results);
    } catch (error) {
      console.error('Error selecting equipment:', error);
      alert('Error selecting equipment. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="operation_type" className="form-label">Operation Type</label>
          <select
            className={`form-select ${errors.operation_type ? 'is-invalid' : ''}`}
            id="operation_type"
            name="operation_type"
            value={formData.operation_type}
            onChange={handleChange}
          >
            <option value="">Select operation type</option>
            <option value="Surface Mining">Surface Mining</option>
            <option value="Underground Mining">Underground Mining</option>
            <option value="Quarrying">Quarrying</option>
            <option value="Strip Mining">Strip Mining</option>
          </select>
          {errors.operation_type && (
            <div className="invalid-feedback">{errors.operation_type}</div>
          )}
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="material_type" className="form-label">Material Type</label>
          <select
            className={`form-select ${errors.material_type ? 'is-invalid' : ''}`}
            id="material_type"
            name="material_type"
            value={formData.material_type}
            onChange={handleChange}
          >
            <option value="">Select material type</option>
            <option value="Coal">Coal</option>
            <option value="Iron Ore">Iron Ore</option>
            <option value="Copper Ore">Copper Ore</option>
            <option value="Gold Ore">Gold Ore</option>
            <option value="Limestone">Limestone</option>
            <option value="Overburden">Overburden</option>
            <option value="Sand and Gravel">Sand and Gravel</option>
          </select>
          {errors.material_type && (
            <div className="invalid-feedback">{errors.material_type}</div>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="production_target" className="form-label">Production Target (tons/day)</label>
          <input
            type="number"
            className={`form-control ${errors.production_target ? 'is-invalid' : ''}`}
            id="production_target"
            name="production_target"
            value={formData.production_target}
            onChange={handleChange}
            placeholder="Enter target production in tons per day"
          />
          {errors.production_target && (
            <div className="invalid-feedback">{errors.production_target}</div>
          )}
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="working_conditions" className="form-label">Working Conditions</label>
          <select
            className={`form-select ${errors.working_conditions ? 'is-invalid' : ''}`}
            id="working_conditions"
            name="working_conditions"
            value={formData.working_conditions}
            onChange={handleChange}
          >
            <option value="">Select working conditions</option>
            <option value="Standard">Standard</option>
            <option value="Heavy Duty">Heavy Duty</option>
            <option value="Extreme Conditions">Extreme Conditions</option>
            <option value="High Altitude">High Altitude</option>
            <option value="Wet Conditions">Wet Conditions</option>
          </select>
          {errors.working_conditions && (
            <div className="invalid-feedback">{errors.working_conditions}</div>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Selecting Equipment...
              </>
            ) : (
              'Find Suitable Equipment'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EquipmentForm;