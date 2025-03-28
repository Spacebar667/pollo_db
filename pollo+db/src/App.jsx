import React, { useState, useEffect } from "react";
import { Button, TextField, Card, CardContent, Typography, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import db from "./firebaseconfig";

const products = [
  { id: 1, name: "Pollo Entero", price: 35000, image: "🐔" },
  { id: 2, name: "Pechuga de Pollo", price: 18000, image: "🍗" },
  { id: 3, name: "Alitas de Pollo", price: 22000, image: "🍖" },
  { id: 4, name: "Muslos de Pollo", price: 18000, image: "🍗" },
];

const cities = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"];
const paymentMethods = ["Efectivo", "Tarjeta de crédito", "Transferencia bancaria"];

const ChickenStore = () => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [userDocId, setUserDocId] = useState(null); // Nuevo estado para guardar el ID del documento del usuario
  const [search, setSearch] = useState("");
  const [registering, setRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [order, setOrder] = useState({ city: "", paymentMethod: "" });
  const [orders, setOrders] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false); // Estado para controlar el diálogo de edición
  const [editUserData, setEditUserData] = useState({ name: "", email: "", phone: "", password: "" }); // Datos editables del usuario

  // Leer pedidos desde Firebase
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersCollection = collection(db, "orders");
        const ordersSnapshot = await getDocs(ordersCollection);
        const ordersList = ordersSnapshot.docs.map(doc => doc.data());
        setOrders(ordersList);
      } catch (error) {
        console.error("Error al recuperar pedidos: ", error);
      }
    };

    fetchOrders();
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
    setShowCart(true);
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    if (newCart.length === 0) {
      setShowCart(false);
    }
  };

  const register = async () => {
    if (formData.name && formData.email && formData.phone && formData.password) {
      try {
        const usersCollection = collection(db, "users");
        const docRef = await addDoc(usersCollection, formData);
        setUser({ name: formData.name, email: formData.email, phone: formData.phone });
        setUserDocId(docRef.id); // Guardar el ID del documento del usuario
        setRegistering(false);
        alert("Registro exitoso!");
      } catch (error) {
        console.error("Error registrando el usuario: ", error);
        alert("Hubo un error al registrar. Por favor intenta de nuevo.");
      }
    } else {
      alert("Por favor completa todos los campos.");
    }
  };

  const login = async () => {
    if (loginData.email && loginData.password) {
      try {
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("email", "==", loginData.email), where("password", "==", loginData.password));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          setUser({ name: userData.name, email: userData.email, phone: userData.phone });
          setUserDocId(userDoc.id); // Guardar el ID del documento del usuario
          
          // Preparar datos para edición
          setEditUserData({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password
          });
        } else {
          alert("Credenciales incorrectas.");
        }
      } catch (error) {
        console.error("Error al iniciar sesión: ", error);
        alert("Hubo un error al iniciar sesión. Por favor intenta de nuevo.");
      }
    }
  };

  const handleEditUser = () => {
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleSaveUserData = async () => {
    if (editUserData.name && editUserData.email && editUserData.phone && editUserData.password) {
      try {
        const userDocRef = doc(db, "users", userDocId);
        await updateDoc(userDocRef, editUserData);
        
        // Actualizar el estado del usuario con los nuevos datos
        setUser({
          name: editUserData.name,
          email: editUserData.email,
          phone: editUserData.phone
        });
        
        alert("Datos actualizados exitosamente!");
        setEditDialogOpen(false);
      } catch (error) {
        console.error("Error actualizando los datos del usuario: ", error);
        alert("Hubo un error al actualizar los datos. Por favor intenta de nuevo.");
      }
    } else {
      alert("Por favor completa todos los campos.");
    }
  };

  const placeOrder = async () => {
    if (order.city && order.paymentMethod && user) {
      const newOrder = {
        user,
        cart,
        city: order.city,
        paymentMethod: order.paymentMethod,
        total: calculateTotal(),
      };

      const ordersCollection = collection(db, "orders");
      await addDoc(ordersCollection, newOrder);

      alert("Pedido registrado exitosamente!");
      setCart([]);
      setShowCart(false);
    } else {
      alert("Por favor completa toda la información del pedido.");
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" style={{ color: "#d35400", textAlign: "center" }}>🐔 Venta de Pollos Online</Typography>

      {!user ? (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          {registering ? (
            <div>
              <TextField label="Nombre" fullWidth margin="normal" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <TextField label="Correo" type="email" fullWidth margin="normal" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <TextField label="Teléfono" type="tel" fullWidth margin="normal" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <TextField label="Contraseña" type="password" fullWidth margin="normal" onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              <Button variant="contained" color="primary" onClick={register} style={{ marginTop: "10px" }}>Registrarse</Button>
              <Button variant="text" color="secondary" onClick={() => setRegistering(false)}>Cancelar</Button>
            </div>
          ) : (
            <div>
              <TextField label="Correo" type="email" fullWidth margin="normal" onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
              <TextField label="Contraseña" type="password" fullWidth margin="normal" onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
              <Button variant="contained" color="primary" onClick={login}>Iniciar Sesión</Button>
              <Button variant="contained" color="secondary" onClick={() => setRegistering(true)}>Registrarse</Button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Typography variant="h6">Bienvenido, {user.name}!</Typography>
          <Typography>Correo: {user.email}</Typography>
          <Typography>Teléfono: {user.phone}</Typography>
          <div style={{ marginTop: "10px" }}>
            <Button variant="contained" color="primary" onClick={handleEditUser} style={{ marginRight: "10px" }}>
              Editar mis datos
            </Button>
            <Button variant="contained" color="error" onClick={() => setUser(null)}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      )}

      {/* Diálogo para editar datos del usuario */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Editar mis datos</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre"
            fullWidth
            margin="normal"
            value={editUserData.name}
            onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
          />
          <TextField
            label="Correo"
            type="email"
            fullWidth
            margin="normal"
            value={editUserData.email}
            onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
          />
          <TextField
            label="Teléfono"
            type="tel"
            fullWidth
            margin="normal"
            value={editUserData.phone}
            onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={editUserData.password}
            onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button onClick={handleSaveUserData} color="primary">Guardar cambios</Button>
        </DialogActions>
      </Dialog>

      {/* Botón para mostrar/ocultar el carrito */}
      {cart.length > 0 && (
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={() => setShowCart(!showCart)}
          style={{ marginBottom: "20px" }}
        >
          {showCart ? "Ocultar Carrito" : `Ver Carrito (${cart.length})`}
        </Button>
      )}

      {/* Sección del carrito */}
      {showCart && cart.length > 0 && (
        <Card style={{ marginBottom: "20px", backgroundColor: "#f8f9fa" }}>
          <CardContent>
            <Typography variant="h5" style={{ marginBottom: "15px" }}>🛒 Tu Carrito de Compras</Typography>
            
            {cart.map((item, index) => (
              <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="h6" style={{ marginRight: "10px" }}>{item.image}</Typography>
                  <Typography>{item.name}</Typography>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Typography style={{ marginRight: "15px" }}>${item.price.toLocaleString()} COP</Typography>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    onClick={() => removeFromCart(index)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
            
            <div style={{ borderTop: "1px solid #ddd", paddingTop: "15px", marginTop: "15px" }}>
              <Typography variant="h6" style={{ textAlign: "right" }}>
                Total a Pagar: <span style={{ color: "#d35400" }}>${calculateTotal().toLocaleString()} COP</span>
              </Typography>
            </div>
          </CardContent>
        </Card>
      )}

      <Typography variant="h6">Productos:</Typography>
      {products.map((product) => (
        <Card key={product.id} style={{ marginBottom: "10px", padding: "10px" }}>
          <CardContent style={{ textAlign: "center" }}>
            <Typography variant="h4">{product.image}</Typography>
            <Typography variant="h6">{product.name}</Typography>
            <Typography color="textSecondary">${product.price.toLocaleString()} COP</Typography>
            <Button
              variant="contained"
              onClick={() => addToCart(product)}
              style={{ marginTop: "10px" }}
            >
              🛒 Agregar al carrito
            </Button>
          </CardContent>
        </Card>
      ))}

      <Typography variant="h6">Ciudades:</Typography>
      <Select fullWidth value={order.city} onChange={(e) => setOrder({ ...order, city: e.target.value })}>
        {cities.map((city) => (
          <MenuItem key={city} value={city}>{city}</MenuItem>
        ))}
      </Select>

      <Typography variant="h6">Método de Pago:</Typography>
      <Select fullWidth value={order.paymentMethod} onChange={(e) => setOrder({ ...order, paymentMethod: e.target.value })}>
        {paymentMethods.map((method) => (
          <MenuItem key={method} value={method}>{method}</MenuItem>
        ))}
      </Select>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={placeOrder} 
        style={{ marginTop: "10px" }}
        disabled={cart.length === 0}
      >
        Realizar Pedido
      </Button>

      <Typography variant="h6" style={{ marginTop: "20px" }}>Pedidos:</Typography>
      {orders.length > 0 ? (
        orders.map((order, index) => (
          <Card key={index} style={{ marginBottom: "10px", padding: "10px" }}>
            <CardContent>
              <Typography variant="h6">Pedido #{index + 1}</Typography>
              <Typography>Cliente: {order.user.name}</Typography>
              <Typography>Email: {order.user.email}</Typography>
              <Typography>Ciudad: {order.city}</Typography>
              <Typography>Método de Pago: {order.paymentMethod}</Typography>
              <Typography>Total: ${order.total.toLocaleString()} COP</Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography>No hay pedidos registrados</Typography>
      )}
    </div>
  );
};

export default ChickenStore;