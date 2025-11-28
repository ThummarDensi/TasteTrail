import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import { setMyOrders, updateOrderStatus, updateRealtimeOrderStatus } from '../redux/userSlice';


function MyOrders() {
  const { userData, myOrders,socket} = useSelector(state => state.user)
  const navigate = useNavigate()
const dispatch=useDispatch()
  useEffect(()=>{
socket?.on('newOrder',(data)=>{
if(data.shopOrders?.owner._id==userData._id){
dispatch(setMyOrders([data,...myOrders]))
}
})

socket?.on('update-status',({orderId,shopId,status,userId})=>{
if(userId==userData._id){
  dispatch(updateRealtimeOrderStatus({orderId,shopId,status}))
}
})

return ()=>{
  socket?.off('newOrder')
  socket?.off('update-status')
}
  },[socket])



  
  return (
    <div className='"w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
      <div className='w-full max-w-[800px] p-4'>

        <div className='flex items-center gap-[20px] mb-6 '>
          <div className=' z-[10] ' onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
          </div>
          <h1 className='text-2xl font-bold  text-start'>My Orders</h1>
        </div>
        <div className='space-y-6'>
          {myOrders?.map((order,index)=>(
            userData.role=="user" ?
            (
              <UserOrderCard data={order} key={index}/>
            )
            :
            userData.role=="owner"? (
              <OwnerOrderCard data={order} key={index}/>
            )
            :
            null
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyOrders
