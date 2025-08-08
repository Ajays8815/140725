import sqlite3
import os

def init_db():
    """Initialize the SQLite database with equipment data"""
    conn = sqlite3.connect('equipment_data.db')
    cursor = conn.cursor()
    
    # Create equipment table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS equipment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            capacity TEXT,
            specifications TEXT
        )
    ''')
    
    # Create mining_conditions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mining_conditions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            equipment_id INTEGER,
            operation_type TEXT,
            material_type TEXT,
            min_production INTEGER,
            max_production INTEGER,
            working_conditions TEXT,
            FOREIGN KEY (equipment_id) REFERENCES equipment (id)
        )
    ''')
    
    # Insert sample equipment data
    sample_equipment = [
        ('CAT 992K Loader', 'Loader', '9.2 m³', 'Wheel loader, diesel engine, 650 HP'),
        ('Komatsu PC8000-6 Excavator', 'Excavator', '42 m³', 'Hydraulic excavator, diesel engine, 4020 HP'),
        ('CAT 797F Dump Truck', 'Dump Truck', '400 ton', 'Mining truck, diesel engine, 4000 HP'),
        ('Liebherr T 282C Dump Truck', 'Dump Truck', '363 ton', 'Mining truck, diesel engine, 3650 HP'),
        ('CAT D11T Dozer', 'Dozer', 'N/A', 'Track-type tractor, diesel engine, 850 HP'),
        ('Komatsu WA900-3 Loader', 'Loader', '17.5 m³', 'Wheel loader, diesel engine, 1050 HP')
    ]
    
    # Check if data already exists
    cursor.execute('SELECT COUNT(*) FROM equipment')
    if cursor.fetchone()[0] == 0:
        cursor.executemany(
            'INSERT INTO equipment (name, type, capacity, specifications) VALUES (?, ?, ?, ?)',
            sample_equipment
        )
    
    # Insert sample mining conditions
    sample_conditions = [
        (1, 'Surface Mining', 'Coal', 1000, 5000, 'Standard'),
        (2, 'Surface Mining', 'Iron Ore', 5000, 15000, 'Heavy Duty'),
        (3, 'Surface Mining', 'Iron Ore', 10000, 25000, 'Heavy Duty'),
        (4, 'Surface Mining', 'Coal', 8000, 20000, 'Heavy Duty'),
        (5, 'Surface Mining', 'Overburden', 2000, 8000, 'Standard'),
        (6, 'Surface Mining', 'Iron Ore', 8000, 20000, 'Heavy Duty')
    ]
    
    # Check if conditions data already exists
    cursor.execute('SELECT COUNT(*) FROM mining_conditions')
    if cursor.fetchone()[0] == 0:
        cursor.executemany(
            'INSERT INTO mining_conditions (equipment_id, operation_type, material_type, min_production, max_production, working_conditions) VALUES (?, ?, ?, ?, ?, ?)',
            sample_conditions
        )
    
    conn.commit()
    conn.close()

class Equipment:
    """Equipment model class"""
    def __init__(self, id, name, type, capacity, specifications):
        self.id = id
        self.name = name
        self.type = type
        self.capacity = capacity
        self.specifications = specifications
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'capacity': self.capacity,
            'specifications': self.specifications
        }

class MiningConditions:
    """Mining conditions model class"""
    def __init__(self, id, equipment_id, operation_type, material_type, min_production, max_production, working_conditions):
        self.id = id
        self.equipment_id = equipment_id
        self.operation_type = operation_type
        self.material_type = material_type
        self.min_production = min_production
        self.max_production = max_production
        self.working_conditions = working_conditions