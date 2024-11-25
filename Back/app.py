from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash

# Configuración de la aplicación y la base de datos
app = Flask(__name__)
app.config.from_object('config.DevelopmentConfig')
con = MySQL(app)

# Habilitar CORS
CORS(app, origins="http://localhost:4200")

# Rutas
@app.route('/agrCliente', methods=['POST'])
def agr_cliente():
    data = request.json
    try:
        cursor = con.connection.cursor()
        
        # Insertar cliente en la tabla Clientes
        query_cliente = """
            INSERT INTO Clientes (nombre, email, telefono, direccion, filtro_nombre, precio_unitario, descripcion_filtro)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cliente_values = (
            data['nombre'],
            data.get('email', None),
            data.get('telefono', None),
            data.get('direccion', None),
            data['filtro_nombre'],
            data['precio_unitario'],
            data.get('descripcion_filtro', None)
        )
        cursor.execute(query_cliente, cliente_values)
        con.connection.commit()
        cliente_id = cursor.lastrowid

        # Insertar pedido en la tabla Pedidos
        query_pedido = """
            INSERT INTO Pedidos (cliente_id, cantidad, subtotal)
            VALUES (%s, %s, %s)
        """
        pedido_values = (
            cliente_id,
            data['cantidad'],
            float(data['cantidad']) * float(data['precio_unitario'])
        )
        cursor.execute(query_pedido, pedido_values)
        con.connection.commit()

        return jsonify({'message': 'Cliente y pedido agregados exitosamente'}), 201
    except Exception as e:
        print(f"Error al agregar cliente: {e}")
        return jsonify({'error': str(e)}), 400

@app.route('/clientes', methods=['GET'])
def get_clientes():
    try:
        cursor = con.connection.cursor()
        cursor.execute("SELECT * FROM Clientes")
        rows = cursor.fetchall()
        clientes = []
        for row in rows:
            clientes.append({
                'cliente_id': row[0],
                'nombre': row[1],
                'email': row[2],
                'telefono': row[3],
                'direccion': row[4],
                'filtro_nombre': row[5],
                'precio_unitario': float(row[6]),
                'descripcion_filtro': row[7],
                'fecha_registro': row[8]
            })
        return jsonify(clientes)
    except Exception as e:
        print(f"Error al obtener clientes: {e}")
        return jsonify({'error': str(e)}), 400

@app.route('/pedidos', methods=['GET'])
def get_pedidos():
    try:
        cursor = con.connection.cursor()
        query = """
            SELECT p.pedido_id, p.cliente_id, p.cantidad, p.subtotal, p.fecha_pedido, p.estado, c.filtro_nombre
            FROM Pedidos p
            JOIN Clientes c ON p.cliente_id = c.cliente_id
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        pedidos = []
        for row in rows:
            pedidos.append({
                'pedido_id': row[0],
                'cliente_id': row[1],
                'cantidad': row[2],
                'subtotal': float(row[3]),
                'fecha_pedido': row[4],
                'estado': row[5],
                'filtro_nombre': row[6]
            })
        return jsonify(pedidos)
    except Exception as e:
        print(f"Error al obtener pedidos: {e}")
        return jsonify({'error': str(e)}), 400

@app.route('/agrUsuario', methods=['POST'])
def agr_usuario():
    data = request.json
    print('Received data:', data)
    try:
        cursor = con.connection.cursor()
        if not data.get('username') or not data.get('email') or not data.get('password'):
            raise ValueError('Missing required fields')
        password_hash = generate_password_hash(data['password'])
        query = """
            INSERT INTO Users (username, email, password_hash)
            VALUES (%s, %s, %s)
        """
        values = (data['username'], data['email'], password_hash)
        cursor.execute(query, values)
        con.connection.commit()
        print('User added successfully')
        return jsonify({'message': 'Usuario agregado exitosamente'}), 201
    except Exception as e:
        print(f"Error al agregar usuario: {e}")
        return jsonify({'error': str(e)}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    print('Received login data:', data)
    try:
        cursor = con.connection.cursor()
        query = "SELECT * FROM Users WHERE username = %s"
        cursor.execute(query, (data['username'],))
        user = cursor.fetchone()
        if user:
            print('User found:', user)
            if check_password_hash(user[3], data['password']):
                print('Login successful for user:', data['username'])
                return jsonify({'message': 'Login exitoso'}), 200
            else:
                print('Invalid password for user:', data['username'])
        else:
            print('User not found:', data['username'])
        return jsonify({'message': 'Credenciales incorrectas'}), 401
    except Exception as e:
        print(f"Error en el login: {e}")
        return jsonify({'error': str(e)}), 400

@app.route('/usuarios', methods=['GET'])
def get_usuarios():
    try:
        cursor = con.connection.cursor()
        cursor.execute("SELECT user_id, email, username, password_hash FROM Users")
        rows = cursor.fetchall()
        usuarios = []
        for row in rows:
            usuarios.append({
                'user_id': row[0],
                'email': row[1],
                'username': row[2],
                'password_hash': row[3]
            })
        return jsonify(usuarios)
    except Exception as e:
        print(f"Error al obtener usuarios: {e}")
        return jsonify({'error': str(e)}), 400

@app.route('/usuarioPorEmail', methods=['GET'])
def get_usuario_por_email():
    email = request.args.get('email')
    try:
        cursor = con.connection.cursor()
        query = "SELECT * FROM Clientes WHERE email = %s"
        cursor.execute(query, (email,))
        row = cursor.fetchone()
        if row:
            cliente = {
                'cliente_id': row[0],
                'nombre': row[1],
                'email': row[2],
                'telefono': row[3],
                'direccion': row[4],
                'filtro_nombre': row[5],
                'precio_unitario': float(row[6]),
                'descripcion_filtro': row[7],
                'fecha_registro': row[8]
            }
            return jsonify(cliente)
        return jsonify({'message': 'Cliente no encontrado'}), 404
    except Exception as e:
        print(f"Error al obtener cliente por email: {e}")
        return jsonify({'error': str(e)}), 400


# Ruta para agregar un pago
@app.route('/agrPago', methods=['POST'])
def agr_pago():
    data = request.json
    try:
        cursor = con.connection.cursor()

        # Insertar pago en la tabla Pagos
        query_pago = """
            INSERT INTO Pagos (pedido_id, monto_pagado, metodo_pago)
            VALUES (%s, %s, %s)
        """
        pago_values = (
            data['pedido_id'],
            data['monto_pagado'],
            data['metodo_pago']
        )
        cursor.execute(query_pago, pago_values)
        con.connection.commit()

        # Actualizar estado de los pagos en el pedido si es necesario
        cursor.execute("SELECT subtotal FROM Pedidos WHERE pedido_id = %s", (data['pedido_id'],))
        pedido = cursor.fetchone()
        if pedido:
            total_pagado = data['monto_pagado']
            cursor.execute("SELECT SUM(monto_pagado) FROM Pagos WHERE pedido_id = %s", (data['pedido_id'],))
            pagos_realizados = cursor.fetchone()[0]
            if pagos_realizados >= pedido[0]:
                # Si el total pagado es mayor o igual al subtotal, marcar el pedido como pagado completamente.
                cursor.execute("UPDATE Pedidos SET estado = 'Pagado' WHERE pedido_id = %s", (data['pedido_id'],))
                con.connection.commit()

        return jsonify({'message': 'Pago agregado exitosamente'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Ruta para obtener los pagos realizados
@app.route('/pagos', methods=['GET'])
def get_pagos():
    try:
        cursor = con.connection.cursor()
        cursor.execute("SELECT * FROM Pagos")
        rows = cursor.fetchall()
        pagos = []
        for row in rows:
            pagos.append({
                'pago_id': row[0],
                'pedido_id': row[1],
                'monto_pagado': float(row[2]),
                'fecha_pago': row[3],
                'metodo_pago': row[4]
            })
        return jsonify(pagos)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(debug=True)
