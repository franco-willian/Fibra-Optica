CREATE DATABASE IF NOT EXISTS fibra_optica;

USE fibra_optica;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'technician',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS network_nodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('cto', 'ceo', 'cable', 'dio', 'splitter') NOT NULL,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    capacity INT DEFAULT 0,
    used_ports INT DEFAULT 0,
    city_id INT,
    status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS change_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    node_id INT,
    action_description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (node_id) REFERENCES network_nodes(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin') ON DUPLICATE KEY UPDATE username=username;
INSERT INTO cities (name, state) VALUES ('São Paulo', 'SP') ON DUPLICATE KEY UPDATE name=name;
