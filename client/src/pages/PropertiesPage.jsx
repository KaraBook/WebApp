import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IoEyeOutline } from "react-icons/io5";
import { RiEditBoxLine } from "react-icons/ri";
import { MdDeleteOutline } from "react-icons/md";
import { IoIosArrowDropdown } from "react-icons/io";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';



const filterOptions = [
  { label: 'All Properties', value: 'all' },
  { label: 'Blocked Properties', value: 'blocked' },
  { label: 'Published Properties', value: 'published' },
];

const PropertiesPage = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [properties, setProperties] = useState([]);

  const handleAddProperty = () => {
    navigate('/admin/add-property');
  };

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  const fetchProperties = async () => {
    try {
      const response = await Axios({
        method: SummaryApi.getProperties.method,
        url: SummaryApi.getProperties.url,
      });
      setProperties(response.data.data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);


  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <>

      <div className='flex justify-between items-center border-b pb-4'>
        <h1 className='text-xl font-bold'>Properties</h1>
        <Button onClick={handleAddProperty}>Add Property</Button>
      </div>


      <div className='mt-4 flex justify-between items-center'>
        <h2>All Properties</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-64 justify-between bg-white text-primary">
              {filterOptions.find(o => o.value === selectedFilter)?.label || "Select"}
              <IoIosArrowDropdown className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            {filterOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => setSelectedFilter(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='mt-6'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sr. No</TableHead>
                <TableHead>Property Name</TableHead>
                <TableHead>Owner Name</TableHead>
                <TableHead>State</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Price/Night</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property, index) => (
                <TableRow key={property._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{property.propertyName}</TableCell>
                  <TableCell>{property.resortOwner?.name || 'N/A'}</TableCell>
                  <TableCell>{property.state}</TableCell>
                  <TableCell>{property.city}</TableCell>
                  <TableCell>₹{property.pricingPerNight}</TableCell>
                  <TableCell>{property.status}</TableCell>
                  <TableCell>{property.featured}</TableCell>
                  <TableCell>{formatDate(property.createdAt)}</TableCell>
                  <TableCell>{formatDate(property.updatedAt)}</TableCell>
                  <TableCell className="flex space-x-2">
                    <IoEyeOutline
                      className="cursor-pointer text-gray-600 hover:text-blue-500"
                      onClick={() => navigate(`/admin/view-property/${property._id}`)}
                    />
                    <RiEditBoxLine
                      className="cursor-pointer text-gray-600 hover:text-yellow-500"
                      onClick={() => navigate(`/admin/edit-property/${property._id}`)}
                    />
                    <MdDeleteOutline
                      className="cursor-pointer text-gray-600 hover:text-red-500"
                      onClick={() => console.log("Delete", property._id)} // Replace with delete logic
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default PropertiesPage;
