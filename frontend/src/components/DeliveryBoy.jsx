import React from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useState } from 'react'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { ClipLoader } from 'react-spinners'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function DeliveryBoy() {
  const {userData,socket}=useSelector(state=>state.user)
  const [currentOrder,setCurrentOrder]=useState()
  const [showOtpBox,setShowOtpBox]=useState(false)
  const [availableAssignments,setAvailableAssignments]=useState(null)
  const [otp,setOtp]=useState("")
  const [todayDeliveries,setTodayDeliveries]=useState([])
const [deliveryBoyLocation,setDeliveryBoyLocation]=useState(null)
const [loading,setLoading]=useState(false)
const [message,setMessage]=useState("")
  useEffect(()=>{
if(!socket || userData.role!=="deliveryBoy") return
let watchId
if(navigator.geolocation){
watchId=navigator.geolocation.watchPosition((position)=>{
    const latitude=position.coords.latitude
    const longitude=position.coords.longitude
    setDeliveryBoyLocation({lat:latitude,lon:longitude})
    socket.emit('updateLocation',{
      latitude,
      longitude,
      userId:userData._id
    })
  }),
  (error)=>{
    console.log(error)
  },
  {
    enableHighAccuracy:true
  }
}

return ()=>{
  if(watchId)navigator.geolocation.clearWatch(watchId)
}

  },[socket,userData])


const ratePerDelivery=50
const totalEarning=todayDeliveries.reduce((sum,d)=>sum + d.count*ratePerDelivery,0)



  const getAssignments=async () => {
    try {
      const result=await axios.get(`${serverUrl}/api/order/get-assignments`,{withCredentials:true})
      
      setAvailableAssignments(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getCurrentOrder=async () => {
     try {
      const result=await axios.get(`${serverUrl}/api/order/get-current-order`,{withCredentials:true})
    setCurrentOrder(result.data)
    } catch (error) {
      console.log(error)
    }
  }


  const acceptOrder=async (assignmentId) => {
    try {
      const result=await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`,{withCredentials:true})
    console.log(result.data)
    await getCurrentOrder()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    socket.on('newAssignment',(data)=>{
      setAvailableAssignments(prev=>([...prev,data]))
    })
    return ()=>{
      socket.off('newAssignment')
    }
  },[socket])
  
  const sendOtp=async () => {
    setLoading(true)
    try {
      const result=await axios.post(`${serverUrl}/api/order/send-delivery-otp`,{
        orderId:currentOrder._id,shopOrderId:currentOrder.shopOrder._id
      },{withCredentials:true})
      setLoading(false)
       setShowOtpBox(true)
    console.log(result.data)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }
   const verifyOtp=async () => {
    setMessage("")
    try {
      const result=await axios.post(`${serverUrl}/api/order/verify-delivery-otp`,{
        orderId:currentOrder._id,shopOrderId:currentOrder.shopOrder._id,otp
      },{withCredentials:true})
    console.log(result.data)
    setMessage(result.data.message)
    location.reload()
    } catch (error) {
      console.log(error)
    }
  }


   const handleTodayDeliveries=async () => {
    
    try {
      const result=await axios.get(`${serverUrl}/api/order/get-today-deliveries`,{withCredentials:true})
    console.log(result.data)
   setTodayDeliveries(result.data)
    } catch (error) {
      console.log(error)
    }
  }
 

  useEffect(()=>{
getAssignments()
getCurrentOrder()
handleTodayDeliveries()
  },[userData])
  return (
    <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto'>
      <Nav/>
      <div className='w-full max-w-[800px] flex flex-col gap-5 items-center'>
    <div className='bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100 text-center gap-2'>
<h1 className='text-xl font-bold text-[#ff4d2d]'>Welcome, {userData.fullName}</h1>
<p className='text-[#ff4d2d] '><span className='font-semibold'>Latitude:</span> {deliveryBoyLocation?.lat}, <span className='font-semibold'>Longitude:</span> {deliveryBoyLocation?.lon}</p>
    </div>

<div className='bg-white rounded-2xl shadow-md p-5 w-[90%] mb-6 border border-orange-100'>
  <h1 className='text-lg font-bold mb-3 text-[#ff4d2d] '>Today Deliveries</h1>

  <ResponsiveContainer width="100%" height={200}>
   <BarChart data={todayDeliveries}>
  <CartesianGrid strokeDasharray="3 3"/>
  <XAxis dataKey="hour" tickFormatter={(h)=>`${h}:00`}/>
    <YAxis  allowDecimals={false}/>
    <Tooltip formatter={(value)=>[value,"orders"]} labelFormatter={label=>`${label}:00`}/>
      <Bar dataKey="count" fill='#ff4d2d'/>
   </BarChart>
  </ResponsiveContainer>

  <div className='max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center'>
<h1 className='text-xl font-semibold text-gray-800 mb-2'>Today's Earning</h1>
<span className='text-3xl font-bold text-green-600'>₹{totalEarning}</span>
  </div>
</div>


{!currentOrder && <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
<h1 className='text-lg font-bold mb-4 flex items-center gap-2'>Available Orders</h1>

<div className='space-y-4'>
{availableAssignments?.length>0
?
(
availableAssignments.map((a,index)=>(
  <div className='border rounded-lg p-4 flex justify-between items-center' key={index}>
   <div>
    <p className='text-sm font-semibold'>{a?.shopName}</p>
    <p className='text-sm text-gray-500'><span className='font-semibold'>Delivery Address:</span> {a?.deliveryAddress.text}</p>
<p className='text-xs text-gray-400'>{a.items.length} items | {a.subtotal}</p>
   </div>
   <button className='bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600' onClick={()=>acceptOrder(a.assignmentId)}>Accept</button>

  </div>
))
):<p className='text-gray-400 text-sm'>No Available Orders</p>}
</div>
</div>}

{currentOrder && <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
<h2 className='text-lg font-bold mb-3'>📦Current Order</h2>
<div className='border rounded-lg p-4 mb-3'>
  <p className='font-semibold text-sm'>{currentOrder?.shopOrder.shop.name}</p>
  <p className='text-sm text-gray-500'>{currentOrder.deliveryAddress.text}</p>
 <p className='text-xs text-gray-400'>{currentOrder.shopOrder.shopOrderItems.length} items | {currentOrder.shopOrder.subtotal}</p>
</div>

 <DeliveryBoyTracking data={{ 
  deliveryBoyLocation:deliveryBoyLocation || {
        lat: userData.location.coordinates[1],
        lon: userData.location.coordinates[0]
      },
      customerLocation: {
        lat: currentOrder.deliveryAddress.latitude,
        lon: currentOrder.deliveryAddress.longitude
      }}} />
{!showOtpBox ? <button className='mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200' onClick={sendOtp} disabled={loading}>
{loading?<ClipLoader size={20} color='white'/> :"Mark As Delivered"}
 </button>:<div className='mt-4 p-4 border rounded-xl bg-gray-50'>
<p className='text-sm font-semibold mb-2'>Enter Otp send to <span className='text-orange-500'>{currentOrder.user.fullName}</span></p>
<input type="text" className='w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400' placeholder='Enter OTP' onChange={(e)=>setOtp(e.target.value)} value={otp}/>
{message && <p className='text-center text-green-400 text-2xl mb-4'>{message}</p>}

<button className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all" onClick={verifyOtp}>Submit OTP</button>
  </div>}

  </div>}


      </div>
    </div>
  )
}

export default DeliveryBoy
