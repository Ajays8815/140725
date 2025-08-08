# Mining Equipment Selector

An interactive web application that helps mining engineers and operators select the most suitable equipment for their specific mining operations. The application considers various factors including operation type, material type, production targets, and working conditions to recommend appropriate mining equipment.

## Features

- **Equipment Selection**: Input your mining requirements and get tailored equipment recommendations
- **Equipment Database**: Browse the complete database of available mining equipment
- **Compatibility Scoring**: Each recommendation includes a compatibility score and detailed reasoning
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Dynamic interface with real-time feedback

## Technology Stack

### Backend
- **Python Flask**: Web framework for API development
- **SQLite**: Lightweight database for equipment data storage
- **Flask-CORS**: Cross-origin resource sharing support

### Frontend
- **React**: Modern JavaScript library for building user interfaces
- **Bootstrap**: Responsive CSS framework for styling
- **Axios**: HTTP client for API communication

## Project Structure

```
mining-equipment-selector/
├── app.py                          # Flask application main file
├── models.py                       # Database models and initialization
├── selector.py                     # Equipment selection logic
├── requirements.txt                # Python dependencies
├── equipment_data.db              # SQLite database file
├── package.json                   # Node.js dependencies
├── public/
│   └── index.html                 # HTML template
├── src/
│   ├── App.js                     # Main React component
│   ├── index.js                   # React entry point
│   ├── api.js                     # API communication utilities
│   └── components/
│       ├── EquipmentForm.js       # Equipment requirements form
│       ├── Results.js             # Equipment recommendations display
│       └── EquipmentTable.js      # Equipment database table
└── README.md                      # This file
```

## Setup Instructions

### Prerequisites

- Python 3.7 or higher
- Node.js 14.0 or higher
- npm or yarn package manager

### Backend Setup

1. **Navigate to the project directory**:
   ```bash
   cd mining-equipment-selector
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize the database**:
   ```bash
   python -c "from models import init_db; init_db()"
   ```

5. **Start the Flask server**:
   ```bash
   python app.py
   ```

   The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

2. **Start the React development server**:
   ```bash
   npm start
   ```

   The frontend application will be available at `http://localhost:3000`

## Usage Instructions

### Using the Equipment Selector

1. **Access the Application**: Open your web browser and navigate to `http://localhost:3000`

2. **Fill in Requirements**:
   - **Operation Type**: Select your mining operation (Surface Mining, Underground Mining, etc.)
   - **Material Type**: Choose the material you're mining (Coal, Iron Ore, Copper Ore, etc.)
   - **Production Target**: Enter your daily production target in tons
   - **Working Conditions**: Select the operating environment (Standard, Heavy Duty, etc.)

3. **Get Recommendations**: Click "Find Suitable Equipment" to receive equipment recommendations

4. **Review Results**: The system will display:
   - Equipment recommendations sorted by compatibility score
   - Detailed specifications for each piece of equipment
   - Reasons why each equipment is suitable for your requirements

### Browsing the Equipment Database

1. **Navigate to Equipment Database Tab**: Click on the "Equipment Database" tab
2. **Browse Available Equipment**: View all equipment in the database with their specifications
3. **Refresh Data**: Use the refresh button to reload the latest equipment data

## API Endpoints

The Flask backend provides the following REST API endpoints:

### GET /api/equipment
Returns all available equipment in the database.

**Response Example**:
```json
[
  {
    "id": 1,
    "name": "CAT 992K Loader",
    "type": "Loader",
    "capacity": "9.2 m³",
    "specifications": "Wheel loader, diesel engine, 650 HP"
  }
]
```

### POST /api/select
Selects equipment based on mining requirements.

**Request Body**:
```json
{
  "operation_type": "Surface Mining",
  "material_type": "Coal",
  "production_target": "5000",
  "working_conditions": "Standard"
}
```

**Response Example**:
```json
[
  {
    "id": 1,
    "name": "CAT 992K Loader",
    "type": "Loader",
    "capacity": "9.2 m³",
    "specifications": "Wheel loader, diesel engine, 650 HP",
    "compatibility_score": 85,
    "reasons": [
      "Suitable for Surface Mining operations",
      "Designed for Coal handling",
      "Production capacity matches target (5000 tons/day)"
    ]
  }
]
```

### GET /api/health
Health check endpoint to verify API status.

## Database Schema

The application uses SQLite with the following tables:

### equipment
- `id`: Primary key
- `name`: Equipment name
- `type`: Equipment type (Loader, Excavator, etc.)
- `capacity`: Equipment capacity
- `specifications`: Detailed specifications

### mining_conditions
- `id`: Primary key
- `equipment_id`: Foreign key to equipment table
- `operation_type`: Type of mining operation
- `material_type`: Type of material
- `min_production`: Minimum production capacity
- `max_production`: Maximum production capacity
- `working_conditions`: Required working conditions

## Development

### Adding New Equipment

To add new equipment to the database:

1. **Modify the sample data** in `models.py`
2. **Delete the existing database**:
   ```bash
   rm equipment_data.db
   ```
3. **Reinitialize the database**:
   ```bash
   python -c "from models import init_db; init_db()"

### Customizing Selection Logic

The equipment selection algorithm is located in `selector.py`. You can modify the `calculate_compatibility_score()` function to adjust how equipment is scored and ranked.

### Frontend Customization

- Modify `src/App.js` for layout changes
- Update component files in `src/components/` for specific functionality
- Customize styling by modifying Bootstrap classes or adding custom CSS

## Troubleshooting

### Common Issues

1. **Backend not starting**:
   - Ensure Python dependencies are installed: `pip install -r requirements.txt`
   - Check that no other application is using port 5000

2. **Frontend not loading**:
   - Verify Node.js dependencies are installed: `npm install`
   - Ensure no other application is using port 3000

3. **Database errors**:
   - Delete and recreate the database: `rm equipment_data.db && python -c "from models import init_db; init_db()"`

4. **API connection errors**:
   - Verify the Flask backend is running on port 5000
   - Check browser console for CORS errors

### Debug Mode

- Backend: The Flask application runs in debug mode by default for development
- Frontend: React development server provides hot reloading and error reporting

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or support, please refer to the project documentation or create an issue in the repository.