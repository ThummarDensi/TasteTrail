import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import useGetCity from './hooks/useGetCity'
import useGetMyshop from './hooks/useGetMyShop'
import CreateEditShop from './pages/CreateEditShop'
import AddItem from './pages/AddItem'
import EditItem from './pages/EditItem'
import useGetShopByCity from './hooks/useGetShopByCity'
import useGetItemsByCity from './hooks/useGetItemsByCity'
import CartPage from './pages/CartPage'
import CheckOut from './pages/CheckOut'
import OrderPlaced from './pages/OrderPlaced'
import MyOrders from './pages/MyOrders'
import useGetMyOrders from './hooks/useGetMyOrders'
import useUpdateLocation from './hooks/useUpdateLocation'
import TrackOrderPage from './pages/TrackOrderPage'
import Shop from './pages/Shop'
import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { setSocket } from './redux/userSlice'

export const serverUrl="http://localhost:8000"
function App() {
    const {userData}=useSelector(state=>state.user)
    const dispatch=useDispatch()
  useGetCurrentUser()
useUpdateLocation()
  useGetCity()
  useGetMyshop()
  useGetShopByCity()
  useGetItemsByCity()
  useGetMyOrders()

  useEffect(()=>{
const socketInstance=io(serverUrl,{withCredentials:true})
dispatch(setSocket(socketInstance))
socketInstance.on('connect',()=>{
if(userData){
  socketInstance.emit('identity',{userId:userData._id})
}
})
return ()=>{
  socketInstance.disconnect()
}
  },[userData?._id])

  return (
   <Routes>
    <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>}/>
    <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
      <Route path='/forgot-password' element={!userData?<ForgotPassword/>:<Navigate to={"/"}/>}/>
      <Route path='/' element={userData?<Home/>:<Navigate to={"/signin"}/>}/>
<Route path='/create-edit-shop' element={userData?<CreateEditShop/>:<Navigate to={"/signin"}/>}/>
<Route path='/add-item' element={userData?<AddItem/>:<Navigate to={"/signin"}/>}/>
<Route path='/edit-item/:itemId' element={userData?<EditItem/>:<Navigate to={"/signin"}/>}/>
<Route path='/cart' element={userData?<CartPage/>:<Navigate to={"/signin"}/>}/>
<Route path='/checkout' element={userData?<CheckOut/>:<Navigate to={"/signin"}/>}/>
<Route path='/order-placed' element={userData?<OrderPlaced/>:<Navigate to={"/signin"}/>}/>
<Route path='/my-orders' element={userData?<MyOrders/>:<Navigate to={"/signin"}/>}/>
<Route path='/track-order/:orderId' element={userData?<TrackOrderPage/>:<Navigate to={"/signin"}/>}/>
<Route path='/shop/:shopId' element={userData?<Shop/>:<Navigate to={"/signin"}/>}/>
   </Routes>
  )
}

export default App
