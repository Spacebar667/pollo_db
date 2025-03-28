import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Container,
  Box,
  Divider
} from "@mui/material";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc
} from "firebase/firestore";
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
  const [userDocId, setUserDocId] = useState(null);
  const [search, setSearch] = useState("");
  const [registering, setRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [order, setOrder] = useState({ city: "", paymentMethod: "" });
  const [orders, setOrders] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editUserData, setEditUserData] = useState({ name: "", email: "", phone: "", password: "" });

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
        setUserDocId(docRef.id);
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
          setUserDocId(userDoc.id);
          
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
    <Container maxWidth="md" style={{ padding: "20px" }}>
      <Paper elevation={3} style={{ padding: "20px", marginBottom: "20px" }}>
        <Typography variant="h4" style={{ color: "#d35400", textAlign: "center", marginBottom: "20px" }}>
          🐔 Venta de Pollos Online
        </Typography>

        {!user ? (
          <Box style={{ textAlign: "center", marginBottom: "20px" }}>
            {registering ? (
              <Box>
                <TextField
                  label="Nombre"
                  fullWidth
                  margin="normal"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <TextField
                  label="Correo"
                  type="email"
                  fullWidth
                  margin="normal"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <TextField
                  label="Teléfono"
                  type="tel"
                  fullWidth
                  margin="normal"
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <TextField
                  label="Contraseña"
                  type="password"
                  fullWidth
                  margin="normal"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={register}
                  style={{ marginTop: "10px", marginRight: "10px" }}
                >
                  Registrarse
                </Button>
                <Button variant="outlined" onClick={() => setRegistering(false)}>
                  Cancelar
                </Button>
              </Box>
            ) : (
              <Box>
                <TextField
                  label="Correo"
                  type="email"
                  fullWidth
                  margin="normal"
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                />
                <TextField
                  label="Contraseña"
                  type="password"
                  fullWidth
                  margin="normal"
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={login}
                  style={{ marginRight: "10px", marginTop: "10px" }}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setRegistering(true)}
                  style={{ marginTop: "10px" }}
                >
                  Registrarse
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Box style={{ textAlign: "center", marginBottom: "20px" }}>
            <Typography variant="h6">Bienvenido, {user.name}!</Typography>
            <Typography>Correo: {user.email}</Typography>
            <Typography>Teléfono: {user.phone}</Typography>
            <Box style={{ marginTop: "10px" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditUser}
                style={{ marginRight: "10px" }}
              >
                Editar mis datos
              </Button>
              <Button variant="contained" color="error" onClick={() => setUser(null)}>
                Cerrar sesión
              </Button>
            </Box>
          </Box>
        )}

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
            <Button onClick={handleSaveUserData} color="primary">
              Guardar cambios
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>

      {cart.length > 0 && (
        <Box style={{ textAlign: "center", marginBottom: "20px" }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setShowCart(!showCart)}
            style={{ marginBottom: "20px" }}
          >
            {showCart ? "Ocultar Carrito" : `Ver Carrito (${cart.length})`}
          </Button>
        </Box>
      )}

      {showCart && cart.length > 0 && (
        <Paper elevation={3} style={{ marginBottom: "20px", padding: "20px" }}>
          <Typography variant="h5" style={{ marginBottom: "15px", textAlign: "center" }}>
            🛒 Tu Carrito de Compras
          </Typography>
          
          {cart.map((item, index) => (
            <Box
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
                padding: "10px",
                backgroundColor: "#f8f9fa",
                borderRadius: "4px"
              }}
            >
              <Box style={{ display: "flex", alignItems: "center" }}>
                <Typography variant="h6" style={{ marginRight: "10px" }}>
                  {item.image}
                </Typography>
                <Typography>{item.name}</Typography>
              </Box>
              <Box style={{ display: "flex", alignItems: "center" }}>
                <Typography style={{ marginRight: "15px" }}>
                  ${item.price.toLocaleString()} COP
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => removeFromCart(index)}
                >
                  Eliminar
                </Button>
              </Box>
            </Box>
          ))}
          
          <Divider style={{ margin: "15px 0" }} />
          
          <Typography variant="h6" style={{ textAlign: "right" }}>
            Total a Pagar:{" "}
            <span style={{ color: "#d35400" }}>
              ${calculateTotal().toLocaleString()} COP
            </span>
          </Typography>
        </Paper>
      )}

      <Paper elevation={3} style={{ padding: "20px", marginBottom: "20px" }}>
        <Typography variant="h5" style={{ textAlign: "center", marginBottom: "20px" }}>
          Nuestros Productos
        </Typography>
        
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.id}>
              <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent style={{ textAlign: "center", flexGrow: 1 }}>
                  <Typography variant="h2" style={{ marginBottom: "10px" }}>
                    {product.image}
                  </Typography>
                  <Typography variant="h6" style={{ marginBottom: "5px" }}>
                    {product.name}
                  </Typography>
                  <Typography color="textSecondary" style={{ marginBottom: "15px" }}>
                    ${product.price.toLocaleString()} COP
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => addToCart(product)}
                    fullWidth
                  >
                    🛒 Agregar al carrito
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper elevation={3} style={{ padding: "20px", marginBottom: "20px" }}>
        <Typography variant="h5" style={{ textAlign: "center", marginBottom: "20px" }}>
          Información del Pedido
        </Typography>
        
        <Box style={{ marginBottom: "20px" }}>
          <Typography variant="h6" style={{ marginBottom: "10px" }}>
            Ciudad de Entrega:
          </Typography>
          <Select
            fullWidth
            value={order.city}
            onChange={(e) => setOrder({ ...order, city: e.target.value })}
          >
            {cities.map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </Select>
        </Box>
        
        <Box style={{ marginBottom: "20px" }}>
          <Typography variant="h6" style={{ marginBottom: "10px" }}>
            Método de Pago:
          </Typography>
          <Select
            fullWidth
            value={order.paymentMethod}
            onChange={(e) => setOrder({ ...order, paymentMethod: e.target.value })}
          >
            {paymentMethods.map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </Select>
        </Box>
        
        <Box style={{ textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={placeOrder}
            style={{ marginTop: "10px" }}
            disabled={cart.length === 0}
            size="large"
          >
            Realizar Pedido
          </Button>
        </Box>
      </Paper>

      <Paper elevation={3} style={{ padding: "20px" }}>
        <Typography variant="h5" style={{ textAlign: "center", marginBottom: "20px" }}>
          Historial de Pedidos
        </Typography>
        
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <Card
              key={index}
              style={{
                marginBottom: "15px",
                padding: "15px",
                backgroundColor: "#f8f9fa"
              }}
            >
              <CardContent>
                <Typography variant="h6" style={{ color: "#d35400" }}>
                  Pedido #{index + 1}
                </Typography>
                <Typography>Cliente: {order.user.name}</Typography>
                <Typography>Email: {order.user.email}</Typography>
                <Typography>Ciudad: {order.city}</Typography>
                <Typography>Método de Pago: {order.paymentMethod}</Typography>
                <Typography>
                  Total: <strong>${order.total.toLocaleString()} COP</strong>
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography style={{ textAlign: "center" }}>
            No hay pedidos registrados
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default ChickenStore;