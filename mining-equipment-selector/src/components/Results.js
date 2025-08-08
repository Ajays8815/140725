import React from 'react';

const Results = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <i className="fas fa-search fa-3x text-muted"></i>
        </div>
        <h5 className="text-muted">No Equipment Selected</h5>
        <p className="text-muted">
          Use the Equipment Selector tab to find suitable mining equipment based on your requirements.
        </p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return 'fas fa-check-circle';
    if (score >= 60) return 'fas fa-exclamation-triangle';
    return 'fas fa-times-circle';
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">
          Found {results.length} suitable equipment option{results.length !== 1 ? 's' : ''}
        </h5>
        <small className="text-muted">
          Sorted by compatibility score
        </small>
      </div>

      <div className="row">
        {results.map((equipment, index) => (
          <div key={equipment.id} className="col-lg-6 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold">{equipment.name}</h6>
                <span className={`badge bg-${getScoreColor(equipment.compatibility_score)} d-flex align-items-center`}>
                  <i className={`${getScoreIcon(equipment.compatibility_score)} me-1`}></i>
                  {equipment.compatibility_score}% Match
                </span>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-6">
                    <strong>Type:</strong>
                    <br />
                    <span className="text-muted">{equipment.type}</span>
                  </div>
                  <div className="col-6">
                    <strong>Capacity:</strong>
                    <br />
                    <span className="text-muted">{equipment.capacity}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <strong>Specifications:</strong>
                  <p className="text-muted small mb-0">{equipment.specifications}</p>
                </div>

                {equipment.reasons && equipment.reasons.length > 0 && (
                  <div>
                    <strong>Why this equipment is suitable:</strong>
                    <ul className="list-unstyled small mt-2">
                      {equipment.reasons.map((reason, reasonIndex) => (
                        <li key={reasonIndex} className="mb-1">
                          <i className="fas fa-check text-success me-2"></i>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="card-footer bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Recommendation #{index + 1}
                  </small>
                  <button className="btn btn-sm btn-outline-primary">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <div className="alert alert-info mt-4">
          <h6 className="alert-heading">
            <i className="fas fa-info-circle me-2"></i>
            Selection Criteria
          </h6>
          <small>
            Equipment recommendations are based on operation type, material type, production targets, and working conditions.
            Higher compatibility scores indicate better matches for your specific requirements.
          </small>
        </div>
      )}
    </div>
  );
};

export default Results;
