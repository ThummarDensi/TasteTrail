import axios from 'axios';
import React from 'react'
import { MdPhone } from "react-icons/md";
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../redux/userSlice';
import { useState } from 'react';
import { useEffect } from 'react';
function OwnerOrderCard({ data }) {
    const [availableBoys,setAvailableBoys]=useState([])
const dispatch=useDispatch()
    const handleUpdateStatus=async (orderId,shopId,status) => {
        try {
            const result=await axios.post(`${serverUrl}/api/order/update-status/${orderId}/${shopId}`,{status},{withCredentials:true})
             dispatch(updateOrderStatus({orderId,shopId,status}))
             setAvailableBoys(result.data.availableBoys)
             console.log(result.data)
        } catch (error) {
            console.log(error)
        }
    }


  
    return (
        <div className='bg-white rounded-lg shadow p-4 space-y-4'>
            <div>
                <h2 className='text-lg font-semibold text-gray-800'>{data.user.fullName}</h2>
                <p className='text-sm text-gray-500'>{data.user.email}</p>
                <p className='flex items-center gap-2 text-sm text-gray-600 mt-1'><MdPhone /><span>{data.user.mobile}</span></p>
                {data.paymentMethod=="online"?<p className='gap-2 text-sm text-gray-600'>payment: {data.payment?"true":"false"}</p>:<p className='gap-2 text-sm text-gray-600'>Payment Method: {data.paymentMethod}</p>}
                
            </div>

            <div className='flex items-start flex-col gap-2 text-gray-600 text-sm'>
                <p>{data?.deliveryAddress?.text}</p>
                <p className='text-xs text-gray-500'>Lat: {data?.deliveryAddress.latitude} , Lon {data?.deliveryAddress.longitude}</p>
            </div>

            <div className='flex space-x-4 overflow-x-auto pb-2'>
                {data.shopOrders.shopOrderItems.map((item, index) => (
                    <div key={index} className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white"'>
                        <img src={item.item.image} alt="" className='w-full h-24 object-cover rounded' />
                        <p className='text-sm font-semibold mt-1'>{item.name}</p>
                        <p className='text-xs text-gray-500'>Qty: {item.quantity} x ₹{item.price}</p>
                    </div>
                ))}
            </div>

<div className='flex justify-between items-center mt-auto pt-3 border-t border-gray-100'>
<span className='text-sm'>status: <span className='font-semibold capitalize text-[#ff4d2d]'>{data.shopOrders.status}</span>
</span>

<select  className='rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 border-[#ff4d2d] text-[#ff4d2d]' onChange={(e)=>handleUpdateStatus(data._id,data.shopOrders.shop._id,e.target.value)}>
    <option value="">Change</option>
<option value="pending">Pending</option>
<option value="preparing">Preparing</option>
<option value="out of delivery">Out Of Delivery</option>
</select>

</div>

{data.shopOrders.status=="out of delivery" && 
<div className="mt-3 p-2 border rounded-lg text-sm bg-orange-50 gap-4">
    {data.shopOrders.assignedDeliveryBoy?<p>Assigned Delivery Boy:</p>:<p>Available Delivery Boys:</p>}
   {availableBoys?.length>0?(
     availableBoys.map((b,index)=>(
        <div className='text-gray-800'>{b.fullName}-{b.mobile}</div>
     ))
   ):data.shopOrders.assignedDeliveryBoy?<div>{data.shopOrders.assignedDeliveryBoy.fullName}-{data.shopOrders.assignedDeliveryBoy.mobile}</div>:<div>Waiting for delivery boy to accept</div>}
</div>}

<div className='text-right font-bold text-gray-800 text-sm'>
 Total: ₹{data.shopOrders.subtotal}
</div>
        </div>
    )
}

export default OwnerOrderCard
