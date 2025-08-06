import React from "react";
import { useNavigate } from "react-router-dom";
import { RiEditBoxLine } from "react-icons/ri";
import { IoEyeOutline } from "react-icons/io5";
import { MdOutlineBlock } from "react-icons/md";




const SinglePropertyCard = ({ property }) => {
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate(`/admin/edit-property/${property._id}`);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden w-[168px] border p-2 gap-3 flex flex-col ">
    <h2 className="font-semibold text-lg truncate max-w-[180px] text-left">{property.propertyName}</h2>
      <div className="h-[80px] w-[150px] overflow-hidden rounded -mt-2">
        <img
          src={property.coverImage}
          alt={property.propertyName}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-0 flex justify-start gap-2 items-center">
        <button onClick={handleEditClick} title="Edit" className="bg-[#36dcf43b] text-white text-sm px-1 py-1 rounded">
          <RiEditBoxLine className="inline-block text-[#454545]" size={18} />
        </button>
        <button onClick={handleEditClick} title="View" className="bg-[#4caf504a] text-white text-sm px-1 py-1 rounded">
          <IoEyeOutline className="inline-block text-[#454545]" size={18} />
        </button>
         <button onClick={handleEditClick} title="Block" className="bg-[#f3202047] text-white text-sm px-1 py-1 rounded">
          <MdOutlineBlock className="inline-block text-[#454545]" size={18} />
        </button>
        </div>
    </div>
  );
};

export default SinglePropertyCard;
