import sqlite3

def select_equipment(requirements):
    """
    Select appropriate mining equipment based on requirements
    
    Args:
        requirements (dict): Dictionary containing operation requirements
            - operation_type: Type of mining operation
            - material_type: Type of material being mined
            - production_target: Target production volume
            - working_conditions: Working environment conditions
    
    Returns:
        list: List of recommended equipment with scores
    """
    try:
        conn = sqlite3.connect('equipment_data.db')
        cursor = conn.cursor()
        
        # Base query to get all equipment with their conditions
        query = '''
            SELECT e.id, e.name, e.type, e.capacity, e.specifications,
                   mc.operation_type, mc.material_type, mc.min_production, 
                   mc.max_production, mc.working_conditions
            FROM equipment e
            LEFT JOIN mining_conditions mc ON e.id = mc.equipment_id
        '''
        
        cursor.execute(query)
        results = cursor.fetchall()
        conn.close()
        
        recommendations = []
        
        for row in results:
            equipment_id, name, eq_type, capacity, specifications, \
            op_type, material_type, min_prod, max_prod, work_conditions = row
            
            # Calculate compatibility score
            score = calculate_compatibility_score(
                requirements, 
                {
                    'operation_type': op_type,
                    'material_type': material_type,
                    'min_production': min_prod,
                    'max_production': max_prod,
                    'working_conditions': work_conditions
                }
            )
            
            if score > 0:  # Only include compatible equipment
                recommendations.append({
                    'id': equipment_id,
                    'name': name,
                    'type': eq_type,
                    'capacity': capacity,
                    'specifications': specifications,
                    'compatibility_score': score,
                    'reasons': get_selection_reasons(requirements, {
                        'operation_type': op_type,
                        'material_type': material_type,
                        'min_production': min_prod,
                        'max_production': max_prod,
                        'working_conditions': work_conditions
                    })
                })
        
        # Sort by compatibility score (highest first)
        recommendations.sort(key=lambda x: x['compatibility_score'], reverse=True)
        
        return recommendations
        
    except Exception as e:
        print(f"Error in equipment selection: {str(e)}")
        return []

def calculate_compatibility_score(requirements, equipment_conditions):
    """
    Calculate compatibility score between requirements and equipment conditions
    
    Returns:
        int: Score from 0-100 indicating compatibility
    """
    score = 0
    max_score = 100
    
    # Operation type match (30 points)
    if (equipment_conditions.get('operation_type') and 
        requirements.get('operation_type') and
        equipment_conditions['operation_type'].lower() == requirements['operation_type'].lower()):
        score += 30
    
    # Material type match (25 points)
    if (equipment_conditions.get('material_type') and 
        requirements.get('material_type') and
        equipment_conditions['material_type'].lower() == requirements['material_type'].lower()):
        score += 25
    
    # Production capacity match (25 points)
    if (equipment_conditions.get('min_production') and 
        equipment_conditions.get('max_production') and
        requirements.get('production_target')):
        try:
            target = int(requirements['production_target'])
            min_prod = equipment_conditions['min_production']
            max_prod = equipment_conditions['max_production']
            
            if min_prod <= target <= max_prod:
                score += 25
            elif target < min_prod:
                # Partial score if close to minimum
                if target >= min_prod * 0.8:
                    score += 15
            elif target > max_prod:
                # Partial score if close to maximum
                if target <= max_prod * 1.2:
                    score += 15
        except (ValueError, TypeError):
            pass
    
    # Working conditions match (20 points)
    if (equipment_conditions.get('working_conditions') and 
        requirements.get('working_conditions') and
        equipment_conditions['working_conditions'].lower() == requirements['working_conditions'].lower()):
        score += 20
    
    return min(score, max_score)

def get_selection_reasons(requirements, equipment_conditions):
    """
    Generate human-readable reasons for equipment selection
    
    Returns:
        list: List of reason strings
    """
    reasons = []
    
    if (equipment_conditions.get('operation_type') and 
        requirements.get('operation_type') and
        equipment_conditions['operation_type'].lower() == requirements['operation_type'].lower()):
        reasons.append(f"Suitable for {requirements['operation_type']} operations")
    
    if (equipment_conditions.get('material_type') and 
        requirements.get('material_type') and
        equipment_conditions['material_type'].lower() == requirements['material_type'].lower()):
        reasons.append(f"Designed for {requirements['material_type']} handling")
    
    if (equipment_conditions.get('min_production') and 
        equipment_conditions.get('max_production') and
        requirements.get('production_target')):
        try:
            target = int(requirements['production_target'])
            min_prod = equipment_conditions['min_production']
            max_prod = equipment_conditions['max_production']
            
            if min_prod <= target <= max_prod:
                reasons.append(f"Production capacity matches target ({target} tons/day)")
            elif target < min_prod:
                reasons.append(f"Higher capacity available (min {min_prod} tons/day)")
            elif target > max_prod:
                reasons.append(f"May need multiple units (max {max_prod} tons/day)")
        except (ValueError, TypeError):
            pass
    
    if (equipment_conditions.get('working_conditions') and 
        requirements.get('working_conditions') and
        equipment_conditions['working_conditions'].lower() == requirements['working_conditions'].lower()):
        reasons.append(f"Built for {requirements['working_conditions']} working conditions")
    
    return reasons if reasons else ["General purpose mining equipment"]