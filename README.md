# Dragline Productivity Analysis Tool

A comprehensive Python tool for analyzing dragline operational data to calculate productivity metrics, focusing on cost per cubic meter of extraction.

## Features

- **Data Processing**: Load and preprocess dragline operational data from CSV or Excel files
- **Productivity Metrics**: Calculate key performance indicators including:
  - Total volume moved
  - Productivity rate (m³/hour)
  - Cost per cubic meter
  - Equipment availability
- **Visualizations**: Generate professional charts and dashboards
- **Comparative Analysis**: Compare dragline performance with truck and shovel operations
- **Logging**: Comprehensive logging for analysis tracking

## Installation

1. Clone this repository
2. Install required dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Basic Usage

```python
from dragline_analysis import DraglineDataProcessor, ProductivityVisualizer

# Initialize processor and load data
processor = DraglineDataProcessor("your_data.csv")
processor.load_data()

# Preprocess data
processed_data = processor.preprocess_data()

# Calculate metrics
metrics = processor.calculate_productivity_metrics()
efficiency = processor.analyze_operational_efficiency()

# Create visualizations
visualizer = ProductivityVisualizer()
visualizer.create_productivity_dashboard(metrics, efficiency, save_as='dashboard.png')
```

### Running the Demo

Run the main script to see the tool in action with sample data:

```bash
python dragline_analysis.py
```

### Running Tests

Verify the installation with the test script:

```bash
python test_dragline_analysis.py
```

## Data Format

The tool expects data with the following columns:
- `dragline_id`: Unique identifier for each dragline
- `operation_hours`: Hours of operation
- `downtime_hours`: Hours of downtime
- `volume_moved`: Volume of material moved (m³)
- `fuel_consumption`: Fuel consumed
- `fuel_cost`: Cost of fuel
- `maintenance_cost`: Maintenance costs
- `labor_cost`: Labor costs
- `depreciation_cost`: Equipment depreciation costs
- `date`: Date of operation (optional)

## Output

The tool generates:
- Log files with analysis details
- PNG visualizations in the `visualizations/` directory
- Comprehensive productivity reports

## Author

Created for dragline mining operation analysis
Date: August 2025
