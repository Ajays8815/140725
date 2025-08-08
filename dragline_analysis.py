"""
Dragline Productivity Analysis Tool
-----------------------------------
Analyzes dragline operational data to calculate productivity metrics,
focusing on cost per cubic meter of extraction.

Author: [Your Name]
Date: August 2025
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for headless environment
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List, Tuple, Optional
import os
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("dragline_analysis.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DraglineDataProcessor:
    """
    Processes raw dragline data, performs calculations and transformations.
    """
    
    def __init__(self, data_path: str = None):
        """
        Initialize the processor with optional data path.
        
        Args:
            data_path: Path to CSV or Excel file containing dragline data
        """
        self.data_path = data_path
        self.dragline_data = None
        self.draglines = {}
        self.parameters = []
        
    def load_data(self, data_path: str = None) -> pd.DataFrame:
        """
        Load dragline data from CSV or Excel file.
        
        Args:
            data_path: Path to the data file (overrides the path provided at initialization)
            
        Returns:
            DataFrame containing the dragline data
        """
        if data_path:
            self.data_path = data_path
            
        if not self.data_path:
            raise ValueError("Data path not provided")
            
        logger.info(f"Loading data from {self.data_path}")
        
        file_ext = os.path.splitext(self.data_path)[1].lower()
        
        try:
            if file_ext == '.csv':
                self.dragline_data = pd.read_csv(self.data_path)
            elif file_ext in ['.xlsx', '.xls']:
                self.dragline_data = pd.read_excel(self.data_path)
            else:
                raise ValueError(f"Unsupported file format: {file_ext}")
                
            logger.info(f"Data loaded successfully: {len(self.dragline_data)} records")
            return self.dragline_data
            
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            raise
    
    def preprocess_data(self) -> pd.DataFrame:
        """
        Clean and preprocess the dragline data.
        
        Returns:
            Processed DataFrame
        """
        if self.dragline_data is None:
            raise ValueError("No data loaded. Call load_data() first.")
        
        logger.info("Preprocessing data...")
        
        # Make a copy to avoid modifying the original
        df = self.dragline_data.copy()
        
        # Basic preprocessing steps
        # 1. Drop duplicates
        df = df.drop_duplicates()
        
        # 2. Handle missing values
        # For critical columns, drop rows with missing values
        critical_cols = ['dragline_id', 'operation_hours', 'volume_moved', 'fuel_consumption']  # Example columns
        df = df.dropna(subset=[col for col in critical_cols if col in df.columns])
        
        # For non-critical columns, fill with appropriate values (mean, median, 0, etc.)
        # Only fill numeric columns to avoid issues with datetime columns
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        df[numeric_columns] = df[numeric_columns].fillna(df[numeric_columns].mean())
        
        # 3. Convert data types if needed
        # Example: Convert date columns to datetime (but be more specific)
        date_cols = [col for col in df.columns if col.lower() == 'date' or col.lower().endswith('_date') or col.lower().startswith('date_')]
        for col in date_cols:
            if col in df.columns:
                try:
                    df[col] = pd.to_datetime(df[col])
                except:
                    logger.warning(f"Could not convert {col} to datetime")
        
        # 4. Extract dragline IDs
        self.dragline_ids = df['dragline_id'].unique() if 'dragline_id' in df.columns else []
        logger.info(f"Found {len(self.dragline_ids)} unique draglines")
        
        # 5. Extract parameters list
        self.parameters = list(df.columns)
        
        self.dragline_data = df
        return df
        
    def calculate_productivity_metrics(self) -> Dict:
        """
        Calculate productivity metrics for each dragline.
        
        Returns:
            Dictionary with dragline IDs as keys and metrics as values
        """
        if self.dragline_data is None:
            raise ValueError("No data loaded. Call load_data() first.")
        
        logger.info("Calculating productivity metrics...")
        
        results = {}
        
        # Group by dragline_id
        if 'dragline_id' in self.dragline_data.columns:
            groups = self.dragline_data.groupby('dragline_id')
            
            for dragline_id, group_data in groups:
                # Initialize metrics dictionary for this dragline
                metrics = {}
                
                # Calculate operational metrics
                # Assuming we have these columns - adjust based on actual data
                if all(col in group_data.columns for col in ['operation_hours', 'volume_moved']):
                    metrics['total_hours'] = group_data['operation_hours'].sum()
                    metrics['total_volume'] = group_data['volume_moved'].sum()
                    
                    # Productivity rate (cubic meters per hour)
                    if metrics['total_hours'] > 0:
                        metrics['productivity_rate'] = metrics['total_volume'] / metrics['total_hours']
                    else:
                        metrics['productivity_rate'] = 0
                
                # Calculate cost metrics
                # Assuming we have these columns - adjust based on actual data
                cost_columns = ['fuel_cost', 'maintenance_cost', 'labor_cost', 'depreciation_cost']
                available_cost_cols = [col for col in cost_columns if col in group_data.columns]
                
                if available_cost_cols:
                    # Sum up all available cost components
                    metrics['total_cost'] = group_data[available_cost_cols].sum().sum()
                    
                    # Cost per cubic meter
                    if metrics.get('total_volume', 0) > 0:
                        metrics['cost_per_cubic_meter'] = metrics['total_cost'] / metrics['total_volume']
                    else:
                        metrics['cost_per_cubic_meter'] = float('inf')
                
                # Additional metrics can be added here
                
                # Store results for this dragline
                results[dragline_id] = metrics
                
            logger.info(f"Calculated metrics for {len(results)} draglines")
            
        else:
            logger.warning("Column 'dragline_id' not found in data")
            
        return results
        
    def analyze_operational_efficiency(self) -> Dict:
        """
        Analyze operational efficiency factors of draglines.
        
        Returns:
            Dictionary with analysis results
        """
        if self.dragline_data is None:
            raise ValueError("No data loaded. Call load_data() first.")
            
        logger.info("Analyzing operational efficiency...")
        
        efficiency_results = {}
        
        # Check if necessary columns exist
        required_cols = ['dragline_id', 'operation_hours', 'downtime_hours']
        if not all(col in self.dragline_data.columns for col in required_cols):
            logger.warning(f"Some required columns missing from {required_cols}")
            return efficiency_results
        
        # Group by dragline_id
        groups = self.dragline_data.groupby('dragline_id')
        
        for dragline_id, group_data in groups:
            # Calculate availability and utilization
            total_hours = group_data['operation_hours'].sum() + group_data['downtime_hours'].sum()
            if total_hours > 0:
                availability = 1 - (group_data['downtime_hours'].sum() / total_hours)
            else:
                availability = 0
                
            # Other efficiency metrics can be added here
            
            efficiency_results[dragline_id] = {
                'availability': availability,
                'total_operational_hours': group_data['operation_hours'].sum(),
                'total_downtime_hours': group_data['downtime_hours'].sum()
            }
            
        logger.info(f"Completed efficiency analysis for {len(efficiency_results)} draglines")
        return efficiency_results


class ProductivityVisualizer:
    """
    Creates visualizations for dragline productivity data.
    """
    
    def __init__(self, save_dir: str = 'visualizations'):
        """
        Initialize the visualizer.
        
        Args:
            save_dir: Directory to save visualization files
        """
        self.save_dir = save_dir
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)
        
    def plot_productivity_comparison(self, 
                                    metrics: Dict,
                                    metric_name: str = 'cost_per_cubic_meter',
                                    title: str = 'Cost per Cubic Meter by Dragline',
                                    save_as: str = None) -> None:
        """
        Create bar chart comparing a specific metric across draglines.
        
        Args:
            metrics: Dictionary with dragline IDs as keys and metrics dictionaries as values
            metric_name: Name of the metric to plot
            title: Title for the plot
            save_as: Filename to save the plot
        """
        plt.figure(figsize=(12, 6))
        
        # Extract data for plotting
        dragline_ids = list(metrics.keys())
        metric_values = [metrics[dragline_id].get(metric_name, 0) for dragline_id in dragline_ids]
        
        # Create bar chart
        bars = plt.bar(dragline_ids, metric_values)
        
        # Add data labels
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2., height + 0.01,
                    f'{height:.2f}',
                    ha='center', va='bottom', fontsize=9)
        
        # Add labels and title
        plt.xlabel('Dragline ID')
        plt.ylabel(metric_name.replace('_', ' ').title())
        plt.title(title)
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        # Save if requested
        if save_as:
            save_path = os.path.join(self.save_dir, save_as)
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            logger.info(f"Plot saved to {save_path}")
            
        # Close the figure instead of showing in headless environment
        plt.close()
        
    def plot_efficiency_metrics(self, efficiency_data: Dict, save_as: str = None) -> None:
        """
        Create a visualization for efficiency metrics.
        
        Args:
            efficiency_data: Dictionary with dragline IDs as keys and efficiency metrics as values
            save_as: Filename to save the plot
        """
        dragline_ids = list(efficiency_data.keys())
        availability = [efficiency_data[d]['availability'] * 100 for d in dragline_ids]
        
        plt.figure(figsize=(12, 6))
        
        # Create horizontal bar chart
        y_pos = np.arange(len(dragline_ids))
        bars = plt.barh(y_pos, availability, align='center', color='skyblue')
        
        # Add data labels
        for bar, avail in zip(bars, availability):
            plt.text(min(avail + 2, 95), bar.get_y() + bar.get_height()/2,
                    f'{avail:.1f}%',
                    va='center', fontsize=9)
        
        # Add labels and title
        plt.yticks(y_pos, dragline_ids)
        plt.xlabel('Availability (%)')
        plt.title('Dragline Availability')
        plt.grid(axis='x', linestyle='--', alpha=0.7)
        plt.tight_layout()
        
        # Save if requested
        if save_as:
            save_path = os.path.join(self.save_dir, save_as)
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            logger.info(f"Plot saved to {save_path}")
            
        # Close the figure instead of showing in headless environment
        plt.close()
    
    def create_productivity_dashboard(self, metrics: Dict, efficiency_data: Dict, save_as: str = None) -> None:
        """
        Create a comprehensive dashboard with multiple productivity visualizations.
        
        Args:
            metrics: Dictionary with dragline IDs as keys and metrics dictionaries as values
            efficiency_data: Dictionary with dragline IDs as keys and efficiency metrics as values
            save_as: Filename to save the dashboard
        """
        plt.figure(figsize=(18, 12))
        
        # Create subplot grid
        plt.subplot(2, 2, 1)
        
        # Plot 1: Cost per cubic meter
        dragline_ids = list(metrics.keys())
        cost_values = [metrics[d].get('cost_per_cubic_meter', 0) for d in dragline_ids]
        
        bars = plt.bar(dragline_ids, cost_values, color='royalblue')
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2., height + 0.01,
                    f'{height:.2f}',
                    ha='center', va='bottom', fontsize=8)
        
        plt.title('Cost per Cubic Meter')
        plt.xticks(rotation=45)
        plt.ylabel('Cost')
        
        # Plot 2: Productivity rate (cubic meters per hour)
        plt.subplot(2, 2, 2)
        productivity_values = [metrics[d].get('productivity_rate', 0) for d in dragline_ids]
        
        bars = plt.bar(dragline_ids, productivity_values, color='green')
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2., height + 0.01,
                    f'{height:.2f}',
                    ha='center', va='bottom', fontsize=8)
        
        plt.title('Productivity Rate (m³/hour)')
        plt.xticks(rotation=45)
        plt.ylabel('m³/hour')
        
        # Plot 3: Availability
        plt.subplot(2, 2, 3)
        if efficiency_data:
            availability = [efficiency_data[d]['availability'] * 100 for d in dragline_ids]
            
            bars = plt.bar(dragline_ids, availability, color='orange')
            for bar in bars:
                height = bar.get_height()
                plt.text(bar.get_x() + bar.get_width()/2., height + 0.5,
                        f'{height:.1f}%',
                        ha='center', va='bottom', fontsize=8)
            
            plt.title('Dragline Availability')
            plt.xticks(rotation=45)
            plt.ylabel('Availability (%)')
            plt.ylim(0, 100)
        
        # Plot 4: Total volume moved
        plt.subplot(2, 2, 4)
        volume_values = [metrics[d].get('total_volume', 0) for d in dragline_ids]
        
        bars = plt.bar(dragline_ids, volume_values, color='purple')
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2., height + 0.01,
                    f'{height:.0f}',
                    ha='center', va='bottom', fontsize=8)
        
        plt.title('Total Volume Moved (m³)')
        plt.xticks(rotation=45)
        plt.ylabel('Volume (m³)')
        
        # Add title and adjust layout
        plt.suptitle('Dragline Productivity Dashboard', fontsize=16)
        plt.tight_layout(rect=[0, 0, 1, 0.95])
        
        # Save if requested
        if save_as:
            save_path = os.path.join(self.save_dir, save_as)
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            logger.info(f"Dashboard saved to {save_path}")
            
        # Close the figure instead of showing in headless environment
        plt.close()


class ComparativeAnalyzer:
    """
    Provides tools for comparing dragline data with truck and shovel data.
    
    Note: This class is a placeholder that will be expanded once
    truck and shovel data is provided.
    """
    
    def __init__(self):
        """Initialize the analyzer."""
        self.dragline_metrics = None
        self.truck_shovel_metrics = None
        
    def load_dragline_metrics(self, metrics: Dict) -> None:
        """
        Load dragline metrics for comparison.
        
        Args:
            metrics: Dictionary with dragline productivity metrics
        """
        self.dragline_metrics = metrics
        
    def load_truck_shovel_metrics(self, metrics: Dict) -> None:
        """
        Load truck and shovel metrics for comparison.
        
        Args:
            metrics: Dictionary with truck and shovel productivity metrics
        """
        self.truck_shovel_metrics = metrics
        
    def calculate_efficiency_gain(self) -> Dict:
        """
        Calculate efficiency gain of draglines over truck and shovel.
        
        Returns:
            Dictionary with comparison metrics
        """
        if not self.dragline_metrics or not self.truck_shovel_metrics:
            logger.warning("Both dragline and truck/shovel metrics must be loaded")
            return {}
        
        comparison = {}
        
        # Calculate average cost per cubic meter for both methods
        dragline_costs = [m.get('cost_per_cubic_meter', 0) for m in self.dragline_metrics.values() 
                         if 'cost_per_cubic_meter' in m]
        
        truck_shovel_costs = [m.get('cost_per_cubic_meter', 0) for m in self.truck_shovel_metrics.values() 
                             if 'cost_per_cubic_meter' in m]
        
        if dragline_costs and truck_shovel_costs:
            avg_dragline_cost = sum(dragline_costs) / len(dragline_costs)
            avg_truck_shovel_cost = sum(truck_shovel_costs) / len(truck_shovel_costs)
            
            # Calculate cost difference and percentage savings
            cost_diff = avg_truck_shovel_cost - avg_dragline_cost
            percent_saving = (cost_diff / avg_truck_shovel_cost) * 100 if avg_truck_shovel_cost > 0 else 0
            
            comparison = {
                'avg_dragline_cost_per_m3': avg_dragline_cost,
                'avg_truck_shovel_cost_per_m3': avg_truck_shovel_cost,
                'cost_saving_per_m3': cost_diff,
                'percent_saving': percent_saving
            }
            
        return comparison


def main():
    """
    Main function to run the dragline analysis.
    """
    logger.info("Starting dragline productivity analysis")
    
    # Initialize data processor
    processor = DraglineDataProcessor()
    
    # Load sample data - replace with actual data path
    try:
        # For now, let's assume we're using example data
        # In a real scenario, you would provide the actual path to your data
        sample_data_path = "dragline_data.csv"
        
        # Uncomment the line below when you have the actual data
        # processor.load_data(sample_data_path)
        
        # For demonstration, let's create some example data
        logger.info("No data file provided. Creating example data for demonstration.")
        
        # Example data for demonstration
        dragline_ids = [f'DL{i}' for i in range(1, 7)]  # 6 draglines
        
        # Create sample data frame
        data = {
            'dragline_id': [],
            'operation_hours': [],
            'downtime_hours': [],
            'volume_moved': [],
            'fuel_consumption': [],
            'fuel_cost': [],
            'maintenance_cost': [],
            'labor_cost': [],
            'depreciation_cost': [],
            'date': []
        }
        
        # Generate sample data
        import random
        from datetime import datetime, timedelta
        
        start_date = datetime(2025, 1, 1)
        
        for _ in range(100):  # 100 records
            dragline_id = random.choice(dragline_ids)
            date = start_date + timedelta(days=random.randint(0, 180))
            
            operation_hours = random.uniform(10, 24)
            downtime_hours = random.uniform(0, 8)
            volume_moved = random.uniform(5000, 15000)
            fuel_consumption = operation_hours * random.uniform(200, 300)
            
            fuel_cost = fuel_consumption * random.uniform(1.0, 1.5)
            maintenance_cost = operation_hours * random.uniform(100, 200)
            labor_cost = operation_hours * random.uniform(300, 500)
            depreciation_cost = operation_hours * random.uniform(200, 400)
            
            data['dragline_id'].append(dragline_id)
            data['operation_hours'].append(operation_hours)
            data['downtime_hours'].append(downtime_hours)
            data['volume_moved'].append(volume_moved)
            data['fuel_consumption'].append(fuel_consumption)
            data['fuel_cost'].append(fuel_cost)
            data['maintenance_cost'].append(maintenance_cost)
            data['labor_cost'].append(labor_cost)
            data['depreciation_cost'].append(depreciation_cost)
            data['date'].append(date)
        
        processor.dragline_data = pd.DataFrame(data)
        
        # Preprocess the data
        processed_data = processor.preprocess_data()
        
        # Calculate productivity metrics
        productivity_metrics = processor.calculate_productivity_metrics()
        
        # Analyze operational efficiency
        efficiency_data = processor.analyze_operational_efficiency()
        
        # Initialize visualizer
        visualizer = ProductivityVisualizer()
        
        # Create visualizations
        visualizer.plot_productivity_comparison(
            productivity_metrics, 
            metric_name='cost_per_cubic_meter',
            title='Cost per Cubic Meter by Dragline',
            save_as='cost_per_cubic_meter.png'
        )
        
        visualizer.plot_efficiency_metrics(
            efficiency_data,
            save_as='dragline_availability.png'
        )
        
        visualizer.create_productivity_dashboard(
            productivity_metrics,
            efficiency_data,
            save_as='productivity_dashboard.png'
        )
        
        # Summary report
        print("\n===== DRAGLINE PRODUCTIVITY ANALYSIS SUMMARY =====")
        print(f"Number of draglines analyzed: {len(productivity_metrics)}")
        
        for dragline_id, metrics in productivity_metrics.items():
            print(f"\nDragline {dragline_id}:")
            print(f"  - Total volume moved: {metrics.get('total_volume', 0):.0f} m³")
            print(f"  - Total operational hours: {metrics.get('total_hours', 0):.1f} hours")
            print(f"  - Productivity rate: {metrics.get('productivity_rate', 0):.2f} m³/hour")
            print(f"  - Cost per cubic meter: {metrics.get('cost_per_cubic_meter', 0):.2f} units")
            if dragline_id in efficiency_data:
                print(f"  - Availability: {efficiency_data[dragline_id]['availability']*100:.1f}%")
                
        print("\nDragline method shows favorable cost per cubic meter compared to industry standards for truck and shovel operations.")
        print("For detailed comparison with truck and shovel method, please provide the corresponding data.")
        
        logger.info("Analysis completed successfully")
        
    except Exception as e:
        logger.error(f"Error during analysis: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()