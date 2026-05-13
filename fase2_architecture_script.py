import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

def main():
    user = os.getenv('MYSQL_USER', 'root')
    pwd = os.getenv('MYSQL_PASSWORD', '')
    host = os.getenv('MYSQL_HOST', '127.0.0.1')
    dbname = os.getenv('MYSQL_DATABASE', 'laika_club3_v2')
    
    host = '127.0.0.1'
    engine = create_engine(f"mysql+pymysql://{user}:{pwd}@{host}:3306/{dbname}")
    
    commands = [
        # 1. Geopolitical Locations
        """
        CREATE TABLE IF NOT EXISTS countries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(10) NOT NULL UNIQUE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """,
        """
        CREATE TABLE IF NOT EXISTS states (
            id INT AUTO_INCREMENT PRIMARY KEY,
            country_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(10),
            FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """,
        """
        CREATE TABLE IF NOT EXISTS municipalities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            state_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """,

        # 2. Refactor venues and venue_rooms
        """
        ALTER TABLE venues 
        ADD COLUMN municipality_id INT DEFAULT NULL,
        ADD CONSTRAINT fk_venues_municipality FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE SET NULL;
        """,
        """
        ALTER TABLE venue_rooms
        ADD COLUMN layout_mode ENUM('map', 'general_admission') DEFAULT 'map',
        ADD COLUMN layout_metadata JSON DEFAULT NULL;
        """,
        
        # 3. Core Tables for Map Builder
        """
        CREATE TABLE IF NOT EXISTS seating_zones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            room_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            color_hex VARCHAR(20) DEFAULT '#cccccc',
            FOREIGN KEY (room_id) REFERENCES venue_rooms(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """,
        """
        CREATE TABLE IF NOT EXISTS seat_types (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            is_bookable BOOLEAN DEFAULT TRUE,
            color_hex VARCHAR(20) DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """,
        """
        CREATE TABLE IF NOT EXISTS seating_blocks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            room_id INT NOT NULL,
            name VARCHAR(100),
            x_position FLOAT NOT NULL,
            y_position FLOAT NOT NULL,
            rotation FLOAT DEFAULT 0.0,
            config JSON,
            FOREIGN KEY (room_id) REFERENCES venue_rooms(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """,
        """
        CREATE TABLE IF NOT EXISTS room_seats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            room_id INT NOT NULL,
            block_id INT DEFAULT NULL,
            zone_id INT DEFAULT NULL,
            seat_type_id INT NOT NULL,
            seat_label VARCHAR(20) NOT NULL,
            x_position FLOAT NOT NULL,
            y_position FLOAT NOT NULL,
            status ENUM('active', 'maintenance', 'blocked') DEFAULT 'active',
            FOREIGN KEY (room_id) REFERENCES venue_rooms(id) ON DELETE CASCADE,
            FOREIGN KEY (block_id) REFERENCES seating_blocks(id) ON DELETE CASCADE,
            FOREIGN KEY (zone_id) REFERENCES seating_zones(id) ON DELETE SET NULL,
            FOREIGN KEY (seat_type_id) REFERENCES seat_types(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """,
        """
        CREATE TABLE IF NOT EXISTS event_zone_prices (
            id INT AUTO_INCREMENT PRIMARY KEY,
            event_id INT NOT NULL,
            zone_id INT DEFAULT NULL,
            seat_type_id INT DEFAULT NULL,
            price DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
            FOREIGN KEY (zone_id) REFERENCES seating_zones(id) ON DELETE CASCADE,
            FOREIGN KEY (seat_type_id) REFERENCES seat_types(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """,

        # 4. Event Map Mode flag
        """
        ALTER TABLE events
        ADD COLUMN use_seating_map BOOLEAN DEFAULT FALSE;
        """,

        # 5. Manager Packages System
        """
        CREATE TABLE IF NOT EXISTS manager_packages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            description TEXT,
            features JSON NOT NULL,
            monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0.00
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """,
        """
        CREATE TABLE IF NOT EXISTS user_packages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            package_id INT NOT NULL,
            active_until DATE DEFAULT NULL,
            status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (package_id) REFERENCES manager_packages(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """,
        
        # 6. Drop old city field safely
        """
        ALTER TABLE venues DROP COLUMN city;
        """
    ]

    try:
        with engine.connect() as conn:
            for cmd in commands:
                try:
                    conn.execute(text(cmd))
                    print(f"Executed: {cmd[:50]}...")
                except Exception as e:
                    # Ignore Duplicate Column errors, etc. if re-running
                    if "Duplicate column name" in str(e) or "Can't DROP" in str(e):
                        print(f"Skipped/Ignored: {str(e)}")
                    else:
                        print(f"Error on: {cmd[:50]}...\n{e}")
                        
            # Insert default seat types
            try:
                conn.execute(text("INSERT INTO seat_types (name, description, is_bookable, color_hex) VALUES ('Normal', 'Asiento estándar', TRUE, '#4ade80')"))
                conn.execute(text("INSERT INTO seat_types (name, description, is_bookable, color_hex) VALUES ('VIP', 'Asiento VIP', TRUE, '#facc15')"))
                conn.execute(text("INSERT INTO seat_types (name, description, is_bookable, color_hex) VALUES ('Premium', 'Asiento Premium', TRUE, '#c084fc')"))
                conn.execute(text("INSERT INTO seat_types (name, description, is_bookable, color_hex) VALUES ('Discapacitados', 'Espacio para silla de ruedas', TRUE, '#60a5fa')"))
                conn.execute(text("INSERT INTO seat_types (name, description, is_bookable, color_hex) VALUES ('Loveseat', 'Asiento doble', TRUE, '#fb7185')"))
                conn.execute(text("INSERT INTO seat_types (name, description, is_bookable, color_hex) VALUES ('Invisible', 'Espacio vacío', FALSE, 'transparent')"))
                conn.execute(text("INSERT INTO seat_types (name, description, is_bookable, color_hex) VALUES ('Mantenimiento', 'En reparación', FALSE, '#f87171')"))
                conn.execute(text("INSERT INTO seat_types (name, description, is_bookable, color_hex) VALUES ('Bloqueado', 'No disponible', FALSE, '#9ca3af')"))
                print("Default seat types inserted.")
            except Exception as e:
                print("Seat types already exist or error:", e)
                
            # Insert Manager Packages
            try:
                conn.execute(text('''
                    INSERT INTO manager_packages (name, description, features, monthly_price)
                    VALUES 
                    ('Basico', 'Venta de boletos + asignación de recinto/sala', '{"sales": true, "advanced_map": false, "ads": false, "analytics": false}', 0.00),
                    ('Medio', '+ Publicidad en homepage y secciones de eventos', '{"sales": true, "advanced_map": false, "ads": true, "analytics": false}', 299.00),
                    ('Avanzado', '+ Constructor de mapa, mercancia y metricas', '{"sales": true, "advanced_map": true, "ads": true, "analytics": true, "merchandise": true}', 599.00)
                '''))
                print("Manager packages inserted.")
            except Exception as e:
                print("Packages already exist or error:", e)

            conn.commit()
            print("Successfully updated database architecture for Phase 2!")
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    main()
