export interface Room {
  id: string;
  title: string;
  description: string;
  price: number;
  tags: string[];
  image: string;
}

export const rooms: Room[] = [
  {
    id: "2-in-1-standard",
    title: "2 in 1 Standard",
    description: "Equipped with essential amenities for a comfortable stay.",
    price: 7500,
    tags: ["Kitchen", "Induction Hob", "Washroom", "Table & Chairs", "Beds", "Wardrobe", "WiFi"],
    image: "https://vdrdrzuveznygrkwdsin.supabase.co/storage/v1/object/public/fredmak%20hostel%20media/2%20in%201%20standard.png",
  },
  {
    id: "3-in-1-standard",
    title: "3 in 1 Standard",
    description: "Spacious room with all standard amenities included.",
    price: 6000,
    tags: ["Kitchen", "Induction Hob", "Washroom", "Table & Chairs", "Beds", "Wardrobe", "WiFi"],
    image: "https://vdrdrzuveznygrkwdsin.supabase.co/storage/v1/object/public/fredmak%20hostel%20media/3%20in%201%20standard.png",
  },
  {
    id: "2-in-1-executive",
    title: "2 in 1 Executive",
    description: "Premium comfort with air conditioning and hot water.",
    price: 8500,
    tags: ["Standard Features", "AC", "Water Heater"],
    image: "https://vdrdrzuveznygrkwdsin.supabase.co/storage/v1/object/public/fredmak%20hostel%20media/2%20in%201%20executive.jpg",
  },
];
