from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from models import init_db
from selector import select_equipment

app = Flask(__name__)
CORS(app)

# Initialize database
init_db()

@app.route('/api/equipment', methods=['GET'])
def get_equipment():
    """Get all available equipment"""
    try:
        conn = sqlite3.connect('equipment_data.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM equipment')
        equipment = cursor.fetchall()
        conn.close()
        
        # Convert to list of dictionaries
        equipment_list = []
        for item in equipment:
            equipment_list.append({
                'id': item[0],
                'name': item[1],
                'type': item[2],
                'capacity': item[3],
                'specifications': item[4]
            })
        
        return jsonify(equipment_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/select', methods=['POST'])
def equipment_selection():
    """Select equipment based on requirements"""
    try:
        data = request.get_json()
        
        # Extract requirements from request
        requirements = {
            'operation_type': data.get('operation_type'),
            'material_type': data.get('material_type'),
            'production_target': data.get('production_target'),
            'working_conditions': data.get('working_conditions')
        }
        
        # Get equipment recommendations
        recommendations = select_equipment(requirements)
        
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)