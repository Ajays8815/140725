#!/usr/bin/env python3
"""
Simple test script to verify the dragline analysis tool works correctly.
"""

import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dragline_analysis import DraglineDataProcessor, ProductivityVisualizer, ComparativeAnalyzer
import pandas as pd
import numpy as np

def test_basic_functionality():
    """Test basic functionality of the dragline analysis tool."""
    print("Testing Dragline Productivity Analysis Tool...")
    
    # Create simple test data
    test_data = {
        'dragline_id': ['DL1', 'DL1', 'DL2', 'DL2'],
        'operation_hours': [10.0, 12.0, 8.0, 15.0],
        'downtime_hours': [2.0, 1.0, 3.0, 0.5],
        'volume_moved': [5000.0, 6000.0, 4000.0, 7500.0],
        'fuel_consumption': [2000.0, 2400.0, 1600.0, 3000.0],
        'fuel_cost': [2500.0, 3000.0, 2000.0, 3750.0],
        'maintenance_cost': [1000.0, 1200.0, 800.0, 1500.0],
        'labor_cost': [3000.0, 3600.0, 2400.0, 4500.0],
        'depreciation_cost': [2000.0, 2400.0, 1600.0, 3000.0]
    }
    
    # Initialize processor
    processor = DraglineDataProcessor()
    processor.dragline_data = pd.DataFrame(test_data)
    
    # Preprocess data
    processed_data = processor.preprocess_data()
    print(f"✓ Data preprocessing complete. Shape: {processed_data.shape}")
    
    # Calculate metrics
    metrics = processor.calculate_productivity_metrics()
    print(f"✓ Productivity metrics calculated for {len(metrics)} draglines")
    
    # Analyze efficiency
    efficiency = processor.analyze_operational_efficiency()
    print(f"✓ Efficiency analysis complete for {len(efficiency)} draglines")
    
    # Test visualizer
    visualizer = ProductivityVisualizer(save_dir='test_visualizations')
    
    # Create single plot
    visualizer.plot_productivity_comparison(
        metrics, 
        metric_name='cost_per_cubic_meter',
        save_as='test_cost_comparison.png'
    )
    print("✓ Cost comparison plot created")
    
    # Create efficiency plot
    visualizer.plot_efficiency_metrics(efficiency, save_as='test_efficiency.png')
    print("✓ Efficiency plot created")
    
    # Create dashboard
    visualizer.create_productivity_dashboard(
        metrics, 
        efficiency, 
        save_as='test_dashboard.png'
    )
    print("✓ Dashboard created")
    
    # Test comparative analyzer
    analyzer = ComparativeAnalyzer()
    analyzer.load_dragline_metrics(metrics)
    print("✓ Comparative analyzer initialized")
    
    # Display summary
    print("\n=== TEST RESULTS SUMMARY ===")
    for dragline_id, metric in metrics.items():
        print(f"{dragline_id}:")
        print(f"  - Total volume: {metric.get('total_volume', 0):.0f} m³")
        print(f"  - Productivity: {metric.get('productivity_rate', 0):.2f} m³/hour")
        print(f"  - Cost/m³: {metric.get('cost_per_cubic_meter', 0):.2f}")
        print(f"  - Availability: {efficiency[dragline_id]['availability']*100:.1f}%")
    
    print("\n✓ All tests passed successfully!")
    return True

if __name__ == "__main__":
    try:
        test_basic_functionality()
    except Exception as e:
        print(f"✗ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)